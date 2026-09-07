// NEED ELECTRO ERP — Create compact push batches
import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relPath = path.relative(process.cwd(), filePath).split(path.sep).join('/');
    if (
      relPath.startsWith('node_modules') ||
      relPath.startsWith('.next') ||
      relPath.startsWith('dist') ||
      relPath.startsWith('.git') ||
      relPath.startsWith('.vercel') ||
      relPath.startsWith('scratch') ||
      relPath.startsWith('backups') ||
      relPath.startsWith('_backup_before_real_db') ||
      relPath.startsWith('data/') ||
      relPath === '.env' ||
      relPath.startsWith('.env.') ||
      relPath.endsWith('.db') ||
      relPath.endsWith('.db-wal') ||
      relPath.endsWith('.db-shm') ||
      relPath.endsWith('.tsbuildinfo') ||
      relPath.endsWith('package-lock.json')
    ) {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(relPath);
    }
  }
  return fileList;
}

const all = getFiles('.');
console.log('Total source files in project:', all.length);

const batches = [];
const batchSize = 15;
for (let i = 0; i < all.length; i += batchSize) {
  const slice = all.slice(i, i + batchSize);
  batches.push(
    slice.map((p) => ({
      path: p,
      content: fs.readFileSync(p, 'utf8'),
    }))
  );
}

console.log(`Created ${batches.length} compact batches of max ${batchSize} files each.`);
for (let i = 0; i < batches.length; i++) {
  fs.writeFileSync(`scratch/push_batch_${i}.json`, JSON.stringify(batches[i]));
  console.log(`Batch ${i}: ${batches[i].length} files, total bytes: ${JSON.stringify(batches[i]).length}`);
}
