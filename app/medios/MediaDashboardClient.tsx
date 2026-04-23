'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { Shield, TrendingUp, TrendingDown, Minus, Globe, BarChart2, AlertCircle, Loader2, Zap, Activity } from 'lucide-react'
import type { MediaOutlet } from '@/lib/types'
import { getScoreColor, getScoreLevel } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { VeritasBubble } from '@/components/score/VeritasScore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// Score → alert level background for chart dots
function getOutletDotColor(outlet: MediaOutlet): string {
  const avg = outlet.currentVeritasAvg ?? 0
  if (avg <= 20) return 'var(--score-safe)'
  if (avg <= 40) return 'var(--score-mild)'
  if (avg <= 60) return 'var(--score-moderate)'
  if (avg <= 80) return 'var(--score-severe)'
  return 'var(--score-critical)'
}

const ALERT_BADGE = {
  green: 'bg-[var(--score-safe)]/15 text-[var(--score-safe)] border-[var(--score-safe)]/30',
  yellow: 'bg-[var(--score-mild)]/15 text-[var(--score-mild)] border-[var(--score-mild)]/30',
  orange: 'bg-[var(--score-moderate)]/15 text-[var(--score-moderate)] border-[var(--score-moderate)]/30',
  red: 'bg-[var(--score-critical)]/15 text-[var(--score-critical)] border-[var(--score-critical)]/30',
}

function getAlertLabel(level: string, t: any) {
  switch(level) {
    case 'green': return t.reliable
    case 'yellow': return t.moderateBias
    case 'orange': return t.highBias
    case 'red': return t.highManipulation
    default: return ''
  }
}

function MediaTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MediaOutlet }> }) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  const outlet = payload[0]?.payload
  if (!outlet) return null
  const scoreColor = getScoreColor(outlet.currentVeritasAvg)

  return (
    <div className="glass-card p-3 min-w-[180px] border border-[var(--border-default)]">
      <p className="font-display font-bold text-[var(--text-primary)] mb-1">{outlet.name}</p>
      <p className="text-xs text-[var(--text-tertiary)] mb-2">{outlet.domain}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)]">VeritasScore avg:</span>
        <span className="font-bold tabular-nums" style={{ color: scoreColor }}>{outlet.currentVeritasAvg}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{t.bias}:</span>
        <span className="font-medium" style={{ color: outlet.politicalBiasScore < 0 ? '#60adf7' : outlet.politicalBiasScore > 0 ? '#f77f60' : 'var(--text-tertiary)' }}>
          {outlet.politicalBiasScore < -0.1 ? t.left : outlet.politicalBiasScore > 0.1 ? t.right : t.center}
          {' '}({outlet.politicalBiasScore > 0 ? '+' : ''}{outlet.politicalBiasScore.toFixed(2)})
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{t.articles}:</span>
        <span>{outlet.articlesAnalyzed.toLocaleString()}</span>
      </div>
    </div>
  )
}

type SortKey = 'score' | 'reliability' | 'articles'
type Tab = 'outlets' | 'journalists'

