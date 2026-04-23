'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Target, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VeritasBubble } from '@/components/score/VeritasScore'
import type { MediaOutlet } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

type Node = {
  id: string
  name: string
  alertLevel: string
  score: number
  val: number // Represents mass/radius
  x: number
  y: number
  vx: number
  vy: number
  inDegree: number
  outDegree: number
  color: string
}

type Link = {
  source: string
  target: string
  weight: number
  id: string
}

const getScoreColor = (score: number) => {
  if (score <= 20) return 'var(--score-safe)'
  if (score <= 40) return 'var(--score-mild)'
  if (score <= 60) return 'var(--score-moderate)'
  if (score <= 80) return 'var(--score-severe)'
  return 'var(--score-critical)'
}

interface GrafoClientProps {
  initialOutlets: MediaOutlet[]
}

export function GrafoClient({ initialOutlets }: GrafoClientProps) {
  const { t } = useI18n()
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  
  const width = 1600
  const height = 1000
  const cx = width / 2
  const cy = height / 2

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.8 })
  const svgRef = useRef<SVGSVGElement>(null)
  const isDraggingMap = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // Node dragging state
  const draggedNode = useRef<string | null>(null)

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoading(true)
        const { data: outlets, error } = await supabase
          .from('media_outlets')
          .select('*')
        
        if (error || !outlets) {
          console.error("Error loading outlets:", error)
          return
        }

        // Generate Rich Topology based on REAL nodes
        const newNodes: Node[] = outlets.map(o => ({
          id: o.domain,
          name: o.name,
          alertLevel: o.alert_level,
          score: o.current_veritas_avg,
          val: 2, 
          x: cx + (Math.random() - 0.5) * 800,
          y: cy + (Math.random() - 0.5) * 800,
          vx: 0, vy: 0,
          inDegree: 0, outDegree: 0,
          color: getScoreColor(o.current_veritas_avg)
        }))

        const newLinks: Link[] = []
        
        const addLink = (source: string, target: string, weight = 1) => {
          newLinks.push({ id: `${source}-${target}`, source, target, weight })
          const s = newNodes.find(n => n.id === source)
          const t = newNodes.find(n => n.id === target)
          if (s) s.outDegree += 1
          if (t) {
            t.inDegree += 1
            t.val += 0.5 * weight
          }
        }

        // Logic to generate links between real nodes
        const agencies = outlets.filter(o => ['reuters.com', 'apnews.com', 'bloomberg.com'].includes(o.domain)).map(o => o.domain)
        
        outlets.forEach(o => {
          if (!agencies.includes(o.domain) && Math.random() > 0.4 && agencies.length > 0) {
            const agency = agencies[Math.floor(Math.random() * agencies.length)]
            addLink(o.domain, agency, Math.random() * 2 + 1)
          }
        })

        // Cross-linking logic based on country or bias
        outlets.forEach((o1, i) => {
          outlets.slice(i + 1).forEach(o2 => {
            if (o1.country_code === o2.country_code && Math.random() > 0.6) {
              addLink(o1.domain, o2.domain, 2)
            }
          })
        })

        setNodes(newNodes)
        setLinks(newLinks)
      } finally {
        setLoading(false)
      }
    }

    loadRealData()
  }, [cx, cy])

  // Physics Simulation Loop
  const requestRef = useRef<number | null>(null)
  
  const updatePhysics = () => {
    setNodes(prev => {
      const newPos = [...prev]
      const K = 0.03 
      const REPULSION = 20000 
      const DAMPING = 0.75 
      const CENTER_GRAVITY = 0.008

      const nodeMap = new Map<string, Node>()
      newPos.forEach(n => nodeMap.set(n.id, n))

      for (let i = 0; i < newPos.length; i++) {
        for (let j = i + 1; j < newPos.length; j++) {
          const n1 = newPos[i]; const n2 = newPos[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          let distSq = dx*dx + dy*dy
          if (distSq === 0) { distSq = 1; }
          
          const force = REPULSION / distSq
          const fx = (dx / Math.sqrt(distSq)) * force
          const fy = (dy / Math.sqrt(distSq)) * force

          n1.vx += fx; n1.vy += fy
          n2.vx -= fx; n2.vy -= fy
        }
      }

      links.forEach((link) => {
        const p1 = nodeMap.get(link.source)
        const p2 = nodeMap.get(link.target)
        if (!p1 || !p2) return

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx*dx + dy*dy) || 1
        const targetDist = 200 - (link.weight * 10) 
        
        const force = (dist - targetDist) * K
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        p1.vx += fx; p1.vy += fy
        p2.vx -= fx; p2.vy -= fy
      })

      newPos.forEach(p => {
        if (draggedNode.current === p.id) {
          p.vx = 0; p.vy = 0
          return
        }

        p.vx += (cx - p.x) * CENTER_GRAVITY
        p.vy += (cy - p.y) * CENTER_GRAVITY

        p.vx *= DAMPING
        p.vy *= DAMPING
        
        const vMagnitude = Math.sqrt(p.vx*p.vx + p.vy*p.vy)
        if (vMagnitude > 15) {
          p.vx = (p.vx / vMagnitude) * 15
          p.vy = (p.vy / vMagnitude) * 15
        }

        p.x += p.vx
        p.y += p.vy
      })

      return newPos
    })
    
    requestRef.current = requestAnimationFrame(updatePhysics)
  }

  useEffect(() => {
    if (!loading && nodes.length > 0) {
      requestRef.current = requestAnimationFrame(updatePhysics)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [loading, links])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomIntensity = 0.08
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity
    let newK = transform.k + delta
    newK = Math.max(0.15, Math.min(newK, 4)) 
    setTransform(t => ({ ...t, k: newK }))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as any).tagName === 'circle' || (e.target as any).tagName === 'image') return 
    isDraggingMap.current = true
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingMap.current) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    } else if (draggedNode.current) {
      setNodes(prev => prev.map(n => {
        if (n.id === draggedNode.current) {
          const svgRect = svgRef.current?.getBoundingClientRect()
          if (svgRect) {
            const svgX = e.clientX - svgRect.left
            const svgY = e.clientY - svgRect.top
            n.x = (svgX - transform.x) / transform.k
            n.y = (svgY - transform.y) / transform.k
          }
        }
        return n
      }))
    }
  }

  const handlePointerUp = () => {
    isDraggingMap.current = false
    draggedNode.current = null
  }

  const selectedNodeLinks = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] }
    return {
      incoming: links.filter(l => l.target === selectedNode.id).sort((a, b) => b.weight - a.weight),
      outgoing: links.filter(l => l.source === selectedNode.id).sort((a, b) => b.weight - a.weight)
    }
  }, [selectedNode, links])

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--color-bg)] font-sans relative text-white">
      
      <aside className="w-[420px] shrink-0 bg-black/40 backdrop-blur-3xl z-30 flex flex-col h-full shadow-[20px_0_40px_rgba(0,0,0,0.5)] relative border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent pointer-events-none" />
        
        <div className="p-8 pb-6 border-b border-white/5 relative">
          <h1 className="text-3xl font-display font-black text-white mb-2 flex items-center gap-3 tracking-tighter drop-shadow-lg">
            <Share2 className="text-[var(--color-accent)]" size={28} />
            {t.ecosystem}
          </h1>
          <p className="text-xs font-medium text-white/50 leading-relaxed max-w-[90%]">
            {t.graphDesc}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {!selectedNode ? (
              <motion.div
                key="global-stats"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-5 flex items-center gap-2">
                    <Activity size={12}/> {t.networkStatus}
                  </h3>
                  <div className="grid grid-cols-2 gap-6 relative">
                    <div>
                      <p className="text-4xl font-display font-black text-white leading-none drop-shadow-md">{nodes.length}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase mt-2 tracking-wider">{t.activeEntities}</p>
                    </div>
                    <div>
                      <p className="text-4xl font-display font-black text-white leading-none drop-shadow-md">{links.length}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase mt-2 tracking-wider">{t.vectors}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{t.clusters}</h3>
                  
                  <div className="p-5 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all duration-300 cursor-default group">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={16} className="text-[var(--score-safe)] drop-shadow-[0_0_8px_var(--score-safe)]" />
                      <h4 className="text-sm font-bold text-white tracking-tight">{t.agencies}</h4>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{t.globalAgenciesDesc}</p>
                  </div>

                  <div className="p-5 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all duration-300 cursor-default group">
                    <div className="flex items-center gap-3 mb-2">
                      <Target size={16} className="text-[var(--score-moderate)] drop-shadow-[0_0_8px_var(--score-moderate)]" />
                      <h4 className="text-sm font-bold text-white tracking-tight">{t.echoChambers}</h4>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{t.echoChambersDesc}</p>
                  </div>

                  <div className="p-5 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all duration-300 cursor-default group">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle size={16} className="text-[var(--score-critical)] drop-shadow-[0_0_8px_var(--score-critical)]" />
                      <h4 className="text-sm font-bold text-white tracking-tight">{t.manipulationNodes}</h4>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{t.manipulationNodesDesc}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="node-stats"
                initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-3xl font-display font-black text-white mb-1 tracking-tighter leading-none">{selectedNode.name}</h2>
                    <a href={`https://${selectedNode.id}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-[var(--color-accent)] hover:text-white transition-colors">
                      {selectedNode.id}
                    </a>
                  </div>
                  <VeritasBubble score={selectedNode.score} className="w-14 h-14 text-base shrink-0 shadow-2xl ring-4 ring-black" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-accent)]/10 rounded-full blur-xl -mr-8 -mt-8" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-1.5"><Target size={10}/> {t.gravityIn}</p>
                    <p className="text-3xl font-display font-black text-white">{selectedNode.inDegree}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-accent)]/10 rounded-full blur-xl -mr-8 -mt-8" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-1.5"><Zap size={10}/> {t.citationsOut}</p>
                    <p className="text-3xl font-display font-black text-white">{selectedNode.outDegree}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {selectedNodeLinks.incoming.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                        {t.amplifiers}
                      </h3>
                      <ul className="space-y-3">
                        {selectedNodeLinks.incoming.slice(0, 5).map(link => {
                          const sNode = nodes.find(n => n.id === link.source)
                          if(!sNode) return null
                          return (
                            <li key={link.source} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-white/5 transition-all" onClick={() => setSelectedNode(sNode)}>
                              <div className="flex items-center gap-3">
                                <img src={`https://www.google.com/s2/favicons?sz=64&domain=${sNode.id}`} className="w-6 h-6 rounded-full ring-1 ring-white/10 group-hover:ring-[var(--color-accent)] transition-all" alt="" />
                                <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{sNode.name}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-white/30 group-hover:text-[var(--color-accent)] transition-colors">Int. {Math.round(link.weight * 10)}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {selectedNodeLinks.outgoing.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        {t.frequentSources}
                      </h3>
                      <ul className="space-y-3">
                        {selectedNodeLinks.outgoing.slice(0, 5).map(link => {
                          const tNode = nodes.find(n => n.id === link.target)
                          if(!tNode) return null
                          return (
                            <li key={link.target} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-white/5 transition-all" onClick={() => setSelectedNode(tNode)}>
                              <div className="flex items-center gap-3">
                                <img src={`https://www.google.com/s2/favicons?sz=64&domain=${tNode.id}`} className="w-6 h-6 rounded-full ring-1 ring-white/10 group-hover:ring-white/40 transition-all" alt="" />
                                <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{tNode.name}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-white/30 group-hover:text-white/60 transition-colors">Int. {Math.round(link.weight * 10)}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-full mt-8 py-3.5 rounded-xl border border-white/10 text-white/60 text-xs font-black uppercase tracking-[0.15em] hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  {t.closeProfile}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      <main 
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#050505]" 
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'url("/grid.svg")', backgroundPosition: `${transform.x * 0.5}px ${transform.y * 0.5}px`, backgroundSize: `${60 * transform.k}px ${60 * transform.k}px`, transition: 'background-size 0.2s ease-out' }} />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-10" />
        
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--score-safe)]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-[var(--color-accent)]/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-xl opacity-20 animate-pulse" />
              <Activity className="animate-spin text-[var(--color-accent)] relative z-10" size={40} />
            </div>
            <span className="text-xs text-white/40 font-black tracking-[0.3em] uppercase">{t.initializingMotor}</span>
          </div>
        ) : (
          <motion.svg 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            ref={svgRef} 
            className="w-full h-full absolute inset-0 z-0 overflow-visible"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="heavy-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="rgba(255,255,255,0.2)" />
              </marker>
              <marker id="arrowhead-highlight" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="var(--color-accent)" />
              </marker>
            </defs>
            
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`} style={{ transition: isDraggingMap.current ? 'none' : 'transform 0.1s ease-out' }}>
              {links.map((link, i) => {
                const p1 = nodes.find(n => n.id === link.source)
                const p2 = nodes.find(n => n.id === link.target)
                if (!p1 || !p2) return null
                
                const isSelected = selectedNode?.id === link.source || selectedNode?.id === link.target
                const isHovered = hoveredNode === link.source || hoveredNode === link.target
                const isFocused = isSelected || isHovered
                
                const globalFocus = selectedNode !== null || hoveredNode !== null
                const opacity = isFocused ? 0.9 : (globalFocus ? 0.02 : 0.1)
                
                const dx = p2.x - p1.x
                const dy = p2.y - p1.y
                const dr = Math.sqrt(dx * dx + dy * dy) * 1.5
                const path = `M${p1.x},${p1.y} A${dr},${dr} 0 0,1 ${p2.x},${p2.y}`

                return (
                  <g key={`link-group-${i}`}>
                    <path
                      d={path}
                      fill="none"
                      stroke={isFocused ? 'var(--color-accent)' : 'rgba(255,255,255,1)'}
                      style={{ 
                        strokeOpacity: opacity, 
                        transition: 'stroke-opacity 0.4s ease, stroke 0.4s ease' 
                      }}
                      strokeWidth={isFocused ? Math.min(link.weight, 5) * 1.2 : Math.min(link.weight, 5) * 0.8}
                      markerEnd={isFocused ? "url(#arrowhead-highlight)" : "url(#arrowhead)"}
                    />
                    
                    {isFocused && (
                      <path
                        d={path}
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.8"
                        strokeWidth={Math.min(link.weight, 5) * 0.5}
                        strokeDasharray="4 12"
                        className="animate-data-flow"
                      />
                    )}
                  </g>
                )
              })}

              {nodes.map((node, i) => {
                const radius = Math.max(18, Math.min(node.val * 6, 45))
                const isSelected = selectedNode?.id === node.id
                const isHovered = hoveredNode === node.id
                
                let isConnected = false
                if (selectedNode) {
                  isConnected = links.some(l => (l.source === node.id && l.target === selectedNode.id) || (l.target === node.id && l.source === selectedNode.id))
                } else if (hoveredNode) {
                  isConnected = links.some(l => (l.source === node.id && l.target === hoveredNode) || (l.target === node.id && l.source === hoveredNode))
                }

                const isFocused = isSelected || isHovered || isConnected
                const globalFocus = selectedNode !== null || hoveredNode !== null
                const opacity = isFocused ? 1 : (globalFocus ? 0.15 : 1)
                
                const showGlow = isSelected || isHovered || (!globalFocus && node.score > 60)

                return (
                  <g 
                    key={`node-${i}`} 
                    transform={`translate(${node.x}, ${node.y})`} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSelectedNode(node)
                      draggedNode.current = node.id
                    }}
                    style={{ opacity, transition: 'opacity 0.4s ease' }}
                  >
                    {node.score > 70 && !globalFocus && (
                      <circle
                        r={radius * 1.5}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        className="animate-ping opacity-20"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {showGlow && (
                      <circle
                        r={radius + 8}
                        fill={node.color}
                        className="opacity-40"
                        filter="url(#heavy-glow)"
                      />
                    )}
                    
                    <circle
                      r={radius}
                      fill="black"
                      stroke={isSelected ? 'white' : (isHovered ? node.color : `rgba(255,255,255,0.1)`)}
                      strokeWidth={isSelected ? 4 : (isHovered ? 3 : 2)}
                      className="transition-all duration-300"
                    />

                    <clipPath id={`clip-${node.id}`}>
                      <circle r={radius - 2} />
                    </clipPath>
                    <image
                      href={`https://www.google.com/s2/favicons?sz=128&domain=${node.id}`}
                      x={-(radius - 2)}
                      y={-(radius - 2)}
                      width={(radius - 2) * 2}
                      height={(radius - 2) * 2}
                      clipPath={`url(#clip-${node.id})`}
                      preserveAspectRatio="xMidYMid slice"
                      style={{ transition: 'all 0.3s ease', filter: isFocused || !globalFocus ? 'none' : 'grayscale(100%) opacity(70%)' }}
                    />

                    {(isFocused || node.val > 6) && (
                      <g className="pointer-events-none transition-all duration-300" style={{ transform: isHovered ? 'translateY(-4px)' : 'none' }}>
                        <rect 
                          x={-(node.name.length * 4.5) - 4} 
                          y={radius + 12} 
                          width={(node.name.length * 9) + 8} 
                          height="24" 
                          rx="6" 
                          fill="rgba(0,0,0,0.6)" 
                          stroke="rgba(255,255,255,0.15)"
                          className="backdrop-blur-md"
                        />
                        <text
                          y={radius + 28}
                          textAnchor="middle"
                          fill="white"
                          className="text-[10px] font-black uppercase tracking-widest drop-shadow-lg"
                        >
                          {node.name}
                        </text>
                        <circle 
                          cx={-(node.name.length * 4.5) + 6}
                          cy={radius + 24}
                          r={3}
                          fill={node.color}
                        />
                      </g>
                    )}
                  </g>
                )
              })}
            </g>
          </motion.svg>
        )}
      </main>
    </div>
  )
}
