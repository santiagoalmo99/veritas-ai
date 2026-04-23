'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, RefreshCw, MessageCircle, Loader2 } from 'lucide-react'
import { useSocraticChat } from '@/lib/hooks/useSocraticChat'
import { cn } from '@/lib/utils'
import type { Article } from '@/lib/types'

interface SocraticChatProps {
  article: Partial<Article> & {
    _scoreBreakdown?: Record<string, number>
    _primaryIntent?: string
  }
}

export function SocraticChat({ article }: SocraticChatProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const articleContext = {
    title: article.title ?? '',
    veritasScore: article.veritasScore,
    titleNeutralized: article.titleNeutralized,
    techniquesDetected: article.techniquesDetected?.map((dt) => ({
      technique: { name: dt.technique.nameEs },
      quote: dt.quote,
    })),
  }

  const { messages, input, setInput, sendMessage, isLoading, clearChat } =
    useSocraticChat(isExpanded ? articleContext : null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isExpanded) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isExpanded])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleSend = () => {
    if (input.trim()) sendMessage(input)
  }

  return (
    <div className="glass-card overflow-hidden transition-all duration-500 border border-[var(--color-border-soft)]">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-4 p-5 text-left transition-all",
          isExpanded ? "bg-[var(--color-surface-1)]" : "hover:bg-[var(--color-surface-1)]/50"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-500",
            isExpanded ? "scale-110 shadow-lg shadow-[var(--color-accent)]/20" : ""
          )}
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #a88532 100%)',
          }}
        >
          <Bot size={20} className="text-[var(--color-bg)]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-display font-bold text-[var(--color-text-primary)] uppercase tracking-tight">
            Veritas — Tutor Socrático
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-medium truncate">
            {isExpanded ? 'Conversación activa' : 'Análisis conversacional'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && !isExpanded && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          )}
          <MessageCircle
            size={18}
            className={cn(
              'transition-colors',
              isExpanded ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
            )}
          />
        </div>
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[var(--color-surface-1)]"
          >
            <div className="border-t border-[var(--color-border-soft)]">
              {/* Messages Area */}
              <div className="max-h-[400px] overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <p className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-[0.2em] mb-2 opacity-60">
                        {article.language === 'en' ? 'Analytical Suggestions' : 'Sugerencias de Análisis'}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          article.language === 'en' ? "What manipulation techniques are most evident?" : "¿Qué técnicas de manipulación son más evidentes?",
                          article.language === 'en' ? "Identify the underlying editorial bias." : "Identifica el sesgo editorial subyacente.",
                          article.language === 'en' ? "How does this compare to neutral reporting?" : "¿Cómo se compara esto con un reporte neutral?",
                          article.language === 'en' ? "Detect emotional triggers in the text." : "Detecta disparadores emocionales en el texto.",
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(suggestion)}
                            className="text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--color-accent)]/30 transition-all text-[11px] text-[var(--color-text-secondary)]"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border shadow-sm',
                          message.role === 'assistant'
                            ? 'bg-gradient-to-br from-[var(--color-accent)] to-[#a88532] border-[var(--color-accent)]/20'
                            : 'bg-[var(--color-surface-2)] border-[var(--color-border-soft)]'
                        )}
                      >
                        {message.role === 'assistant'
                          ? <Bot size={14} className="text-[var(--color-bg)]" strokeWidth={2.5} />
                          : <User size={14} className="text-[var(--text-secondary)]" />
                        }
                      </div>

                      {/* Bubble */}
                      <div
                        className={cn(
                          'max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                          message.role === 'assistant'
                            ? 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-tl-none'
                            : 'bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-tr-none'
                        )}
                      >
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-1.5 bg-current animate-pulse rounded-full align-middle" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#a88532] flex items-center justify-center border border-[var(--color-accent)]/20 shadow-sm">
                      <Bot size={14} className="text-[var(--color-bg)]" strokeWidth={2.5} />
                    </div>
                    <div className="bg-[var(--color-bg-base)] px-4 py-3 rounded-2xl rounded-tl-none border border-[var(--color-border-soft)] shadow-sm">
                      <Loader2 size={14} className="text-[var(--color-accent)] animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[var(--color-border-soft)] flex items-end gap-3 bg-[var(--color-surface-2)]">
                <div className="flex-1 relative group">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe una pregunta forense..."
                    rows={1}
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-soft)] rounded-xl px-4 py-2.5
                      text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--text-tertiary)]
                      focus:outline-none focus:border-[var(--color-accent)]/40 focus:ring-1 focus:ring-[var(--color-accent)]/20
                      resize-none min-h-[42px] max-h-[120px] transition-all leading-relaxed"
                    style={{ height: `${Math.min(Math.max(input.split('\n').length * 24, 42), 120)}px` }}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={clearChat}
                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--color-accent)] transition-colors hover:bg-[var(--color-bg-base)] rounded-lg"
                    title="Nueva conversación"
                  >
                    <RefreshCw size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      'p-2.5 rounded-xl transition-all shadow-md',
                      input.trim() && !isLoading
                        ? 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:scale-105 active:scale-95'
                        : 'bg-[var(--color-surface-2)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                    )}
                  >
                    <Send size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="bg-[var(--color-surface-2)] px-4 pb-3">
                <p className="text-[9px] text-[var(--text-tertiary)] text-center font-mono uppercase tracking-[0.1em] opacity-60">
                  Método Socrático · Motor VeritasAI v2.4
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
