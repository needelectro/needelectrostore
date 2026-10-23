# NEED ELECTRO — Live Production Smoke Test Checklist
**Platform:** NEED ELECTRO Integrated Storefront & Enterprise ERP  
**Target URL:** [https://www.needelectro.store](https://www.needelectro.store) | [https://www.needelectro.store/admin](https://www.needelectro.store/admin)  
**Execution Window:** Post-Deployment Smoke Testing  
**Execution Date:** October 24, 2026  
**Auditor / Tester:** Senior QA & DevSecOps Lead  

---

## 1. Storefront & Customer Operations Smoke Tests

| # | Test Scenario | Step-by-Step Procedure | Expected Result | Status |
|:---:|:---|:---|:---|:---:|
| **ST-01** | **Homepage & Branding Integrity** | 1. Load `https://www.needelectro.store`<br>2. Inspect header logo, brand colors, phone hotlines<br>3. Check footer developer credits and links | Homepage renders crisply in < 1.5s. Logo, tagline, and hotline (+880 1733-983752) display accurately. | **PASS** |
| **ST-02** | **Catalogue & Product Filtering** | 1. Navigate to `/laptops`<br>2. Filter by brand (Dell, HP, Lenovo)<br>3. Search for "EliteBook" | Catalogue filters update instantly without full page reload. Prices display in ৳ (BDT) format. | **PASS** |
| **ST-03** | **Product Detail Page (PDP)** | 1. Click on a product card<br>2. Check specifications, warranty info, stock status<br>3. Click WhatsApp inquiry button | PDP loads with verified specs. WhatsApp button opens chat with prefilled product SKU. | **PASS** |
| **ST-04** | **Cart & Checkout Workflow** | 1. Add product to cart<br>2. Navigate to `/checkout`<br>3. Enter delivery address in Moulvibazar<br>4. Select Cash on Delivery (COD)<br>5. Submit order | Order is created with unique order number. Delivery charge calculated. Customer redirected to `/order-confirmation/[orderNumber]`. | **PASS** |
| **ST-05** | **Order Tracking Workflow** | 1. Navigate to `/track-order`<br>2. Enter generated order number and customer phone | Order status displays correctly with current lifecycle stage (`PENDING` or `CONFIRMED`). | **PASS** |
| **ST-06** | **Service Booking Form** | 1. Navigate to `/services/electrician`<br>2. Select service category and enter problem description<br>3. Submit booking | Unique Job Card Reference is generated. Confirmation message displays with emergency WhatsApp link. | **PASS** |
| **ST-07** | **Laptop EMI Calculator** | 1. Navigate to `/laptop-emi`<br>2. Move price slider to ৳65,000<br>3. Select 6 months tenure | Real-time calculation displays monthly installment (approx ৳7,500) and down-payment rules. | **PASS** |

---

## 2. ERP & Operational Backend Smoke Tests

| # | Test Scenario | Step-by-Step Procedure | Expected Result | Status |
|:---:|:---|:---|:---|:---:|
| **ET-01** | **ERP Authentication & Session** | 1. Navigate to `https://www.needelectro.store/admin/login`<br>2. Enter Super Admin credentials<br>3. Submit login form | PBKDF2 authentication succeeds. User redirected to `/admin` dashboard. Session token stored safely. | **PASS** |
| **ET-02** | **Dashboard & Live Metrics** | 1. View primary ERP dashboard<br>2. Check Sales, Inventory count, and Accounts summary | Dashboard loads without spinner locks. Active stock displays 102 items. Liquid cash displays ৳38,015. | **PASS** |
| **ET-03** | **POS Sales & Thermal Invoice** | 1. Navigate to `/admin/pos`<br>2. Search product SKU<br>3. Select customer and click Complete Sale<br>4. Click Print Receipt | Sale completes inside atomic transaction. Stock decrements. Thermal receipt preview renders formatted invoice. | **PASS** |
| **ET-04** | **Quotation PDF Generation** | 1. Navigate to Quotations module<br>2. Open existing quotation or create new draft<br>3. Click Generate PDF | jsPDF multi-page engine generates vector PDF with company header, itemized table, and official Terms. | **PASS** |
| **ET-05** | **Service Dispatch Management** | 1. Navigate to `/admin/service`<br>2. Locate recent customer booking ticket<br>3. Assign ticket to technician | Job status transitions to `ASSIGNED`. Technician assignment recorded in history. | **PASS** |
| **ET-06** | **EMI Contract Generation** | 1. Navigate to `/admin/emi`<br>2. Select customer and eligible product<br>3. Generate EMI schedule | Full repayment schedule computed. Company Legal Terms & Conditions embedded in contract snapshot. | **PASS** |
| **ET-07** | **Accounting & General Ledger** | 1. Navigate to `/admin/accounting`<br>2. Review Cash Drawer account balance<br>3. Inspect recent ledger entries | Running balances match exact debit/credit postings. Cash Drawer balance confirms ৳38,015 baseline. | **PASS** |

---

## 3. Security, Transport & Performance Smoke Tests

| # | Test Scenario | Step-by-Step Procedure | Expected Result | Status |
|:---:|:---|:---|:---|:---:|
| **SEC-01** | **HTTP Security Headers** | 1. Run `curl -I https://www.needelectro.store`<br>2. Inspect response headers | `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, and `X-Content-Type-Options` present. | **PASS** |
| **SEC-02** | **ERP Route Search Engine Shield** | 1. Run `curl -I https://www.needelectro.store/admin`<br>2. Check `X-Robots-Tag` | `X-Robots-Tag: noindex, nofollow, noarchive` is returned on all administrative paths. | **PASS** |
| **SEC-03** | **Responsive Mobile Layout** | 1. Open mobile browser or Chrome DevTools (375px width)<br>2. Test navigation drawer, product grid, and checkout form | Layout adjusts smoothly without horizontal overflow. Touch targets exceed 44px minimum. | **PASS** |
| **SEC-04** | **Database Connection Health** | 1. Execute multiple concurrent requests to `/api/bootstrap` | PgBouncer manages connection pool smoothly without connection timeout or exhaustion. | **PASS** |

---

## 4. Smoke Test Sign-Off
- **All 18 Smoke Test Scenarios:** **PASSED**
- **Critical Defects Observed:** **0**
- **Test Verdict:** **APPROVED FOR IMMEDIATE LIVE TRAFFIC**
