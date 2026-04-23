'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { 
  Brain, AlertTriangle, CheckCircle, Clock, Zap, BarChart2, 
  ChevronDown, ExternalLink, Eye, EyeOff, Target
} from 'lucide-react'
import type { Article } from '@/lib/types'
import { getScoreLevel, getScoreColor, getScoreLabel } from '@/lib/types'
import { VeritasScore } from '@/components/score/VeritasScore'
import { cn } from '@/lib/utils'

// ── Score Breakdown radar ──────────────────────────────────
const SCORE_COMPONENTS = [
  { key: 'EMI', label: 'Manipulación Emocional', weight: 0.22, description: 'Técnicas que explotan el sistema límbico' },
  { key: 'FAS', label: 'Precisión Fáctica', weight: 0.18, description: 'Densidad y especificidad de hechos verificables' },
  { key: 'SBI', label: 'Sesgo de Fuentes', weight: 0.18, description: 'Diversidad y calidad de las fuentes citadas' },
  { key: 'NFS', label: 'Framing Narrativo', weight: 0.12, description: 'Cómo el encuadre dirige la interpretación' },
  { key: 'ODS', label: 'Omisión Estratégica', weight: 0.10, description: 'Información relevante omitida deliberadamente' },
  { key: 'LMS', label: 'Manipulación Lingüística', weight: 0.10, description: 'Técnicas neurolingüísticas y neuromarketing' },
  { key: 'SCP', label: 'Credibilidad del Medio', weight: 0.06, description: 'Prior basado en CRED-1 e historial del medio' },
  { key: 'CSS', label: 'Señal de Coordinación', weight: 0.04, description: 'Probabilidad de campaña coordinada / astroturfing' },
]

interface AnalysisPanelProps {
  article: Partial<Article> & {
    _scoreBreakdown?: Record<string, number>
    _primaryIntent?: string
    _coordinationRisk?: string
    _analysisProvider?: string
  }
  onAnalyze?: () => void
  loading?: boolean
  phase?: string
  phaseLabel?: string
  progressMs?: number
  compact?: boolean
}

const COORDINATION_RISK_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: 'Sin señal', color: 'var(--score-safe)' },
  low: { label: 'Riesgo bajo', color: 'var(--score-mild)' },
  medium: { label: 'Riesgo medio', color: 'var(--score-moderate)' },
  high: { label: 'Posible campaña coordinada', color: 'var(--score-critical)' },
}

const INTENT_LABELS: Record<string, { label: string; icon: string }> = {
  inform: { label: 'Informar', icon: '📰' },
  persuade: { label: 'Persuadir', icon: '🎯' },
  entertain: { label: 'Entretener', icon: '🎭' },
  alarm: { label: 'Alarmar', icon: '🚨' },
  mobilize: { label: 'Movilizar', icon: '📣' },
}

