const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';
const query = 'sourcelang:spanish politics';
const gdeltParams = new URLSearchParams({
  format: 'json',
  timespan: '24h',
  query: query,
  maxrecords: '10',
  mode: 'artlist',
});

async function run() {
  try {
    const res = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Articles count:", data.articles ? data.articles.length : 0);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
