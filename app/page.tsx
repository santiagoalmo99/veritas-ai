import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InfiniteFeed } from '@/components/feed/InfiniteFeed'
import { TopicBar } from '@/components/feed/TopicBar'
import { FeedHeader } from '@/components/feed/FeedHeader'
import { EditorialExplainer } from '@/components/feed/EditorialExplainer'
import { WeatherModule } from '@/components/feed/WeatherModule'
import { MarketModule } from '@/components/feed/MarketModule'

export const metadata: Metadata = {
  title: 'Feed de Noticias — VeritasAI',
  description: 'Noticias analizadas en tiempo real con detección de manipulación mediática y VeritasScore™',
}

export default function HomePage() {
  return (
    <div className="container-app pb-12 flex flex-col gap-6">
      {/* Feed header with location + stats */}
      <FeedHeader />

      {/* FIX: Contenedor del TopicBar con fondo sólido para evitar transparencia en scroll */}
      <div className="sticky top-[52px] z-[100] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <TopicBar />
      </div>

      {/* Layout Asimétrico Estricto (Editorial) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 xl:gap-12 items-start">
        {/* Main Content (Noticias) */}
        <main>
          <EditorialExplainer />
          <InfiniteFeed />
        </main>

        {/* Sidebar (Contexto Global) */}
        <aside className="hidden lg:flex flex-col gap-6 sticky top-[120px]">
          <WeatherModule />
          <MarketModule />

          <div className="border border-[var(--color-border)] rounded-sm p-5 bg-[var(--color-surface-1)]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-ui font-semibold text-xs tracking-wider uppercase text-[var(--color-text-secondary)]">Tendencias</span>
              <span className="font-ui text-[9px] uppercase tracking-widest text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded">Beta</span>
            </div>
            <p className="font-ui text-sm text-[var(--color-text-tertiary)]">
              El análisis predictivo de entidades y narrativas globales estará disponible próximamente.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
