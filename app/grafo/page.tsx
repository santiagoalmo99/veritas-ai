import type { Metadata } from 'next'
import { GrafoClient } from './GrafoClient'
import { api } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Grafo de Influencia — VeritasAI',
  description: 'Visualización topológica de la red de influencia mediática y flujo de información en tiempo real.',
}

export default async function GrafoPage() {
  const outlets = await api.getMediaOutlets()
  
  return <GrafoClient initialOutlets={outlets} />
}
