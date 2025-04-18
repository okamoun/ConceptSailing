  // Script to download Unsplash images to public/images
// Run with: node scripts/download_unsplash_images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  'https://images.unsplash.com/photo-1712167959870-0bf3d9cae41a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523294587484-bae6cc870010?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
];

const destDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function getFileName(url, idx) {
  const urlObj = new URL(url);
  const name = urlObj.pathname.split('/').pop();
  const params = urlObj.searchParams;
  const width = params.get('w') || 'orig';
  return `unsplash_${idx + 1}_${name}_w${width}.jpg`;
}

function downloadImage(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      cb(`Failed to get '${url}' (${response.statusCode})`);
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', (err) => {
    fs.unlink(dest, () => cb(err.message));
  });
}

(async () => {
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const fileName = getFileName(url, i);
    const dest = path.join(destDir, fileName);
    console.log(`Downloading ${url} -> ${dest}`);
    await new Promise((resolve, reject) => {
      downloadImage(url, dest, (err) => {
        if (err) {
          console.error(`Error downloading ${url}: ${err}`);
          reject(err);
        } else {
          console.log(`Saved ${dest}`);
          resolve();
        }
      });
    });
  }
  console.log('All images downloaded!');
})();
