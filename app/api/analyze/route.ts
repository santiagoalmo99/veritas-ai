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
    let { url, outlet_id } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    // Default to a generic outlet if not specified
    if (!outlet_id || outlet_id === 'default') {
      outlet_id = 'm_generic'
      
      // Ensure generic outlet exists
      await supabaseAdmin.from('media_outlets').upsert({
        id: 'm_generic',
        name: 'Fuente Externa',
        domain: new URL(url).hostname,
        country_code: 'ALL',
        current_veritas_avg: 50,
        articles_analyzed: 1,
        alert_level: 'yellow'
      }, { onConflict: 'id' })
    }

    // 1. Scrape Article Content
    const response = await fetch(url, { headers: { 'User-Agent': 'VeritasAI-Bot/1.0' } })
    if (!response.ok) throw new Error('Failed to fetch article URL')
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Clean up unnecessary elements
    $('script, style, nav, footer, header, aside, .ad, .advertisement').remove()
    
    const title = $('h1').first().text().trim() || $('title').text().trim()
    const content = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n').substring(0, 8000)
    
    if (!content || content.length < 200) {
      return NextResponse.json({ error: 'Content too short or unreadable' }, { status: 400 })
    }

    // 2. Perform AI Forensic Analysis with Cascade
    let result;
    try {
      // Try Cerebras (Llama-3.1-70b or 405b if available, currently 70b is stable)
      result = await generateObject({
        model: cerebras('llama-3.1-70b'),
        schema: AnalysisSchema,
        prompt: `Analiza este artículo con enfoque forense:\nTítulo: ${title}\nContenido:\n${content}`,
      });
    } catch (e) {
      console.warn("Cerebras failed, falling back to Groq");
      result = await generateObject({
        model: groq('llama-3.3-70b-versatile'),
        schema: AnalysisSchema,
        prompt: `Analiza este artículo con enfoque forense:\nTítulo: ${title}\nContenido:\n${content}`,
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

    if (articleErr) throw articleErr;

    return NextResponse.json({ success: true, article, analysis })

  } catch (error: any) {
    console.error('Analysis Engine Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
