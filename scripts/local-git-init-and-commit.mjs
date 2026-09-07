// NEED ELECTRO ERP — Automated Pure JS Git Engine
import git from 'isomorphic-git';
import fs from 'node:fs';
import path from 'node:path';

const dir = process.cwd();

async function run() {
  console.log('--- INITIALIZING LOCAL GIT REPOSITORY ---');

  if (!fs.existsSync(path.join(dir, '.git'))) {
    await git.init({ fs, dir, defaultBranch: 'main' });
    console.log('Git repo initialized with default branch: main');
  }

  // Get status matrix of all files
  const status = await git.statusMatrix({
    fs,
    dir,
    filter: (f) => {
      if (
        f.startsWith('node_modules') ||
        f.startsWith('.next') ||
        f.startsWith('dist') ||
        f.startsWith('.git') ||
        f.startsWith('.vercel') ||
        f.startsWith('scratch') ||
        f.startsWith('backups') ||
        f.startsWith('_backup_before_real_db') ||
        f.startsWith('data/') ||
        f === '.env' ||
        f.startsWith('.env.') ||
        f.endsWith('.db') ||
        f.endsWith('.db-wal') ||
        f.endsWith('.db-shm') ||
        f.endsWith('.tsbuildinfo')
      ) {
        return false;
      }
      return true;
    },
  });

  console.log(`Found ${status.length} candidate files.`);

  let stagedCount = 0;
  for (const [filepath, head, worktree, stage] of status) {
    // Stage file
    await git.add({ fs, dir, filepath });
    stagedCount++;
  }

  console.log(`Successfully staged ${stagedCount} files.`);

  const sha = await git.commit({
    fs,
    dir,
    message: 'feat: production release for NEED ELECTRO ERP (Next.js + Prisma + Supabase)',
    author: {
      name: 'Amdadur Rahman',
      email: 'contact.amdadur@gmail.com',
    },
  });

  console.log(`Successfully committed all files! Commit SHA: ${sha}`);
  console.log('--- LOCAL GIT PREPARATION COMPLETED ---');
}

run().catch((err) => {
  console.error('Git engine error:', err);
  process.exit(1);
});
