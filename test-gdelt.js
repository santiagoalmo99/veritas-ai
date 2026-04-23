const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';
const gdeltParams = new URLSearchParams({
  format: 'json',
  timespan: '24h',
  query: 'sourcelang:spanish',
  maxrecords: '50',
  mode: 'artlist',
});

async function run() {
  try {
    const res = await fetch(`${GDELT_API_URL}?${gdeltParams.toString()}`);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Articles count:", data.articles ? data.articles.length : 0);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
