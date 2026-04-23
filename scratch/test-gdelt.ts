async function testGdelt() {
  const query = 'sourcecountry:UnitedStates sourcelang:english'
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=5&format=json&timespan=24h`
  
  console.log('Fetching:', url)
  try {
    const res = await fetch(url)
    const data = await res.json()
    console.log('GDELT Response Articles:', data.articles?.length || 0)
    if (data.articles) {
      data.articles.forEach((a: any, i: number) => {
        console.log(`${i+1}. ${a.title} (${a.language}) - ${a.url}`)
      })
    }
  } catch (e) {
    console.error('GDELT Error:', e)
  }
}

testGdelt()