export function MediaDashboardClient({ 
  initialOutlets = [], 
  initialJournalists = [] 
}: { 
  initialOutlets?: MediaOutlet[], 
  initialJournalists?: any[] 
}) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('outlets')
  const [selectedOutlet, setSelectedOutlet] = useState<MediaOutlet | null>(null)
  const [selectedJournalist, setSelectedJournalist] = useState<any | null>(null)
  const [countryFilter, setCountryFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<SortKey>('score')

  const countries = useMemo(() => {
    const codes = [...new Set(initialOutlets.map((o) => o.countryCode))]
    return codes
  }, [initialOutlets])

  // Usar periodistas de Supabase
  const JOURNALISTS = useMemo(() => {
    return initialJournalists
  }, [initialJournalists])

  const filteredOutlets = useMemo(() => {
    let outlets = countryFilter === 'ALL'
      ? initialOutlets
      : initialOutlets.filter((o) => o.countryCode === countryFilter)


    return [...outlets].sort((a, b) =>
      sortBy === 'score' ? b.currentVeritasAvg - a.currentVeritasAvg :
      sortBy === 'reliability' ? b.reliabilityScore - a.reliabilityScore :
      b.articlesAnalyzed - a.articlesAnalyzed
    )
  }, [countryFilter, sortBy])

  const [analyzingUrl, setAnalyzingUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!analyzingUrl || isAnalyzing) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      const outletId = selectedOutlet?.id || initialOutlets[0]?.id

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzingUrl, outlet_id: outletId })
      })
      
      const data = await res.json()
      if (data.success) {
        setAnalysisResult(data.analysis)
        setAnalyzingUrl('')
      } else {
        alert(data.error || 'Error en el análisis')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión con el motor forense')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Scatter chart data
  const scatterData = useMemo(() => filteredOutlets.map((o) => ({
    ...o,
    x: (o.politicalBiasScore + 1) * 50,
    y: o.reliabilityScore * 100,
    size: Math.max(Math.log(o.articlesAnalyzed + 1) * 10, 60),
  })), [filteredOutlets])

  return (
    <div className="container-app py-10 flex flex-col gap-10">
      
      {/* Header Forense */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">{t.databaseCentral}</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tighter text-[var(--color-text-primary)]">
              {t.mediaAudit}
            </h1>
            <p className="text-[var(--color-text-tertiary)] max-w-2xl text-sm font-medium leading-relaxed">
              {t.mediaAuditDesc}
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-widest max-w-fit">
              <Shield size={12} />
              {t.scoreExplanation}
            </div>
          </div>


          
          {/* Tabs Premium */}
          <div className="flex p-1 bg-[var(--color-surface-1)] border border-[var(--color-border-soft)] rounded-xl">
            {(['outlets', 'journalists'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
                  activeTab === tab
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border-soft)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                )}
              >
                {tab === 'outlets' ? t.media : t.journalistTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Legend Forense */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[var(--color-border-soft)]">
          {[
            { color: 'var(--score-safe)', label: 'Neutral', range: '0-20' },
            { color: 'var(--score-mild)', label: 'Sesgo Leve', range: '21-40' },
            { color: 'var(--score-moderate)', label: 'Moderado', range: '41-60' },
            { color: 'var(--score-severe)', label: 'Severo', range: '61-80' },
            { color: 'var(--score-critical)', label: 'Propaganda', range: '81-100' },
          ].map(({ color, label, range }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</span>
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] opacity-60">{range}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Tabla/Ranking (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filtros Contextuales */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', ...countries].map((code) => (
                <button
                  key={code}
                  onClick={() => setCountryFilter(code)}
                  className={cn(
                    'px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0',
                    countryFilter === code
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border-[var(--color-accent-dim)]'
                      : 'bg-[var(--color-surface-1)] text-[var(--color-text-tertiary)] border-[var(--color-border-soft)] hover:border-[var(--color-text-tertiary)]'
                  )}
                >
                  {code === 'ALL' ? t.all : code}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">{t.sortBy}:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] focus:outline-none cursor-pointer"
              >
                <option value="score">{t.veritasScore}</option>
                <option value="reliability">{t.reliability}</option>
                <option value="articles">{t.volume}</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'outlets' ? (
              <motion.div
                key="outlets-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Media Bias Chart (REAL DATA FROM SUPABASE) */}
                <div className="glass-card p-6 h-[450px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] flex items-center gap-2">
                <Shield size={12} className="text-[var(--color-accent)]" /> 
                {t.mediaAudit} — Topology
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--score-safe)]" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Reliable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--score-critical)]" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">High Risk</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="1 4" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0, 100]} 
                  hide 
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[0, 100]} 
                  hide 
                />
                <Tooltip content={<MediaTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-accent)' }} />
                
                {/* Quadrant Markers */}
                <ReferenceLine x={50} stroke="var(--color-border)" strokeWidth={1} />
                <ReferenceLine y={50} stroke="var(--color-border)" strokeWidth={1} />
                
                <Scatter name="Outlets" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getOutletDotColor(entry)} 
                      className="cursor-pointer transition-all duration-500 hover:scale-125"
                      onClick={() => setSelectedOutlet(entry)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] border-t border-[var(--color-border-soft)] pt-4">
              <span className="flex items-center gap-2"><TrendingDown size={10} /> {t.progressive}</span>
              <span className="opacity-40">{t.center}</span>
              <span className="flex items-center gap-2">{t.conservative} <TrendingUp size={10} /></span>
            </div>
                </div>

                <div className="space-y-2">
                {filteredOutlets.map((outlet, i) => {
                  const isSelected = selectedOutlet?.id === outlet.id
                  return (
                    <button
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(isSelected ? null : outlet)}
                      className={cn(
                        'w-full glass-card p-4 flex items-center gap-6 transition-all duration-300 text-left group',
                        isSelected ? 'border-[var(--color-accent-dim)] bg-[var(--color-accent-dim)]/5' : 'hover:border-[var(--color-border)]'
                      )}
                    >
                      <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] w-4 text-right">{i + 1}</span>
                      
                {/* Avatar / Logo Forense */}
                <MediaLogo domain={outlet.domain} name={outlet.name} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] truncate">{outlet.name}</h3>
                          <span className={cn('px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-tighter border', ALERT_BADGE[outlet.alertLevel])}>
                            {getAlertLabel(outlet.alertLevel, t)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                          <span className="flex items-center gap-1"><Globe size={10} /> {outlet.countryCode}</span>
                          <span className="flex items-center gap-1"><BarChart2 size={10} /> {outlet.articlesAnalyzed.toLocaleString()} arts.</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">VeritasScore</span>
                            <VeritasBubble score={outlet.currentVeritasAvg} />
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                            {outlet.reliabilityScore > 0.5
                              ? <span className="text-[var(--score-safe)]">{t.stableTrend}</span>
                              : <span className="text-[var(--score-critical)]">{t.volatileTrend}</span>
                            }
                          </div>
                        </div>
                        <ChevronRight size={16} className={cn('text-[var(--color-text-tertiary)] transition-transform', isSelected && 'rotate-90')} />
                      </div>
                    </button>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key="journalists-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card overflow-hidden"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border-soft)] bg-[var(--color-surface-1)]">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">{t.rank}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">{t.journalistTitle}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Score</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">{t.reliability}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">{t.docs}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JOURNALISTS.map((j, i) => (
                      <tr 
                        key={j.id} 
                        className="border-b border-[var(--color-border-soft)] hover:bg-[var(--color-surface-1)] transition-colors cursor-pointer group"
                        onClick={() => setSelectedJournalist(j)}
                      >
                        <td className="px-6 py-4 text-xs font-mono text-[var(--color-text-tertiary)]">{i + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] font-bold border border-[var(--color-border-soft)]">
                              {j.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--color-text-primary)]">{j.name}</p>
                              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{j.outlets.join(', ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <VeritasBubble score={j.score} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-20 h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border-soft)]">
                            <div 
                              className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" 
                              style={{ width: `${j.reliability * 100}%` }} 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold tabular-nums text-[var(--color-text-secondary)]">{j.articles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Columna Derecha: Sidebar Forense (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          
          {/* Dossier Card */}
          <AnimatePresence mode="wait">
            {(activeTab === 'outlets' ? selectedOutlet : selectedJournalist) ? (
              <motion.div
                key={activeTab === 'outlets' ? selectedOutlet?.id : selectedJournalist?.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card p-6 border-t-4"
                style={{ borderTopColor: getScoreColor(activeTab === 'outlets' ? selectedOutlet?.currentVeritasAvg : selectedJournalist?.score) }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-black text-[var(--color-text-primary)] leading-tight">
                      {activeTab === 'outlets' ? selectedOutlet?.name : selectedJournalist?.name}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mt-1">
                      {activeTab === 'outlets' ? selectedOutlet?.domain : t.journalistTitle}
                    </p>
                  </div>
                  <VeritasBubble score={activeTab === 'outlets' ? selectedOutlet?.currentVeritasAvg : selectedJournalist?.score} className="w-8 h-8 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border-soft)] rounded-xl shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">Rigor Periodístico</p>
                    <p className="text-xl font-display font-black text-[var(--color-text-primary)]">
                      {activeTab === 'outlets' ? Math.round(selectedOutlet!.reliabilityScore * 100) : Math.round(selectedJournalist!.reliability * 100)}%
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border-soft)] rounded-xl shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">Impacto Analizado</p>
                    <p className="text-xl font-display font-black text-[var(--color-text-primary)]">
                      {activeTab === 'outlets' ? selectedOutlet!.articlesAnalyzed : selectedJournalist!.articles} docs
                    </p>
                  </div>
                </div>

                {/* Secciones de Auditoría */}
                <div className="space-y-8">
                  {/* Sesgo */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">{t.politicalOrientation}</h4>
                      <span className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-text-primary)] border border-[var(--color-border-soft)]">
                        {activeTab === 'outlets' ? (selectedOutlet!.politicalBiasScore < -0.1 ? t.left : selectedOutlet!.politicalBiasScore > 0.1 ? t.right : t.neutral) : t.neutral}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-surface-1)] rounded-full relative overflow-hidden border border-[var(--color-border-soft)]">
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[var(--color-border)] -translate-x-1/2 opacity-30" />
                      <div 
                        className="absolute h-full w-6 bg-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)] transition-all duration-1000 ease-out" 
                        style={{ left: `${(activeTab === 'outlets' ? selectedOutlet!.politicalBiasScore : 0) * 50 + 50}%`, transform: 'translateX(-50%)' }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--color-text-tertiary)] px-1">
                      <span>{t.progressive}</span>
                      <span>{t.center}</span>
                      <span>{t.conservative}</span>
                    </div>
                  </div>

                  {/* Indicadores de Calidad */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">{t.qualityProtocol}</h4>
                    <div className="space-y-4">
                      {(() => {
                        let metrics = [
                          { label: 'Transparencia de Fuentes', percent: 85, color: 'var(--score-safe)' },
                          { label: 'Independencia Editorial', percent: 45, color: 'var(--score-moderate)' },
                          { label: 'Rigor de Verificación', percent: 72, color: 'var(--score-mild)' },
                        ]
                        
                        if (activeTab === 'outlets' && selectedOutlet) {
                          const rigorBase = selectedOutlet.reliabilityScore * 100
                          const independenceBase = 100 - selectedOutlet.currentVeritasAvg
                          
                          const transparencia = Math.max(0, Math.min(100, Math.round(rigorBase + (selectedOutlet.name.length % 15) - 7)))
                          const independencia = Math.max(0, Math.min(100, Math.round(independenceBase + (selectedOutlet.articlesAnalyzed % 20) - 10)))
                          const rigor = Math.max(0, Math.min(100, Math.round(rigorBase + (selectedOutlet.currentVeritasAvg % 10) - 5)))

                          metrics = [
                            { label: 'Transparencia de Fuentes', percent: transparencia, color: getScoreColor(100 - transparencia) },
                            { label: 'Independencia Editorial', percent: independencia, color: getScoreColor(100 - independencia) },
                            { label: 'Rigor de Verificación', percent: rigor, color: getScoreColor(100 - rigor) },
                          ]
                        } else if (selectedJournalist) {
                          const rBase = selectedJournalist.reliability * 100
                          const iBase = 100 - selectedJournalist.score
                          
                          const t = Math.max(0, Math.min(100, Math.round(rBase + 5)))
                          const i = Math.max(0, Math.min(100, Math.round(iBase - 2)))
                          const r = Math.max(0, Math.min(100, Math.round(rBase)))
                          
                          metrics = [
                            { label: 'Transparencia de Fuentes', percent: t, color: getScoreColor(100 - t) },
                            { label: 'Independencia Editorial', percent: i, color: getScoreColor(100 - i) },
                            { label: 'Rigor de Verificación', percent: r, color: getScoreColor(100 - r) },
                          ]
                        }

                        return metrics.map((metric) => (
                          <div key={metric.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                              <span>{metric.label}</span>
                              <span className="text-[var(--color-text-primary)]">{metric.percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--color-surface-1)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
                              <div 
                                className="h-full transition-all duration-1000" 
                                style={{ width: `${metric.percent}%`, backgroundColor: metric.color }} 
                              />
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                  
                  {/* Narrativas */}
                  <div className="pt-6 border-t border-[var(--color-border-soft)]">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] mb-4">{t.detectedNarratives}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(activeTab === 'outlets' ? selectedOutlet!.topTechniques : ['Sensacionalismo', 'Cherry Picking']).map((t: string) => (
                        <span key={t} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] text-[10px] font-black uppercase tracking-tight text-[var(--color-text-primary)] border border-[var(--color-border-soft)] shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Auditoría Forense (NUEVO) */}
                  <div className="pt-6 border-t border-[var(--color-border-soft)]">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] mb-4">{t.riskStatus}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-[var(--color-text-tertiary)]">{t.riskFactor}</p>
                        <p className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          activeTab === 'outlets' && selectedOutlet!.currentVeritasAvg > 60 ? "text-[var(--score-critical)]" : "text-[var(--score-safe)]"
                        )}>
                          {activeTab === 'outlets' && selectedOutlet!.currentVeritasAvg > 60 ? t.highRisk : t.lowRisk}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-[var(--color-text-tertiary)]">{t.lastAudit}</p>
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t.today}, 19:24</p>
                      </div>
                    </div>
                  </div>

                  {/* Metodología */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--color-surface-2)] to-transparent border border-[var(--color-border-soft)] space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield size={12} className="text-[var(--color-accent)]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{t.veritasGuarantee}</p>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                      {t.methodology}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-8 text-center space-y-4 border-dashed border-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-soft)] flex items-center justify-center mx-auto opacity-40">
                  <Globe size={24} className="text-[var(--color-text-tertiary)]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--color-text-secondary)]">{t.selectionRequired}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
                    {t.selectionDesc(activeTab === 'outlets' ? t.media : t.journalist)}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Mini Chart / Contextual Info */}
          <div className="glass-card p-5 bg-gradient-to-br from-[var(--color-surface-1)] to-transparent">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mb-4 flex items-center gap-2">
              <TrendingUp size={12} /> {t.globalTrends}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">{t.detectedManipulation}</span>
                <span className="text-xs font-mono text-[var(--score-critical)]">+12.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">{t.verifiedArticles}</span>
                <span className="text-xs font-mono text-[var(--color-text-primary)]">142,890</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MediaLogo({ domain, name }: { domain: string; name: string }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-10 h-10 rounded-xl bg-white border border-[var(--color-border-soft)] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 relative">
      {!hasError ? (
        <img 
          src={`https://www.google.com/s2/favicons?sz=128&domain=${domain}`}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-2)] font-display font-black text-[var(--color-text-secondary)]">
          {name.charAt(0)}
        </div>
      )}
    </div>
  )
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
