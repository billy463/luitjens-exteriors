import fs from 'fs';
import path from 'path';

async function run() {
  const baseUrl = 'https://www.luitjens-exteriors.com/';
  const html = await fetch(baseUrl).then(r => r.text());
  
  const imgSrcs = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)].map(m => m[1]);
  const styleMatch = [...html.matchAll(/style="([^"]+)"/g)].map(m => m[1]).join(' ');
  const inlineColors = styleMatch.match(/#[A-Fa-f0-9]{3,6}/g);
  
  const results = {
    images: uniqImages,
    colors: sortedColors
  };
  fs.writeFileSync('scraped_data.json', JSON.stringify(results, null, 2));
}

run();
