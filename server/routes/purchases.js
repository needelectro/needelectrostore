// NEED ELECTRO ERP — Purchase Inflow & Serial Intake Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const purchasesRouter = Router();

purchasesRouter.get('/', requireAuth, requirePermission('purchases.view'), (req, res) => {
  try {
    const purchases = db.prepare('SELECT * FROM purchases ORDER BY date DESC LIMIT 300').all();
    const purchaseIds = purchases.map(p => p.id);

    let itemsMap = {};
    if (purchaseIds.length > 0) {
      const placeholders = purchaseIds.map(() => '?').join(',');
      const items = db.prepare(`SELECT * FROM purchase_items WHERE purchase_id IN (${placeholders})`).all(...purchaseIds);
      for (const item of items) {
        if (!itemsMap[item.purchase_id]) itemsMap[item.purchase_id] = [];
        itemsMap[item.purchase_id].push({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          costPrice: item.cost_price,
          subtotal: item.subtotal,
          serialNumbers: item.serial_numbers ? JSON.parse(item.serial_numbers) : []
        });
      }
    }

    const formatted = purchases.map(p => ({
      id: p.id,
      invoiceNumber: p.invoice_number,
      supplierId: p.supplier_id,
      supplierName: p.supplier_name,
      branchId: p.branch_id,
      date: p.date,
      status: p.status,
      subtotal: p.subtotal,
      discount: p.discount,
      tax: p.tax,
      total: p.total,
      paidAmount: p.paid_amount,
      dueAmount: p.due_amount,
      paymentMethod: p.payment_method,
      notes: p.notes,
      createdAt: p.created_at,
      items: itemsMap[p.id] || []
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ATOMIC PURCHASE TRANSACTION
 */
purchasesRouter.post('/', requireAuth, requirePermission('purchases.create'), (req, res) => {
  try {
    const { supplierId, branchId, items, paymentMethod, paidAmount, notes, depositAccountId } = req.body;

    if (!supplierId || !branchId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Supplier, branch, and at least one item are required.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const result = transaction(() => {
      const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(supplierId);
      if (!supplier) throw new Error('Supplier record not found.');

      const purCount = db.prepare('SELECT COUNT(*) as count FROM purchases').get().count;
      const invoiceNumber = `PUR-2026-${String(purCount + 101).padStart(4, '0')}`;
      const purchaseId = 'pur-' + Date.now();

      let total = 0;
      for (const item of items) {
        total += Number(item.quantity) * Number(item.costPrice);
      }

      const paid = Number(paidAmount || 0);
      const due = Math.max(0, total - paid);

      // Verify serial numbers for serialized items
      for (const item of items) {
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (!prod) throw new Error(`Product not found (ID: ${item.productId})`);

        if (prod.is_serialized && item.serials && item.serials.length > 0) {
          if (item.serials.length !== item.quantity) {
            throw new Error(`Item '${prod.name}' specifies quantity ${item.quantity} but provided ${item.serials.length} serials.`);
          }

          for (const sn of item.serials) {
            const cleanSn = sn.trim();
            const existing = db.prepare('SELECT id FROM product_serials WHERE serial_number = ?').get(cleanSn);
            if (existing) {
              throw new Error(`Serial number '${cleanSn}' is already registered in the system.`);
            }
          }
        }
      }

      // 1. Insert Purchase Master
      db.prepare(`
        INSERT INTO purchases (
          id, invoice_number, supplier_id, supplier_name, branch_id,
          date, status, subtotal, discount, tax, total, paid_amount,
          due_amount, payment_method, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'Received', ?, 0, 0, ?, ?, ?, ?, ?, ?)
      `).run(
        purchaseId, invoiceNumber, supplier.id, supplier.company, branchId,
        today, total, total, paid, due, paymentMethod || 'Bank Transfer', notes || '', nowIso
      );

      // 2. Insert Items, Increase Stock, Register Serials & Stock Ledger
      const insItem = db.prepare(`
        INSERT INTO purchase_items (
          id, purchase_id, product_id, product_name, quantity,
          cost_price, subtotal, serial_numbers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updStock = db.prepare('UPDATE products SET current_stock = current_stock + ?, cost_price = ? WHERE id = ?');
      const insSerial = db.prepare(`
        INSERT INTO product_serials (
          id, serial_number, product_id, branch_id, status,
          purchase_id, purchase_date, supplier_id, purchase_cost, service_history
        ) VALUES (?, ?, ?, ?, 'AVAILABLE', ?, ?, ?, ?, '[]')
      `);

      const insInvTx = db.prepare(`
        INSERT INTO inventory_transactions (
          id, transaction_number, date, type, product_id, product_name,
          branch_id, quantity, unit_cost, total_value, opening_stock,
          closing_stock, reference_type, reference_id, serial_numbers, created_by
        ) VALUES (?, ?, ?, 'PURCHASE', ?, ?, ?, ?, ?, ?, ?, ?, 'PURCHASE', ?, ?, ?)
      `);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        const sub = Number(item.quantity) * Number(item.costPrice);
        const serialsJson = item.serials ? JSON.stringify(item.serials) : '[]';

        insItem.run(`pi-${Date.now()}-${i}`, purchaseId, item.productId, prod.name, item.quantity, item.costPrice, sub, serialsJson);

        const openStock = prod.current_stock;
        const closeStock = openStock + item.quantity;
        updStock.run(item.quantity, item.costPrice, item.productId);

        insInvTx.run(
          `itx-pur-${Date.now()}-${i}`, `TX-PUR-${invoiceNumber}-${i + 1}`, today,
          item.productId, prod.name, branchId, item.quantity, item.costPrice,
          sub, openStock, closeStock, invoiceNumber, serialsJson, req.user.name
        );

        if (prod.is_serialized && item.serials) {
          for (let s = 0; s < item.serials.length; s++) {
            const sn = item.serials[s].trim();
            insSerial.run(`ser-${Date.now()}-${i}-${s}`, sn, item.productId, branchId, invoiceNumber, today, supplier.id, item.costPrice);
          }
        }
      }

      // 3. Update Supplier Payable
      if (due > 0) {
        db.prepare('UPDATE suppliers SET current_payable = current_payable + ? WHERE id = ?').run(due, supplier.id);

        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'SUPPLIER', ?, 'PURCHASE', ?, ?, 0, ?, (SELECT current_payable FROM suppliers WHERE id = ?))
        `).run(
          'le-pur-' + Date.now(), today, supplier.id, invoiceNumber,
          `Goods Receipt & Supplier Bill ${invoiceNumber}`, due, supplier.id
        );
      }

      // 4. If Paid, Deduct from Financial Account
      if (paid > 0) {
        const targetAcc = depositAccountId || 'acc-2';
        db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(paid, targetAcc);

        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'SUPPLIER', ?, 'PAYMENT', ?, ?, ?, 0, (SELECT current_payable FROM suppliers WHERE id = ?))
        `).run(
          'le-purpay-' + Date.now(), today, supplier.id, invoiceNumber,
          `Payment for Purchase Bill ${invoiceNumber}`, paid, supplier.id
        );
      }

      // 5. Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PURCHASE_RECORDED', 'PURCHASE', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, invoiceNumber,
        `Received purchase goods ${invoiceNumber} from '${supplier.company}' (Total: ৳${total}, Paid: ৳${paid}, Due: ৳${due}).`,
        req.ip || '127.0.0.1'
      );

      return {
        purchaseId,
        invoiceNumber,
        total,
        paidAmount: paid,
        dueAmount: due
      };
    });

    res.json({
      success: true,
      message: `Purchase bill ${result.invoiceNumber} recorded successfully.`,
      purchase: result
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
