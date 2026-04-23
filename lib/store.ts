'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences, FeedFilters, TopicSlug, GeolocationResult } from './types'
import { DEFAULT_TOPICS_BY_COUNTRY, COUNTRY_LANGUAGE_MAP } from './constants'

interface AppState {
  // User preferences (persisted)
  preferences: UserPreferences
  
  // Geolocation (session only)
  geo: GeolocationResult | null
  geoLoading: boolean
  
  // Feed state
  filters: FeedFilters
  
  // UI state
  onboardingOpen: boolean
  analysisOpen: string | null // article id
  
  // Actions
  setPreferences: (prefs: Partial<UserPreferences>) => void
  completeOnboarding: (topics: TopicSlug[], countryCode: string) => void
  setGeo: (geo: GeolocationResult) => void
  setGeoLoading: (loading: boolean) => void
  setFilters: (filters: Partial<FeedFilters>) => void
  openOnboarding: () => void
  closeOnboarding: () => void
  openAnalysis: (articleId: string) => void
  closeAnalysis: () => void
  toggleTopic: (topic: TopicSlug) => void
  resetFilters: () => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedTopics: ['politics', 'economy', 'international', 'tech'],
  countryCode: 'CO',
  language: 'es',
  hasCompletedOnboarding: false,
  feedLayout: 'grid',
}

const DEFAULT_FILTERS: FeedFilters = {
  sortBy: 'trending',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      geo: null,
      geoLoading: false,
      filters: DEFAULT_FILTERS,
      onboardingOpen: false,
      analysisOpen: null,

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      completeOnboarding: (topics, countryCode) => {
        const language = COUNTRY_LANGUAGE_MAP[countryCode] ?? 'es'
        set((state) => ({
          preferences: {
            ...state.preferences,
            selectedTopics: topics,
            countryCode,
            language,
            hasCompletedOnboarding: true,
          },
          filters: {
            ...state.filters,
            topics,
            country: countryCode,
            language,
          },
          onboardingOpen: false,
        }))
      },

      setGeo: (geo) => {
        const state = get()
        // Auto-set country/language from geo if onboarding not done
        if (!state.preferences.hasCompletedOnboarding) {
          const defaultTopics =
            DEFAULT_TOPICS_BY_COUNTRY[geo.countryCode] ??
            DEFAULT_TOPICS_BY_COUNTRY['DEFAULT']!
          set({
            geo,
            geoLoading: false,
            preferences: {
              ...state.preferences,
              countryCode: geo.countryCode,
              language: geo.language,
              selectedTopics: defaultTopics,
            },
          })
        } else {
          set({ geo, geoLoading: false })
        }
      },

      setGeoLoading: (loading) => set({ geoLoading: loading }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      openOnboarding: () => set({ onboardingOpen: true }),
      closeOnboarding: () => set({ onboardingOpen: false }),
      openAnalysis: (articleId) => set({ analysisOpen: articleId }),
      closeAnalysis: () => set({ analysisOpen: null }),

      toggleTopic: (topic) => {
        const state = get()
        const current = state.preferences.selectedTopics
        const next = current.includes(topic)
          ? current.filter((t) => t !== topic)
          : [...current, topic]
        // Min 1 topic required
        if (next.length === 0) return
        set({
          preferences: { ...state.preferences, selectedTopics: next },
          filters: { ...state.filters, topics: next },
        })
      },

      resetFilters: () =>
        set((state) => ({
          filters: {
            sortBy: 'trending',
            country: state.preferences.countryCode,
            language: state.preferences.language,
            topics: state.preferences.selectedTopics,
          },
        })),
    }),
    {
      name: 'veritas-preferences',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
)
