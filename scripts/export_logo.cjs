const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save-logo') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.transparentPng) {
          const base64Data = data.transparentPng.replace(/^data:image\/png;base64,/, '');
          const outPath = path.join(__dirname, '..', 'public', 'logo-transparent.png');
          fs.writeFileSync(outPath, base64Data, 'base64');
          console.log('Saved transparent logo to', outPath);
        }
        if (data.darkTransparentPng) {
          const base64Data = data.darkTransparentPng.replace(/^data:image\/png;base64,/, '');
          const outPath = path.join(__dirname, '..', 'public', 'logo-dark-transparent.png');
          fs.writeFileSync(outPath, base64Data, 'base64');
          console.log('Saved dark transparent logo to', outPath);
        }
        if (data.iconPng) {
          const base64Data = data.iconPng.replace(/^data:image\/png;base64,/, '');
          const outPath = path.join(__dirname, '..', 'public', 'logo-icon.png');
          fs.writeFileSync(outPath, base64Data, 'base64');
          console.log('Saved icon PNG to', outPath);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        setTimeout(() => process.exit(0), 500);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(err.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4567, () => {
  console.log('Logo receiver listening on port 4567');
});
