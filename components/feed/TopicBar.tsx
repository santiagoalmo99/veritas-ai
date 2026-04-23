'use client'
import { useI18n } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'
import { TOPICS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function TopicBar() {
  const { preferences, toggleTopic, setPreferences } = useAppStore()
  const { t, language } = useI18n()
  const { selectedTopics } = preferences
  const isEn = language === 'en'

  const allSelected = selectedTopics.length === TOPICS.length

  const handleSelectAll = () => {
    if (allSelected) return
    setPreferences({ selectedTopics: TOPICS.map((t) => t.slug) })
  }

  return (
    <div className="w-full mb-6">
      <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3" role="navigation" aria-label={t.categories}>
        <button
          onClick={handleSelectAll}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-ui font-medium transition-colors whitespace-nowrap',
            allSelected
              ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)]'
              : 'bg-[var(--color-surface-1)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
          )}
        >
          {t.featured}
        </button>

        {TOPICS.map((topic) => {
          const isActive = selectedTopics.includes(topic.slug)
          return (
            <button
              key={topic.slug}
              onClick={() => toggleTopic(topic.slug)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-ui font-medium transition-colors whitespace-nowrap',
                isActive && !allSelected
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-surface-1)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              )}
            >
              {isEn ? topic.label : topic.labelEs}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
