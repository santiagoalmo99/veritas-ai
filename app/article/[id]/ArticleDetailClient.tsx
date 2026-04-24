'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Clock, Eye, ExternalLink, Shield, Globe, User, 
  AlertCircle, ChevronDown, EyeOff, CheckCircle, AlertTriangle,
  Bot
} from 'lucide-react'
import type { Article } from '@/lib/types'
import { getScoreColor, getScoreLevel, getScoreLabel } from '@/lib/types'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
import { VeritasScore, VeritasBadge, VeritasBubble } from '@/components/score/VeritasScore'
import { SocraticChat } from '@/components/analysis/SocraticChat'
import { useAnalysis } from '@/lib/hooks/useAnalysis'
import { HighlightedBody } from '@/components/article/HighlightedBody'
import { AnalysisTimeline } from '@/components/analysis/AnalysisTimeline'
import { TechniqueAccordion } from '@/components/analysis/TechniqueAccordion'

const ALERT_LEVEL_CONFIG = {
  green: { label: 'Medio confiable', color: 'var(--score-safe)' },
  yellow: { label: 'Sesgo moderado', color: 'var(--score-mild)' },
  orange: { label: 'Sesgo alto', color: 'var(--score-moderate)' },
  red: { label: 'Alta manipulación', color: 'var(--score-critical)' },
}

