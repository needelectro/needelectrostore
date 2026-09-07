// NEED ELECTRO ERP — Automated Push to Official needelectro GitHub Account
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'node:fs';
import path from 'node:path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO_NAME = 'needelectroerp';
const OWNER = 'needelectro';
const dir = process.cwd();

async function main() {
  console.log(`--- CONNECTING TO GITHUB ACCOUNT: ${OWNER} ---`);

  // 1. Check or create repository in needelectro account
  const checkRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO_NAME}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'NeedElectro-Deployer',
    },
  });

  if (checkRes.status === 404) {
    console.log(`Creating repository ${OWNER}/${REPO_NAME}...`);
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'NeedElectro-Deployer',
      },
      body: JSON.stringify({
        name: REPO_NAME,
        description: 'NEED ELECTRO ERP — Production Enterprise Management System (Next.js + Prisma + Supabase)',
        private: true,
        auto_init: false,
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      throw new Error(`Failed to create repository: ${JSON.stringify(errData)}`);
    }
    console.log(`Repository ${OWNER}/${REPO_NAME} created successfully!`);
  } else if (checkRes.ok) {
    console.log(`Repository ${OWNER}/${REPO_NAME} already exists.`);
  }

  // 2. Set up remote in local git config and push
  console.log('--- PUSHING TO GITHUB VIA ISOMORPHIC-GIT ---');
  const remoteUrl = `https://github.com/${OWNER}/${REPO_NAME}.git`;

  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch (e) {
    // ignore if doesn't exist
  }

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: remoteUrl,
  });

  console.log(`Remote 'origin' set to: ${remoteUrl}`);
  console.log('Pushing main branch...');

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({
      username: GITHUB_TOKEN,
      password: '',
    }),
  });

  console.log('Push response:', pushResult);
  console.log(`✅ SUCCESS: All project files pushed to https://github.com/${OWNER}/${REPO_NAME}`);
}

main().catch((err) => {
  console.error('Migration push error:', err);
  process.exit(1);
});
