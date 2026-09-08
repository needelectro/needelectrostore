import { GET } from '../app/api/bootstrap/route.ts';
import { NextRequest } from 'next/server';

async function test() {
  const req = new NextRequest('http://localhost:3000/api/bootstrap');
  const res = await GET(req);
  const data = await res.json();
  console.log('Bootstrap success:', data.success);
  if (data.data) {
    console.log('Bootstrap summary:');
    console.log('  Products:', data.data.products?.length);
    console.log('  Customers:', data.data.customers?.length);
    console.log('  Sales:', data.data.sales?.length);
    console.log('  EMI Accounts:', data.data.emiAccounts?.length);
    console.log('  Branches:', data.data.branches?.length);
    console.log('  Settings companyName:', data.data.settings?.companyName);
    console.log('  SetupStatus:', data.data.setupStatus);
  } else {
    console.log('No data, error:', data.error);
  }
}

test().catch(console.error);
