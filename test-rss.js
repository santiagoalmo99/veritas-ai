async function run() {
  const res = await fetch('https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada');
  const text = await res.text();
  console.log("Length:", text.length, "Matches:", text.match(/<item[\s>]/g)?.length);
}
run();
