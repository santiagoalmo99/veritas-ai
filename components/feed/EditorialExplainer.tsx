'use client'
import { useState } from 'react'
import { Microscope, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function EditorialExplainer() {
  const [dismissed, setDismissed] = useState(false)
  const { preferences } = useAppStore()
  const isEn = preferences.countryCode === 'US'

  if (dismissed) return null

  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-4 mb-6 flex items-start sm:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent)] to-transparent" />
      
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
          <Microscope size={14} className="text-[var(--color-text-secondary)]" />
        </div>
        <div>
          <h3 className="font-display text-sm font-medium text-[var(--color-text-primary)]">
            {isEn ? 'VeritasAI · Cognitive Microscope' : 'VeritasAI · Microscopio Cognitivo'}
          </h3>
          <p className="font-ui text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug max-w-2xl">
            {isEn ? (
              <>
                Every news item is analyzed in real-time to detect manipulation techniques. The <strong className="text-[var(--color-text-primary)]">VeritasScore</strong> (0-100) indicates the alert level, revealing the neutral version hidden behind misleading headlines.
              </>
            ) : (
              <>
                Cada noticia es analizada en tiempo real para detectar técnicas de manipulación. El <strong className="text-[var(--color-text-primary)]">VeritasScore</strong> (0-100) indica el nivel de alerta, y revelamos la versión neutral oculta tras los titulares engañosos.
              </>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-md transition-colors shrink-0"
        aria-label={isEn ? "Dismiss explanation" : "Cerrar explicación"}
      >
        <X size={14} />
      </button>
    </div>
  )
}
