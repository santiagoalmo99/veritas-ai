
const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/context/context'
const queryParts = [`sourcecountry:CO`, 'sourcelang:spanish']
const gdeltParams = new URLSearchParams({
  format: 'json',
  timespan: '24h',
  query: queryParts.join(' '),
  maxrecords: '5',
  mode: 'artlist'
})

fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`)
  .then(res => res.json())
  .then(data => {
    console.log('GDELT Sample Article:', JSON.stringify(data.articles?.[0], null, 2))
  })
  .catch(err => console.error(err))
