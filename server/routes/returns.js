// NEED ELECTRO ERP — Returns, RMA & Warranty Exchange Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const returnsRouter = Router();

returnsRouter.get('/', requireAuth, requirePermission('sales.view'), (req, res) => {
  try {
    const returns = db.prepare('SELECT * FROM product_returns ORDER BY date DESC').all();
    const formatted = returns.map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : []
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ATOMIC RETURN TRANSACTION
 */
returnsRouter.post('/', requireAuth, requirePermission('sales.return'), (req, res) => {
  try {
    const returnData = req.body;
    if (!returnData || !returnData.items || returnData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Return must specify at least one item.' });
    }

    const today = returnData.date || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const result = transaction(() => {
      const retCount = db.prepare('SELECT COUNT(*) as count FROM product_returns').get().count;
      const returnNumber = `RET-2026-${String(retCount + 101).padStart(4, '0')}`;
      const returnId = 'ret-' + Date.now();
      const refundTotal = Number(returnData.totalRefundAmount || 0);

      // 1. Process items: adjust stock or move to defective
      for (let i = 0; i < returnData.items.length; i++) {
        const item = returnData.items[i];
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (!prod) continue;

        if (item.condition === 'RESALEABLE') {
          // Put back into active stock
          db.prepare('UPDATE products SET current_stock = current_stock + ? WHERE id = ?').run(item.quantity, item.productId);

          // Update serials to AVAILABLE
          if (prod.is_serialized && item.serialNumbers && item.serialNumbers.length > 0) {
            const updSerial = db.prepare(`
              UPDATE product_serials
              SET status = 'AVAILABLE',
                  sale_invoice_id = NULL,
                  customer_id = NULL
              WHERE serial_number = ?
            `);
            for (const sn of item.serialNumbers) {
              updSerial.run(sn.trim());
            }
          }

          // Inventory transaction
          db.prepare(`
            INSERT INTO inventory_transactions (
              id, transaction_number, date, type, product_id, product_name,
              branch_id, quantity, unit_cost, total_value, opening_stock,
              closing_stock, reference_type, reference_id, serial_numbers, created_by
            ) VALUES (?, ?, ?, 'RETURN', ?, ?, 'branch-1', ?, ?, ?, ?, ?, 'RETURN', ?, ?, ?)
          `).run(
            `itx-ret-${Date.now()}-${i}`, `TX-RET-${returnNumber}-${i + 1}`, today,
            item.productId, item.productName, item.quantity, item.unitCost || prod.cost_price,
            item.quantity * (item.unitCost || prod.cost_price), prod.current_stock,
            prod.current_stock + item.quantity, returnNumber,
            item.serialNumbers ? JSON.stringify(item.serialNumbers) : '[]', req.user.name
          );
        } else {
          // Damaged / defective: mark serials as DEFECTIVE
          if (prod.is_serialized && item.serialNumbers && item.serialNumbers.length > 0) {
            const updSerial = db.prepare("UPDATE product_serials SET status = 'DEFECTIVE' WHERE serial_number = ?");
            for (const sn of item.serialNumbers) {
              updSerial.run(sn.trim());
            }
          }
        }
      }

      // 2. Adjust Refund / Accounts
      if (refundTotal > 0 && returnData.accountId) {
        db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(refundTotal, returnData.accountId);
      }

      // 3. Customer Ledger Reversal
      if (returnData.customerId) {
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'CUSTOMER', ?, 'RETURN', ?, ?, 0, ?, (SELECT current_balance FROM customers WHERE id = ?))
        `).run(
          'le-ret-' + Date.now(), today, returnData.customerId, returnNumber,
          `Return Refund / Credit on Return ${returnNumber}`, refundTotal, returnData.customerId
        );
      }

      // 4. Record Return Master
      db.prepare(`
        INSERT INTO product_returns (
          id, return_number, date, sale_invoice_id, customer_id,
          customer_name, customer_phone, return_type, reason, items,
          total_refund_amount, refund_method, account_id, status,
          handled_by, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        returnId, returnNumber, today, returnData.saleInvoiceId || '',
        returnData.customerId || '', returnData.customerName || '',
        returnData.customerPhone || '', returnData.returnType || 'CUSTOMER_RETURN',
        returnData.reason || '', JSON.stringify(returnData.items),
        refundTotal, returnData.refundMethod || 'Cash', returnData.accountId || null,
        returnData.status || 'COMPLETED', req.user.name, returnData.notes || '', nowIso
      );

      // 5. Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'RETURN_PROCESSED', 'POS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, returnNumber,
        `Processed return ${returnNumber} for invoice ${returnData.saleInvoiceId} (Refund: ৳${refundTotal}). Reason: ${returnData.reason}`,
        req.ip || '127.0.0.1'
      );

      return { returnId, returnNumber, refundTotal };
    });

    res.json({
      success: true,
      message: `Return ${result.returnNumber} processed successfully.`,
      data: result
    });
  } catch (err) {
    console.error('Return error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
