async function fetchRssFallback(lang, country) {
  let url = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'
  if (lang === 'en') url = 'http://feeds.bbci.co.uk/news/rss.xml'
  if (lang === 'pt') url = 'https://g1.globo.com/rss/g1/'

  try {
    const res = await fetch(url)
    const text = await res.text()
    
    // Simple regex XML parser
    const items = text.split(/<item[\s>]/i).slice(1)
    return items.map((item, i) => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || item.match(/<title>(.*?)<\/title>/i)
      const linkMatch = item.match(/<link>(.*?)<\/link>/i)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || item.match(/<description>(.*?)<\/description>/i)
      const imgMatch = item.match(/<media:content[^>]*url="([^"]+)"/i) || item.match(/<enclosure[^>]*url="([^"]+)"/i)
      
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : 'Noticia Internacional'
      const articleUrl = linkMatch ? linkMatch[1] : `https://news.google.com/?item=${i}`
      let excerpt = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 160) : ''
      if (excerpt && !excerpt.endsWith('.')) excerpt += '...'
      const image_url = imgMatch ? imgMatch[1] : null

      return {
        title, url: articleUrl, excerpt, image_url
      }
    }).slice(0, 2)
  } catch (e) {
    console.error(e)
    return []
  }
}

fetchRssFallback('es', 'CO').then(console.log)
