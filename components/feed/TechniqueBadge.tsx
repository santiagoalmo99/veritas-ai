'use client'
import { cn } from '@/lib/utils'
import type { Technique } from '@/lib/types'
import { useI18n } from '@/lib/i18n'

interface TechniqueBadgeProps {
  technique: Technique
  compact?: boolean
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function TechniqueBadge({
  technique,
  compact = false,
  selected = false,
  onClick,
  className,
}: TechniqueBadgeProps) {
  const { language } = useI18n()
  const isEn = language === 'en'

  return (
    <span
      className={cn(
        'font-ui text-[0.6rem] font-bold tracking-widest uppercase flex items-center gap-1.5 transition-colors px-2 py-0.5 rounded-full border',
        selected 
          ? 'text-[var(--color-text-primary)] border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10' 
          : 'text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-surface-2)]',
        onClick && 'cursor-pointer hover:border-[var(--color-text-tertiary)]',
        className
      )}
      onClick={onClick}
      title={isEn ? technique.description : technique.descriptionEs}
      role={onClick ? 'button' : undefined}
    >
      <span>{isEn ? technique.name : technique.nameEs}</span>
    </span>
  )
}
