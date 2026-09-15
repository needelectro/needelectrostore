// NEED ELECTRO ERP — Product Catalog, Serial Lifecycle & Inventory Control
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const productsRouter = Router();

/**
 * List Products with Filters
 */
productsRouter.get('/', requireAuth, requirePermission('products.view'), (req, res) => {
  try {
    const { category, brand, search, status } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (brand) {
      sql += ' AND brand = ?';
      params.push(brand);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR sku LIKE ? OR model LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const products = db.prepare(sql).all(...params);

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      model: p.model,
      description: p.description,
      imageUrl: p.image_url,
      purchasePrice: p.purchase_price,
      costPrice: p.cost_price,
      retailPrice: p.retail_price,
      wholesalePrice: p.wholesale_price,
      emiPrice: p.emi_price,
      currentStock: p.current_stock,
      minStock: p.min_stock,
      supplierId: p.supplier_id,
      warrantyPeriodMonths: p.warranty_period_months,
      isSerialized: Boolean(p.is_serialized),
      status: p.status,
      specs: p.specs ? JSON.parse(p.specs) : undefined,
      createdAt: p.created_at
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Create Product & Optional Initial Serials
 */
productsRouter.post('/', requireAuth, requirePermission('products.create'), (req, res) => {
  try {
    const { productData, initialSerials } = req.body;

    if (!productData || !productData.name || !productData.sku || !productData.category) {
      return res.status(400).json({ success: false, error: 'Product name, SKU, and category are required.' });
    }

    const cleanSku = productData.sku.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(cleanSku);
    if (existing) {
      return res.status(400).json({ success: false, error: `A product with SKU '${cleanSku}' already exists.` });
    }

    const newId = 'prod-' + Date.now();
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    const result = transaction(() => {
      const initialStock = Number(productData.currentStock || (initialSerials ? initialSerials.length : 0));

      // Validate serials if serialized
      if (productData.isSerialized && initialSerials && initialSerials.length > 0) {
        for (const sn of initialSerials) {
          const cleanSn = sn.trim();
          const existingSerial = db.prepare('SELECT id FROM product_serials WHERE serial_number = ?').get(cleanSn);
          if (existingSerial) {
            throw new Error(`Serial number '${cleanSn}' already exists in the system database.`);
          }
        }
      }

      // Insert product
      db.prepare(`
        INSERT INTO products (
          id, name, sku, category, brand, model, description,
          image_url, purchase_price, cost_price, retail_price,
          wholesale_price, emi_price, current_stock, min_stock,
          supplier_id, warranty_period_months, is_serialized,
          status, specs, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId, productData.name.trim(), cleanSku, productData.category,
        productData.brand || 'General', productData.model || '',
        productData.description || '', productData.imageUrl || '',
        Number(productData.purchasePrice || 0), Number(productData.costPrice || productData.purchasePrice || 0),
        Number(productData.retailPrice || 0), Number(productData.wholesalePrice || 0),
        Number(productData.emiPrice || productData.retailPrice || 0), initialStock,
        Number(productData.minStock || 3), productData.supplierId || '',
        Number(productData.warrantyPeriodMonths || 12), productData.isSerialized ? 1 : 0,
        productData.status || 'ACTIVE',
        productData.specs ? JSON.stringify(productData.specs) : null,
        nowIso
      );

      // Register initial serials if serialized
      if (productData.isSerialized && initialSerials && initialSerials.length > 0) {
        const insSerial = db.prepare(`
          INSERT INTO product_serials (
            id, serial_number, product_id, branch_id, status,
            purchase_id, purchase_date, supplier_id, purchase_cost,
            service_history
          ) VALUES (?, ?, ?, 'branch-1', 'AVAILABLE', 'INITIAL-IMPORT', ?, ?, ?, '[]')
        `);

        for (let i = 0; i < initialSerials.length; i++) {
          const sn = initialSerials[i].trim();
          insSerial.run(
            `ser-${Date.now()}-${i}`, sn, newId, today,
            productData.supplierId || 'sup-1', Number(productData.costPrice || 0)
          );
        }
      }

      // Record initial inventory transaction if stock > 0
      if (initialStock > 0) {
        db.prepare(`
          INSERT INTO inventory_transactions (
            id, transaction_number, date, type, product_id, product_name,
            branch_id, quantity, unit_cost, total_value, opening_stock,
            closing_stock, reference_type, reference_id, serial_numbers, created_by
          ) VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, 'branch-1', ?, ?, ?, 0, ?, 'INITIAL', 'PROD-REG', ?, ?)
        `).run(
          'itx-' + Date.now(), `TX-INIT-${cleanSku}`, today, newId,
          productData.name, initialStock, Number(productData.costPrice || 0),
          initialStock * Number(productData.costPrice || 0), initialStock,
          initialSerials ? JSON.stringify(initialSerials) : '[]', req.user.name
        );
      }

      // Automatically record initial procurement as an Operating Expense if unitCost > 0
      const unitCost = Number(productData.costPrice || productData.purchasePrice || 0);
      const effectiveStock = initialStock > 0 ? initialStock : (unitCost > 0 ? 1 : 0);
      const totalExpenseAmount = unitCost * effectiveStock;

      let recordedExpense = null;
      if (totalExpenseAmount > 0) {
        const expCountRow = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
        const expCount = expCountRow ? expCountRow.count : 0;
        const voucherNumber = `EXP-PRD-${String(expCount + 101).padStart(4, '0')}`;
        const expenseId = 'exp-' + Date.now();

        // Deduct from financial account if exists
        const account = db.prepare('SELECT id FROM financial_accounts WHERE is_active = 1 LIMIT 1').get() ||
                        db.prepare('SELECT id FROM financial_accounts LIMIT 1').get();
        if (account) {
          db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(totalExpenseAmount, account.id);
        }

        const expDescription = `Product Catalog Inflow: ${productData.name} (SKU: ${cleanSku}) — ${effectiveStock} unit(s) @ ৳${unitCost.toLocaleString()}`;

        db.prepare(`
          INSERT INTO expenses (
            id, voucher_number, category, amount, date,
            payment_method, branch_id, description, attachment_name,
            created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          expenseId, voucherNumber, 'Purchase Expenses', totalExpenseAmount, today,
          'Cash', 'branch-1', expDescription,
          '', req.user.name, nowIso
        );

        recordedExpense = {
          id: expenseId,
          voucherNumber,
          category: 'Purchase Expenses',
          amount: totalExpenseAmount,
          date: today,
          paymentMethod: 'Cash',
          branchId: 'branch-1',
          description: expDescription,
          createdBy: req.user.name,
          createdAt: nowIso
        };
      }

      // Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PRODUCT_CREATED', 'INVENTORY', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, newId,
        `Registered new product '${productData.name}' (${cleanSku}) in ${productData.category} with ${initialStock} initial stock.`,
        req.ip || '127.0.0.1'
      );

      return {
        product: {
          id: newId,
          name: productData.name,
          sku: cleanSku,
          currentStock: initialStock
        },
        expense: recordedExpense
      };
    });

    res.json({
      success: true,
      message: `Product '${productData.name}' created successfully.` + (result.expense ? ` Recorded initial purchase expense of ৳${result.expense.amount}.` : ''),
      product: result.product,
      expense: result.expense
    });
  } catch (err) {
    console.error('Product create error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Update Product Details
 */
productsRouter.put('/:id', requireAuth, requirePermission('products.edit'), (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    transaction(() => {
      const targetSupplierId = p.supplierId !== undefined ? p.supplierId : (p.supplier_id !== undefined ? p.supplier_id : existing.supplier_id);
      db.prepare(`
        UPDATE products
        SET name = COALESCE(?, name),
            category = COALESCE(?, category),
            brand = COALESCE(?, brand),
            model = COALESCE(?, model),
            description = COALESCE(?, description),
            image_url = COALESCE(?, image_url),
            min_stock = COALESCE(?, min_stock),
            warranty_period_months = COALESCE(?, warranty_period_months),
            supplier_id = ?,
            status = COALESCE(?, status),
            specs = COALESCE(?, specs)
        WHERE id = ?
      `).run(
        p.name, p.category, p.brand, p.model, p.description, p.imageUrl,
        p.minStock, p.warrantyPeriodMonths, targetSupplierId || '', p.status,
        p.specs ? JSON.stringify(p.specs) : existing.specs, id
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PRODUCT_UPDATED', 'INVENTORY', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Updated specifications and details for '${existing.name}' (${existing.sku}).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Super Admin Price Change with Mandatory Audit Log
 */
productsRouter.post('/:id/price', requireAuth, requirePermission('products.pricing'), (req, res) => {
  try {
    const { id } = req.params;
    const { retailPrice, emiPrice, wholesalePrice, purchasePrice, costPrice, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'A valid business reason is mandatory for price adjustments.' });
    }

    const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!prod) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    transaction(() => {
      const insPriceAudit = db.prepare(`
        INSERT INTO price_audits (
          id, product_id, product_name, sku, price_type,
          old_price, new_price, changed_by, reason, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      if (retailPrice !== undefined && retailPrice !== prod.retail_price) {
        insPriceAudit.run('pa-' + Date.now() + '-ret', id, prod.name, prod.sku, 'RETAIL', prod.retail_price, retailPrice, req.user.name, reason.trim());
      }
      if (emiPrice !== undefined && emiPrice !== prod.emi_price) {
        insPriceAudit.run('pa-' + Date.now() + '-emi', id, prod.name, prod.sku, 'EMI', prod.emi_price, emiPrice, req.user.name, reason.trim());
      }
      if (wholesalePrice !== undefined && wholesalePrice !== prod.wholesale_price) {
        insPriceAudit.run('pa-' + Date.now() + '-ws', id, prod.name, prod.sku, 'WHOLESALE', prod.wholesale_price, wholesalePrice, req.user.name, reason.trim());
      }
      if (costPrice !== undefined && costPrice !== prod.cost_price) {
        insPriceAudit.run('pa-' + Date.now() + '-cp', id, prod.name, prod.sku, 'PURCHASE', prod.cost_price, costPrice, req.user.name, reason.trim());
      }

      db.prepare(`
        UPDATE products
        SET retail_price = COALESCE(?, retail_price),
            emi_price = COALESCE(?, emi_price),
            wholesale_price = COALESCE(?, wholesale_price),
            purchase_price = COALESCE(?, purchase_price),
            cost_price = COALESCE(?, cost_price)
        WHERE id = ?
      `).run(retailPrice, emiPrice, wholesalePrice, purchasePrice, costPrice, id);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PRICE_MODIFIED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Price updated for '${prod.name}' (${prod.sku}). Retail: ৳${retailPrice ?? prod.retail_price}, EMI: ৳${emiPrice ?? prod.emi_price}. Reason: ${reason}`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Price updated and recorded in audit trail.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Stock Adjustment with Inventory Ledger Transaction
 */
productsRouter.post('/stock-adjust', requireAuth, requirePermission('inventory.adjust'), (req, res) => {
  try {
    const { productId, branchId, quantityDiff, reason, serialNumbers } = req.body;

    if (!productId || quantityDiff === undefined || !reason) {
      return res.status(400).json({ success: false, error: 'Product ID, quantity difference, and reason are required.' });
    }

    const diff = Number(quantityDiff);
    const targetBranch = branchId || 'branch-1';
    const today = new Date().toISOString().split('T')[0];

    transaction(() => {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!prod) throw new Error('Product not found.');

      const openingStock = prod.current_stock;
      const closingStock = openingStock + diff;

      if (closingStock < 0) {
        throw new Error(`Adjustment would cause negative stock (${closingStock}). Prohibited.`);
      }

      // Update product stock
      db.prepare('UPDATE products SET current_stock = current_stock + ? WHERE id = ?').run(diff, productId);

      // Handle serials if positive adjustment
      if (prod.is_serialized && diff > 0 && serialNumbers && serialNumbers.length > 0) {
        const insSerial = db.prepare(`
          INSERT INTO product_serials (
            id, serial_number, product_id, branch_id, status,
            purchase_id, purchase_date, supplier_id, purchase_cost,
            service_history
          ) VALUES (?, ?, ?, ?, 'AVAILABLE', 'ADJUSTMENT', ?, 'sup-1', ?, '[]')
        `);

        for (let i = 0; i < serialNumbers.length; i++) {
          const sn = serialNumbers[i].trim();
          insSerial.run(`ser-adj-${Date.now()}-${i}`, sn, productId, targetBranch, today, prod.cost_price);
        }
      }

      // Insert inventory transaction
      db.prepare(`
        INSERT INTO inventory_transactions (
          id, transaction_number, date, type, product_id, product_name,
          branch_id, quantity, unit_cost, total_value, opening_stock,
          closing_stock, reference_type, reference_id, serial_numbers, notes, created_by
        ) VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, ?, ?, ?, ?, ?, ?, 'ADJUSTMENT', 'MANUAL-ADJ', ?, ?, ?)
      `).run(
        'itx-' + Date.now(), `TX-ADJ-${Date.now()}`, today,
        productId, prod.name, targetBranch, diff, prod.cost_price,
        Math.abs(diff) * prod.cost_price, openingStock, closingStock,
        serialNumbers ? JSON.stringify(serialNumbers) : '[]', reason, req.user.name
      );

      // Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'STOCK_ADJUSTMENT', 'INVENTORY', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, productId,
        `Adjusted stock for '${prod.name}' by ${diff > 0 ? `+${diff}` : diff} units. Reason: ${reason}`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Stock adjusted successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Inter-Branch / Warehouse Stock Transfer
 */
productsRouter.post('/stock-transfer', requireAuth, requirePermission('inventory.transfer'), (req, res) => {
  try {
    const { productId, fromBranchId, toBranchId, quantity, serialNumbers } = req.body;

    if (!productId || !fromBranchId || !toBranchId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, error: 'Product, origin, destination, and valid quantity are required.' });
    }

    if (fromBranchId === toBranchId) {
      return res.status(400).json({ success: false, error: 'Origin and destination branches must be different.' });
    }

    const qty = Number(quantity);
    const today = new Date().toISOString().split('T')[0];

    transaction(() => {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!prod) throw new Error('Product not found.');

      if (prod.is_serialized && serialNumbers && serialNumbers.length > 0) {
        const updSerial = db.prepare('UPDATE product_serials SET branch_id = ? WHERE serial_number = ? AND branch_id = ?');
        for (const sn of serialNumbers) {
          updSerial.run(toBranchId, sn.trim(), fromBranchId);
        }
      }

      // Record transfer transactions
      db.prepare(`
        INSERT INTO inventory_transactions (
          id, transaction_number, date, type, product_id, product_name,
          branch_id, from_branch_id, to_branch_id, quantity, unit_cost,
          total_value, opening_stock, closing_stock, reference_type, reference_id,
          serial_numbers, notes, created_by
        ) VALUES (?, ?, ?, 'TRANSFER', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'TRANSFER', 'INTER-BRANCH', ?, ?, ?)
      `).run(
        'itx-tr-' + Date.now(), `TX-TR-${Date.now()}`, today,
        productId, prod.name, toBranchId, fromBranchId, toBranchId,
        qty, prod.cost_price, qty * prod.cost_price, prod.current_stock,
        prod.current_stock, serialNumbers ? JSON.stringify(serialNumbers) : '[]',
        `Transferred from ${fromBranchId} to ${toBranchId}`, req.user.name
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'STOCK_TRANSFER', 'INVENTORY', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, productId,
        `Transferred ${qty} unit(s) of '${prod.name}' from ${fromBranchId} to ${toBranchId}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: `Transferred ${qty} unit(s) successfully.` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
