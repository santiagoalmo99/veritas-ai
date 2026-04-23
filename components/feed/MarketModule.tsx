'use client'
import { useState, useEffect } from 'react'
import { fetchMarketData, MarketQuote } from '@/lib/market'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function MarketModule() {
  const countryCode = useAppStore((s) => s.preferences.countryCode)
  const isEn = countryCode === 'US'
  const [markets, setMarkets] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchMarketData(countryCode)
      setMarkets(data)
      setLoading(false)
    }
    load()
  }, [countryCode])

  const labels = {
    title: isEn ? "Markets" : "Mercados",
  }

  if (loading && markets.length === 0) {
    return (
      <div className="border border-[var(--color-border)] rounded-sm p-5 bg-[var(--color-surface-1)] animate-pulse">
        <div className="h-4 w-24 bg-[var(--color-border)] mb-4" />
        <div className="space-y-4">
          <div className="h-10 bg-[var(--color-border)] rounded-sm" />
          <div className="h-10 bg-[var(--color-border)] rounded-sm" />
          <div className="h-10 bg-[var(--color-border)] rounded-sm" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] rounded-sm p-5 bg-[var(--color-surface-1)] transition-all">
      {/* Header del módulo */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
        <span className="font-ui font-semibold text-xs tracking-wider uppercase text-[var(--color-text-secondary)]">
          {labels.title}
        </span>
        {loading && <Loader2 size={12} className="animate-spin text-[var(--color-text-tertiary)]" />}
      </div>
      
      {/* Markets List */}
      <div className="flex flex-col gap-4">
        {markets.map(market => (
          <div key={market.symbol} className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-ui font-medium text-sm text-[var(--color-text-primary)]">{market.short}</span>
              <span className="font-ui text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-tight">{market.label}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-display font-medium text-[var(--color-text-primary)]">{market.price}</span>
              <div className={`flex items-center gap-1 font-ui text-[10px] font-bold ${market.positive ? 'text-[var(--score-safe)]' : 'text-[var(--score-critical)]'}`}>
                {market.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {market.changeFormatted}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
