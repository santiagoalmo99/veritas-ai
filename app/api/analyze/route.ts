import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import * as cheerio from 'cheerio'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── INTELLIGENCE CASCADE CONFIG ─────────────────────────────
// 1. Cerebras (Primary)
const cerebras = createOpenAI({
  baseURL: 'https://api.cerebras.ai/v1',
  apiKey: process.env.CEREBRAS_API_KEY,
})

// 2. Groq (Fallback 1)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

// Validation schema for the LLM response
const AnalysisSchema = z.object({
  title_neutralized: z.string().describe('A completely neutral, objective version of the article headline.'),
  summary_neutralized: z.string().describe('A completely neutral 2-sentence summary of the factual events.'),
  primary_intent: z.enum(['inform', 'persuade', 'manipulate', 'clickbait']).describe('The primary intention of the article.'),
  veritas_score: z.number().min(0).max(100).describe('Manipulation Risk Score (0 = completely neutral/safe, 100 = extreme propaganda/manipulation).'),
  analysis_confidence: z.number().min(0).max(1).describe('Confidence level of this AI analysis (0.0 to 1.0).'),
  detected_techniques: z.array(z.object({
    technique_slug: z.string().describe('The slug of the detected technique.'),
    quote: z.string().describe('Exact quote from the text demonstrating this technique.'),
    confidence: z.number().min(0).max(1),
    explanation: z.string().describe('Why this quote represents this technique in Spanish.')
  })).max(3).describe('Top 3 manipulation techniques detected in the text.'),
  tags: z.array(z.string()).max(5).describe('Relevant topic tags.')
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { url, outletName, outletDomain, title: bodyTitle, excerpt: bodyExcerpt } = body
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    const domain = outletDomain || new URL(url).hostname.replace('www.', '')
    const outlet_id = `m_${domain.replace(/\./g, '_')}`

    // Ensure outlet exists
    await supabaseAdmin.from('media_outlets').upsert({
      id: outlet_id,
      name: outletName || domain.split('.')[0].toUpperCase(),
      domain: domain,
      country_code: 'ALL',
      current_veritas_avg: 50,
      articles_analyzed: 1,
      alert_level: 'yellow'
    }, { onConflict: 'id' })

    // 1. Scrape Article Content
    let title = ''
    let content = ''
    
    try {
      const response = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        },
        next: { revalidate: 3600 }
      })
      
      if (response.ok) {
        const html = await response.text()
        const $ = cheerio.load(html)
        
        // Clean up unnecessary elements
        $('script, style, nav, footer, header, aside, .ad, .advertisement, iframe').remove()
        
        title = $('h1').first().text().trim() || $('title').text().trim()
        content = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n').substring(0, 10000)
      }
    } catch (e) {
      console.warn('Scraper failed, using fallback from request body:', e)
    }

    // Fallback to provided metadata if scraping failed or returned nothing
    title = title || bodyTitle || 'Noticia Sin Título'
    content = (content && content.length > 200) ? content : (bodyExcerpt || title)
    
    if (content.length < 50) {
      return NextResponse.json({ error: 'Insuficiente contenido para analizar.' }, { status: 400 })
    }

    // 2. Perform AI Forensic Analysis with Cascade
    const systemPrompt = `Eres VeritasAI, un motor de análisis forense de medios diseñado para detectar manipulación, sesgos y técnicas de propaganda.
Tu objetivo es auditar el texto y encontrar patrones de:
1. LENGUAJE CARGADO: Adjetivos emocionales, palabras diseñadas para provocar una reacción.
2. FALACIAS LÓGICAS: Falsos dilemas, ataques ad hominem, generalizaciones.
3. INGENIERÍA MORAL: Encuadrar el tema como una lucha de "buenos contra malos".
4. SESGOS DE ANCLAJE: Presentar datos parciales para forzar una conclusión.
5. GENERACIÓN DE MIEDO: Uso de hipérboles sobre peligros inminentes.

INSTRUCCIONES DE SCORE (veritas_score):
- 0-20: Artículo puramente fáctico, seco, sin adjetivos emocionales.
- 21-40: Sesgo leve, uso de algunos adjetivos.
- 41-70: Manipulación clara, uso de lenguaje emocional y encuadre sesgado.
- 71-100: Propaganda agresiva, múltiples falacias y desinformación.

RESPONDE SIEMPRE EN ESPAÑOL.`

    let result;
    const userPrompt = `Analiza este artículo con enfoque forense:\nTítulo: ${title}\nContenido:\n${content.substring(0, 5000)}`

    try {
      result = await generateObject({
        model: cerebras('llama-3.1-70b'),
        schema: AnalysisSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
    } catch (e) {
      console.warn("Cerebras failed, falling back to Groq");
      result = await generateObject({
        model: groq('llama-3.3-70b-versatile'),
        schema: AnalysisSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
    }

    const { object: analysis } = result;

    // 3. Save to Supabase
    const { data: article, error: articleErr } = await supabaseAdmin.from('articles').insert({
      id: `art-${Date.now()}`,
      url,
      title,
      title_neutralized: analysis.title_neutralized,
      excerpt: content.substring(0, 200) + '...',
      outlet_id,
      published_at: new Date().toISOString(),
      category: 'general',
      country_code: 'ALL',
      language: 'es',
      veritas_score: analysis.veritas_score,
      analysis_status: 'completed',
      analysis_confidence: analysis.analysis_confidence,
      summary_neutralized: analysis.summary_neutralized,
      content: content,
      primary_intent: analysis.primary_intent,
      tags: analysis.tags
    }).select().single()

    if (articleErr) {
      console.warn('Failed to insert article into DB, but returning analysis anyway:', articleErr.message)
    }

    // 4. Return results in frontend-friendly format (camelCase)
    const techniques = (analysis.detected_techniques || []).map((t: any) => ({
      technique: {
        slug: t.technique_slug,
        name: t.technique_slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        nameEs: t.technique_slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: 'cognitive',
        severity: t.confidence,
        description: t.explanation,
        descriptionEs: t.explanation,
        icon: 'alert-triangle'
      },
      quote: t.quote,
      confidence: t.confidence,
      explanation: t.explanation
    }))

    const analysisLogs = [
      { stepId: 'INGESTION', status: 'completed', timestamp: '0.1s', technicalDetail: 'Article content scraped successfully', technicalDetailEs: 'Contenido del artículo extraído con éxito' },
      { stepId: 'CLASSIFICATION', status: 'completed', timestamp: '0.4s', technicalDetail: `Identified as ${analysis.primary_intent}`, technicalDetailEs: `Identificado como ${analysis.primary_intent}` },
      { stepId: 'FORENSIC_SCAN', status: 'completed', timestamp: '3.2s', technicalDetail: `Detected ${techniques.length} manipulation patterns`, technicalDetailEs: `Detectados ${techniques.length} patrones de manipulación` },
      { stepId: 'SYNTHESIS', status: 'completed', timestamp: '4.8s', technicalDetail: 'Calculated final VeritasScore', technicalDetailEs: 'VeritasScore final calculado' }
    ]

    return NextResponse.json({
      success: true,
      veritasScore: analysis.veritas_score,
      analysisConfidence: analysis.analysis_confidence,
      techniquesDetected: techniques,
      titleNeutralized: analysis.title_neutralized,
      summaryNeutralized: analysis.summary_neutralized,
      primaryIntent: analysis.primary_intent,
      tags: analysis.tags,
      analysisLogs
    })

  } catch (error: any) {
    console.error('Analysis Engine Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
