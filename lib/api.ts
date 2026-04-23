import { supabase } from './supabase'
import type { Article, MediaOutlet, Technique, DetectedTechnique, AnalysisLog } from './types'

export const api = {
  // ── ARTICLES ──────────────────────────────────────────────

  async getArticles(countryCode?: string): Promise<Article[]> {
    let query = supabase
      .from('articles')
      .select(`
        *,
        outlet:media_outlets (*)
      `)
      .order('published_at', { ascending: false })

    if (countryCode) {
      query = query.eq('country_code', countryCode)
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return articles.map(mapArticleFromDB)
  },

  async getArticleById(id: string): Promise<Article | null> {
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        outlet:media_outlets (*),
        techniques:article_techniques (
          quote,
          confidence,
          explanation,
          technique:techniques (*)
        ),
        logs:article_analysis_logs (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching article by id:', error)
      return null
    }

    return mapArticleFromDB(article)
  },

  // ── MEDIA OUTLETS ──────────────────────────────────────────

  async getMediaOutlets(): Promise<MediaOutlet[]> {
    const { data: outlets, error } = await supabase
      .from('media_outlets')
      .select('*')
      .order('current_veritas_avg', { ascending: true })

    if (error) {
      console.error('Error fetching outlets:', error)
      return []
    }

    return outlets.map(mapOutletFromDB)
  },

  // ── JOURNALISTS ────────────────────────────────────────────
  
  async getJournalists() {
    const { data: journalists, error } = await supabase
      .from('journalists')
      .select('*')
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching journalists:', error)
      return []
    }

    return journalists
  },

  // ── GRAPH TOPOLOGY ─────────────────────────────────────────

  async getGraphTopology() {
    // Para simplificar, traeremos todos los outlets y los devolveremos listos para el componente Grafo
    const outlets = await this.getMediaOutlets()
    return { nodes: outlets, links: [] } // La topología rica la seguimos armando en el cliente o la podemos mover aquí
  }
}

// ── MAPPERS (DB -> Frontend Types) ───────────────────────────

function mapOutletFromDB(dbOutlet: any): MediaOutlet {
  return {
    id: dbOutlet.id,
    name: dbOutlet.name,
    domain: dbOutlet.domain,
    countryCode: dbOutlet.country_code,
    currentVeritasAvg: Number(dbOutlet.current_veritas_avg),
    articlesAnalyzed: dbOutlet.articles_analyzed,
    alertLevel: dbOutlet.alert_level as any,
    politicalBiasScore: Number(dbOutlet.political_bias_score),
    reliabilityScore: Number(dbOutlet.reliability_score),
    credScore: dbOutlet.cred_score ? Number(dbOutlet.cred_score) : undefined,
    topTechniques: dbOutlet.top_techniques || []
  }
}

function mapArticleFromDB(dbArticle: any): Article {
  return {
    id: dbArticle.id,
    url: dbArticle.url,
    title: dbArticle.title,
    titleNeutralized: dbArticle.title_neutralized,
    excerpt: dbArticle.excerpt,
    imageUrl: dbArticle.image_url,
    outlet: dbArticle.outlet ? mapOutletFromDB(dbArticle.outlet) : ({} as any),
    journalist: dbArticle.journalist,
    journalistScore: dbArticle.journalist_score ? Number(dbArticle.journalist_score) : undefined,
    publishedAt: dbArticle.published_at,
    category: dbArticle.category as any,
    countryCode: dbArticle.country_code,
    language: dbArticle.language,
    veritasScore: dbArticle.veritas_score ? Number(dbArticle.veritas_score) : undefined,
    analysisStatus: dbArticle.analysis_status as any,
    analysisConfidence: dbArticle.analysis_confidence ? Number(dbArticle.analysis_confidence) : undefined,
    viewCount: dbArticle.view_count,
    trendingScore: Number(dbArticle.trending_score),
    summaryNeutralized: dbArticle.summary_neutralized,
    contentNeutralized: dbArticle.content_neutralized,
    primaryIntent: dbArticle.primary_intent as any,
    tags: dbArticle.tags || [],
    content: dbArticle.content,
    
    // Relaciones
    techniquesDetected: (dbArticle.techniques || []).map((t: any) => ({
      quote: t.quote,
      confidence: Number(t.confidence),
      explanation: t.explanation,
      technique: {
        id: t.technique.id,
        slug: t.technique.slug,
        name: t.technique.name,
        nameEs: t.technique.name_es,
        category: t.technique.category,
        biopsychosocialLevel: t.technique.biopsychosocial_level,
        description: t.technique.description,
        descriptionEs: t.technique.description_es,
        severity: Number(t.technique.severity),
        icon: t.technique.icon,
        academicSource: t.technique.academic_source
      }
    })),
    
    analysisLogs: (dbArticle.logs || [])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((l: any) => ({
        stepId: l.step_id,
        status: l.status,
        timestamp: l.timestamp_val,
        technicalDetail: l.technical_detail,
        technicalDetailEs: l.technical_detail_es
      }))
  }
}
