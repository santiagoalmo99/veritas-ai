'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Article } from '@/lib/types'
import type { TopicSlug } from '@/lib/types'
import { simulateInfiniteScroll } from '@/lib/mock-data'

interface UseInfiniteFeedOptions {
  countryCode: string
  topics: TopicSlug[]
  perPage?: number
}

export function useInfiniteFeed({
  countryCode,
  topics,
  perPage = 9,
}: UseInfiniteFeedOptions) {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const countryRef = useRef(countryCode)
  const topicsRef = useRef(topics)

  const loadPage = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true)
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600))
    const topicSlugs = (reset ? topicsRef.current : topics).map((t) => t as string)
    const country = reset ? countryRef.current : countryCode
    const result = simulateInfiniteScroll(pageNum, perPage, country, topicSlugs)
    
    setArticles((prev) =>
      reset ? result.articles : [...prev, ...result.articles]
    )
    setHasMore(result.hasMore)
    setPage(result.nextPage)
    setLoading(false)
    setInitialLoading(false)
  }, [countryCode, topics, perPage])

  // Reset when filters change
  useEffect(() => {
    const countryChanged = countryRef.current !== countryCode
    const topicsChanged = JSON.stringify(topicsRef.current) !== JSON.stringify(topics)
    
    if (countryChanged || topicsChanged) {
      countryRef.current = countryCode
      topicsRef.current = topics
      setInitialLoading(true)
      setArticles([])
      setPage(1)
      setHasMore(true)
      loadPage(1, true)
    }
  }, [countryCode, topics, loadPage])

  // Initial load
  useEffect(() => {
    loadPage(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPage(page)
    }
  }, [loading, hasMore, page, loadPage])

  return { articles, hasMore, loading, initialLoading, loadMore }
}