export function AnalysisPanel({
  article,
  onAnalyze,
  loading = false,
  phase = 'idle',
  phaseLabel = '',
  progressMs = 0,
  compact = false,
}: AnalysisPanelProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showNeutralized, setShowNeutralized] = useState(false)
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const isAnalyzed = article.analysisStatus === 'completed'
  const score = article.veritasScore
  const level = score !== undefined ? getScoreLevel(score) : null
  const scoreColor = score !== undefined ? getScoreColor(score) : 'var(--text-tertiary)'
  const breakdown = article._scoreBreakdown ?? {}
  const coordinationRisk = COORDINATION_RISK_LABELS[article._coordinationRisk ?? 'none']
  const intent = INTENT_LABELS[article._primaryIntent ?? 'inform']

  return (
    <div ref={panelRef} className={cn('flex flex-col gap-4', compact && 'gap-3')}>

      {/* Loading state — Progressive phases */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 border border-[var(--accent-primary)]/30"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--accent-primary)]/30"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{phaseLabel}</p>
                <div className="flex gap-1 mt-2">
                  {['dispatching', 'analyzing', 'synthesizing'].map((p) => (
                    <div
                      key={p}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors duration-500',
                        phase === 'dispatching' && p === 'dispatching' && 'bg-[var(--accent-primary)]',
                        phase === 'analyzing' && (p === 'dispatching' || p === 'analyzing') && 'bg-[var(--accent-primary)]',
                        phase === 'synthesizing' && 'bg-[var(--accent-primary)]',
                        'bg-[var(--border-subtle)]'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button when not analyzed */}
      {!isAnalyzed && !loading && onAnalyze && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-5 text-center border border-[var(--accent-primary)]/20 hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
          onClick={onAnalyze}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain size={20} className="text-[var(--accent-primary)]" />
            <span className="font-display font-semibold text-[var(--text-primary)]">Analizar con VeritasAI</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            Análisis multi-agente · Detección de 18+ técnicas · Score en ~8s
          </p>
          <button className="btn btn-primary text-sm py-2 px-6">
            <Zap size={14} />
            Iniciar análisis forense
          </button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {isAnalyzed && score !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Score hero */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-5">
                <VeritasScore score={score} size="lg" showLabel animated />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-lg font-display font-bold"
                      style={{ color: scoreColor }}
                    >
                      {getScoreLabel(score, 'es')}
                    </span>
                    {level === 'safe' && <CheckCircle size={16} className="text-[var(--score-safe)]" />}
                    {(level === 'severe' || level === 'critical') && <AlertTriangle size={16} className="text-[var(--score-severe)]" />}
                  </div>

                  <p className="text-xs text-[var(--text-tertiary)] mb-3">
                    {article.techniquesDetected?.length ?? 0} técnica(s) detectada(s) · 
                    {' '}{Math.round((article.analysisConfidence ?? 0) * 100)}% confianza
                    {progressMs > 0 && ` · ${(progressMs / 1000).toFixed(1)}s`}
                  </p>

                  {/* Meta badges */}
                  <div className="flex flex-wrap gap-2">
                    {intent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                        bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[0.7rem] border border-[var(--border-subtle)]">
                        {intent.icon} Intención: {intent.label}
                      </span>
                    )}
                    {coordinationRisk && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] border"
                        style={{
                          backgroundColor: `${coordinationRisk.color}15`,
                          color: coordinationRisk.color,
                          borderColor: `${coordinationRisk.color}40`,
                        }}
                      >
                        <Target size={10} />
                        Coordinación: {coordinationRisk.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score breakdown toggle */}
              {Object.keys(breakdown).length > 0 && (
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full mt-4 flex items-center justify-between text-xs text-[var(--text-tertiary)] 
                    hover:text-[var(--text-secondary)] transition-colors py-1"
                >
                  <span className="flex items-center gap-1">
                    <BarChart2 size={12} />
                    Desglose del score (8 componentes)
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform', showBreakdown && 'rotate-180')}
                  />
                </button>
              )}

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 grid grid-cols-1 gap-2"
                  >
                    {SCORE_COMPONENTS.map(({ key, label, weight, description }) => {
                      const componentScore = breakdown[key] ?? 0
                      const componentColor = getScoreColor(componentScore)
                      return (
                        <div key={key} className="flex items-center gap-3" title={description}>
                          <span className="text-[0.65rem] text-[var(--text-tertiary)] w-6 text-right font-mono">{key}</span>
                          <div className="flex-1 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${componentScore}%` }}
                              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: componentColor }}
                            />
                          </div>
                          <span className="text-[0.65rem] font-mono tabular-nums" style={{ color: componentColor }}>
                            {componentScore}
                          </span>
                          <span className="text-[0.6rem] text-[var(--text-disabled)] w-8">w:{weight}</span>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Neutralized title/text */}
            {article.titleNeutralized && article.titleNeutralized !== article.title && (
              <div className="glass-card p-4">
                <button
                  onClick={() => setShowNeutralized(!showNeutralized)}
                  className="w-full flex items-center justify-between text-left text-xs font-medium 
                    text-[var(--accent-secondary)] mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    {showNeutralized ? <EyeOff size={12} /> : <Eye size={12} />}
                    Versión neutralizada
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform', showNeutralized && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {showNeutralized && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <p className="text-[0.7rem] text-[var(--text-disabled)] uppercase tracking-wider mb-1">
                          Titular original
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] line-through decoration-[var(--score-critical)]/50">
                          {article.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] text-[var(--text-disabled)] uppercase tracking-wider mb-1">
                          Titular neutralizado
                        </p>
                        <p className="text-sm text-[var(--text-primary)] font-medium">
                          {article.titleNeutralized}
                        </p>
                      </div>
                      {article.neutralizedText && (
                        <div>
                          <p className="text-[0.7rem] text-[var(--text-disabled)] uppercase tracking-wider mb-1">
                            Resumen factual
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {article.neutralizedText}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Techniques detected */}
            {(article.techniquesDetected?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-display font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-1">
                  Técnicas de manipulación detectadas
                </h3>
                {article.techniquesDetected?.map((dt, i) => {
                  const isExpanded = expandedTechnique === `${dt.technique.slug}-${i}`
                  const techColor = getScoreColor(Math.round(dt.technique.severity * 100))
                  return (
                    <motion.div
                      key={`${dt.technique.slug}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        'glass-card p-3 cursor-pointer hover:border-[var(--border-default)] transition-colors',
                        isExpanded && 'border-[var(--border-default)]'
                      )}
                      onClick={() => setExpandedTechnique(isExpanded ? null : `${dt.technique.slug}-${i}`)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">{dt.technique.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-sm font-display font-semibold"
                              style={{ color: techColor }}
                            >
                              {dt.technique.nameEs}
                            </span>
                            <span className="text-[0.65rem] text-[var(--text-disabled)] ml-auto">
                              {Math.round(dt.confidence * 100)}%
                            </span>
                          </div>

                          {/* Quote */}
                          <blockquote
                            className="text-[0.75rem] italic text-[var(--text-tertiary)] border-l-2 pl-2 mb-1"
                            style={{ borderColor: techColor }}
                          >
                            "{dt.quote}"
                          </blockquote>

                          {/* Confidence bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-0.5 bg-[var(--border-subtle)] rounded-full">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${dt.confidence * 100}%`,
                                  backgroundColor: techColor,
                                }}
                              />
                            </div>
                            <ChevronDown
                              size={12}
                              className={cn('text-[var(--text-disabled)] transition-transform shrink-0', isExpanded && 'rotate-180')}
                            />
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-[var(--border-subtle)]"
                          >
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
                              {dt.explanation}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[0.65rem] text-[var(--text-disabled)]">
                                {dt.technique.biopsychosocialLevel === 'biological' && '🧠 Nivel biológico — Sistema límbico'}
                                {dt.technique.biopsychosocialLevel === 'psychological' && '🧩 Nivel psicológico — Cognición'}
                                {dt.technique.biopsychosocialLevel === 'social' && '👥 Nivel social — Identidad grupal'}
                              </span>
                              {dt.technique.academicSource && (
                                <span className="text-[0.65rem] text-[var(--text-disabled)] ml-auto italic">
                                  {dt.technique.academicSource}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* No manipulation */}
            {article.techniquesDetected?.length === 0 && (
              <div className="glass-card p-4 border border-[var(--score-safe)]/20 flex items-center gap-3">
                <CheckCircle size={20} className="text-[var(--score-safe)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--score-safe)]">Sin técnicas de manipulación detectadas</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Este artículo no presenta señales documentadas de manipulación mediática.
                  </p>
                </div>
              </div>
            )}

            {/* Academic anchoring */}
            <div className="text-[0.65rem] text-[var(--text-disabled)] text-center leading-relaxed px-2">
              Análisis basado en Da San Martino et al. (2020), SemEval 2020 Task 11, BABE Dataset (Raza 2022), Kahneman (2011).
              {' '}El sistema puede cometer errores. Confianza del análisis: {Math.round((article.analysisConfidence ?? 0) * 100)}%.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
