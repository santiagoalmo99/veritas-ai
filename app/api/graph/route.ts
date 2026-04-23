import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    // 1. Fetch Outlets (Nodes)
    const { data: outlets, error: errOutlets } = await supabaseAdmin
      .from('media_outlets')
      .select('id, name, domain, alert_level, reliability_score')
      
    if (errOutlets) throw errOutlets

    // 2. Fetch Links (Edges)
    const { data: links, error: errLinks } = await supabaseAdmin
      .from('media_links')
      .select('source_outlet_id, target_domain, target_url')
      
    if (errLinks) throw errLinks

    // 3. Process Nodes
    // We only want to show nodes that are connected or are in our DB
    const nodesMap = new Map()
    
    outlets?.forEach(o => {
      nodesMap.set(o.domain, {
        id: o.domain,
        name: o.name,
        val: 1, // Default size
        color: o.alert_level === 'green' ? '#10b981' : 
               o.alert_level === 'yellow' ? '#eab308' : 
               o.alert_level === 'orange' ? '#f97316' : '#ef4444'
      })
    })

    // 4. Process Edges
    const edgesMap = new Map()
    
    links?.forEach(link => {
      // Find source domain from outlet_id
      const sourceOutlet = outlets?.find(o => o.id === link.source_outlet_id)
      if (!sourceOutlet) return
      
      const sourceId = sourceOutlet.domain
      const targetId = link.target_domain
      
      // If target is not in our outlets, add it as a small grey node
      if (!nodesMap.has(targetId)) {
        nodesMap.set(targetId, {
          id: targetId,
          name: targetId,
          val: 0.5,
          color: '#4b5563' // gray
        })
      }
      
      // Increase size of target node (In-degree)
      const targetNode = nodesMap.get(targetId)
      targetNode.val += 0.2
      
      // Create or update edge
      const edgeId = `${sourceId}-${targetId}`
      if (edgesMap.has(edgeId)) {
        edgesMap.get(edgeId).weight += 1
      } else {
        edgesMap.set(edgeId, {
          source: sourceId,
          target: targetId,
          weight: 1
        })
      }
    })

    const graphData = {
      nodes: Array.from(nodesMap.values()),
      links: Array.from(edgesMap.values())
    }

    return NextResponse.json(graphData)
    
  } catch (error) {
    console.error('[graph api] error:', error)
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 })
  }
}
