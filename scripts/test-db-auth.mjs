// NEED ELECTRO ERP — Test Supabase Database Authentication
import { PrismaClient } from '@prisma/client';

const ref = 'apvjfoyxfjievjdhgtjo';
const password = encodeURIComponent('@Needelectro2025');

const candidateRegions = [
  'ap-southeast-1', // Singapore (default for South/SE Asia)
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'eu-central-1',   // Frankfurt
  'ap-northeast-1', // Tokyo
  'us-west-1',
  'eu-west-1',
];

async function tryConnect(region) {
  const url = `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  console.log(`Trying region ${region}...`);
  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });

  try {
    const result = await client.$queryRaw`SELECT 1 as connected`;
    console.log(`🎉 SUCCESS! Connected to Supabase in region: ${region}`);
    return { region, url, success: true };
  } catch (err) {
    console.log(`Region ${region} failed:`, err.message?.split('\n')[0] || err.message);
    return { region, url, success: false, err: err.message };
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  console.log('--- TESTING SUPABASE AUTHENTICATION ACROSS REGIONS ---');
  for (const reg of candidateRegions) {
    const res = await tryConnect(reg);
    if (res.success) {
      console.log('--- FOUND ACTIVE SUPABASE REGION ---');
      console.log('ACTIVE REGION:', res.region);
      console.log('ACTIVE DATABASE_URL:', res.url);
      process.exit(0);
    }
  }
  console.log('--- TEST FINISHED (No matching region found with provided password) ---');
}

main();
