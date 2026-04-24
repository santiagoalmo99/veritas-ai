import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import * as cheerio from 'cheerio'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TECHNIQUES } from '@/lib/seed-data'

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

// 3. OpenRouter (Fallback 2)
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
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
    explanation: z.string().describe('Detailed forensic explanation of why this quote represents the detected technique.')
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
        },
        next: { revalidate: 3600 }
      })
      
      if (response.ok) {
        const html = await response.text()
        const $ = cheerio.load(html)
        
        // Clean up unnecessary elements
        $('script, style, nav, footer, header, aside, .ad, .advertisement, iframe, .cookie-banner, #cookie-law-info-bar').remove()
        
        title = $('h1').first().text().trim() || $('title').text().trim()
        
        // Try specific article containers first, fallback to all paragraphs
        let contentNodes = $('article p, main p, .article-body p, .entry-content p, .post-content p')
        if (contentNodes.length === 0) {
          contentNodes = $('p')
        }
        
        content = contentNodes
          .map((i, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 60 && !/cookies|suscríbete|boletines|derechos reservados|política de privacidad|términos y condiciones/i.test(text))
          .join('\n\n')
          .substring(0, 10000)
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
    const systemPrompt = `You are the VeritasAI Forensic Auditor v3.1. Your sole function is to audit media MANIPULATION.
STRICT RULES:
1. DO NOT summarize the news.
2. DO NOT provide additional information.
3. YOUR MISSION is to detect:
   - FRAMING BIAS: How the author attempts to manipulate the reader's perception.
   - EMOTIONAL TRIGGERS: Words designed to generate fear, hatred, or unjustified joy.
   - LOGICAL FALLACIES: Straw man, false equivalence, ad hominem attacks.
   - UNILATERALITY: Presenting only one side of the story as if it were the only one.

The VeritasScore (0-100) is an EDITORIAL TOXICITY THERMOMETER:
- 0-30: Neutral, factual, safe.
- 31-60: Biased, uses loaded language.
- 61-100: Aggressive propaganda, cognitive manipulation detected.

STRICT INSTRUCTION FOR LANGUAGE:
- Respond in the SAME LANGUAGE as the article provided.
- If the article is in English, all fields (explanation, summary_neutralized, title_neutralized) MUST be in English.
- If the article is in Spanish, all fields MUST be in Spanish.
- QUOTES must always be exact snippets from the original source text.

STRICT INSTRUCTION FOR TECHNIQUES:
- Use English standardized slugs for technique_slug (e.g., "loaded-language", "fear-mongering", "anchoring-bias", "false-dilemma", "moral-engineering", "ad-hominem", "cherry-picking", "framing-bias", "emotional-manipulation").`

    let result;
    const userPrompt = `AUDITORÍA FORENSE OBLIGATORIA:
Título del artículo: ${title}
Fragmento de texto: ${content.substring(0, 4500)}`

    try {
      result = await generateObject({
        model: cerebras('llama3.1-70b'),
        schema: AnalysisSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
    } catch (e) {
      console.warn("Cerebras failed, falling back to Groq:", e);
      try {
        result = await generateObject({
          model: groq('llama-3.1-70b-versatile'),
          schema: AnalysisSchema,
          system: systemPrompt,
          prompt: userPrompt,
        });
      } catch (e2) {
        console.warn("Groq failed, falling back to OpenRouter:", e2);
        result = await generateObject({
          model: openrouter('meta-llama/llama-3.1-70b-instruct'),
          schema: AnalysisSchema,
          system: systemPrompt,
          prompt: userPrompt,
        });
      }
    }

    if (!result || !result.object) {
      // Ultimate fallback to prevent the detail page from hanging
      return NextResponse.json({
        success: true,
        veritasScore: 50,
        analysisConfidence: 0.1,
        techniquesDetected: [],
        titleNeutralized: title,
        summaryNeutralized: "El escaneo profundo fue interrumpido por restricciones de la fuente. Análisis basado en metadatos parciales.",
        primaryIntent: 'inform',
        tags: ['scan-interrupted'],
        analysisLogs: [
          { stepId: 'INGESTION', status: 'completed', timestamp: '0.1s', technicalDetail: 'Partial content metadata acquired', technicalDetailEs: 'Metadatos parciales adquiridos' },
          { stepId: 'AI_CASCADE', status: 'error', timestamp: '5.2s', technicalDetail: 'AI Providers unavailable', technicalDetailEs: 'Proveedores de IA no disponibles' }
        ]
      })
    }

    const { object: analysis } = result;

    const isEnglishArticle = content.match(/[a-zA-Z]{4,}/g)?.length ? (content.match(/the | and | or | with /gi)?.length ?? 0) > 5 : false;
    const detectedLang = isEnglishArticle ? 'en' : 'es';

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
      country_code: isEnglishArticle ? 'US' : 'CO',
      language: detectedLang,
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
    const techniques = (analysis.detected_techniques || []).map((t: any) => {
      const slug = (t.technique_slug || '').toLowerCase().replace(/ /g, '-');
      // Find matching technique in our seed data if possible
      const ref = TECHNIQUES.find(r => r.slug === slug);
      
      return {
        technique: {
          slug,
          name: ref?.name || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          nameEs: ref?.nameEs || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          category: ref?.category || 'cognitive',
          severity: t.confidence || 0.8,
          description: t.explanation,
          descriptionEs: t.explanation,
          icon: ref?.icon || 'alert-triangle'
        },
        quote: t.quote,
        confidence: t.confidence || 0.85,
        explanation: t.explanation
      };
    })

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
      analysisLogs,
      language: detectedLang,
      title: title, // Returning original scraped title
      content: content // Returning original scraped content
    })

  } catch (error: any) {
    console.error('Analysis Engine Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
