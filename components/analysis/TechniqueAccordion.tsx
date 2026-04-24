'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BookOpen, Quote, Info, AlertTriangle, Target, Brain, Zap, Megaphone, ShieldAlert, Eye } from 'lucide-react'

const IconMap: Record<string, React.ReactNode> = {
  'alert-triangle': <AlertTriangle size={20} />,
  'target': <Target size={20} />,
  'brain': <Brain size={20} />,
  'zap': <Zap size={20} />,
  'megaphone': <Megaphone size={20} />,
  'shield-alert': <ShieldAlert size={20} />,
  'eye': <Eye size={20} />,
}
import { cn } from '@/lib/utils'
import { DetectedTechnique } from '@/lib/types'

interface Props {
  dt: DetectedTechnique
  index: number
}

export function TechniqueAccordion({ dt, index }: Props) {
  const [isOpen, setIsOpen] = useState(index === 0)

  return (
    <div className="group border-b border-[var(--color-border-soft)] last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-5 px-6 text-left transition-colors",
          isOpen ? "bg-[var(--color-surface-1)]" : "hover:bg-[var(--color-surface-1)]/50"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-[var(--color-border-soft)] transition-all",
            isOpen ? "bg-[var(--color-bg-base)] scale-110 rotate-3" : "bg-[var(--color-surface-2)]"
          )}>
            {typeof dt.technique.icon === 'string' && IconMap[dt.technique.icon] 
              ? IconMap[dt.technique.icon] 
              : <Target size={20} />}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[13px] font-display font-bold text-[var(--color-text-primary)] uppercase tracking-tight">
              {dt.technique.nameEs}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-[var(--color-accent)] opacity-80">
                {Math.round(dt.confidence * 100)}% CONF
              </span>
              <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
              <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-widest">
                ID: {dt.technique.slug.split('-')[0]}-{index + 100}
              </span>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-[var(--color-text-tertiary)]"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[var(--color-surface-1)]"
          >
            <div className="pb-8 px-6 space-y-6">
              {/* Evidence Quote */}
              <div className="space-y-2">
                <span className="forensic-label">Evidencia Textual</span>
                <div className="relative p-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-soft)] border-dashed">
                  <Quote className="absolute -left-2 -top-2 text-[var(--color-accent)] opacity-20" size={16} />
                  <p className="text-[13px] italic text-[var(--color-text-secondary)] leading-relaxed font-serif">
                    "{dt.quote}"
                  </p>
                </div>
              </div>

              {/* Forensic Rationale */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info size={12} className="text-[var(--color-accent)]" />
                  <span className="forensic-label mb-0">Racional Forense</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-bg-base)] to-[var(--color-surface-2)] border border-[var(--color-border-soft)]">
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {dt.explanation}
                  </p>
                </div>
              </div>

              {/* Source/Reference */}
              {dt.technique.academicSource && (
                <div className="pt-2 flex items-center gap-2 text-[9px] font-mono text-[var(--color-text-tertiary)]">
                  <BookOpen size={10} className="opacity-50" />
                  <span className="uppercase opacity-50">Base Académica:</span>
                  <span className="text-[var(--text-secondary)]">{dt.technique.academicSource}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
