'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Cpu, Brain, Zap, FileText, Search, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnalysisLog } from '@/lib/types'

const STEPS = [
  { id: 'nlp', label: 'NLP', icon: Cpu, time: '100ms' },
  { id: 'bert', label: 'BERT', icon: Brain, time: '450ms' },
  { id: 'llama', label: 'Llama 3', icon: Zap, time: '2.3s' },
  { id: 'rewrite', label: 'Rewriting', icon: FileText, time: '3.1s' },
  { id: 'factcheck', label: 'Fact-check', icon: Search, time: '4.8s' },
]

interface Props {
  active?: boolean
  logs?: AnalysisLog[]
}

export function AnalysisTimeline({ active = true, logs = [] }: Props) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  return (
    <div className="py-8 px-4 overflow-visible">
      <div className="flex items-start justify-between relative">
        {/* Background Line */}
        <div className="absolute top-[18px] left-0 w-full h-[1px] bg-[var(--color-border)] z-0" />
        
        {/* Progress Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: active ? '100%' : '0%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute top-[18px] left-0 h-[1px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/30 z-0 origin-left"
        />

        {STEPS.map((step, idx) => {
          const log = logs.find(l => l.stepId === step.id);
          
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="relative z-10 flex flex-col items-center gap-4"
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Step Circle */}
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-700 cursor-help",
                active 
                  ? "bg-[var(--color-surface-1)] border-[var(--color-accent)]/40 text-[var(--color-accent)] shadow-[0_0_15px_rgba(212,168,67,0.1)]" 
                  : "bg-[var(--color-bg-base)] border-[var(--color-border)] text-[var(--color-text-tertiary)]"
              )}>
                <step.icon size={16} strokeWidth={1.5} className={cn(active && "animate-pulse")} />
                
                {active && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.15 + 0.4 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-bg-base)] shadow-sm"
                  >
                    <Check size={10} strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              {/* Label Section */}
              <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
                  {step.label}
                </span>
                <span className="text-[8px] text-[var(--color-text-tertiary)] font-mono tabular-nums">
                  {log?.timestamp || step.time}
                </span>
              </div>

              {/* Hover Log Detail */}
              <AnimatePresence>
                {hoveredStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-50 w-64 pointer-events-none"
                  >
                    <div className="p-3 rounded-xl bg-[#0a0a0b] border border-[var(--color-border)] shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={10} className="text-[var(--color-accent)]" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                          Technical Analysis Log
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-primary)] leading-relaxed font-mono opacity-90">
                        {log?.technicalDetailEs || `Ejecutando proceso de ${step.label} sobre el corpus del artículo...`}
                      </p>
                      {/* Arrow */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[#0a0a0b]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
