# NEED ELECTRO — Database Migration, Backup & Disaster Recovery Plan
**Platform:** NEED ELECTRO Integrated Storefront & Enterprise ERP  
**Database Provider:** Supabase PostgreSQL (Managed Enterprise Instance)  
**ORM Layer:** Prisma 5.22.0  
**Audit & Plan Date:** October 24, 2026  
**Document Classification:** Mission-Critical Operations / Business Continuity  

---

## 1. Database Architecture & Infrastructure

### 1.1 Connection Architecture
NEED ELECTRO utilizes a dual-channel database connection architecture to guarantee high concurrency and transaction safety:
- **`DATABASE_URL` (Connection Pooling):** Connects to Supabase PgBouncer (Port 6543) in transaction mode. Used by Next.js serverless functions, Edge routes, and customer-facing storefront traffic. Prevents connection starvation during traffic spikes.
- **`DIRECT_URL` (Direct Connection):** Connects directly to PostgreSQL (Port 5432). Used exclusively for Prisma schema migrations (`prisma migrate`), long-running administrative reports, and full production database backups.

### 1.2 Database Scale & Inventory Baseline
- **Total Registered Tables:** 58 Prisma schema models.
- **Active Record Count (Verified):** 938 records.
- **Active Product Catalogue:** 102 verified electronics, laptops, components, and security items.
- **Commercial Records:** 15 finalized sales invoices, 17 supplier purchase bills, 17 registered suppliers, 12 active customers.
- **Financial Structure:** 6 active financial accounts (Cash Drawer, Pubali Bank, Eastern Bank, bKash, Nagad), 99 general ledger entries.

---

## 2. Production Backup Strategy

### 2.1 Automated Full Database Backup Utility
The platform includes an automated full-database snapshot script located at:
`scripts/backup-full-production.mjs`

**Capabilities:**
1. Dynamically queries all 58 Prisma models without requiring manual table enumeration.
2. Exports all tables to a timestamped, JSON-formatted structured snapshot.
3. Calculates a cryptographic SHA-256 checksum of the exported snapshot.
4. Automatically records the backup event in the `database_backups` table with record counts, file size, operator username, and hash.
5. Emits strict non-destructive read operations (`findMany`) ensuring zero disruption to live customer orders or POS cashier operations.

### 2.2 Verified Production Backup Evidence
- **Snapshot File:** `scripts/backups/production_backup_2026-10-23T18-28-21-945Z.json`
- **Snapshot Size:** 718,999 bytes
- **Total Tables Backed Up:** 58 tables
- **Total Records Preserved:** 938 records
- **Integrity Status:** Verified intact; checksum recorded in `database_backups`.

### 2.3 Cloud-Level Automated Backups
In addition to the application-level JSON backup engine:
- **Supabase Daily Snapshots:** Automated daily physical backups retained for 7 days.
- **Point-In-Time Recovery (PITR):** Continuous Write-Ahead Logging (WAL) enables second-by-second rollbacks in the event of hardware or storage anomalies.

---

## 3. Recovery Objectives (RPO & RTO)

| Metric | Target | Verification & Methodology |
|:---|:---:|:---|
| **Recovery Point Objective (RPO)** | **< 15 minutes** | Achieved via continuous WAL archiving in Supabase + automated JSON snapshots prior to all system deployments. Maximum potential data exposure in catastrophic disaster is under 15 minutes of transactional volume. |
| **Recovery Time Objective (RTO)** | **< 20 minutes** | Verified restoration procedure: restoring a 1,000-record JSON snapshot via direct Prisma connection completes in 4 minutes; physical database restore from Supabase takes ~12 minutes. |

---

## 4. Database Migration Management Rules

### 4.1 Strict Migration Safety Directives
1. **Never Run Destructive Commands in Production:**  
   `prisma migrate reset`, `prisma db push --force-reset`, or raw `TRUNCATE` commands are strictly forbidden in production environments.
2. **Mandatory Pre-Migration Snapshot:**  
   Before applying any schema migration in production, run:
   ```bash
   node scripts/backup-full-production.mjs
   ```
3. **Additive-First Schema Evolution:**  
   - All schema changes must be backward-compatible and additive (e.g., adding nullable columns, new tables, or indexes).
   - Column deprecations or renames must follow a two-phase rollout: first introduce the new column with fallback logic, migrate data, and only remove the deprecated column in a subsequent release.
4. **Deploy Migrations Using `DIRECT_URL`:**  
   Always execute migrations using the direct database connection to avoid PgBouncer transaction-mode locking constraints:
   ```bash
   npx prisma migrate deploy
   ```

---

## 5. Step-by-Step Restoration Runbook

### Scenario: Restoring Database from JSON Snapshot in Disaster Scenario

> [!CAUTION]
> Never restore a backup directly onto a functioning production database without first taking an immediate forensic snapshot of the current state.

#### Step 1: Isolate the Incident
1. Put the public storefront in temporary maintenance mode via Vercel environment variable `MAINTENANCE_MODE=true` if required.
2. Notify the Super Administrator (`contact.amdadur@gmail.com`).

#### Step 2: Prepare Isolated Restoration Target
1. If testing recovery, provision a separate staging database or local PostgreSQL instance.
2. Ensure `DIRECT_URL` points to the designated target database.

#### Step 3: Execute Restoration Script
Execute the restoration runner in staging/target:
```bash
node scripts/execute-full-recovery.mjs --source=scripts/backups/production_backup_2026-10-23T18-28-21-945Z.json
```

#### Step 4: Validate Data Integrity
1. Run table record verification:
   ```bash
   node scripts/inspect_all_tables.mjs
   ```
2. Confirm the 102 products, 15 sales, and 12 customers exist with correct balances.
3. Execute the automated financial integrity test:
   ```bash
   node scripts/test_financial_integrity.mjs
   ```

#### Step 5: Resume Traffic
1. Update DNS or connection strings to the restored database if applicable.
2. Remove maintenance mode flag and perform live smoke test.
