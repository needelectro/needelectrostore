// NEED ELECTRO ERP — Real POS, Sales & Laptop EMI Backend Engine
// Enforces ACID Database Transactions for Inventory, Serial Tracking, Customer Receivables & Accounting Ledgers
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const salesRouter = Router();

/**
 * List Sales Invoices with Filters
 */
salesRouter.get('/', requireAuth, requirePermission('sales.view'), (req, res) => {
  try {
    const { branchId, customerId, startDate, endDate, saleType } = req.query;
    let sql = 'SELECT * FROM sales WHERE 1=1';
    const params = [];

    if (branchId) {
      sql += ' AND branch_id = ?';
      params.push(branchId);
    }
    if (customerId) {
      sql += ' AND customer_id = ?';
      params.push(customerId);
    }
    if (saleType) {
      sql += ' AND sale_type = ?';
      params.push(saleType);
    }
    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY date DESC, created_at DESC LIMIT 300';
    const sales = db.prepare(sql).all(...params);

    const saleIds = sales.map(s => s.id);
    let itemsMap = {};
    if (saleIds.length > 0) {
      const placeholders = saleIds.map(() => '?').join(',');
      const items = db.prepare(`SELECT * FROM sale_items WHERE sale_id IN (${placeholders})`).all(...saleIds);
      for (const item of items) {
        if (!itemsMap[item.sale_id]) itemsMap[item.sale_id] = [];
        itemsMap[item.sale_id].push({
          productId: item.product_id,
          productName: item.product_name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discount: item.discount,
          total: item.total,
          warrantyMonths: item.warranty_months,
          isSerialized: Boolean(item.is_serialized),
          serialNumbers: item.serial_numbers ? JSON.parse(item.serial_numbers) : []
        });
      }
    }

    const formatted = sales.map(s => ({
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerPhone: s.customer_phone,
      branchId: s.branch_id,
      date: s.date,
      subtotal: s.subtotal,
      overallDiscount: s.overall_discount,
      vatAmount: s.vat_amount,
      vatPercent: s.vat_percent,
      grandTotal: s.grand_total,
      paidAmount: s.paid_amount,
      dueAmount: s.due_amount,
      payments: s.payments ? JSON.parse(s.payments) : [],
      saleType: s.sale_type,
      emiAccountId: s.emi_account_id,
      status: s.status,
      salespersonId: s.salesperson_id,
      salespersonName: s.salesperson_name,
      notes: s.notes,
      createdAt: s.created_at,
      items: itemsMap[s.id] || []
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ATOMIC SALE & EMI TRANSACTION
 */
salesRouter.post('/', requireAuth, requirePermission('sales.create'), (req, res) => {
  try {
    const { saleData, emiPlanConfig, paymentAccountId } = req.body;

    if (!saleData || !saleData.items || saleData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Sale must contain at least one item.' });
    }

    const result = transaction(() => {
      // 1. Generate Sequential Guaranteed-Unique Invoice Number from POS Settings
      const posSettings = db.prepare('SELECT invoice_prefix, next_invoice_number FROM pos_settings WHERE id = ?').get('main');
      const prefix = posSettings?.invoice_prefix || 'INV-2026-';
      let nextNum = posSettings?.next_invoice_number || 1001;

      let candidate = `${prefix}${nextNum}`;
      while (db.prepare('SELECT id FROM sales WHERE invoice_number = ?').get(candidate)) {
        nextNum++;
        candidate = `${prefix}${nextNum}`;
      }
      const invoiceNumber = candidate;

      // Increment next invoice number
      db.prepare('UPDATE pos_settings SET next_invoice_number = ? WHERE id = ?').run(nextNum + 1, 'main');

      const saleId = 'sale-' + Date.now();
      const today = saleData.date || new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      // Fetch inventory rules
      const invRules = db.prepare('SELECT allow_negative_stock FROM inventory_rules WHERE id = ?').get('main');
      const allowNegative = Boolean(invRules?.allow_negative_stock);

      // Verify stock & serials
      for (const item of saleData.items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (!product) {
          throw new Error(`Product not found (ID: ${item.productId})`);
        }

        if (!allowNegative && product.current_stock < item.quantity) {
          throw new Error(`Insufficient stock for product '${product.name}'. Available: ${product.current_stock}, Requested: ${item.quantity}`);
        }

        // Serialized product verification
        if (product.is_serialized && item.serialNumbers && item.serialNumbers.length > 0) {
          if (item.serialNumbers.length !== item.quantity) {
            throw new Error(`Item '${product.name}' requires exactly ${item.quantity} serial number(s). Provided: ${item.serialNumbers.length}`);
          }

          for (const sn of item.serialNumbers) {
            const cleanSn = sn.trim();
            const serialRecord = db.prepare('SELECT * FROM product_serials WHERE serial_number = ?').get(cleanSn);

            if (!serialRecord) {
              throw new Error(`Serial number '${cleanSn}' does not exist in inventory records.`);
            }
            if (serialRecord.status === 'SOLD') {
              throw new Error(`Serial number '${cleanSn}' has already been sold on invoice ${serialRecord.sale_invoice_id || 'UNKNOWN'}. Cannot sell twice.`);
            }
            if (serialRecord.status !== 'AVAILABLE') {
              throw new Error(`Serial number '${cleanSn}' is not available for sale (Status: ${serialRecord.status}).`);
            }
          }
        }
      }

      // 2. Insert Sale Master Record
      const isEmi = saleData.saleType === 'EMI' || Boolean(emiPlanConfig);
      const paidAmount = Number(saleData.paidAmount || 0);
      const grandTotal = Number(saleData.grandTotal || 0);
      const dueAmount = isEmi ? 0 : Math.max(0, grandTotal - paidAmount);

      let createdEmiAccountId = null;

      db.prepare(`
        INSERT INTO sales (
          id, invoice_number, customer_id, customer_name, customer_phone,
          branch_id, date, subtotal, overall_discount, vat_amount,
          vat_percent, grand_total, paid_amount, due_amount, payments,
          sale_type, emi_account_id, status, salesperson_id,
          salesperson_name, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'COMPLETED', ?, ?, ?, ?)
      `).run(
        saleId, invoiceNumber, saleData.customerId, saleData.customerName,
        saleData.customerPhone, saleData.branchId, today, saleData.subtotal,
        saleData.overallDiscount || 0, saleData.vatAmount || 0,
        saleData.vatPercent || 5, grandTotal, paidAmount, dueAmount,
        JSON.stringify(saleData.payments || [{ method: 'Cash', amount: paidAmount }]),
        isEmi ? 'EMI' : 'REGULAR',
        req.user.id, req.user.name, saleData.notes || '', nowIso
      );

      // Deduct Inventory Stock, Update Serials, Insert Sale Items & Stock Ledger
      const insSaleItem = db.prepare(`
        INSERT INTO sale_items (
          id, sale_id, product_id, product_name, sku, category,
          quantity, unit_price, discount, total, warranty_months,
          is_serialized, serial_numbers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updStock = db.prepare('UPDATE products SET current_stock = current_stock - ? WHERE id = ?');
      const insInvTx = db.prepare(`
        INSERT INTO inventory_transactions (
          id, transaction_number, date, type, product_id, product_name,
          branch_id, quantity, unit_cost, total_value, opening_stock,
          closing_stock, reference_type, reference_id, serial_numbers, created_by
        ) VALUES (?, ?, ?, 'SALE', ?, ?, ?, ?, ?, ?, ?, ?, 'INVOICE', ?, ?, ?)
      `);

      for (let i = 0; i < saleData.items.length; i++) {
        const item = saleData.items[i];
        const itemId = `si-${Date.now()}-${i}`;
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        const openingStock = prod.current_stock;
        const closingStock = openingStock - item.quantity;
        const unitCost = prod.cost_price || (item.unitPrice * 0.78);
        const serialsJson = item.serialNumbers ? JSON.stringify(item.serialNumbers) : '[]';

        // Insert sale item
        insSaleItem.run(
          itemId, saleId, item.productId, item.productName, item.sku || prod.sku,
          item.category || prod.category, item.quantity, item.unitPrice,
          item.discount || 0, item.total, item.warrantyMonths || prod.warranty_period_months || 0,
          prod.is_serialized ? 1 : 0, serialsJson
        );

        // Deduct stock
        updStock.run(item.quantity, item.productId);

        // Record stock movement transaction
        insInvTx.run(
          `itx-${Date.now()}-${i}`, `TX-SALE-${invoiceNumber}-${i + 1}`, today,
          item.productId, item.productName, saleData.branchId,
          -item.quantity, unitCost, unitCost * item.quantity,
          openingStock, closingStock, invoiceNumber, serialsJson,
          req.user.name
        );

        // Update Serial Records if serialized
        if (prod.is_serialized && item.serialNumbers && item.serialNumbers.length > 0) {
          const warrantyEnd = new Date(today);
          const wMonths = item.warrantyMonths || prod.warranty_period_months || 12;
          warrantyEnd.setMonth(warrantyEnd.getMonth() + wMonths);
          const warrantyEndStr = warrantyEnd.toISOString().split('T')[0];

          const updSerial = db.prepare(`
            UPDATE product_serials
            SET status = 'SOLD',
                sale_invoice_id = ?,
                sale_date = ?,
                customer_id = ?,
                warranty_start_date = ?,
                warranty_end_date = ?
            WHERE serial_number = ?
          `);

          for (const sn of item.serialNumbers) {
            updSerial.run(invoiceNumber, today, saleData.customerId, today, warrantyEndStr, sn.trim());
          }
        }
      }

      // 3. Handle EMI Creation if EMI Sale
      if (isEmi && emiPlanConfig) {
        const emiPlan = db.prepare('SELECT * FROM emi_plans WHERE id = ?').get(emiPlanConfig.planId);
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(saleData.customerId);
        const firstItem = saleData.items[0];
        const primarySerial = (firstItem.serialNumbers && firstItem.serialNumbers[0]) || 'SERIAL-N/A';

        const downPayment = Number(emiPlanConfig.downPayment || 0);
        const laptopPrice = grandTotal;
        const financedAmount = Math.max(0, laptopPrice - downPayment);
        const duration = Number(emiPlanConfig.durationMonths || emiPlan?.duration_months || 6);
        const monthlyInstallment = duration > 0 ? Math.round(financedAmount / duration) : 0;
        const totalPayable = financedAmount;

        const emiId = 'emi-' + Date.now();
        const emiCount = db.prepare('SELECT COUNT(*) as c FROM emi_accounts').get().c;
        const emiNumber = `EMI-2026-${String(emiCount + 101).padStart(3, '0')}`;
        createdEmiAccountId = emiId;

        const startDate = today;
        const endDateObj = new Date(startDate);
        endDateObj.setMonth(endDateObj.getMonth() + duration);
        const endDate = endDateObj.toISOString().split('T')[0];

        // Insert EMI Account
        db.prepare(`
          INSERT INTO emi_accounts (
            id, emi_number, sale_invoice_id, customer_id, customer_name,
            customer_phone, customer_address, customer_nid, guarantor,
            product_id, product_name, serial_number, laptop_price,
            down_payment, financed_amount, duration_months, monthly_installment,
            total_payable, total_paid, remaining_balance, start_date,
            end_date, status, contract_terms, approved_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        `).run(
          emiId, emiNumber, invoiceNumber, customer.id, customer.name,
          customer.phone, customer.address || '', customer.nid || '',
          customer.guarantor || null, firstItem.productId, firstItem.productName,
          primarySerial, laptopPrice, downPayment, financedAmount, duration,
          monthlyInstallment, totalPayable, financedAmount, startDate,
          endDate, emiPlan?.terms_text || 'Standard laptop EMI contract',
          req.user.name, nowIso
        );

        // Generate Installment Schedule
        const insInstallment = db.prepare(`
          INSERT INTO emi_installments (
            id, emi_account_id, installment_number, due_date,
            amount, penalty_amount, paid_amount, status
          ) VALUES (?, ?, ?, ?, ?, 0, 0, 'UPCOMING')
        `);

        for (let m = 1; m <= duration; m++) {
          const dueDateObj = new Date(startDate);
          dueDateObj.setMonth(dueDateObj.getMonth() + m);
          const dueDateStr = dueDateObj.toISOString().split('T')[0];

          insInstallment.run(`inst-${emiId}-${m}`, emiId, m, dueDateStr, monthlyInstallment);
        }

        // Link serial record to EMI account
        if (primarySerial !== 'SERIAL-N/A') {
          db.prepare('UPDATE product_serials SET emi_account_id = ? WHERE serial_number = ?').run(emiId, primarySerial);
        }

        // Record customer receivable for financed amount
        db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE id = ?').run(financedAmount, customer.id);

        // Record customer ledger entry
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'CUSTOMER', ?, 'EMI', ?, ?, ?, 0, (SELECT current_balance FROM customers WHERE id = ?))
        `).run(
          'le-' + Date.now(), today, customer.id, emiNumber,
          `EMI Financed Account opened for ${firstItem.productName} (${duration} Months)`,
          financedAmount, customer.id
        );
      } else if (dueAmount > 0) {
        // Regular Credit Sale with outstanding due
        db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE id = ?').run(dueAmount, saleData.customerId);

        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'CUSTOMER', ?, 'INVOICE', ?, ?, ?, 0, (SELECT current_balance FROM customers WHERE id = ?))
        `).run(
          'le-' + Date.now(), today, saleData.customerId, invoiceNumber,
          `Credit Sale Due on Invoice ${invoiceNumber}`,
          dueAmount, saleData.customerId
        );
      }

      // 4. Update Financial Account Balances for Payments Received
      if (paidAmount > 0) {
        const targetAccountId = paymentAccountId || 'acc-1';
        db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(paidAmount, targetAccountId);

        // Customer Ledger credit for payment
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'CUSTOMER', ?, 'PAYMENT', ?, ?, 0, ?, (SELECT current_balance FROM customers WHERE id = ?))
        `).run(
          'le-pay-' + Date.now(), today, saleData.customerId, invoiceNumber,
          isEmi ? `EMI Down Payment for Invoice ${invoiceNumber}` : `Cash/Payment on Invoice ${invoiceNumber}`,
          paidAmount, saleData.customerId
        );
      }

      if (createdEmiAccountId) {
        db.prepare('UPDATE sales SET emi_account_id = ? WHERE id = ?').run(createdEmiAccountId, saleId);
      }

      // 6. Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, ?, 'POS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name,
        isEmi ? 'EMI_SALE_CREATED' : 'SALE_CREATED', invoiceNumber,
        `Created ${isEmi ? 'EMI' : 'retail'} sale ${invoiceNumber} for ৳${grandTotal} (Paid: ৳${paidAmount}, Due: ৳${dueAmount}).`,
        req.ip || '127.0.0.1'
      );

      return {
        id: saleId,
        invoiceNumber,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        branchId: saleData.branchId,
        date: today,
        subtotal: saleData.subtotal,
        overallDiscount: saleData.overallDiscount || 0,
        vatAmount: saleData.vatAmount || 0,
        vatPercent: saleData.vatPercent || 0,
        grandTotal,
        paidAmount,
        dueAmount,
        payments: saleData.payments || [],
        saleType: isEmi ? 'EMI' : (saleData.saleType || 'REGULAR'),
        emiAccountId: createdEmiAccountId,
        status: 'COMPLETED',
        salespersonId: req.user.id,
        salespersonName: req.user.name,
        notes: saleData.notes || '',
        createdAt: nowIso,
        items: saleData.items
      };
    });

    res.json({
      success: true,
      message: `Sale ${result.invoiceNumber} processed successfully.`,
      sale: result
    });
  } catch (err) {
    console.error('Sale transaction error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
