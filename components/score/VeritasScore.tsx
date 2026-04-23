'use client'
import { useEffect, useState } from 'react'
import { getScoreLevel, getScoreColor } from '@/lib/types'
import { cn } from '@/lib/utils'

interface VeritasScoreProps {
  score: number | undefined
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const SIZE_CONFIG = {
  xs: { r: 7, stroke: 2, viewBox: 18, fontSize: '0.55rem', labelFs: '0' },
  sm: { r: 18, stroke: 3, viewBox: 44, fontSize: '0.85rem', labelFs: '0.6rem' },
  md: { r: 28, stroke: 4, viewBox: 64, fontSize: '1.1rem', labelFs: '0.65rem' },
  lg: { r: 40, stroke: 5, viewBox: 90, fontSize: '1.5rem', labelFs: '0.72rem' },
  xl: { r: 60, stroke: 8, viewBox: 140, fontSize: '2.5rem', labelFs: '0.85rem' },
}

const SCORE_LABELS_ES: Record<string, string> = {
  safe: 'Neutral',
  mild: 'Leve',
  moderate: 'Moderado',
  severe: 'Severo',
  critical: 'Crítico',
}

export function VeritasScore({
  score,
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: VeritasScoreProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const config = SIZE_CONFIG[size]
  const circumference = 2 * Math.PI * config.r
  
  const level = score !== undefined ? getScoreLevel(score) : 'safe'
  const color = score !== undefined ? getScoreColor(score) : 'var(--text-tertiary)'
  const progress = score !== undefined ? score / 100 : 0
  const strokeDashoffset = circumference - progress * circumference
  const center = config.viewBox / 2

  // Animate score number
  useEffect(() => {
    if (!animated || score === undefined) {
      setDisplayScore(score ?? 0)
      return
    }
    setDisplayScore(0)
    const duration = 1000
    const start = performance.now()
    const target = score
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animated])

  if (score === undefined) {
    return (
      <div
        className={cn('relative inline-flex items-center justify-center', className)}
        role="img"
        aria-label="Score pendiente"
      >
        <span
          className="font-display font-semibold"
          style={{ fontSize: config.labelFs, color: 'var(--text-tertiary)' }}
        >
          —
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('relative inline-flex flex-col items-center', className)}
      role="img"
      aria-label={`VeritasScore: ${score} de 100 — ${SCORE_LABELS_ES[level]}`}
    >
      <span
        className="font-display font-black tabular-nums"
        style={{ fontSize: config.fontSize, color }}
      >
        {displayScore}
      </span>
      {showLabel && (
        <span
          className="font-display font-medium uppercase tracking-wider"
          style={{ fontSize: config.labelFs, color }}
        >
          {SCORE_LABELS_ES[level]}
        </span>
      )}
    </div>
  )
}

interface VeritasBadgeProps {
  score: number | undefined
  className?: string
  showPulsingDot?: boolean
}

export function VeritasBadge({ score, className, showPulsingDot = true }: VeritasBadgeProps) {
  if (score === undefined) return null

  const color = getScoreColor(score)
  const level = getScoreLevel(score)
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono text-[9px] font-black tracking-tighter transition-all duration-500",
        className
      )}
      style={{ 
        color: color,
        borderColor: `${color}44`,
        backgroundColor: `${color}11`,
        boxShadow: `0 0 10px ${color}11`
      }}
    >
      {showPulsingDot && (
        <span 
          className="w-1 h-1 rounded-full animate-pulse" 
          style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
        />
      )}
      <span>{score}</span>
    </div>
  )
}

export function VeritasBubble({ score, className }: { score: number | undefined, className?: string }) {
  if (score === undefined) return null
  const color = getScoreColor(score)
  
  return (
    <span 
      className={cn(
        "font-display font-black tabular-nums flex-shrink-0",
        className
      )}
      style={{ color }}
    >
      {score}
    </span>
  )
}
