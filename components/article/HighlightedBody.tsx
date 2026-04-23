import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { DetectedTechnique } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

interface Props {
  text: string
  techniques: DetectedTechnique[]
}

const CATEGORY_STYLES: Record<string, string> = {
  emotional: 'highlight-emotional',
  cognitive: 'highlight-cognitive',
  narrative: 'highlight-narrative',
  linguistic: 'highlight-linguistic',
  neurolinguistic: 'highlight-linguistic',
  neuromarketing: 'highlight-neuromarketing',
}

export function HighlightedBody({ text, techniques }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!text) return null;
  
  // Split text into paragraphs first
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="article-body selection:bg-[var(--color-accent)]/30">
      {paragraphs.map((pText, pIdx) => {
        // If no techniques, just render the paragraph
        if (!techniques || techniques.length === 0) {
          return <p key={pIdx}>{pText}</p>;
        }

        let lastIndex = 0;
        const parts: (string | React.ReactNode)[] = [];
        
        // Identify all occurrences of all quotes within THIS paragraph
        const occurrences: { start: number; end: number; dt: DetectedTechnique }[] = [];
        
        techniques.forEach(dt => {
          if (!dt.quote) return;
          let pos = pText.indexOf(dt.quote);
          while (pos !== -1) {
            occurrences.push({ start: pos, end: pos + dt.quote.length, dt });
            pos = pText.indexOf(dt.quote, pos + 1);
          }
        });

        // Sort and remove overlaps
        const sortedOccurrences = occurrences.sort((a, b) => a.start - b.start);
        const nonOverlapping: typeof occurrences = [];
        
        let currentEnd = -1;
        for (const occ of sortedOccurrences) {
          if (occ.start >= currentEnd) {
            nonOverlapping.push(occ);
            currentEnd = occ.end;
          }
        }

        for (const occ of nonOverlapping) {
          if (occ.start > lastIndex) {
            parts.push(pText.substring(lastIndex, occ.start));
          }
          
          const styleClass = CATEGORY_STYLES[occ.dt.technique.category] || 'bg-accent-dim/20 border-b border-accent';
          const id = `${occ.dt.technique.id}-${pIdx}-${occ.start}`;
          
          parts.push(
            <span 
              key={id}
              className={cn("relative inline px-0.5 rounded-sm transition-all duration-300 cursor-help", styleClass)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {occ.dt.quote}
              
              <AnimatePresence>
                {hoveredId === id && (
                  <motion.span
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-72 pointer-events-none"
                  >
                    <span className="block p-4 rounded-xl bg-[#0a0a0b] border border-[var(--color-border)] shadow-2xl backdrop-blur-xl">
                      <span className="flex items-center gap-2 mb-2">
                        <Info size={12} className="text-[var(--color-accent)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                          {occ.dt.technique.nameEs}
                        </span>
                      </span>
                      <span className="block text-xs text-[var(--color-text-primary)] leading-relaxed font-ui">
                        {occ.dt.explanation}
                      </span>
                      {/* Arrow */}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a0a0b]" />
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          );
          
          lastIndex = occ.end;
        }
        
        if (lastIndex < pText.length) {
          parts.push(pText.substring(lastIndex));
        }

        return (
          <p key={pIdx} className="mb-8 last:mb-0">
            {parts}
          </p>
        );
      })}
    </div>
  );
}
