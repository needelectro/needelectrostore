# NEED ELECTRO ERP — Production Deployment & Infrastructure Runbook

This guide covers the deployment, database setup, data preservation, and domain configuration for **NEED ELECTRO ERP**.

---

## 1. Architecture Summary

| Component | Production Technology | Configuration |
|---|---|---|
| **Frontend** | Next.js 14 (React 18 + TypeScript) | Tailwind CSS, Lucide, Recharts, shadcn UI design tokens |
| **Backend** | Next.js Route Handlers / Server Actions | Zod validation, PBKDF2/Bcrypt auth, RBAC middleware |
| **Database** | Supabase PostgreSQL | 47 normalized relational tables, Prisma ORM, Decimal financial precision |
| **Connection Pooling** | PgBouncer / Supabase Pooler | Port 6543 (transaction pooling) for serverless API routes |
| **Direct URL** | Supabase Direct Session | Port 5432 for Prisma migrations and CLI |
| **File Storage** | Supabase Storage | Bucket: `needelectro-storage` |
| **Hosting** | Vercel Edge / Serverless | Region: `sin1` (Singapore, lowest latency for Bangladesh) |
| **Production Domain** | `needelectroerp` | Configurable via `NEXT_PUBLIC_APP_URL` / `APP_URL` |
| **Source Control** | GitHub | Automated CI/CD via GitHub Actions |

---

## 2. Supabase PostgreSQL & Storage Setup

1. Log in to [Supabase](https://supabase.com) and create a project:
   - **Project Name**: `NEED ELECTRO ERP Production`
   - **Region**: `Singapore (ap-southeast-1)`
   - **Database Password**: Choose a strong, high-entropy password.

2. Retrieve Connection Strings (**Project Settings → Database**):
   - **Connection Pooler (Transaction Mode, Port 6543)**:
     ```env
     DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
     ```
   - **Direct Session Connection (Port 5432)**:
     ```env
     DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
     ```

3. Create Storage Bucket (**Storage → New Bucket**):
   - **Bucket Name**: `needelectro-storage`
   - **Public**: Enabled (for product photos, logos, and invoices)

4. Retrieve API Keys (**Project Settings → API**):
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://[project-ref].supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOi...`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOi...`

---

## 3. Data Migration & Preservation from SQLite

To migrate existing business data (branches, customer accounts, products, serial numbers, sales, EMI contracts, and audit logs) to Supabase:

### Method A: Direct SQL Execution (Recommended for First Deploy)
1. Open the Supabase Dashboard and go to the **SQL Editor**.
2. Open [`prisma/seed_from_sqlite.sql`](file:///d:/Startup/Need%20Electro%20ERP/prisma/seed_from_sqlite.sql) in your editor.
3. Paste the SQL script and click **Run**.
4. All 47 tables will be populated with existing business records, preserving all original IDs, serial numbers, and financial balances.

### Method B: Automated CLI Migration Script
Run from your terminal with your Supabase credentials in `.env`:
```bash
node scripts/migrate-sqlite-to-postgres.mjs
```

---

## 4. GitHub Connection

1. Ensure `.env` is never committed (verified in `.gitignore`).
2. Add the remote and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: production Next.js + Prisma + Supabase ERP"
   git branch -M main
   git remote add origin https://github.com/[your-account]/need-electro-erp.git
   git push -u origin main
   ```

---

## 5. Vercel Deployment

1. Import the repository into [Vercel](https://vercel.com).
2. Configure **Environment Variables** in Vercel:

| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1` | Supabase pooled connection string |
| `DIRECT_URL` | `postgresql://...:5432/postgres` | Supabase direct connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase Service Role Key |
| `APP_URL` | `https://needelectro.store` | Production Domain |
| `NEXT_PUBLIC_APP_URL` | `https://needelectro.store` | Client-accessible Production Domain |
| `NEXT_PUBLIC_SITE_URL` | `https://www.needelectro.store` | Public Canonical Store Domain for SEO, Sitemaps & OpenGraph |
| `SUPER_ADMIN_EMAIL` | `contact.amdadur@gmail.com` | Master Super Admin Email |
| `SUPER_ADMIN_PASSWORD` | `[SecureDeploymentSecret]` | Initial Super Admin Password |
| `AUTH_SECRET` | `[Random32HexKey]` | Secret key for JWT sessions |
| `STORAGE_BUCKET` | `needelectro-storage` | Supabase Bucket Name |

3. Click **Deploy**. Vercel will automatically run:
   ```bash
   prisma generate && next build
   ```

---

## 6. Super Admin Verification

- **Name**: Amdadur Rahman
- **Email**: `contact.amdadur@gmail.com`
- **Initial Login**: Sign in at `/` using the `SUPER_ADMIN_PASSWORD` defined in your environment secrets.
- **First Login Action**: Navigate to **Control Center → Security** to change your temporary password to a personal secret.

---

## 7. Database Backup & Disaster Recovery

### Manual PostgreSQL Backup (pg_dump)
```bash
pg_dump "postgresql://postgres:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" > backups/needelectro-prod-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
psql "postgresql://postgres:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" < backups/needelectro-prod-[timestamp].sql
```
