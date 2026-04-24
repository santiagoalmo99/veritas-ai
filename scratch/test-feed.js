
async function testFeed() {
  const country = 'US';
  const topics = 'politics,economy,tech,international';
  const url = `http://localhost:3000/api/feed?country=${country}&topics=${topics}`;
  
  console.log(`Testing feed URL: ${url}`);
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Source:', data.source);
    console.log('Articles count:', data.articles?.length);
    if (data.articles?.length > 0) {
      console.log('First article title:', data.articles[0].title);
      console.log('First article ID:', data.articles[0].id);
    } else {
      console.log('Message:', data.message);
    }
  } catch (e) {
    console.error('Test failed:', e);
  }
}

testFeed();
