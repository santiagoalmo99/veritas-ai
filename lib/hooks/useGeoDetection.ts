'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { COUNTRY_LANGUAGE_MAP, COUNTRIES } from '@/lib/constants'
import type { GeolocationResult } from '@/lib/types'

async function detectGeoFromIP(): Promise<GeolocationResult | null> {
  try {
    // ip-api.com: 1000 req/min free, no key required
    const res = await fetch('http://ip-api.com/json/?fields=country,countryCode,city,timezone', {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('ip-api failed')
    const data = await res.json()
    
    const countryCode: string = data.countryCode ?? 'CO'
    const language = COUNTRY_LANGUAGE_MAP[countryCode] ?? 'es'
    const country = COUNTRIES.find((c) => c.code === countryCode)
    
    return {
      countryCode,
      countryName: data.country ?? country?.name ?? 'Colombia',
      city: data.city,
      language,
      timezone: data.timezone ?? 'America/Bogota',
      flag: country?.flag ?? '🌎',
    }
  } catch {
    // Fallback: use browser language
    const lang = navigator.language?.split('-')[0] ?? 'es'
    const countryFromLang = lang === 'pt' ? 'BR' : lang === 'en' ? 'US' : 'CO'
    return {
      countryCode: countryFromLang,
      countryName: 'Colombia',
      language: lang,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      flag: '🌎',
    }
  }
}

export function useGeoDetection() {
  const { geo, geoLoading, setGeo, setGeoLoading } = useAppStore()

  useEffect(() => {
    if (geo || geoLoading) return
    setGeoLoading(true)
    detectGeoFromIP().then((result) => {
      if (result) setGeo(result)
      else setGeoLoading(false)
    })
  }, [geo, geoLoading, setGeo, setGeoLoading])

  return { geo, geoLoading }
}
