'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useGeoDetection } from '@/lib/hooks/useGeoDetection'

// AppInit runs once on mount to handle onboarding and geo detection
export function AppInit() {
  const { preferences, openOnboarding } = useAppStore()
  useGeoDetection() // start geo detection on mount

  useEffect(() => {
    // Show onboarding if not completed
    if (!preferences.hasCompletedOnboarding) {
      // Small delay so layout renders first
      const timer = setTimeout(openOnboarding, 300)
      return () => clearTimeout(timer)
    }
  }, [preferences.hasCompletedOnboarding, openOnboarding])

  return null
}
