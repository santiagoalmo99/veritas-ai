'use client'
import { useState, useEffect } from 'react'
import { fetchWeather, getWeatherIcon } from '@/lib/weather'
import { getUserLocation } from '@/lib/location'
import * as Icons from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function WeatherModule() {
  const countryCode = useAppStore((s) => s.preferences.countryCode)
  const isEn = countryCode === 'US'
  const locale = isEn ? 'en-US' : 'es-CO'
  
  const [data, setData] = useState<any>(null)
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const loc = await getUserLocation()
        // Override location if country doesn't match? No, keep it real but use correct units.
        const weather = await fetchWeather(loc.lat, loc.lon, locale)
        setLocation(loc)
        setData(weather)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [countryCode, locale])

  const labels = {
    title: isEn ? "Global Weather" : "Clima Global",
    feelsLike: isEn ? "Feels like" : "Sensación",
  }

  if (loading && !data) {
    return (
      <div className="border border-[var(--color-border)] rounded-sm p-5 bg-[var(--color-surface-1)] animate-pulse h-[280px]">
        <div className="flex justify-between mb-8">
          <div className="h-4 w-24 bg-[var(--color-border)]" />
          <div className="h-4 w-16 bg-[var(--color-border)]" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-24 bg-[var(--color-border)] rounded-sm" />
          <div className="h-4 w-32 bg-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const WeatherIcon = (Icons as any)[getWeatherIcon(data.current.code)] || Icons.HelpCircle

  return (
    <div className="border border-[var(--color-border)] rounded-sm p-5 bg-[var(--color-surface-1)] transition-all">
      {/* Header del módulo */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui font-semibold text-xs tracking-wider uppercase text-[var(--color-text-secondary)]">
          {labels.title}
        </span>
        <span className="font-ui text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1 font-bold uppercase">
          <Icons.MapPin size={10} className="text-[var(--color-accent)]" />
          {location?.city}
        </span>
      </div>
      
      {/* Temperatura actual */}
      <div className="flex flex-col items-center py-2 mb-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-display font-medium text-4xl text-[var(--color-text-primary)] tracking-tighter">
            {data.current.temp}{data.current.unit}
          </span>
          <WeatherIcon size={32} className="text-[var(--color-accent)]" strokeWidth={1.5} />
        </div>
        <span className="font-ui text-xs text-[var(--color-text-primary)] mt-2 font-bold uppercase tracking-widest">
          {data.current.condition}
        </span>
        <span className="font-ui text-[10px] text-[var(--color-text-tertiary)] mt-1 uppercase font-bold">
          {labels.feelsLike} {data.current.feelsLike}{data.current.unit}
        </span>
      </div>
      
      {/* Forecast 4 días */}
      <div className="flex justify-between px-1">
        {data.forecast.map((day: any) => {
          const DayIcon = (Icons as any)[getWeatherIcon(day.code)] || Icons.HelpCircle
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span className="font-ui text-[9px] font-black uppercase tracking-widest text-[var(--color-text-tertiary)]">
                {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(day.date))}
              </span>
              <DayIcon size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
              <span className="font-ui font-bold text-[11px] text-[var(--color-text-primary)] mt-1">
                {day.max}°
              </span>
              <span className="font-ui text-[9px] font-bold text-[var(--color-text-tertiary)]">
                {day.min}°
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
