'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ClientImageProps {
  imageUrl?: string | null
  articleUrl: string
  alt: string
  priority?: boolean
}

export function ClientImage({ imageUrl: initialImageUrl, articleUrl, alt, priority = false }: ClientImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [isScraping, setIsScraping] = useState(false)

  // Si no hay imagen inicial, intentamos scrapear una vez al montar
  useEffect(() => {
    if (!initialImageUrl && articleUrl) {
      scrapeMetadata()
    }
  }, [articleUrl, initialImageUrl])

  async function scrapeMetadata() {
    if (isScraping) return
    setIsScraping(true)
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(articleUrl)}`)
      const data = await res.json()
      if (data.image) {
        setImageUrl(data.image)
      } else {
        setError(true)
      }
    } catch (err) {
      setError(true)
    } finally {
      setIsScraping(false)
    }
  }

  // Fallback final al generador de OG si todo lo demás falla
  const finalSrc = !error && imageUrl 
    ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    : `/api/og?url=${encodeURIComponent(articleUrl)}`

  return (
    <div className="relative w-full h-full bg-[#0c0c0e] overflow-hidden">
      {/* Background Placeholder/Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-white/5" />
        </div>
      )}
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // Si falla la imagen original, intenta con el fallback de OG si no lo estamos usando ya
          if (finalSrc !== `/api/og?url=${encodeURIComponent(articleUrl)}`) {
            setError(true)
          }
        }}
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* Overlay para mejorar legibilidad del score si es necesario */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
    </div>
  )
}
