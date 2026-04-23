'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Heart, MoreHorizontal, Clock, CheckCircle2, ShieldAlert, X, ExternalLink } from 'lucide-react'
import type { Article, AlternativeSource } from '@/lib/types'
import { formatRelativeTime, cn } from '@/lib/utils'
import { TechniqueBadge } from './TechniqueBadge'
import { ClientImage } from './ClientImage'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { VeritasScore } from '@/components/score/VeritasScore'
import { useI18n } from '@/lib/i18n'

interface NewsCardProps {
  article: Article
  index?: number
}

function ArticleMeta({ publishedAt, language }: { publishedAt: string, language: string }) {
  const { t } = useI18n()
  const isEn = language === 'en'
  return (
    <div className="flex items-center gap-1.5 mb-2 text-[var(--color-text-secondary)]">
      <Clock size={12} />
      <time className="font-ui text-[0.7rem] uppercase tracking-wide font-semibold" dateTime={publishedAt}>
        {isEn ? 'Published' : 'Publicado'} {formatRelativeTime(publishedAt, language as 'en' | 'es')}
      </time>
    </div>
  )
}

export function NewsCard({ article, index = 0 }: NewsCardProps) {
  const { t, language } = useI18n()
  const [isNeutralized, setIsNeutralized] = useState(false)
  const isEn = language === 'en'

  // Bento Grid Patterns
  const patternIndex = index % 10
  let isHorizontal = false
  let spanClass = 'col-span-1'
  let imagePos: 'left' | 'right' = 'left'

  if (patternIndex === 0) {
    isHorizontal = true
    spanClass = 'lg:col-span-3 md:col-span-2 col-span-1'
    imagePos = 'right'
  } else if (patternIndex === 4) {
    isHorizontal = true
    spanClass = 'lg:col-span-2 md:col-span-2 col-span-1'
    imagePos = 'left'
  } else if (patternIndex === 9) {
    isHorizontal = true
    spanClass = 'lg:col-span-3 md:col-span-2 col-span-1'
    imagePos = 'left'
  } else {
    isHorizontal = false
    spanClass = 'col-span-1'
  }
  
  const hasManipulation = (article.veritasScore ?? 0) > 40
  const topTechniques = article.techniquesDetected?.slice(0, 3) || []
  const scoreValue = article.veritasScore ?? 0

  const getScoreStyles = (score: number) => {
    if (score > 60) return { bg: "bg-[#f87171]", text: "text-black", border: "border-red-900/20" }
    if (score > 30) return { bg: "bg-[#fbbf24]", text: "text-black", border: "border-amber-900/20" }
    return { bg: "bg-[#34d399]", text: "text-black", border: "border-emerald-900/20" }
  }

  const scoreStyles = getScoreStyles(scoreValue)

  const AnalysisBlock = () => {
    return (
      <div className="mt-4 mb-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4 pointer-events-auto shadow-inner">
        <div className="flex items-center gap-2 mb-3">
           <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                hasManipulation ? "bg-red-500" : "bg-emerald-500"
              )} />
              <span className="font-ui text-[0.65rem] font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                {isEn ? 'Veritas Analysis' : 'Análisis Veritas'}
              </span>
           </div>
        </div>
        
        <div className="mb-4 pl-3 border-l-2 border-[var(--color-border)]">
          <p className="font-ui text-sm text-[var(--color-text-primary)] leading-relaxed m-0">
            {hasManipulation 
              ? (isEn 
                  ? `This content presents a high risk of cognitive manipulation. The outlet is structuring information using persuasive tactics like ${topTechniques.map(t => t.technique.name).join(', ')} to direct the reader's emotional response rather than presenting facts objectively.`
                  : `Este contenido presenta un alto riesgo de manipulación cognitiva. El medio está estructurando la información mediante tácticas persuasivas como ${topTechniques.map(t => t.technique.name.toLowerCase()).join(', ')} para dirigir la respuesta emocional del lector en lugar de presentar los hechos objetivamente.`)
              : (isEn
                  ? `This content maintains a factual and balanced informational structure. No algorithmic patterns oriented towards moral outrage or evident cognitive bias are detected. Editorial rigor is high.`
                  : `Este contenido mantiene una estructura informativa fáctica y equilibrada. No se detectan patrones algorítmicos orientados a la indignación moral o sesgo cognitivo evidente. El rigor editorial es alto.`)}
          </p>
        </div>

        {hasManipulation && topTechniques.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {topTechniques.map(dt => (
              <TechniqueBadge key={dt.technique.slug} technique={dt.technique} compact selected />
            ))}
          </div>
        )}

        {hasManipulation && article.titleNeutralized && article.titleNeutralized !== article.title && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsNeutralized(!isNeutralized); }}
            className={cn(
              "w-full py-2.5 px-4 rounded-md font-ui text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2",
              isNeutralized 
                ? "bg-[var(--score-high-text)]/10 text-[var(--score-high-text)] border border-[var(--score-high-text)]/30" 
                : "bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm",
              "relative z-30 pointer-events-auto"
            )}
          >
            {isNeutralized ? (
              <><CheckCircle2 size={14} /> {isEn ? 'Neutrality Applied (100%)' : 'Neutralidad Aplicada (100%)'}</>
            ) : (
              <><ShieldAlert size={14} /> {isEn ? 'Neutralize Headline' : 'Neutralizar Titular'}</>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <article className={cn(
      "bg-[var(--color-surface-1)] rounded-[14px] border border-[var(--color-border)] flex transition-all duration-300 hover:bg-[var(--color-surface-2)] hover:border-[#555] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/card relative h-full", 
      spanClass, 
      isHorizontal ? "flex-col md:flex-row overflow-visible" : "flex-col overflow-hidden"
    )}>
      <Link href={`/article/${article.id}`} className="absolute inset-0 z-20 cursor-pointer" aria-label={`Read ${article.title}`} />
      <div className={cn(
        "relative w-full shrink-0 bg-[#0c0c0e] border-[var(--color-border)] overflow-hidden",
        isHorizontal ? "md:w-[45%] lg:w-[40%] min-h-[300px] md:min-h-full border-b md:border-b-0" : "aspect-[16/10] border-b",
        isHorizontal && imagePos === 'right' ? "md:order-2 md:border-l" : "md:order-1 md:border-r"
      )}>
        <ClientImage 
          imageUrl={article.imageUrl} 
          articleUrl={article.url} 
          alt={article.title} 
          priority={index === 0} 
        />
        
        <div className="absolute top-3 right-3 z-20">
          <div className={cn(
            "font-ui text-[0.6rem] font-black px-2.5 py-1.5 rounded-md border uppercase shadow-2xl flex items-center gap-1.5 tracking-tighter",
            scoreStyles.bg,
            scoreStyles.text,
            scoreStyles.border
          )}>
            <span className="opacity-70">SCORE</span>
            <span className="text-sm font-black leading-none">{scoreValue}</span>
          </div>
        </div>
      </div>

      <div className={cn(
        "p-5 sm:p-6 flex flex-col flex-1 relative z-10",
        isHorizontal && imagePos === 'right' ? "md:order-1" : "md:order-2"
      )}>
        <ArticleMeta publishedAt={article.publishedAt} language={language} />
        <h2 className={cn(
          "font-display font-medium leading-tight tracking-tight group-hover/card:text-[var(--color-accent)] transition-all duration-500 mb-3 relative z-10",
          isHorizontal ? "text-xl sm:text-2xl" : "text-lg",
          isNeutralized ? "text-[var(--score-high-text)]" : "text-[var(--color-text-primary)]"
        )}>
          {isNeutralized && article.titleNeutralized ? article.titleNeutralized : article.title}
        </h2>
        {article.excerpt && <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-3 leading-relaxed relative z-10">{article.excerpt}</p>}
        <AnalysisBlock />
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)] relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <img src={`https://www.google.com/s2/favicons?domain=${article.outlet.domain}&sz=32`} alt="" className="w-4 h-4 rounded-full ring-1 ring-[var(--color-border)]" />
              <span className="font-ui text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest whitespace-nowrap">
                {article.outlet.name}
              </span>
              <VeritasScore score={article.outlet.currentVeritasAvg ?? 0} size="xs" animated />
            </div>
            {article.journalist && (
              <div className="flex items-center gap-2 opacity-80">
                <span className="font-ui text-[8px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {article.journalist}
                </span>
                <VeritasScore score={article.journalistScore ?? 0} size="xs" animated />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-[var(--color-text-tertiary)] relative z-30 pointer-events-auto">
            <Heart size={14} className="hover:text-red-500 transition-colors cursor-pointer" />
            <MoreHorizontal size={14} className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </article>
  )
}
