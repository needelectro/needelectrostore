// NEED ELECTRO ERP — Database Configuration & Health Status API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function maskUrl(url: string | undefined): string {
  if (!url) return 'Not Configured';
  try {
    const parsed = new URL(url);
    const maskedPass = parsed.password ? '••••••••' : '';
    return `${parsed.protocol}//${parsed.username}:${maskedPass}@${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return 'Configured (Custom Format)';
  }
}

function parseDbDetails(url: string | undefined) {
  if (!url) {
    return {
      host: 'Unknown',
      port: 'Unknown',
      database: 'Unknown',
      username: 'Unknown',
      isPooler: false,
      ssl: 'Unknown',
      provider: 'PostgreSQL'
    };
  }
  try {
    const parsed = new URL(url);
    const isPooler = parsed.port === '6543' || url.includes('pooler') || url.includes('pgbouncer=true');
    const ssl = parsed.searchParams.get('sslmode') || (url.includes('sslmode=') ? 'Enabled' : 'Default (SSL)');
    return {
      host: parsed.hostname || 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: parsed.port || '5432',
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'postgres',
      username: parsed.username || 'postgres',
      isPooler,
      ssl,
      provider: url.includes('supabase') ? 'Supabase Managed PostgreSQL (AWS)' : 'PostgreSQL Relational DB'
    };
  } catch {
    return {
      host: 'Custom Host',
      port: '5432',
      database: 'postgres',
      username: 'postgres',
      isPooler: url.includes('6543') || url.includes('pooler'),
      ssl: 'Enabled',
      provider: 'PostgreSQL'
    };
  }
}

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  // Strict clearance: Super Admin or Admin only
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin clearance required.' }, { status: 403 });
  }

  const rawDbUrl = process.env.DATABASE_URL;
  const rawDirectUrl = process.env.DIRECT_URL;

  // Measure query latency
  const startTime = Date.now();
  let isConnected = false;
  let latencyMs = 0;
  let connectionError: string | null = null;
  let serverVersion = 'PostgreSQL 15+ (Cloud)';

  try {
    const rawResult = await prisma.$queryRaw<Array<{ version?: string; now?: Date }>>`SELECT version(), NOW() as now`;
    latencyMs = Date.now() - startTime;
    isConnected = true;
    if (rawResult && rawResult[0]?.version) {
      serverVersion = rawResult[0].version.split(' on ')[0] || serverVersion;
    }
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to ping database';
    latencyMs = Date.now() - startTime;
  }

  // Count core system tables
  let tablesSummary: Record<string, { count: number; category: string }> = {};

  if (isConnected) {
    try {
      const [
        usersCount, rolesCount, permissionsCount,
        productsCount, serialsCount, categoriesCount, brandsCount,
        customersCount, suppliersCount,
        salesCount, purchasesCount, returnsCount,
        accountsCount, paymentMethodsCount, ledgerEntriesCount, expensesCount, investmentsCount,
        emiAccountsCount, emiPlansCount,
        servicesCount, techniciansCount, warrantyClaimsCount,
        employeesCount, auditLogsCount, branchesCount, settingsCount
      ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.role.count().catch(() => 0),
        prisma.permission.count().catch(() => 0),
        prisma.product.count().catch(() => 0),
        prisma.productSerial.count().catch(() => 0),
        prisma.categoryConfig.count().catch(() => 0),
        prisma.brandConfig.count().catch(() => 0),
        prisma.customer.count().catch(() => 0),
        prisma.supplier.count().catch(() => 0),
        prisma.sale.count().catch(() => 0),
        prisma.purchase.count().catch(() => 0),
        prisma.productReturn.count().catch(() => 0),
        prisma.financialAccount.count().catch(() => 0),
        prisma.configurablePaymentMethod.count().catch(() => 0),
        prisma.ledgerEntry.count().catch(() => 0),
        prisma.expense.count().catch(() => 0),
        prisma.investment.count().catch(() => 0),
        prisma.eMIAccount.count().catch(() => 0),
        prisma.eMIPlan.count().catch(() => 0),
        prisma.serviceJob.count().catch(() => 0),
        prisma.technician.count().catch(() => 0),
        prisma.warrantyClaim.count().catch(() => 0),
        prisma.employee.count().catch(() => 0),
        prisma.auditLog.count().catch(() => 0),
        prisma.branch.count().catch(() => 0),
        prisma.systemSettings.count().catch(() => 0),
      ]);

      tablesSummary = {
        users: { count: usersCount, category: 'Auth & Security' },
        roles: { count: rolesCount, category: 'Auth & Security' },
        permissions: { count: permissionsCount, category: 'Auth & Security' },
        products: { count: productsCount, category: 'Catalog & Inventory' },
        product_serials: { count: serialsCount, category: 'Catalog & Inventory' },
        category_configs: { count: categoriesCount, category: 'Catalog & Inventory' },
        brand_configs: { count: brandsCount, category: 'Catalog & Inventory' },
        customers: { count: customersCount, category: 'CRM & Stakeholders' },
        suppliers: { count: suppliersCount, category: 'CRM & Stakeholders' },
        sales: { count: salesCount, category: 'Billing & POS' },
        purchases: { count: purchasesCount, category: 'Inventory Inflow' },
        product_returns: { count: returnsCount, category: 'Billing & POS' },
        financial_accounts: { count: accountsCount, category: 'Accounting & Vault' },
        payment_methods: { count: paymentMethodsCount, category: 'Accounting & Vault' },
        ledger_entries: { count: ledgerEntriesCount, category: 'Accounting & Vault' },
        expenses: { count: expensesCount, category: 'Accounting & Vault' },
        investments: { count: investmentsCount, category: 'Accounting & Vault' },
        emi_accounts: { count: emiAccountsCount, category: 'Financing & EMI' },
        emi_plans: { count: emiPlansCount, category: 'Financing & EMI' },
        service_jobs: { count: servicesCount, category: 'Repairs & Services' },
        technicians: { count: techniciansCount, category: 'Repairs & Services' },
        warranty_claims: { count: warrantyClaimsCount, category: 'Repairs & Services' },
        employees: { count: employeesCount, category: 'Human Resources' },
        audit_logs: { count: auditLogsCount, category: 'Auditing & System' },
        branches: { count: branchesCount, category: 'Enterprise Setup' },
        system_settings: { count: settingsCount, category: 'Enterprise Setup' },
      };
    } catch (e: any) {
      console.warn('Error counting database tables:', e.message);
    }
  }

  const dbDetails = parseDbDetails(rawDbUrl);
  const directDetails = parseDbDetails(rawDirectUrl);

  const totalRegisteredRecords = Object.values(tablesSummary).reduce((acc, curr) => acc + curr.count, 0);

  return NextResponse.json({
    success: true,
    data: {
      status: isConnected ? 'ONLINE' : 'OFFLINE',
      isConnected,
      latencyMs,
      serverVersion,
      connectionError,
      poolerConnection: {
        ...dbDetails,
        maskedUrl: maskUrl(rawDbUrl),
      },
      directConnection: {
        ...directDetails,
        maskedUrl: maskUrl(rawDirectUrl),
      },
      environment: {
        hasDatabaseUrl: Boolean(rawDbUrl),
        hasDirectUrl: Boolean(rawDirectUrl),
        hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        nodeEnv: process.env.NODE_ENV || 'production',
        databaseEngine: 'PostgreSQL Relational DB (Prisma ORM)',
      },
      schemaHealth: {
        tablesTracked: Object.keys(tablesSummary).length,
        totalEntitiesTracked: 56,
        totalRecords: totalRegisteredRecords,
        tablesSummary,
        missingPermissions: (tablesSummary.permissions?.count || 0) === 0,
        missingRoles: (tablesSummary.roles?.count || 0) === 0,
        missingAccounts: (tablesSummary.financial_accounts?.count || 0) === 0,
      }
    }
  });
}
