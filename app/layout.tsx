import type { Metadata, Viewport } from 'next'
import { Newsreader, Figtree } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { AppInit } from './app-init'

const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VeritasAI — Microscopio Cognitivo de Noticias',
    template: '%s | VeritasAI',
  },
  description:
    'Analiza noticias en tiempo real. VeritasAI detecta técnicas de manipulación mediática, calcula el VeritasScore™, y te devuelve tu agencia intelectual.',
  keywords: ['noticias', 'fact-checking', 'manipulación mediática', 'análisis de noticias', 'IA', 'desinformación'],
  authors: [{ name: 'VeritasAI' }],
  creator: 'VeritasAI',
  openGraph: {
    title: 'VeritasAI — Análisis Crítico de Medios con IA',
    description: 'Detecta manipulación mediática en tiempo real. Portal de noticias con inteligencia artificial.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'VeritasAI',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`dark ${newsreader.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-noise min-h-dvh" suppressHydrationWarning>
        <Providers>
          <AppInit />
          <div className="flex flex-col min-h-dvh">
            <Header />
            <main className="flex-1 pt-8 md:pt-12">{children}</main>
            <footer className="py-10 mt-12 border-t border-[var(--border-subtle)]">
              <div className="container-app">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center
                      bg-[var(--accent-primary)] text-white font-bold text-[0.6rem] font-display">
                      V
                    </div>
                    <span className="font-display font-bold text-sm text-[var(--text-primary)]">
                      Veritas<span className="text-[var(--accent-primary)]">AI</span>
                    </span>
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 
                      text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 font-display font-medium">
                      BETA
                    </span>
                  </div>
                  <nav className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <a href="/" className="hover:text-[var(--text-primary)] transition-colors">Feed</a>
                    <a href="/medios" className="hover:text-[var(--text-primary)] transition-colors">Dashboard de Medios</a>
                  </nav>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-[0.65rem] text-[var(--text-disabled)] text-center sm:text-left max-w-lg">
                    Análisis basado en técnicas documentadas académicamente: Da San Martino et al. (2020), SemEval 2020 Task 11, 
                    Kahneman (2011), BABE Dataset. El sistema puede cometer errores — la confianza de cada análisis es siempre visible.
                  </p>
                  <p className="text-[0.6rem] text-[var(--text-disabled)] text-center sm:text-right shrink-0">
                    Costo operativo: <span className="text-[var(--score-safe)]">$0/mes</span> · 
                    Tracking: <span className="text-[var(--score-safe)]">cero</span> · 
                    <span className="text-[var(--accent-secondary)]"> Privacidad por diseño</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
          <OnboardingModal />
        </Providers>
      </body>
    </html>
  )
}