export function ArticleDetailClient({ article: initialArticle }: { article: Article }) {
  const [imageError, setImageError] = useState(false)
  const [showNeutralized, setShowNeutralized] = useState(false)
  const isEn = initialArticle.language === 'en'

  const { result, loading, phaseLabel, progressMs, analyze, error } = useAnalysis(initialArticle)
  
  // Merge result data into article object for display
  const article = result ? {
    ...initialArticle,
    ...result,
    title: (result.title && result.title !== "Cargando análisis forense...") ? result.title : (result.titleNeutralized || initialArticle.title),
    content: result.content || initialArticle.content
  } as Article : initialArticle
  const needsAnalysis = article.analysisStatus === 'pending' || article.analysisStatus === undefined

  // Auto-trigger analysis if pending
  useEffect(() => {
    if (needsAnalysis && !loading && article.url) {
      analyze()
    }
  }, [needsAnalysis, loading, article.url, analyze])

  // Localized Labels
  const labels = {
    back: isEn ? "Back to feed" : "Volver al feed",
    originalTitle: isEn ? "Original Title" : "Titular Original",
    neutralizedTitle: isEn ? "Neutralized Title" : "Titular Neutralizado",
    veritasVerdict: isEn ? "VeritasAI Verdict" : "Veredicto VeritasAI",
    rewriteBtn: isEn ? "VeritasAI: Rewrite without bias" : "VeritasAI: Re-escribir sin sesgos",
    showOriginalBtn: isEn ? "Show Original Article" : "Ver más: Artículo Original",
    neutralizing: isEn ? "Neutralizing content..." : "Neutralizando contenido...",
    primaryIntent: isEn ? "Primary Intent" : "Intención Primaria",
    forensicAnalysis: isEn ? "Forensic Analysis" : "Análisis Forense",
    aiAssistant: isEn ? "AI Assistant" : "Asistente IA",
    share: isEn ? "Share" : "Compartir",
    originalSource: isEn ? "Original Source" : "Fuente Original",
    readings: isEn ? "readings" : "lecturas",
    confidence: isEn ? "Confidence" : "Confianza",
    patterns: isEn ? "Patterns Identified" : "Patrones Identificados",
    historicalScore: isEn ? "Historical Score" : "Score Histórico",
    reliability: isEn ? "Reliability" : "Credibilidad",
    standardMode: isEn ? "Standard Mode" : "Modo Estándar",
    privacyMode: isEn ? "Privacy Mode" : "Modo Privado",
    chainOfThought: isEn ? "Multi-Layer Analysis (Chain of Thought)" : "Análisis Multi-Capa (Chain of Thought)",
    engineVer: isEn ? "Forensic validation by Veritas Engine v2.4.0" : "Validación forense por Veritas Engine v2.4.0",
    success: isEn ? "Success in" : "Éxito en",
  }

  const intentLabels = {
    inform: isEn ? "Informative" : "Informativo",
    persuade: isEn ? "Persuasive" : "Persuasivo",
    agitate: isEn ? "Agitational" : "Agitador",
    deceive: isEn ? "Deceptive" : "Engañoso",
  }

  return (
    <div className="container-app pb-16">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] 
            hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {labels.back}
        </Link>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{isEn ? "Analysis failed: " : "El análisis falló: "} {error}</span>
          <button onClick={() => analyze()} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">
        
        {/* ── Main Column (Editorial) ──────────────────────────── */}
        <main className="flex flex-col gap-12">
          
          {/* Article Header */}
          <section className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest border border-[var(--color-accent)]/20">
                  {article.category}
                </span>
                <div className="h-4 w-px bg-[var(--color-border-soft)]" />
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Globe size={12} className="text-[var(--color-accent)]" />
                    <span className="text-[var(--text-secondary)]">{article.outlet?.name}</span>
                    <VeritasBubble score={article.outlet?.currentVeritasAvg ?? 0} />
                  </span>
                  {article.journalist && (
                    <>
                      <span className="opacity-30">/</span>
                      <span className="flex items-center gap-1.5">
                        <User size={12} />
                        <span className="text-[var(--text-tertiary)]">{article.journalist}</span>
                        <VeritasBubble score={article.journalistScore ?? 0} />
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Title Hierarchy: ORIGINAL FIRST */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="article-title text-[var(--color-text-primary)]"
                >
                  {article.title}
                </motion.h1>

                {/* Neutralized version as secondary reference */}
                {article.titleNeutralized && article.titleNeutralized !== article.title && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-[var(--color-surface-1)] border-l-4 border-[var(--color-accent)]/60"
                  >
                    <span className="forensic-label mb-2">{labels.neutralizedTitle}</span>
                    <p className="text-lg font-ui font-medium text-[var(--color-accent)] leading-tight italic">
                      "{article.titleNeutralized}"
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--color-accent)]" />
                    {formatRelativeTime(article.publishedAt ?? '', isEn ? 'en' : 'es')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye size={14} className="text-[var(--color-accent)]" />
                    {formatNumber(article.viewCount ?? 0)} {labels.readings}
                  </span>
                  <div className="flex gap-4 ml-auto">
                    <button className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                      <ExternalLink size={14} />
                      {labels.share}
                    </button>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
                    >
                      {labels.originalSource}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            {article.imageUrl && !imageError && (
              <motion.div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden glass border border-[var(--color-border-soft)] group">
                <Image
                  src={article.imageUrl}
                  alt={article.title ?? ''}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-transparent to-transparent opacity-80" />
              </motion.div>
            )}
          </section>

          {/* VeritasAI Rewrite Button */}
          {!needsAnalysis && (
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNeutralized(!showNeutralized)}
                className={cn(
                  "flex items-center gap-3 px-10 py-5 rounded-2xl font-display font-bold text-sm uppercase tracking-widest transition-all shadow-2xl",
                  showNeutralized 
                    ? "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border-soft)]"
                    : "bg-gradient-to-r from-[var(--color-accent)] to-[#a88532] text-[var(--color-bg-base)] shadow-[var(--color-accent)]/20"
                )}
              >
                {showNeutralized ? <ArrowLeft size={18} /> : <Bot size={18} />}
                {showNeutralized ? labels.showOriginalBtn : labels.rewriteBtn}
              </motion.button>
            </div>
          )}

          {/* Article Verdict */}
          {!needsAnalysis && !showNeutralized && (
            <section className="p-8 rounded-3xl bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-bg-base)] border border-[var(--color-border-soft)] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={80} className="text-[var(--color-accent)]" />
              </div>
              <div className="flex items-start gap-8 relative z-10">
                <div className="w-20 h-20 shrink-0">
                   <VeritasScore score={article.veritasScore ?? 0} size="md" animated />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="forensic-label mb-0">{labels.veritasVerdict}</h3>
                    <div className="px-2 py-0.5 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-widest">
                      Risk Assessment
                    </div>
                  </div>
                  <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
                    {isEn ? "This article presents" : "Este artículo presenta"} <span className="font-black underline decoration-2 underline-offset-4" style={{ color: getScoreColor(article.veritasScore ?? 0) }}>{getScoreLabel(article.veritasScore ?? 0, isEn ? 'en' : 'es').toUpperCase()}</span>. 
                    {isEn ? ` We identified ${article.techniquesDetected?.length} precision patterns of semantic manipulation.` : ` Hemos identificado ${article.techniquesDetected?.length} patrones precisos de manipulación semántica.`}
                  </p>
                  
                  {/* Real Forensic Summary (Verdict) */}
                  <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-base)]/40 border border-white/5">
                    <p className="font-ui text-base text-[var(--color-text-primary)] leading-relaxed m-0 italic font-medium">
                      {article.analysisStatus === 'completed' 
                        ? `"${article.summaryNeutralized || (isEn ? 'No forensic summary generated.' : 'Veredicto no disponible.')}"`
                        : (isEn ? "Gathering forensic evidence..." : "Recopilando evidencia forense...")
                      }
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-4 items-center border-t border-[var(--color-border-soft)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(article.veritasScore ?? 0) }} />
                      <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                        {isEn ? "Score Mapping:" : "Mapeo de Score:"} {article.veritasScore}/100 (Inverso: +Score = +Riesgo)
                      </span>
                    </div>
                    <Link href="/metodologia" className="text-[10px] font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1 uppercase tracking-widest">
                      {isEn ? "View Methodology" : "Ver Metodología"}
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Article Content Area */}
          <section className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={showNeutralized ? 'neutralized' : 'original'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {showNeutralized ? (
                  <div className="article-body">
                    <p className="text-[10px] font-mono uppercase text-[var(--color-accent)] mb-8 tracking-[0.3em] opacity-80 animate-pulse">
                      // {labels.neutralizing}
                    </p>
                    <HighlightedBody 
                      text={article.contentNeutralized || article.summaryNeutralized || ''} 
                      techniques={[]} 
                    />
                  </div>
                ) : (
                  <HighlightedBody 
                    text={article.content || article.excerpt} 
                    techniques={article.techniquesDetected || []} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Forensic Command Center: Chain of Thought */}
          {!needsAnalysis && (
            <section className="pt-16 border-t border-[var(--color-border-soft)] space-y-10">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                  {labels.chainOfThought}
                </h3>
                <p className="text-[10px] text-[var(--text-disabled)] font-mono">
                  {labels.engineVer} • Status: <span className="text-green-500 uppercase">Verified</span>
                </p>
              </div>

              <div className="bg-[var(--color-surface-1)]/30 rounded-3xl p-8 border border-[var(--color-border-soft)] backdrop-blur-sm">
                <AnalysisTimeline 
                  active={!needsAnalysis} 
                  logs={article.analysisLogs || []} 
                />

                {/* Detailed Technical Log Board */}
                {article.analysisLogs && article.analysisLogs.length > 0 && (
                  <div className="mt-10 rounded-2xl bg-[#050506] border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <Bot size={14} className="text-[var(--color-accent)]" />
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]">
                          Forensic Execution Log
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-[var(--color-accent)]">
                          {labels.success} {progressMs ? `${(progressMs/1000).toFixed(1)}s` : '0.8s'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {article.analysisLogs.map((log, i) => (
                        <motion.div 
                          key={log.stepId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex gap-6 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] group hover:bg-white/[0.03] transition-all"
                        >
                          <div className="text-[9px] font-mono text-[var(--color-accent)] shrink-0 w-16 opacity-60">
                            [{log.timestamp}]
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                              {log.stepId}
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed group-hover:text-[var(--color-text-primary)] transition-colors">
                              {isEn ? log.technicalDetail : log.technicalDetailEs}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside className="space-y-8 lg:sticky lg:top-12">
          
          <div className="glass-card p-8 text-center space-y-6 border border-[var(--color-border-soft)]">
            <span className="forensic-label">VeritasScore™ Index</span>
            <VeritasScore score={article.veritasScore ?? 0} size="xl" animated showLabel />
            
            <div className="space-y-4 pt-4 border-t border-[var(--color-border-soft)]">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                <span>{labels.primaryIntent}</span>
                <span className="text-[var(--color-text-primary)]">{intentLabels[article.primaryIntent || 'inform']}</span>
              </div>
              <div className="w-full h-1 bg-[var(--color-border-soft)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: article.veritasScore ? `${article.veritasScore}%` : '0%' }}
                  className="h-full bg-[var(--color-accent)]"
                />
              </div>
              <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-mono tracking-tighter">
                {labels.confidence}: {Math.round((article.analysisConfidence ?? 0.95) * 100)}%
              </p>
            </div>
          </div>

          {!needsAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="forensic-label mb-0">{labels.patterns}</h3>
                <span className="px-2 py-0.5 rounded-md bg-[var(--color-surface-1)] text-[var(--color-accent)] text-[10px] font-mono border border-[var(--color-accent)]/20">
                  {article.techniquesDetected?.length}
                </span>
              </div>
              <div className="glass-card divide-y divide-[var(--color-border-soft)] overflow-hidden border border-[var(--color-border-soft)]">
                {article.techniquesDetected?.map((dt, i) => (
                  <TechniqueAccordion key={i} dt={dt} index={i} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="forensic-label px-2 mb-0">{labels.aiAssistant}</h3>
            <div className="rounded-3xl border border-[var(--color-border-soft)] overflow-hidden bg-[var(--color-surface-1)]/30 backdrop-blur-xl">
               <SocraticChat article={article} />
            </div>
          </div>

          {/* Source Analysis Section */}
          <div className="space-y-4">
            <h3 className="forensic-label px-2 mb-0">Source Reliability</h3>
            
            {/* Outlet Stats */}
            <div className="glass-card p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={40} className="text-[var(--color-accent)]" />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold font-display bg-white/[0.03] border border-white/5 text-[var(--color-text-primary)] shadow-inner">
                  {article.outlet?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-display font-bold text-[var(--color-text-primary)] leading-tight">{article.outlet?.name}</h4>
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-mono mt-0.5">{article.outlet?.domain}</p>
                </div>
                <VeritasBubble score={article.outlet?.currentVeritasAvg} className="w-7 h-7 text-[10px]" />
              </div>

              <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                <div className="bg-[#0c0d10] p-3 text-center">
                  <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mb-1">{labels.historicalScore}</p>
                  <p className="text-sm font-display font-black text-[var(--color-text-primary)]">{article.outlet?.currentVeritasAvg ?? '—'}</p>
                </div>
                <div className="bg-[#0c0d10] p-3 text-center">
                  <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mb-1">{labels.reliability}</p>
                  <p className="text-sm font-display font-black text-[var(--color-text-primary)]">
                    {article.outlet?.credScore ? `${Math.round(article.outlet.credScore * 100)}%` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Journalist Stats */}
            {article.journalist && (
              <div className="glass-card p-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <User size={40} className="text-[var(--color-accent)]" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-display bg-white/[0.03] border border-white/5 text-[var(--color-text-primary)] shadow-inner">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-display font-bold text-[var(--color-text-primary)] leading-tight">{article.journalist}</h4>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-mono mt-0.5">Primary Contributor</p>
                  </div>
                  <VeritasBubble score={article.journalistScore ?? 0} className="w-7 h-7 text-[10px]" />
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                  <div className="bg-[#0c0d10] p-3 text-center">
                    <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mb-1">Author Score</p>
                    <p className="text-sm font-display font-black text-[var(--color-text-primary)]">{article.journalistScore ?? '—'}</p>
                  </div>
                  <div className="bg-[#0c0d10] p-3 text-center">
                    <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mb-1">Risk Level</p>
                    <p className="text-[9px] font-display font-black uppercase" style={{ color: getScoreColor(article.journalistScore ?? 0) }}>
                      {getScoreLabel(article.journalistScore ?? 0, isEn ? 'en' : 'es')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function MediaBadge({ outlet }: { outlet: any }) {
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 shadow-sm"
      style={{ backgroundColor: `color-mix(in srgb, ${getScoreColor(outlet?.currentVeritasAvg ?? 0)}, transparent 80%)` }}
    >
      <div className="w-5 h-5 rounded-lg bg-[var(--color-bg-base)] flex items-center justify-center text-[10px] font-bold border border-[var(--color-border-soft)] text-[var(--color-text-primary)]">
        {outlet?.name?.charAt(0)}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">{outlet?.name}</span>
      <VeritasScore score={outlet?.currentVeritasAvg} size="xs" animated />
    </div>
  )
}
