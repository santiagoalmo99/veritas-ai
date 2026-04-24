'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import type { Article } from '@/lib/types'

interface AnalysisState {
  loading: boolean
  phase: 'idle' | 'dispatching' | 'analyzing' | 'synthesizing' | 'complete' | 'error'
  phaseLabel: string
  result: Partial<Article> | null
  error: string | null
  progressMs: number
}

const PHASE_LABELS: Record<string, string> = {
  idle: 'Listo para analizar',
  dispatching: 'Clasificando artículo…',
  analyzing: 'Detectando técnicas de manipulación…',
  synthesizing: 'Calculando VeritasScore™…',
  complete: 'Análisis completo',
  error: 'Error en el análisis',
}

// Progressive phases timing (mimics the multi-agent fan-out)
const PHASE_TIMELINE = [
  { phase: 'dispatching', at: 0 },
  { phase: 'analyzing', at: 500 },
  { phase: 'synthesizing', at: 4000 },
]

export function useAnalysis(article: Partial<Article> | null) {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    phase: 'idle',
    phaseLabel: PHASE_LABELS.idle,
    result: article ?? null,
    error: null,
    progressMs: 0,
  })

  const startRef = useRef<number>(0)
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearPhaseTimers = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout)
    phaseTimersRef.current = []
  }, [])

  const analyze = useCallback(async (targetArticle?: Partial<Article>) => {
    const art = targetArticle ?? article
    if (!art?.url && !art?.title && !art?.excerpt) return

    setState((s) => ({ ...s, loading: true, phase: 'dispatching', phaseLabel: PHASE_LABELS.dispatching, error: null }))
    startRef.current = Date.now()

    // Schedule progressive phase UI updates
    clearPhaseTimers()
    PHASE_TIMELINE.forEach(({ phase, at }) => {
      const t = setTimeout(() => {
        setState((s) =>
          s.loading ? { ...s, phase: phase as AnalysisState['phase'], phaseLabel: PHASE_LABELS[phase] ?? phase } : s
        )
      }, at)
      phaseTimersRef.current.push(t)
    })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: art.url,
          title: art.title,
          excerpt: art.excerpt,
          content: art.summaryNeutralized, // if we already fetched full content
          outletName: art.outlet?.name,
          outletDomain: art.outlet?.domain,
        }),
      })

      clearPhaseTimers()

      if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`)

      const data = await res.json()

      setState({
        loading: false,
        phase: 'complete',
        phaseLabel: PHASE_LABELS.complete,
        error: null,
        progressMs: Date.now() - startRef.current,
        result: {
          ...art,
          veritasScore: data.veritasScore,
          analysisStatus: 'completed',
          analysisConfidence: data.analysisConfidence,
          techniquesDetected: data.techniquesDetected ?? [],
          titleNeutralized: data.titleNeutralized,
          summaryNeutralized: data.summaryNeutralized,
          primaryIntent: data.primaryIntent ?? art.primaryIntent,
          analysisLogs: data.analysisLogs ?? [],
          category: data.category ?? art.category,
          title: data.title ?? art.title,
          content: data.content ?? art.content,
        } as Partial<Article>,
      })
    } catch (err) {
      clearPhaseTimers()
      setState((s) => ({
        ...s,
        loading: false,
        phase: 'error',
        phaseLabel: PHASE_LABELS.error,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [article, clearPhaseTimers])

  // Cleanup on unmount
  useEffect(() => () => clearPhaseTimers(), [clearPhaseTimers])

  return { ...state, analyze }
}
