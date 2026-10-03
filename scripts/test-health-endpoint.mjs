// NEED ELECTRO ERP — Test Health & Keep-Alive Logic
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHealthPing() {
  console.log('Testing Supabase keep-alive database ping...');
  const start = Date.now();
  try {
    const rawResult = await prisma.$queryRaw`SELECT 1 as ping`;
    const pingLatency = Date.now() - start;
    console.log(`[PASS] Raw query SELECT 1 succeeded in ${pingLatency}ms:`, rawResult);

    const settingsStart = Date.now();
    const settings = await prisma.systemSettings.findFirst({
      select: { id: true, updatedAt: true },
    });
    const settingsLatency = Date.now() - settingsStart;
    console.log(`[PASS] Read SystemSettings (zero customer data) in ${settingsLatency}ms:`, settings);

    const totalLatency = Date.now() - start;
    const responsePayload = {
      status: 'ok',
      database: 'reachable',
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
    };

    console.log('\n[RESULT] Health endpoint simulation successful:');
    console.log(JSON.stringify(responsePayload, null, 2));
    return true;
  } catch (err) {
    console.error('[FAIL] Supabase keep-alive check failed:', err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testHealthPing().then((ok) => {
  process.exit(ok ? 0 : 1);
});
