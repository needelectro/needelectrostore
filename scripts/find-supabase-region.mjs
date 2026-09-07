// NEED ELECTRO ERP — Detect Supabase Project Pooler Region
import net from 'node:net';

const ref = 'apvjfoyxfjievjdhgtjo';
const password = '%40Needelectro2025';

const regions = [
  'ap-southeast-1',
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1',
];

async function checkRegion(reg) {
  const host = 'aws-0-' + reg + '.pooler.supabase.com';
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ reg, host, ok: true });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ reg, host, ok: false, err: 'timeout' });
    });

    socket.on('error', (err) => {
      resolve({ reg, host, ok: false, err: err.message });
    });

    socket.connect(6543, host);
  });
}

async function main() {
  console.log('--- SCANNING SUPABASE POOLER REGIONS ---');
  for (const reg of regions) {
    const res = await checkRegion(reg);
    if (res.ok) {
      console.log('✅ Pooler reachable in region:', reg, '(' + res.host + ')');
    }
  }
  console.log('--- SCAN COMPLETED ---');
}

main();
