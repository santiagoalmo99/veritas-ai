import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import { MediaDashboardClient } from './MediaDashboardClient'
import { api } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Dashboard de Medios — VeritasAI',
  description: 'Ranking de medios latinoamericanos por índice de manipulación. Media Bias Chart interactivo, perfiles dinámicos y análisis de tendencias.',
}

export default async function MediaDashboardPage() {
  const [outlets, journalists] = await Promise.all([
    api.getMediaOutlets(),
    api.getJournalists()
  ])
  
  return <MediaDashboardClient initialOutlets={outlets} initialJournalists={journalists} />
}
