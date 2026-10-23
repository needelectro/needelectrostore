# NEED ELECTRO — Production Deployment & Rollback Runbook
**Platform:** NEED ELECTRO Integrated Storefront & Enterprise ERP  
**Release Pipeline:** GitHub CI/CD (`origin main`) -> Vercel Production Edge & Serverless  
**Effective Date:** October 24, 2026  
**Document Version:** 2.4.0-PROD  

---

## 1. Deployment Architecture & Infrastructure Overview

```
+-----------------------------------------------------------------------------------+
|                            PRODUCTION RELEASE PIPELINE                            |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Developer / Agent]                                                              |
|          |                                                                        |
|          v  (1. Mandatory Pre-Flight: npx tsc --noEmit & Database Backup)          |
|  [Git Commit & Push to 'origin main']                                             |
|          |                                                                        |
|          +-----------------------------------+                                    |
|          |                                   |                                    |
|          v                                   v                                    |
|  [GitHub Actions CI]                 [Vercel Production Hook]                     |
|  (.github/workflows/deploy.yml)      - Instant Build & Hydration                  |
|  - Validates Node 20/24 env          - Deploys Next.js 14 App Router              |
|  - Runs static analysis              - Propagates CDN Edge across Bangladesh       |
|          |                                   |                                    |
|          +-----------------+-----------------+                                    |
|                            |                                                      |
|                            v                                                      |
|        [LIVE PRODUCTION: https://www.needelectro.store]                           |
|        [LIVE ERP PANEL:  https://www.needelectro.store/admin]                     |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Mandatory Pre-Deployment Checklist

Before initiating any deployment to production, the engineer or automated agent MUST complete the following gates:

- [ ] **Gate 1: TypeScript Build Verification**
  Run type checking to ensure zero type errors:
  ```bash
  npx tsc --noEmit
  ```
  *Requirement: Must exit with code 0.*

- [ ] **Gate 2: Database Snapshot Verification**
  Capture a clean point-in-time snapshot of the production database:
  ```bash
  node scripts/backup-full-production.mjs
  ```
  *Requirement: Confirms 58 tables exported to `scripts/backups/`.*

- [ ] **Gate 3: Automated Financial & Production Test Suite**
  Execute the regression verification scripts:
  ```bash
  npx tsx scripts/test-e2e-production.mjs
  node scripts/test_financial_integrity.mjs
  ```
  *Requirement: 100% test pass rate.*

- [ ] **Gate 4: Clean Git Working Tree**
  Ensure all files are staged and no untracked scratch files remain:
  ```bash
  git status
  ```

---

## 3. Step-by-Step Production Release Execution

### Step 1: Stage All Validated Changes
```bash
git add .
```

### Step 2: Commit with Conventional Semantic Message
Use clear conventional commit formatting indicating scope and rationale:
```bash
git commit -m "feat(release): v2.4.0 production readiness audit, security hardening and launch qualification"
```

### Step 3: Push to Production Branch (`origin main`)
Push directly to the `main` branch to trigger automated webhooks:
```bash
git push origin main
```

### Step 4: Monitor CI/CD Pipeline & Vercel Build
1. Inspect GitHub Actions status at:  
   `https://github.com/needelectro/needelectrostore/actions`
2. Verify that the build completes successfully:
   - Next.js static page generation completes.
   - API routes and Edge functions bundle cleanly.
   - Deployment reaches `READY` status.

---

## 4. Post-Deployment Verification (Smoke Test)

Within 5 minutes of release deployment, perform the following verification:

1. **Storefront Health Check:**
   - Navigate to `https://www.needelectro.store`.
   - Verify homepage renders, banners display, and product prices format in ৳ (BDT).
2. **ERP Admin Access:**
   - Navigate to `https://www.needelectro.store/admin`.
   - Log in using Super Admin credentials.
   - Confirm active cash balance (৳38,015) and 102 catalogue products display accurately.
3. **Quotation & POS Check:**
   - Open POS module (`/admin/pos`) and verify search operates quickly.
   - Generate sample quotation preview and confirm PDF renders without error.
4. **Security Header Validation:**
   - Inspect network headers using browser DevTools or `curl -I https://www.needelectro.store`.
   - Verify `Strict-Transport-Security`, `Content-Security-Policy`, and `X-Frame-Options` headers are present.

---

## 5. Rollback Procedures

If any critical defect (P0/P1), transaction disruption, or unhandled exception occurs post-launch, initiate rollback immediately.

### Method A: Instant Vercel Rollback (Zero Build Time — Under 30 Seconds)
*Preferred and fastest recovery method.*

1. Open the Vercel Project Dashboard for NEED ELECTRO.
2. Navigate to the **Deployments** tab.
3. Locate the previous stable production deployment (prior to the current commit).
4. Click the three dots menu `(...)` and select **Promote to Production** or **Instant Rollback**.
5. Vercel instantly switches traffic to the prior immutable build artifact in under 15 seconds.

### Method B: Git Revert Rollback
*Used to align repository commit history after an emergency rollback.*

1. Revert the problematic commit:
   ```bash
   git revert HEAD --no-edit
   ```
2. Verify type checking on the reverted state:
   ```bash
   npx tsc --noEmit
   ```
3. Push the reversion commit to `origin main`:
   ```bash
   git push origin main
   ```
4. Verify automated deployment of the clean reverted state.

### Method C: Database Schema Rollback
If a database migration introduced an unexpected schema constraint:
1. Refer to `DATABASE_MIGRATION_AND_BACKUP_PLAN.md`.
2. Connect using `DIRECT_URL`.
3. Roll back or forward-fix the specific migration via Prisma migration script.
4. If necessary, restore data from the pre-deployment snapshot captured in Step 2 of the Pre-Deployment Checklist.

---

## 6. Release Governance & Escalation Contacts

- **Lead Architect & Release Manager:** Amdadur Rahman (`contact.amdadur@gmail.com`)
- **Emergency Hotline / Operations WhatsApp:** `+880 1733-983752`
- **Hosting Dashboard:** Vercel Team Account (NEED ELECTRO)
- **Database Console:** Supabase Cloud Dashboard (Project ID: `qdrfsqyptfmsxuxlyfqv`)
