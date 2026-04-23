'use client'
import { useAppStore } from '@/lib/store'
import { COUNTRIES } from '@/lib/constants'
import { MapPin, Activity, Shield, Zap, Brain, Eye } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export function FeedHeader() {
  const { preferences } = useAppStore()
  const { t, language } = useI18n()
  const country = COUNTRIES.find((c) => c.code === preferences.countryCode)
  const isEn = language === 'en'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          {country && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-2">
              <MapPin size={11} />
              <span>{country.flag} {isEn ? country.name : country.nameEs}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--score-safe)] animate-pulse ml-1" />
              <span className="text-[var(--score-safe)]">{t.live}</span>
            </div>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-tight">
            {t.feedTitle}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-lg">
            {t.feedDescription}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl surface text-xs">
            <Activity size={12} className="text-[var(--score-safe)]" />
            <span className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">GDELT 2.0</strong> · {t.sources}
            </span>
          </div>
          <Link
            href="/medios"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl surface text-xs
              text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
          >
            <Shield size={12} className="text-[var(--accent-secondary)]" />
            <span className="hidden sm:inline">{t.viewOutlets}</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.7rem] text-[var(--text-disabled)]">
        <span className="inline-flex items-center gap-1.5">
          <Brain size={10} style={{ color: 'var(--accent-primary)' }} />
          {t.techLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield size={10} style={{ color: 'var(--accent-secondary)' }} />
          {t.costLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye size={10} style={{ color: 'var(--accent-purple)' }} />
          {t.privacyLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Zap size={9} className="text-[var(--score-mild)]" />
          {t.activeThemes(preferences.selectedTopics.length)}
        </span>
      </div>
    </div>
  )
}
