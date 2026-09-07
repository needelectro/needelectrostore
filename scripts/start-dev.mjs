// NEED ELECTRO ERP — Parallel Dev Process Runner (Backend API + Vite Frontend)
import { spawn } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[36m%s\x1b[0m', '⚡ NEED ELECTRO ERP — PRODUCTION ENGINE & DEV SERVER ⚡');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

// 1. Spawn Backend Express Server
const serverScript = path.join(rootDir, 'server', 'index.js');
const serverProcess = spawn(process.execPath, [serverScript], {
  cwd: rootDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.stdout.on('data', data => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data}`);
});

serverProcess.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${data}`);
});

// 2. Spawn Vite Frontend
const vitePath = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const clientProcess = spawn(process.execPath, [vitePath], {
  cwd: rootDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env }
});

clientProcess.stdout.on('data', data => {
  process.stdout.write(`\x1b[32m[VITE]\x1b[0m ${data}`);
});

clientProcess.stderr.on('data', data => {
  process.stderr.write(`\x1b[33m[VITE ERR]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\nShutting down NEED ELECTRO ERP dev servers...');
  serverProcess.kill('SIGTERM');
  clientProcess.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
