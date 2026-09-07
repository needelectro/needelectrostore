// NEED ELECTRO ERP — Execute SQLite Preserved SQL against Supabase PostgreSQL
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const sqlPath = path.resolve(process.cwd(), 'prisma/seed_from_sqlite.sql');

async function main() {
  console.log('--- IMPORTING PRESERVED SQL DATA TO SUPABASE POSTGRESQL ---');
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL seed file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split SQL commands by semicolon (ignoring comments and transaction blocks)
  const statements = sql
    .split(';\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && s !== 'BEGIN' && s !== 'COMMIT');

  console.log(`Executing ${statements.length} preserved SQL insert blocks...`);

  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      successCount++;
    } catch (err) {
      console.warn(`Statement ${i + 1} notice:`, err.message?.split('\n')[0]);
    }
  }

  console.log(`✅ Successfully executed ${successCount}/${statements.length} SQL insert blocks.`);

  // Verify counts in Supabase
  console.log('\n--- VERIFYING LIVE SUPABASE POSTGRESQL COUNTS ---');
  const userCount = await prisma.user.count();
  const branchCount = await prisma.branch.count();
  const roleCount = await prisma.role.count();
  const permissionCount = await prisma.permission.count();
  const catCount = await prisma.categoryConfig.count();
  const brandCount = await prisma.brandConfig.count();
  const paymentCount = await prisma.configurablePaymentMethod.count();
  const financialCount = await prisma.financialAccount.count();
  const emiPlanCount = await prisma.eMIPlan.count();

  console.table({
    users: userCount,
    branches: branchCount,
    roles: roleCount,
    permissions: permissionCount,
    categories: catCount,
    brands: brandCount,
    payment_methods: paymentCount,
    financial_accounts: financialCount,
    emi_plans: emiPlanCount,
  });

  console.log('--- SUPABASE DATA MIGRATION VERIFICATION COMPLETE ---');
}

main()
  .catch((e) => {
    console.error('Migration execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
