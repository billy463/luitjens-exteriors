import fs from 'fs';
import path from 'path';
import https from 'https';

const data = JSON.parse(fs.readFileSync('images.json', 'utf8'));
const publicImagesDir = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

data.forEach((url) => {
  const filename = path.basename(decodeURIComponent(url));
  const destPath = path.join(publicImagesDir, filename);
  const file = fs.createWriteStream(destPath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => file.close());
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error(`Error downloading ${url}:`, err.message);
  });
});
console.log('Downloading ' + data.length + ' images into public/images/');
