'use client'
import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Satellite, Database } from 'lucide-react'
import { useGdeltFeed } from '@/lib/hooks/useGdeltFeed'
import { useAppStore } from '@/lib/store'
import { NewsCard } from './NewsCard'
import { NewsCardSkeleton } from './NewsCardSkeleton'
import type { TopicSlug } from '@/lib/types'

import { useI18n } from '@/lib/i18n'

interface InfiniteFeedProps {
  initialCountry?: string
  initialTopics?: TopicSlug[]
}

export function InfiniteFeed({ initialCountry = 'CO', initialTopics = [] }: InfiniteFeedProps) {
  const { t } = useI18n()
  const preferences = useAppStore((s) => s.preferences)
  const countryCode = preferences.countryCode || initialCountry
  const topics = preferences.selectedTopics.length > 0 ? preferences.selectedTopics : initialTopics

  const { articles, hasMore, loading, initialLoading, source, error, loadMore } = useGdeltFeed({
    countryCode,
    topics,
    perPage: 9,
  })

  console.log('[InfiniteFeed Debug]:', { 
    articlesCount: articles.length, 
    loading, 
    initialLoading, 
    source, 
    error,
    countryCode,
    topics
  })

  const sentinelRef = useRef<HTMLDivElement>(null)

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry?.isIntersecting && hasMore && !loading) {
        loadMore()
      }
    },
    [hasMore, loading, loadMore]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: '300px',
      threshold: 0,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onIntersect])

  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch auto-rows-max">
        {Array.from({ length: 9 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-6xl">🔍</div>
        <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">
          {t.noResults}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm text-center max-w-sm">
          {t.noResultsDesc}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Data source indicator - Premium Design */}
      <div className="flex items-center justify-between mb-6">
        {source && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)]/50 border border-[var(--color-border-soft)] shadow-inner">
            {source?.includes('gdelt') ? (
              <>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  {t.realTime} <span className="text-[var(--color-accent)]">GDELT {source === 'gdelt_live' ? 'LIVE' : 'NETWORK'}</span>
                </span>
              </>
            ) : (
              <>
                <div className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  {t.archived} <span className="text-blue-400">VERITAS DATABASE</span>
                </span>
              </>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4 text-[10px] font-display font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {articles.length} {t.articles}
          </div>
        </div>
      </div>

      {/* Feed Layout: Perplexity Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch auto-rows-max">
        <AnimatePresence mode="popLayout">
          {articles.map((article, i) => (
            <NewsCard
              key={article.id}
              article={article}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Sentinel for infinite scroll + loading indicator */}
      <div ref={sentinelRef} className="flex justify-center py-8" aria-live="polite">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm"
          >
            <Loader2 size={16} className="animate-spin" />
            {t.loadingMore}
          </motion.div>
        )}
        {!hasMore && !loading && articles.length > 0 && (
          <p className="text-[var(--text-tertiary)] text-sm">
            {t.allLoaded}
          </p>
        )}
      </div>
    </div>
  )
}
