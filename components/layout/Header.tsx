'use client'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sliders, ChevronDown, X, Loader2, Zap, Shield, Activity, Bot } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/lib/store'
import { COUNTRIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { useI18n } from '@/lib/i18n'

export function Header() {
  const { preferences, setPreferences, openOnboarding } = useAppStore()
  const { t, language } = useI18n()
  const [searchOpen, setSearchOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const isEn = language === 'en'
  const currentCountry = COUNTRIES.find((c) => c.code === preferences.countryCode)

  const isUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (isUrl(searchQuery)) {
      setIsAnalyzing(true)
      try {
        // Enviar a la API de análisis
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: searchQuery, outlet_id: 'default' }) // Podemos mejorar la detección de outlet después
        })
        const data = await res.json()
        if (data.success) {
          // Redirigir a la página de resultados del artículo recién analizado
          window.location.href = `/article/${data.article.id}`
        } else {
          alert(data.error || 'Error analizando URL')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsAnalyzing(false)
        setSearchOpen(false)
        setSearchQuery('')
      }
    } else {
      // Búsqueda normal (esto se puede conectar a una página de búsqueda real)
      console.log('Searching for:', searchQuery)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] w-full h-16 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-soft)] flex items-center shadow-[0_1px_0_0_rgba(212,168,67,0.05)]">
      <div className="container-app w-full flex items-center justify-between gap-8">
        {/* Izquierda: logo + navegación principal */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex items-baseline gap-[3px]">
              <span className="font-display font-bold text-2xl tracking-tighter text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">Veritas</span>
              <span className="font-ui font-black text-sm tracking-widest uppercase text-[var(--color-accent)]">AI</span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border border-[var(--color-border)] rounded-[4px] leading-none">BETA</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/medios" className="font-ui text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap">
              {t.mediaDashboard}
            </Link>
            <Link href="/grafo" className="font-ui text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap">
              {t.connectionsGraph}
            </Link>
          </nav>
        </div>
        
        {/* Centro: búsqueda */}
        <div className="flex-1 max-w-xl hidden md:block">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search-expanded"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                className="relative flex flex-col"
              >
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search size={16} className={cn("absolute left-4 transition-colors", isAnalyzing ? "text-[var(--color-accent)] animate-pulse" : "text-[var(--color-text-tertiary)]")} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    disabled={isAnalyzing}
                    className="w-full pl-11 pr-24 py-2.5 rounded-xl text-sm font-ui
                      bg-[var(--color-surface-1)] border border-[var(--color-border-soft)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]
                      focus:outline-none focus:border-[var(--color-accent-dim)] focus:ring-1 focus:ring-[var(--color-accent-dim)]
                      transition-all duration-300 shadow-inner disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchOpen(false)
                    }}
                  />
                  <div className="absolute right-4 flex items-center gap-2">
                    {isUrl(searchQuery) && !isAnalyzing && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] animate-fade-in">Analizar URL</span>
                    )}
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                        aria-label={t.closeSearch}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </form>
                <motion.p 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 ml-4 text-[10px] text-[var(--color-text-tertiary)] font-medium"
                >
                  {t.searchExplanation}
                </motion.p>
              </motion.div>
            ) : (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-ui
                  bg-[var(--color-surface-1)]/50 border border-[var(--color-border-soft)]
                  text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] hover:border-[var(--color-border)]
                  transition-all w-full text-left group"
                aria-label="Buscar"
              >
                <Search size={16} className="group-hover:text-[var(--color-accent)] transition-colors" />
                <span className="flex-1 opacity-70">{t.searchShort}</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  ⌘K
                </kbd>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Derecha: país + preferencias */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative">
            <button
              onClick={() => setCountryOpen(!countryOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-1)] border border-transparent hover:border-[var(--color-border)] transition-all"
              aria-label={t.selectCountry}
              aria-expanded={countryOpen}
            >
              <span className="hidden sm:inline">{isEn ? currentCountry?.name : currentCountry?.nameEs ?? 'Global'}</span>
              <ChevronDown size={14} className={cn('transition-transform duration-300', countryOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {countryOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCountryOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute right-0 top-full mt-3 z-20 bg-[var(--color-surface-1)]/95 backdrop-blur-xl border border-[var(--color-border-soft)] rounded-xl p-2 min-w-[200px] shadow-2xl"
                  >
                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                      {t.regionLanguage}
                    </div>
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setPreferences({ countryCode: country.code, language: country.language })
                          setCountryOpen(false)
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-ui text-left transition-all',
                          preferences.countryCode === country.code
                            ? 'bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] shadow-sm'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'
                        )}
                      >
                        <span className="font-medium flex-1">{isEn ? country.name : country.nameEs}</span>
                        {preferences.countryCode === country.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={openOnboarding}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--color-text-tertiary)] border border-[var(--color-border-soft)] bg-[var(--color-surface-1)]/50 hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-1)] transition-all group"
            aria-label={t.preferences}
          >
            <Sliders size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
      {/* Analysis Overlay */}
      {isAnalyzing && typeof document !== 'undefined' && createPortal(
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg)]/90 backdrop-blur-2xl"
        >
          <div className="max-w-md w-full p-8 text-center space-y-8">
            <div className="relative inline-block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-2 border-dashed border-[var(--color-accent)]/30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[#a88532] flex items-center justify-center shadow-2xl shadow-[var(--color-accent)]/40"
                >
                  <Bot size={40} className="text-[var(--color-bg)]" />
                </motion.div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                {isEn ? "Forensic Ingestion" : "Ingesta Forense"}
              </h2>
              <div className="flex items-center justify-center gap-2 text-[var(--color-accent)]">
                <Activity size={14} className="animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                  Veritas Engine v2.4.0 — Processing
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-[var(--color-accent)]"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono animate-pulse">
                  // Fetching content via Cerebras Intelligence Cascade...
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono opacity-60">
                  // Cross-verifying manipulation patterns...
                </p>
              </div>
            </div>
          </div>
        </motion.div>,
        document.body
      )}
    </header>
  )
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
