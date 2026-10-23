# NEED ELECTRO — Incident Response & Business Continuity Runbook
**Platform:** NEED ELECTRO Integrated Storefront & Enterprise ERP  
**Target Environment:** Production Infrastructure (Vercel, Supabase PostgreSQL)  
**Effective Date:** October 24, 2026  
**Document Classification:** Operations Protocol / Critical Incident Management  

---

## 1. Incident Management Lifecycle

```
+---------------+     +---------------+     +---------------+     +---------------+     +---------------+
| 1. DETECTION  | --> |  2. TRIAGE    | --> |3. CONTAINMENT | --> | 4. RECOVERY   | --> | 5. POST-MORTEM|
| - Alerts/Logs |     | - SEV-1/2/3   |     | - Isolation   |     | - Hotfix/Roll |     | - RCA Report  |
| - WhatsApp    |     | - Assign Lead |     | - Read-Only   |     | - Smoke Test  |     | - Action Items|
+---------------+     +---------------+     +---------------+     +---------------+     +---------------+
```

---

## 2. Severity Classification Matrix

| Severity Level | Definition | Impact Scope | Maximum Response Time | Target Resolution Time |
|:---|:---|:---|:---:|:---:|
| **SEV-1 (Critical)** | Core platform offline, database unreachable, customer unable to checkout, financial balance corruption, unauthorized data breach. | Storewide / All Users | **< 15 minutes** | **< 2 hours** |
| **SEV-2 (Major)** | Specific module impaired (e.g., Quotation PDF generator failing, POS thermal printer format error, technician service booking queue delayed). | Departmental / Partial Customers | **< 30 minutes** | **< 6 hours** |
| **SEV-3 (Minor)** | Cosmetic layout flaw, translation key missing, slow filter response, non-blocking notification delay. | Low / Edge Cases | **< 4 hours** | **< 24 hours** |

---

## 3. Incident Containment & Recovery Procedures

### Phase 1: Rapid Detection & Assessment
1. Identify the source of the anomaly:
   - Check Vercel Function logs: `https://vercel.com/needelectro/logs`
   - Check Supabase Database health: `https://supabase.com/dashboard/project/qdrfsqyptfmsxuxlyfqv`
   - Check internal `audit_logs` table for suspicious activities.
2. Formulate incident severity classification (SEV-1, SEV-2, or SEV-3).

### Phase 2: Containment Measures
Depending on the incident vector, apply immediate containment:
- **For Suspected Database Corruption:**
  Immediately disable write access or place the storefront in maintenance mode (`MAINTENANCE_MODE=true`).
- **For Compromised Staff Session:**
  Execute session revocation script:
  ```bash
  node scripts/unlock-all-users.mjs --revoke-sessions
  ```
- **For Third-Party Network Degradation:**
  Temporarily disable problematic payment/courier webhooks while preserving order drafts.

### Phase 3: Resolution & Hotfix
1. Implement fix on a local reproduction branch.
2. Run mandatory type check:
   ```bash
   npx tsc --noEmit
   ```
3. Run the automated regression suite:
   ```bash
   npx tsx scripts/test-e2e-production.mjs
   ```
4. Deploy fix to `origin main` following the `DEPLOYMENT_AND_ROLLBACK_RUNBOOK.md`.

---

## 4. Specialized Incident Playbooks

### Playbook A: Database Connection Pool Exhaustion (HTTP 500 / 504)
**Symptoms:** Storefront or ERP screens hang with database timeout errors.
1. Inspect active connection metrics on Supabase dashboard.
2. Verify if a long-running reporting query or orphaned client connection locked tables.
3. Switch connection pooler to transaction mode if not active.
4. Restart PgBouncer pooler from the Supabase management console.
5. Confirm response times drop below 200ms.

### Playbook B: Suspected Unauthorized Administrative Login
**Symptoms:** Unrecognized IP address or unexpected action in `audit_logs`.
1. Identify the compromised user account from the `audit_logs` record.
2. Immediately invalidate the user's session token:
   Update the user record in PostgreSQL: `UPDATE users SET "sessionToken" = NULL WHERE email = '<target_user>';`
3. Force password reset by generating a new PBKDF2 hash with 100,000 rounds.
4. Audit all financial transactions and stock movements executed during the session window.
5. Revert unauthorized adjustments using the double-entry accounting reversal module.

### Playbook C: Duplicate Payment or Cart Checkout Race Condition
**Symptoms:** Customer charged twice or order created twice.
1. Inspect the `orders` and `sales` tables for duplicate timestamps matching customer phone or email.
2. Verify `paymentReference` or transaction ID.
3. If duplicate order exists:
   - Mark duplicate order as `CANCELLED_DUPLICATE`.
   - Restore reserved stock to inventory.
   - Initiate payment refund via the authorized financial account.
   - Record ledger reversal in `ledger_entries` with audit log.

### Playbook D: Inventory Discrepancy or Out-of-Stock Alert
**Symptoms:** Product sold online but physical stock unavailable in Moulvibazar showroom.
1. Check `inventory_transactions` to identify the conflicting sale or purchase.
2. Contact customer immediately via official WhatsApp hotline (`+880 1733-983752`).
3. Offer immediate dispatch from backup supplier inventory or issue instant full refund.
4. Update product stock in ERP catalogue to prevent further sales.

---

## 5. Customer & Public Communications Guide

During a SEV-1 incident lasting longer than 15 minutes, customer transparency is maintained:
- **WhatsApp Support Hotline:** Dedicated operator updates customer inquiries via `+880 1733-983752`.
- **Standardized Response Template:**
  > "Thank you for contacting NEED ELECTRO. Our technical team is currently conducting scheduled system maintenance to enhance platform reliability. Your existing orders and payments are completely secure. Normal operations will resume shortly. We appreciate your patience."

---

## 6. Post-Mortem & Root Cause Analysis (RCA) Protocol

Within 24 hours of resolving a SEV-1 or SEV-2 incident, the Lead Architect must publish an RCA document:
1. **Incident Summary:** Date, duration, severity, affected customers.
2. **Root Cause Analysis:** Technical explanation of the failure mode.
3. **Timeline of Events:** Chronological log from detection to full recovery.
4. **Impact Assessment:** Business, customer, and financial impact.
5. **Corrective & Preventive Actions (CAPA):** Code fixes, new automated tests, monitoring threshold adjustments, or architectural refactorings.
