// NEED ELECTRO ERP — Supabase Connection Tester
import dns from 'node:dns/promises';

const ref = 'apvjfoyxfjievjdhgtjo';
const directHost = 'db.' + ref + '.supabase.co';

async function test() {
  console.log('Testing direct host: ' + directHost);
  try {
    const res = await dns.lookup(directHost);
    console.log('Direct host IP: ' + res.address);
  } catch (e) {
    console.log('Direct host resolution failed: ' + e.message);
  }
}

test();
