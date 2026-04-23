import { supabaseAdmin } from './supabase-admin'

export const SupabaseService = {
  /**
   * Obtiene todos los medios de comunicación reales de la BD
   */
  async getMediaOutlets() {
    const { data, error } = await supabaseAdmin
      .from('media_outlets')
      .select('*')
      .order('current_veritas_avg', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene la lista de periodistas reales
   */
  async getJournalists() {
    const { data, error } = await supabaseAdmin
      .from('journalists')
      .select('*')
      .order('score', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Recalcula el VeritasScore promedio de un medio basado en sus artículos analizados
   */
  async updateOutletMetrics(outletId: string) {
    // 1. Obtener todos los artículos completados de este medio
    const { data: articles, error: artError } = await supabaseAdmin
      .from('articles')
      .select('veritas_score')
      .eq('outlet_id', outletId)
      .eq('analysis_status', 'completed')

    if (artError) throw artError

    if (!articles || articles.length === 0) return

    // 2. Calcular promedio
    const totalScore = articles.reduce((acc, art) => acc + (art.veritas_score || 0), 0)
    const avgScore = Math.round(totalScore / articles.length)
    
    // Determinamos el alert_level basado en el promedio
    let alertLevel = 'green'
    if (avgScore > 20) alertLevel = 'yellow'
    if (avgScore > 40) alertLevel = 'orange'
    if (avgScore > 60) alertLevel = 'red'

    // 3. Actualizar el medio
    const { error: updateError } = await supabaseAdmin
      .from('media_outlets')
      .update({
        current_veritas_avg: avgScore,
        articles_analyzed: articles.length,
        alert_level: alertLevel
      })
      .eq('id', outletId)

    if (updateError) throw updateError
  },

  /**
   * Obtiene la topología para el grafo (nodos y aristas)
   */
  async getGraphTopology() {
    const { data: outlets, error: oError } = await supabaseAdmin.from('media_outlets').select('*')
    if (oError) throw oError

    // En una fase real, las aristas vendrían de una tabla de citaciones o análisis de red.
    // Por ahora, devolvemos los nodos para que el cliente genere la topología basada en datos reales.
    return {
      nodes: outlets
    }
  }
}
