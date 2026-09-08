import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Step 1: Updating Supabase PostgreSQL Schema & Foreign Key Constraints ---');
  try {
    // 1. Make branch_id in users nullable
    await prisma.$executeRawUnsafe(`ALTER TABLE users ALTER COLUMN branch_id DROP NOT NULL;`);
    console.log('✔ users.branch_id is now nullable in PostgreSQL.');

    // 2. Drop existing foreign key and recreate with ON DELETE SET NULL
    await prisma.$executeRawUnsafe(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_branch_id_fkey;`);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users 
      ADD CONSTRAINT users_branch_id_fkey 
      FOREIGN KEY (branch_id) REFERENCES branches(id) 
      ON DELETE SET NULL;
    `);
    console.log('✔ users_branch_id_fkey constraint updated to ON DELETE SET NULL.');

    // 3. Clear branch_id on all users
    const usersUpdated = await prisma.$executeRawUnsafe(`UPDATE users SET branch_id = NULL, primary_branch_id = NULL;`);
    console.log(`✔ Set branch_id = NULL for users (${usersUpdated} affected).`);

    // 4. Delete all branches from PostgreSQL
    const deletedBranches = await prisma.branch.deleteMany({});
    console.log(`✔ Deleted all branches from PostgreSQL (${deletedBranches.count} removed).`);

    const remainingPostgres = await prisma.branch.count();
    console.log(`✔ Remaining branches in PostgreSQL: ${remainingPostgres}`);
  } catch (err) {
    console.error('❌ Error in PostgreSQL branch wipe/migration:', err);
    throw err;
  }

  console.log('\n--- Step 2: Updating SQLite Local Database ---');
  const sqlitePath = path.resolve(process.cwd(), 'data/need_electro.db');
  if (fs.existsSync(sqlitePath)) {
    try {
      const db = new DatabaseSync(sqlitePath);
      db.exec(`PRAGMA foreign_keys = OFF;`);
      
      db.exec(`UPDATE users SET branch_id = '';`);
      db.exec(`DELETE FROM branches;`);
      console.log(`✔ Deleted branches from SQLite.`);

      const remainingSqlite = db.prepare(`SELECT count(*) as count FROM branches`).get();
      console.log(`✔ Remaining branches in SQLite: ${remainingSqlite.count}`);
      db.close();
    } catch (sqliteErr) {
      console.error('❌ Error in SQLite branch wipe:', sqliteErr);
    }
  } else {
    console.log('ℹ SQLite database data/need_electro.db not found (skipping).');
  }

  console.log('\n--- Branch Wipe Complete! ---');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
