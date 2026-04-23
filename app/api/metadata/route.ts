import { NextRequest, NextResponse } from 'next/server'
import { load } from 'cheerio'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // 1. Intentar con Microlink primero (es muy bueno para bypass de Cloudflare)
    try {
      const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&filter=image`
      const mlRes = await fetch(microlinkUrl, { signal: AbortSignal.timeout(4000) })
      if (mlRes.ok) {
        const mlData = await mlRes.json()
        const mlImage = mlData.data?.image?.url
        // Si la imagen de Microlink parece una foto real (no un icono/logo pequeño)
        if (mlImage && !mlImage.toLowerCase().includes('logo') && !mlImage.toLowerCase().includes('icon')) {
          return NextResponse.json({ image: mlImage })
        }
      }
    } catch (e) {
      console.error('Microlink sub-fetch failed', e)
    }

    // 2. Fallback: Scraper manual con Cheerio (más específico para noticias)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    }).catch(() => null)

    if (!response || !response.ok) {
      return NextResponse.json({ image: null })
    }

    const html = await response.text()
    const $ = load(html)

    // Prioridad absoluta: OG Image de la noticia
    const ogImage = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('meta[property="og:image:secure_url"]').attr('content') ||
                    $('meta[name="thumbnail"]').attr('content')

    if (!ogImage) {
      // Si no hay OG, buscar la imagen más grande en el body (heurística simple)
      const firstBigImg = $('article img').first().attr('src') || $('main img').first().attr('src')
      if (firstBigImg) return NextResponse.json({ image: firstBigImg })
      return NextResponse.json({ image: null })
    }

    // Normalizar URL
    let absoluteImage = ogImage
    if (ogImage.startsWith('//')) {
      absoluteImage = `https:${ogImage}`
    } else if (ogImage.startsWith('/')) {
      const urlObj = new URL(url)
      absoluteImage = `${urlObj.origin}${ogImage}`
    }

    return NextResponse.json({ image: absoluteImage })
  } catch (error) {
    console.error('[Metadata Error]:', error)
    return NextResponse.json({ image: null })
  }
}
