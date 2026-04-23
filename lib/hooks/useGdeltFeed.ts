'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { Article } from '@/lib/types'
import type { TopicSlug } from '@/lib/types'

interface FeedState {
  articles: Article[]
  hasMore: boolean
  loading: boolean
  initialLoading: boolean
  source: 'gdelt' | 'mock' | null
  error: string | null
}

interface UseGdeltFeedOptions {
  countryCode: string
  topics: TopicSlug[]
  perPage?: number
}

export function useGdeltFeed({
  countryCode,
  topics,
  perPage = 12,
}: UseGdeltFeedOptions) {
  const [state, setState] = useState<FeedState>({
    articles: [],
    hasMore: true,
    loading: false,
    initialLoading: true,
    source: null,
    error: null,
  })
  const [page, setPage] = useState(1)
  const countryRef = useRef(countryCode)
  const topicsRef = useRef(topics)

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    setState((s) => ({ ...s, loading: true, error: null }))

    const country = reset ? countryRef.current : countryCode
    const topicList = reset ? topicsRef.current : topics

    const params = new URLSearchParams({
      country,
      topics: topicList.join(','),
      page: String(pageNum),
      perPage: String(perPage),
    })

    try {
      const res = await fetch(`/api/feed?${params}`)
      if (!res.ok) throw new Error('Feed fetch failed')

      const data = await res.json()
      const newArticles: Article[] = data.articles ?? []
      
      setState((s) => {
        if (reset) {
          return {
            ...s,
            articles: newArticles,
            hasMore: data.hasMore ?? false,
            loading: false,
            initialLoading: false,
            source: data.source ?? 'mock',
            error: null,
          }
        }
        const existingIds = new Set(s.articles.map(a => a.id))
        const uniqueNew = newArticles.filter(a => !existingIds.has(a.id))
        return {
          ...s,
          articles: [...s.articles, ...uniqueNew],
          hasMore: data.hasMore ?? false,
          loading: false,
          initialLoading: false,
          source: data.source ?? 'mock',
          error: null,
        }
      })
      setPage(data.nextPage ?? pageNum + 1)
    } catch (err) {
      console.error('[useGdeltFeed]', err)
      // Fallback to mock feed
      const { simulateInfiniteScroll } = await import('@/lib/mock-data')
      const result = simulateInfiniteScroll(pageNum, perPage, country, topicList)
      
      setState((s) => {
        if (reset) {
          return {
            ...s,
            articles: result.articles,
            hasMore: result.hasMore,
            loading: false,
            initialLoading: false,
            source: 'mock',
            error: 'Usando datos de demostración (GDELT no disponible)',
          }
        }
        const existingIds = new Set(s.articles.map(a => a.id))
        const uniqueNew = result.articles.filter(a => !existingIds.has(a.id))
        return {
          ...s,
          articles: [...s.articles, ...uniqueNew],
          hasMore: result.hasMore,
          loading: false,
          initialLoading: false,
          source: 'mock',
          error: 'Usando datos de demostración (GDELT no disponible)',
        }
      })
      setPage(result.nextPage)
    }
  }, [countryCode, topics, perPage])

  // Reset on filter change
  useEffect(() => {
    const countryChanged = countryRef.current !== countryCode
    const topicsChanged = JSON.stringify(topicsRef.current) !== JSON.stringify(topics)

    if (countryChanged || topicsChanged) {
      countryRef.current = countryCode
      topicsRef.current = topics
      setState((s) => ({ ...s, initialLoading: true, articles: [], hasMore: true }))
      setPage(1)
      fetchPage(1, true)
    }
  }, [countryCode, topics, fetchPage])

  // Initial load
  useEffect(() => {
    fetchPage(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchPage(page)
    }
  }, [state.loading, state.hasMore, page, fetchPage])

  return { ...state, loadMore }
}
