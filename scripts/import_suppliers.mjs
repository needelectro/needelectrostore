// NEED ELECTRO ERP — Suppliers Import Engine
// Imports the 13 wholesale computer & laptop suppliers into PostgreSQL and SQLite

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

const suppliersData = [
  {
    id: 'supp-gb',
    code: 'GB',
    company: 'Green View Computer',
    representative: 'Imran Hossain',
    phone: '01603-713021',
    address: 'New Elepant, Dhaka',
    category: 'Computer Accesories',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-at',
    code: 'AT',
    company: 'Aroz Technology',
    representative: 'Rinku Hossain',
    phone: '01970-138150',
    address: 'Multiplan, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-osbd',
    code: 'OSBD',
    company: 'Olama Shop BD',
    representative: 'Aman Ullah',
    phone: '01834-424723',
    address: 'Multiplan, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-tv',
    code: 'TV',
    company: 'Tech Vally',
    representative: 'illias',
    phone: '01604-699542',
    address: 'Mirpur 10',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-muscom',
    code: 'MUSCOM',
    company: 'Muscom',
    representative: 'Ahad',
    phone: '01922-896964',
    address: 'Multiplan, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-rt',
    code: 'RT',
    company: 'Ray Technology',
    representative: 'Rana',
    phone: '01854-840553',
    address: 'Multiplan, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-hbc',
    code: 'HBC',
    company: 'HB Computer',
    representative: 'Opu',
    phone: '01989-039959',
    address: 'ICT Bhaban, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-gil',
    code: 'GIL',
    company: 'Genius IT Lab',
    representative: 'unknown',
    phone: '01717-031497',
    address: 'ICT Bhaban, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-lzbd',
    code: 'LZBD',
    company: 'Laptop Zone BD',
    representative: 'Razib',
    phone: '01623-767012',
    address: 'Multiplan, New Elepant, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-dlb',
    code: 'DLB',
    company: 'Dubai Laptop Bazar',
    representative: 'unknown',
    phone: '01770-283681',
    address: 'Karim ullah market , Sylhet',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-tc',
    code: 'TC',
    company: 'Trust Computer',
    representative: 'Shiblu',
    phone: '01753-765372',
    address: 'Kusumbag , Moulvibazar',
    category: 'Computer Accesories',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-cz',
    code: 'CZ',
    company: 'Computer Zone',
    representative: 'Jahirul',
    phone: '01998-289898',
    address: 'Kusumbag , Moulvibazar',
    category: 'Computer Accesories',
    contactBy: 'Amdadur',
  },
  {
    id: 'supp-dg',
    code: 'DG',
    company: 'Dhaka Gadget',
    representative: 'Kamrunnahar',
    phone: '01715-835375',
    address: 'Mirpur 10, Dhaka',
    category: 'Laptop',
    contactBy: 'Amdadur',
  },
];

async function main() {
  console.log('=== Starting Import of 13 Suppliers ===\n');

  // 1. PostgreSQL Import
  for (const s of suppliersData) {
    const existing = await prisma.supplier.findFirst({
      where: {
        OR: [
          { id: s.id },
          { code: s.code },
          { company: s.company },
        ],
      },
    });

    const repName = s.representative === 'unknown' ? 'Unknown' : s.representative;
    const email = `${s.code.toLowerCase()}@needelectro.com`;

    if (existing) {
      console.log(`Updating existing supplier: [${s.code}] ${s.company}`);
      await prisma.supplier.update({
        where: { id: existing.id },
        data: {
          name: repName,
          company: s.company,
          code: s.code,
          representative: repName,
          contactBy: s.contactBy,
          phone: s.phone,
          address: s.address,
          category: s.category,
        },
      });
    } else {
      console.log(`Creating supplier: [${s.code}] ${s.company}`);
      await prisma.supplier.create({
        data: {
          id: s.id,
          name: repName,
          company: s.company,
          code: s.code,
          representative: repName,
          contactBy: s.contactBy,
          phone: s.phone,
          email,
          address: s.address,
          category: s.category,
          openingBalance: new Prisma.Decimal(0),
          currentPayable: new Prisma.Decimal(0),
        },
      });
    }
  }

  const pgCount = await prisma.supplier.count();
  console.log(`\n✔ PostgreSQL Suppliers Count: ${pgCount}`);

  // 2. Local SQLite Sync
  const sqlitePath = path.resolve('data/need_electro.db');
  if (fs.existsSync(sqlitePath)) {
    console.log('\nSyncing with local SQLite (data/need_electro.db)...');
    try {
      const sqlite = new DatabaseSync(sqlitePath);
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          code TEXT,
          representative TEXT,
          contact_by TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          category TEXT,
          opening_balance REAL DEFAULT 0,
          current_payable REAL DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);

      // Ensure columns exist in SQLite if table already existed
      try { sqlite.exec(`ALTER TABLE suppliers ADD COLUMN code TEXT;`); } catch (_) {}
      try { sqlite.exec(`ALTER TABLE suppliers ADD COLUMN representative TEXT;`); } catch (_) {}
      try { sqlite.exec(`ALTER TABLE suppliers ADD COLUMN contact_by TEXT;`); } catch (_) {}

      const insertSqlite = sqlite.prepare(`
        INSERT OR REPLACE INTO suppliers (
          id, name, company, code, representative, contact_by, phone, email, address, category, opening_balance, current_payable, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const s of suppliersData) {
        const repName = s.representative === 'unknown' ? 'Unknown' : s.representative;
        const email = `${s.code.toLowerCase()}@needelectro.com`;

        insertSqlite.run(
          s.id,
          repName,
          s.company,
          s.code,
          repName,
          s.contactBy,
          s.phone,
          email,
          s.address,
          s.category,
          0,
          0,
          new Date().toISOString()
        );
      }

      console.log('✔ SQLite Sync complete.');
    } catch (err) {
      console.warn('SQLite notice:', err.message);
    }
  }

  // 3. Record Audit Log
  const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (user) {
    await prisma.auditLog.create({
      data: {
        id: `audit-supp-import-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        action: 'SUPPLIERS_IMPORTED',
        module: 'SUPPLIERS',
        recordId: 'batch-13-suppliers',
        details: `Imported 13 wholesale partner suppliers (GB, AT, OSBD, TV, MUSCOM, RT, HBC, GIL, LZBD, DLB, TC, CZ, DG).`,
        timestamp: new Date(),
      },
    });
  }

  console.log('\n=== All 13 Suppliers Successfully Imported! ===');
}

main()
  .catch((err) => {
    console.error('Import error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
