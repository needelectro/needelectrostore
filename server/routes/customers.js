// NEED ELECTRO ERP — Customer CRM, Dynamic Ledger & Duplicate Account Merge
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const customersRouter = Router();

/**
 * List Customers with Dynamic Balances
 */
customersRouter.get('/', requireAuth, requirePermission('customers.view'), (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR customer_id LIKE ? OR nid LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const customers = db.prepare(sql).all(...params);

    const formatted = customers.map(c => ({
      id: c.id,
      customerId: c.customer_id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      nid: c.nid,
      guarantor: c.guarantor ? JSON.parse(c.guarantor) : undefined,
      customerPhoto: c.customer_photo,
      creditLimit: c.credit_limit,
      currentBalance: c.current_balance,
      notes: c.notes,
      createdAt: c.created_at
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Create Customer
 */
customersRouter.post('/', requireAuth, requirePermission('customers.create'), (req, res) => {
  try {
    const { name, phone, email, address, nid, guarantor, creditLimit, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Customer name and telephone number are required.' });
    }

    const cleanPhone = phone.trim();
    const existingPhone = db.prepare('SELECT id, customer_id, name FROM customers WHERE phone = ?').get(cleanPhone);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: `A customer with telephone '${cleanPhone}' is already registered (${existingPhone.name}, ${existingPhone.customer_id}).`
      });
    }

    // Ensure document_sequences table and CUSTOMER sequence row exist
    let customerSeq = null;
    try {
      customerSeq = db.prepare("SELECT next_number FROM document_sequences WHERE document_type = 'CUSTOMER'").get();
    } catch {
      db.exec(`
        CREATE TABLE IF NOT EXISTS document_sequences (
          document_type TEXT PRIMARY KEY,
          prefix TEXT,
          next_number INTEGER DEFAULT 1001,
          updated_at TEXT
        )
      `);
      customerSeq = db.prepare("SELECT next_number FROM document_sequences WHERE document_type = 'CUSTOMER'").get();
    }

    if (!customerSeq) {
      db.prepare(`
        INSERT OR IGNORE INTO document_sequences (document_type, prefix, next_number, updated_at)
        VALUES ('CUSTOMER', 'CUST-', 1001, datetime('now'))
      `).run();
      customerSeq = db.prepare("SELECT next_number FROM document_sequences WHERE document_type = 'CUSTOMER'").get();
    }

    let nextNum = customerSeq ? customerSeq.next_number : 1001;

    // Safety check against any existing customer with equal or higher number
    const maxCust = db.prepare("SELECT customer_id FROM customers WHERE customer_id LIKE 'CUST-%' ORDER BY customer_id DESC LIMIT 1").get();
    if (maxCust && maxCust.customer_id) {
      const match = maxCust.customer_id.match(/CUST-(\d+)/);
      if (match) {
        const highest = parseInt(match[1], 10);
        if (highest >= nextNum) {
          nextNum = highest + 1;
        }
      }
    }

    const customerId = `CUST-${String(nextNum).padStart(5, '0')}`;
    const newId = 'cust-' + Date.now();
    const nowIso = new Date().toISOString();

    transaction(() => {
      db.prepare(`
        INSERT INTO document_sequences (document_type, prefix, next_number, updated_at)
        VALUES ('CUSTOMER', 'CUST-', ?, datetime('now'))
        ON CONFLICT(document_type) DO UPDATE SET next_number = ?, updated_at = datetime('now')
      `).run(nextNum + 1, nextNum + 1);

      db.prepare(`
        INSERT INTO customers (
          id, customer_id, name, phone, email, address, nid, guarantor, credit_limit, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId, customerId, name.trim(), cleanPhone, email || null,
        address || '', nid || '', guarantor ? JSON.stringify(guarantor) : null,
        Number(creditLimit || 0), notes || '', nowIso
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'CUSTOMER_CREATED', 'CUSTOMER', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, newId,
        `Created customer record '${name}' (${customerId}, Phone: ${cleanPhone}).`,
        req.ip || '127.0.0.1'
      );
    });

    const createdRecord = {
      id: newId,
      customerId,
      name: name.trim(),
      phone: cleanPhone,
      email: email || '',
      address: address || '',
      nid: nid || '',
      guarantor: guarantor || undefined,
      creditLimit: Number(creditLimit || 0),
      currentBalance: 0,
      notes: notes || '',
      createdAt: nowIso
    };

    res.json({
      success: true,
      message: `Customer '${name}' registered with ID ${customerId}.`,
      customer: createdRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update Customer
 */
customersRouter.put('/:id', requireAuth, requirePermission('customers.edit'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, nid, guarantor, creditLimit, notes } = req.body;

    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    transaction(() => {
      db.prepare(`
        UPDATE customers
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            address = COALESCE(?, address),
            nid = COALESCE(?, nid),
            guarantor = COALESCE(?, guarantor),
            credit_limit = COALESCE(?, credit_limit),
            notes = COALESCE(?, notes)
        WHERE id = ?
      `).run(
        name, phone, email, address, nid,
        guarantor ? JSON.stringify(guarantor) : existing.guarantor,
        creditLimit, notes, id
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'CUSTOMER_UPDATED', 'CUSTOMER', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Updated customer profile for ${existing.name} (${existing.customer_id}).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Live Statement of Account / Ledger
 */
customersRouter.get('/:id/ledger', requireAuth, requirePermission('customers.view'), (req, res) => {
  try {
    const { id } = req.params;
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const entries = db.prepare(`
      SELECT * FROM ledger_entries
      WHERE party_type = 'CUSTOMER' AND party_id = ?
      ORDER BY date ASC, id ASC
    `).all(id);

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        customerId: customer.customer_id,
        currentBalance: customer.current_balance
      },
      ledger: entries
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Super Admin Customer Account Merge
 */
customersRouter.post('/merge', requireAuth, requirePermission('customers.merge'), (req, res) => {
  try {
    const { sourceCustomerId, targetCustomerId, reason } = req.body;

    if (!sourceCustomerId || !targetCustomerId || !reason) {
      return res.status(400).json({ success: false, error: 'Source customer, target customer, and reason are required.' });
    }
    if (sourceCustomerId === targetCustomerId) {
      return res.status(400).json({ success: false, error: 'Cannot merge an account into itself.' });
    }

    const source = db.prepare('SELECT * FROM customers WHERE id = ?').get(sourceCustomerId);
    const target = db.prepare('SELECT * FROM customers WHERE id = ?').get(targetCustomerId);

    if (!source || !target) {
      return res.status(404).json({ success: false, error: 'Source or target customer record not found.' });
    }

    const result = transaction(() => {
      // 1. Move Sales
      const movedSales = db.prepare(`
        UPDATE sales
        SET customer_id = ?, customer_name = ?, customer_phone = ?
        WHERE customer_id = ?
      `).run(target.id, target.name, target.phone, source.id);

      // 2. Move EMI Accounts
      const movedEmi = db.prepare(`
        UPDATE emi_accounts
        SET customer_id = ?, customer_name = ?, customer_phone = ?
        WHERE customer_id = ?
      `).run(target.id, target.name, target.phone, source.id);

      // 3. Move Services
      const movedServices = db.prepare(`
        UPDATE service_jobs
        SET customer_id = ?, customer_name = ?, customer_phone = ?
        WHERE customer_id = ?
      `).run(target.id, target.name, target.phone, source.id);

      // 4. Move Ledger Entries
      db.prepare(`
        UPDATE ledger_entries
        SET party_id = ?
        WHERE party_type = 'CUSTOMER' AND party_id = ?
      `).run(target.id, source.id);

      // 5. Transfer Outstanding Due Balance
      db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE id = ?').run(source.current_balance, target.id);

      // 6. Archive Source Customer
      db.prepare("UPDATE customers SET notes = COALESCE(notes, '') || ' [MERGED INTO ' || ? || ']', current_balance = 0 WHERE id = ?").run(target.customer_id, source.id);

      // 7. Audit records
      const auditId = 'cma-' + Date.now();
      db.prepare(`
        INSERT INTO customer_merge_audits (
          id, source_customer_id, source_customer_name, target_customer_id,
          target_customer_name, moved_invoices_count, moved_emi_accounts_count,
          moved_service_jobs_count, performed_by, timestamp, reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
      `).run(
        auditId, source.id, source.name, target.id, target.name,
        movedSales.changes, movedEmi.changes, movedServices.changes,
        req.user.name, reason.trim()
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'CUSTOMER_MERGED', 'CUSTOMER', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, target.id,
        `Merged account '${source.name}' (${source.customer_id}) into '${target.name}' (${target.customer_id}). Reason: ${reason}`,
        req.ip || '127.0.0.1'
      );

      return {
        movedInvoicesCount: movedSales.changes,
        movedEmiAccountsCount: movedEmi.changes,
        movedServiceJobsCount: movedServices.changes
      };
    });

    res.json({
      success: true,
      message: `Merged ${source.name} into ${target.name} successfully.`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
