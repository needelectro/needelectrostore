// Script to fetch all sheets from the Google Spreadsheet as CSV and analyze them
import https from 'https';
import fs from 'fs';
import path from 'path';

const docId = '1tGOHhRjrcfWKjyRQKBjuk3dnu0Fqaex7gPpKJRyFJ9w';
const sheets = [
  { name: 'Sales Report', gid: '0' },
  { name: 'Monthly Report', gid: '914185447' },
  { name: 'Product info', gid: '2019466901' },
  { name: 'Expense - Invest', gid: '543238443' },
  { name: 'Final Calculate', gid: '845084336' },
  { name: 'Source Code', gid: '1998941369' },
];

function fetchCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
          let data = '';
          res2.on('data', (chunk) => data += chunk);
          res2.on('end', () => resolve(data));
        }).on('error', reject);
      } else {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

async function main() {
  const outputDir = path.resolve('scripts/sheet_data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log('Fetching Google Spreadsheet data...');
  for (const s of sheets) {
    try {
      const csv = await fetchCsv(s.gid);
      const filePath = path.join(outputDir, `${s.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
      fs.writeFileSync(filePath, csv, 'utf-8');
      console.log(`Saved ${s.name} (${csv.length} bytes, ${csv.split('\n').length} lines) to ${filePath}`);
    } catch (e) {
      console.error(`Failed to fetch ${s.name}:`, e.message);
    }
  }
}

main();
