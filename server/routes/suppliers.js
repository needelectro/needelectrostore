// NEED ELECTRO ERP — Supplier Management & Vendor Ledgers
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const suppliersRouter = Router();

/**
 * List Suppliers
 */
suppliersRouter.get('/', requireAuth, requirePermission('suppliers.view'), (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY created_at DESC').all();
    const formatted = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      company: s.company,
      phone: s.phone,
      email: s.email,
      address: s.address,
      category: s.category,
      openingBalance: s.opening_balance,
      currentPayable: s.current_payable,
      createdAt: s.created_at
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Create Supplier
 */
suppliersRouter.post('/', requireAuth, requirePermission('suppliers.manage'), (req, res) => {
  try {
    const { name, company, phone, email, address, category, openingBalance } = req.body;

    if (!name || !company) {
      return res.status(400).json({ success: false, error: 'Contact person name and company name are required.' });
    }

    const newId = 'sup-' + Date.now();
    const opBal = Number(openingBalance || 0);
    const nowIso = new Date().toISOString();

    transaction(() => {
      db.prepare(`
        INSERT INTO suppliers (
          id, name, company, phone, email, address, category,
          opening_balance, current_payable, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, name.trim(), company.trim(), phone || '', email || '', address || '', category || 'General Tech', opBal, opBal, nowIso);

      if (opBal > 0) {
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, date('now'), 'SUPPLIER', ?, 'ADJUSTMENT', 'OPENING-BAL', 'Opening Payable Balance', 0, ?, ?)
        `).run('le-sup-' + Date.now(), newId, opBal, opBal);
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'SUPPLIER_CREATED', 'PURCHASE', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, newId,
        `Created supplier profile for '${company}' (${name}).`,
        req.ip || '127.0.0.1'
      );
    });

    const createdSupplier = {
      id: newId,
      name: name.trim(),
      company: company.trim(),
      phone: phone || '',
      email: email || '',
      address: address || '',
      category: category || 'General Tech',
      openingBalance: opBal,
      currentPayable: opBal,
      createdAt: nowIso
    };

    res.json({ success: true, message: `Supplier '${company}' added.`, supplierId: newId, supplier: createdSupplier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Record Supplier Payment
 */
suppliersRouter.post('/:id/payment', requireAuth, requirePermission('suppliers.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, accountId, reference, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'A positive payment amount is required.' });
    }

    const payAmount = Number(amount);
    const today = new Date().toISOString().split('T')[0];

    const result = transaction(() => {
      const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
      if (!supplier) throw new Error('Supplier not found.');

      const paymentCount = db.prepare('SELECT COUNT(*) as count FROM supplier_payments').get().count;
      const voucherNumber = `SPV-2026-${String(paymentCount + 101).padStart(4, '0')}`;

      // Reduce payable
      db.prepare('UPDATE suppliers SET current_payable = current_payable - ? WHERE id = ?').run(payAmount, id);

      // Deduct from financial account
      const targetAcc = accountId || 'acc-1';
      db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(payAmount, targetAcc);

      // Record voucher
      db.prepare(`
        INSERT INTO supplier_payments (
          id, voucher_number, supplier_id, supplier_name, amount,
          payment_date, payment_method, account_id, reference, notes, paid_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'sp-' + Date.now(), voucherNumber, supplier.id, supplier.company,
        payAmount, today, paymentMethod || 'Cash', targetAcc,
        reference || '', notes || '', req.user.name
      );

      // Record supplier ledger credit
      db.prepare(`
        INSERT INTO ledger_entries (
          id, date, party_type, party_id, reference_type, reference_number,
          description, debit, credit, running_balance
        ) VALUES (?, ?, 'SUPPLIER', ?, 'PAYMENT', ?, ?, ?, 0, (SELECT current_payable FROM suppliers WHERE id = ?))
      `).run(
        'le-sp-' + Date.now(), today, supplier.id, voucherNumber,
        `Payment to ${supplier.company} via ${paymentMethod || 'Cash'} (${voucherNumber})`,
        payAmount, supplier.id
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'SUPPLIER_PAYMENT', 'ACCOUNTING', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, voucherNumber,
        `Disbursed vendor payment of ৳${payAmount} to '${supplier.company}'. Voucher: ${voucherNumber}`,
        req.ip || '127.0.0.1'
      );

      return { voucherNumber, payAmount };
    });

    res.json({ success: true, message: `Payment voucher ${result.voucherNumber} recorded.`, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Supplier Ledger
 */
suppliersRouter.get('/:id/ledger', requireAuth, requirePermission('suppliers.view'), (req, res) => {
  try {
    const { id } = req.params;
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) return res.status(404).json({ success: false, error: 'Supplier not found.' });

    const ledger = db.prepare(`
      SELECT * FROM ledger_entries
      WHERE party_type = 'SUPPLIER' AND party_id = ?
      ORDER BY date ASC, id ASC
    `).all(id);

    res.json({
      success: true,
      supplier: {
        id: supplier.id,
        name: supplier.name,
        company: supplier.company,
        currentPayable: supplier.current_payable
      },
      ledger
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
