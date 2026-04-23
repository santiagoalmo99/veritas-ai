'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ArticleContext {
  title: string
  veritasScore?: number
  titleNeutralized?: string
  techniquesDetected?: Array<{ technique: { name: string }; quote: string }>
}

export function useSocraticChat(articleContext: ArticleContext | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Generate opening Socratic question based on article context
  const initializeChat = useCallback(() => {
    if (initialized || !articleContext) return
    setInitialized(true)

    const openingMessages: ChatMessage[] = []
    
    // Opening question based on score and detected techniques
    let opening = ''
    const score = articleContext.veritasScore ?? 0
    const techniques = articleContext.techniquesDetected ?? []

    if (techniques.length > 0) {
      const first = techniques[0]
      opening = `Analizando este artículo, noté que la frase *"${first?.quote}"* tiene una estructura particular. ¿Qué emoción activó en ti cuando la leíste por primera vez?`
    } else if (score > 60) {
      opening = `El análisis detectó varias señales en este artículo. Antes de explorarlas juntos — ¿cuál fue tu primera reacción al leer el titular?`
    } else if (score > 20) {
      opening = `Este artículo tiene algunas señales de framing. ¿Notaste si el titular y el contenido te llevaban hacia una conclusión específica?`
    } else {
      opening = `Este artículo muestra bajo índice de manipulación. ¿Te animarías a compararlo con otro medio que cubra el mismo tema para ver qué difiere?`
    }

    openingMessages.push({
      id: 'opening',
      role: 'assistant',
      content: opening,
      timestamp: new Date(),
    })

    setMessages(openingMessages)
  }, [articleContext, initialized])

  useEffect(() => {
    initializeChat()
  }, [initializeChat])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }

    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsLoading(true)

    // Cancel any ongoing stream
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          articleContext,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Chat failed')

      // Stream parsing
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content ?? ''
            accumulated += delta

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: accumulated, isStreaming: true }
                  : m
              )
            )
          } catch {
            // ignore malformed chunks
          }
        }
      }

      // Finalize
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      )
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Lo siento, tuve un problema técnico. ¿Puedes intentarlo de nuevo?', isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages, articleContext, isLoading])

  const clearChat = useCallback(() => {
    setMessages([])
    setInitialized(false)
    setTimeout(initializeChat, 100)
  }, [initializeChat])

  return { messages, input, setInput, sendMessage, isLoading, clearChat }
}
