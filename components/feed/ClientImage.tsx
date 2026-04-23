'use client'
import { useState, useEffect } from 'react'

interface ClientImageProps {
  articleUrl: string
  alt: string
  priority?: boolean
}

export function ClientImage({ articleUrl, alt, priority = false }: ClientImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchOg() {
      if (!articleUrl) return
      try {
        setLoading(true)
        setError(false)
        
        // Siempre usamos el proxy para evitar CORS y bloqueos
        const res = await fetch(`/api/og?url=${encodeURIComponent(articleUrl)}`)
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const data = await res.json()
        
        if (!cancelled) {
          if (data.image) {
            setImageUrl(data.image)
          } else {
            setError(true)
          }
        }
      } catch (err) {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOg()

    return () => { cancelled = true }
  }, [articleUrl])

  if (error || (!loading && !imageUrl)) {
    return (
      <div className="w-full h-full bg-[#0c0c0e] flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center animate-pulse">
           <div className="w-6 h-6 rounded-full bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[#0c0c0e]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-105"
          onError={() => setError(true)}
          loading={priority ? 'eager' : 'lazy'}
        />
      ) : (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
    </div>
  )
}
