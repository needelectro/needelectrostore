// NEED ELECTRO ERP — Run Full Batch Recovery Script
import { recoveryEngine } from '../lib/imageRecovery/recoveryEngine';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- STARTING FULL CATALOG IMAGE RECOVERY ---');
  const scanBefore = await recoveryEngine.scanCatalog();
  console.log(`Products needing recovery before: ${scanBefore.needingImages}`);

  const summary = await recoveryEngine.runBatch({
    limit: 60,
    forceAutoApprove: true,
    userId: 'system-agent',
    userName: 'Antigravity AI Catalog Automation'
  });

  console.log('\n--- BATCH EXECUTION FINISHED ---');
  console.log(`Processed:        ${summary.processed}`);
  console.log(`Recovered:        ${summary.recovered}`);
  console.log(`Queued for Review: ${summary.queuedForReview}`);
  console.log(`Skipped:          ${summary.skipped}`);
  console.log(`Failed:           ${summary.failed}`);

  const scanAfter = await recoveryEngine.scanCatalog();
  console.log('\n--- FINAL CATALOG AUDIT STATE ---');
  console.log(`Total Products:           ${scanAfter.totalScanned}`);
  console.log(`Valid Products with Image: ${scanAfter.validImages}`);
  console.log(`Products Remaining:       ${scanAfter.needingImages}`);

  await prisma.$disconnect();
}

main().catch(console.error);
