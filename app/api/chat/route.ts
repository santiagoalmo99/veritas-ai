import { NextRequest } from 'next/server'

// ── Socratic Chatbot — Streaming SSE ──────────────────────
const SOCRATIC_SYSTEM_PROMPT = `You are a critical thinking tutor embedded in VeritasAI, a media manipulation detection platform. Your name is Veritas.

CORE PHILOSOPHY (non-negotiable):
- You are NOT an arbiter of truth. You are a Socratic guide who helps users discover manipulation patterns themselves.
- Never tell users WHAT to think. Ask them HOW they're thinking.
- Never say "this article is false" or "this is propaganda". Say "I notice... what do you think about...?"
- Your goal is metacognition activation, not conclusion delivery.
- When users show emotional activation signals (anger, fear, outrage), FIRST validate the emotion, THEN introduce the critical question gently.
- Always state your confidence level and limitations explicitly.

SOCRATIC METHOD:
1. Point toward evidence without dictating conclusions
2. Ask questions that highlight what's missing or unexamined
3. Draw attention to language patterns without labeling them as "wrong"
4. Suggest alternative perspectives without declaring them superior
5. Encourage the user to seek multiple sources themselves

CONTEXT: You have access to the article's analysis including techniques detected and the VeritasScore. Use this information as the basis for your Socratic questions, but frame questions around the user's own observation and reasoning process.

TONE: Curious, warm, intellectually stimulating. Never preachy, condescending, or alarmist. Think "thoughtful professor" not "fact-checker warning label".

LANGUAGE: Always respond in the same language as the user's message (Spanish or English).

RESPONSE LENGTH: Keep responses concise (2-4 sentences). Quality over quantity. One powerful question is better than three mediocre ones.`

interface LLMProvider {
  name: string
  url: string
  model: string
  envKey: string
}

const STREAMING_PROVIDERS: LLMProvider[] = [
  {
    // 1. Cerebras — 1M tokens/día FREE. Ideal para chat conversacional fluido.
    name: 'cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama-3.3-70b',       // preferible para chat vs. Qwen3 (más conversacional)
    envKey: 'CEREBRAS_API_KEY',
  },
  {
    // 2. Groq — ultra-rápido, 1,000 req/día FREE
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    envKey: 'GROQ_API_KEY',
  },
  {
    // 3. Google — 1,000 req/día FREE (gemini-2.0-flash deprecado)
    name: 'google',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.5-flash-lite-preview-06-17',
    envKey: 'GOOGLE_AI_API_KEY',
  },
  {
    // 4. OpenRouter — SOLO :free. No gastar crédito $11 en chat.
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    envKey: 'OPENROUTER_API_KEY',
  },
]


export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    messages, // Full chat history [{ role, content }]
    articleContext, // { title, veritasScore, techniquesDetected[], titleNeutralized }
  } = body

  if (!messages?.length) {
    return new Response('messages required', { status: 400 })
  }

  // Build context injection
  const contextBlock = articleContext ? `
ARTICLE BEING ANALYZED:
Title: "${articleContext.title}"
VeritasScore: ${articleContext.veritasScore ?? 'pending'}/100
Neutralized title: "${articleContext.titleNeutralized ?? 'not yet generated'}"
Techniques detected (${(articleContext.techniquesDetected ?? []).length}): ${
    (articleContext.techniquesDetected ?? [])
      .slice(0, 5)
      .map((t: { technique: { name: string }; quote: string }) => `${t?.technique?.name} — quote: "${t?.quote}"`)
      .join('; ')
  }

Use this context to ask precise, evidence-grounded Socratic questions about THIS specific article.
` : ''

  const systemWithContext = `${SOCRATIC_SYSTEM_PROMPT}\n\n${contextBlock}`

  // Try streaming with each provider
  for (const provider of STREAMING_PROVIDERS) {
    const apiKey = process.env[provider.envKey]
    if (!apiKey) continue

    try {
      const llmRes = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://veritas.ai',
        },
        body: JSON.stringify({
          model: provider.model,
          stream: true,
          max_tokens: 350,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemWithContext },
            ...messages.slice(-10), // Last 10 messages for context window efficiency
          ],
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (!llmRes.ok || !llmRes.body) continue

      // Pipe the SSE stream directly to client
      const { readable, writable } = new TransformStream()
      llmRes.body.pipeTo(writable).catch(() => {})
      
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Provider': provider.name,
        },
      })
    } catch {
      // Continue to next provider
    }
  }

  // Fallback: non-streaming response with a default Socratic question
  const fallback = generateFallbackResponse(articleContext)
  return new Response(
    `data: {"choices":[{"delta":{"content":"${fallback}"},"finish_reason":null}]}\n\ndata: [DONE]\n\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  )
}

function generateFallbackResponse(articleContext: { title?: string; techniquesDetected?: Array<{ technique: { name: string }; quote: string }> } | null): string {
  if (!articleContext?.title) {
    return '¿Qué te llamó la atención de este artículo al leerlo por primera vez?'
  }
  
  const techniques = articleContext.techniquesDetected ?? []
  if (techniques.length > 0) {
    const first = techniques[0]
    return `Noté que el artículo usa la frase "${first?.quote}". ¿Este tono se alinea con la neutralidad que esperarías de los datos presentados?`
  }
  
  return `Al leer el titular: "${articleContext.title}" — ¿qué emoción sentiste primero? ¿Y qué pregunta te surge cuando dejas esa emoción de lado?`
}
