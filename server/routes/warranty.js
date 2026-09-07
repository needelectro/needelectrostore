// NEED ELECTRO ERP — Serialized Product Warranty & RMA Claims Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const warrantyRouter = Router();

warrantyRouter.get('/claims', requireAuth, requirePermission('warranty.view'), (req, res) => {
  try {
    const claims = db.prepare('SELECT * FROM warranty_claims ORDER BY claim_date DESC').all();
    const formatted = claims.map(c => ({
      id: c.id,
      claimNumber: c.claim_number,
      serialNumber: c.serial_number,
      productName: c.product_name,
      customerId: c.customer_id,
      customerName: c.customer_name,
      customerPhone: c.customer_phone,
      invoiceNumber: c.invoice_number,
      issueDescription: c.issue_description,
      claimDate: c.claim_date,
      status: c.status,
      resolutionNotes: c.resolution_notes,
      resolvedDate: c.resolved_date
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

warrantyRouter.post('/claims', requireAuth, requirePermission('warranty.claims'), (req, res) => {
  try {
    const claimData = req.body;
    if (!claimData || !claimData.serialNumber || !claimData.issueDescription) {
      return res.status(400).json({ success: false, error: 'Serial number and issue description are required.' });
    }

    const claimCount = db.prepare('SELECT COUNT(*) as count FROM warranty_claims').get().count;
    const claimNumber = `CLM-2026-${String(claimCount + 101).padStart(3, '0')}`;
    const claimId = 'clm-' + Date.now();
    const today = new Date().toISOString().split('T')[0];

    const prodName = claimData.productName || 'Hardware Unit';
    const custId = claimData.customerId || 'walk-in';
    const custName = claimData.customerName || 'Retail Customer';
    const custPhone = claimData.customerPhone || '';
    const invNumber = claimData.invoiceNumber || 'N/A';

    transaction(() => {
      // Find serial and product
      const serial = db.prepare('SELECT * FROM product_serials WHERE serial_number = ?').get(claimData.serialNumber.trim());
      const prod = serial ? db.prepare('SELECT name FROM products WHERE id = ?').get(serial.product_id) : null;

      db.prepare(`
        INSERT INTO warranty_claims (
          id, claim_number, serial_number, product_name, customer_id,
          customer_name, customer_phone, invoice_number, issue_description,
          claim_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `).run(
        claimId, claimNumber, claimData.serialNumber.trim(),
        claimData.productName || prod?.name || prodName,
        claimData.customerId || serial?.customer_id || custId,
        claimData.customerName || custName,
        claimData.customerPhone || custPhone,
        claimData.invoiceNumber || serial?.sale_invoice_id || invNumber,
        claimData.issueDescription, today
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'WARRANTY_CLAIM_FILED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, claimNumber,
        `Filed warranty claim ${claimNumber} for serial ${claimData.serialNumber}. Issue: ${claimData.issueDescription}`,
        req.ip || '127.0.0.1'
      );
    });

    const createdClaim = {
      id: claimId,
      claimNumber,
      serialNumber: claimData.serialNumber.trim(),
      productName: claimData.productName || prodName,
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      invoiceNumber: invNumber,
      issueDescription: claimData.issueDescription,
      claimDate: today,
      status: 'PENDING',
      resolutionNotes: '',
      resolvedDate: null
    };

    res.json({ success: true, message: `Warranty claim ${claimNumber} logged.`, claimNumber, claim: createdClaim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

warrantyRouter.put('/claims/:id', requireAuth, requirePermission('warranty.claims'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const existing = db.prepare('SELECT * FROM warranty_claims WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Claim not found.' });

    const today = new Date().toISOString().split('T')[0];

    transaction(() => {
      db.prepare(`
        UPDATE warranty_claims
        SET status = COALESCE(?, status),
            resolutionNotes = COALESCE(?, resolution_notes),
            resolved_date = ?
        WHERE id = ?
      `).run(status, resolutionNotes, today, id);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'WARRANTY_CLAIM_RESOLVED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, existing.claim_number,
        `Resolved warranty claim ${existing.claim_number} (Status: ${status}). Resolution: ${resolutionNotes}`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Warranty claim updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
