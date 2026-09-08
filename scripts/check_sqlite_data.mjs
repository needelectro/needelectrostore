import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/need_electro.db');
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log('SQLite Tables:', tables.map(t => t.name));

for (const t of tables) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
    console.log(`  ${t.name}: ${count.count}`);
  } catch (err) {
    console.log(`  ${t.name}: error ${err.message}`);
  }
}

// Check sample products
try {
  const products = db.prepare("SELECT id, name, sku, brand, category, retail_price FROM products LIMIT 5").all();
  console.log('SQLite Sample Products:', products);
} catch (e) {
  console.log('No products query:', e.message);
}
