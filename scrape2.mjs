import fs from 'fs';
async function run() {
  const html = await fetch('https://www.luitjens-exteriors.com/').then(r => r.text());
  const imgSrcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  const uniqImages = [...new Set(imgSrcs)].filter(src => src.includes('http') || src.startsWith('//'));
  const fullUrls = uniqImages.map(u => u.startsWith('//') ? 'https:' + u : u).map(u => u.split('?')[0]);
  fs.writeFileSync('images.json', JSON.stringify(fullUrls, null, 2));
}
run();
