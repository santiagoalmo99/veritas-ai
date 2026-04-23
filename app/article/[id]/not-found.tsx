import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function ArticleNotFound() {
  return (
    <div className="container-app flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center
        bg-[var(--score-moderate)]/10 border border-[var(--score-moderate)]/20 mb-6">
        <FileQuestion size={28} className="text-[var(--score-moderate)]" />
      </div>
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
        Artículo no encontrado
      </h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        Este artículo no está en nuestro catálogo de análisis. Es posible que haya sido 
        analizado en otra sesión o que el enlace sea incorrecto.
      </p>
      <Link
        href="/"
        className="btn btn-primary text-sm py-2.5 px-6"
      >
        ← Volver al feed
      </Link>
    </div>
  )
}
