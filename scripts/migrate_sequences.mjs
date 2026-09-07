import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/need_electro.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS document_sequences (
    document_type TEXT PRIMARY KEY,
    prefix TEXT,
    next_number INTEGER DEFAULT 1001,
    updated_at TEXT
  );
`);

const defaultSequences = [
  ['CUSTOMER', 'CUST-', 1001],
  ['INVOICE', 'INV-2026-', 1001],
  ['PURCHASE', 'PUR-2026-', 1001],
  ['SERVICE', 'SRV-2026-', 1001],
  ['WARRANTY', 'WAR-2026-', 1001],
  ['RETURN', 'RET-2026-', 1001]
];

const stmt = db.prepare(`
  INSERT OR IGNORE INTO document_sequences (document_type, prefix, next_number, updated_at)
  VALUES (?, ?, ?, datetime('now'))
`);

for (const [docType, prefix, nextNum] of defaultSequences) {
  stmt.run(docType, prefix, nextNum);
}

console.log('document_sequences created and populated:');
console.log(db.prepare('SELECT * FROM document_sequences').all());
