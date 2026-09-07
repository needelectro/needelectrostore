// NEED ELECTRO ERP — Real Existing Business Data Import Engine
// Validates schema, detects duplicates (SKU, Phone, NID), and prevents bad imports
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

export const importRouter = Router();

/**
 * Validate Import Data Prior to Ingestion
 */
importRouter.post('/validate', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { entityType, rows } = req.body;

    if (!entityType || !rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Entity type and an array of rows are required.' });
    }

    const errors = [];
    const duplicates = [];
    const validRows = [];

    switch (entityType) {
      case 'PRODUCTS': {
        const existingSkus = new Set(db.prepare('SELECT sku FROM products').all().map(r => r.sku.toUpperCase()));
        const seenInFile = new Set();

        rows.forEach((row, idx) => {
          const line = idx + 1;
          const sku = (row.sku || row.SKU || '').trim().toUpperCase();
          const name = (row.name || row.Name || '').trim();

          if (!name) {
            errors.push({ line, field: 'name', message: 'Product name is missing.' });
            return;
          }
          if (!sku) {
            errors.push({ line, field: 'sku', message: 'SKU is missing.' });
            return;
          }
          if (seenInFile.has(sku)) {
            duplicates.push({ line, field: 'sku', value: sku, message: 'Duplicate SKU found within uploaded dataset.' });
            return;
          }
          seenInFile.add(sku);

          if (existingSkus.has(sku)) {
            duplicates.push({ line, field: 'sku', value: sku, message: 'Product with this SKU already exists in ERP database.' });
            return;
          }

          validRows.push({
            name,
            sku,
            category: row.category || 'Other Gadgets',
            brand: row.brand || 'General',
            model: row.model || '',
            purchasePrice: Number(row.purchasePrice || row.costPrice || 0),
            costPrice: Number(row.costPrice || row.purchasePrice || 0),
            retailPrice: Number(row.retailPrice || 0),
            wholesalePrice: Number(row.wholesalePrice || 0),
            emiPrice: Number(row.emiPrice || row.retailPrice || 0),
            currentStock: Number(row.currentStock || row.stock || 0),
            minStock: Number(row.minStock || 3),
            warrantyPeriodMonths: Number(row.warrantyPeriodMonths || 12),
            isSerialized: Boolean(row.isSerialized)
          });
        });
        break;
      }

      case 'CUSTOMERS': {
        const existingPhones = new Set(db.prepare('SELECT phone FROM customers').all().map(r => r.phone.replace(/[- ]/g, '')));
        const seenPhones = new Set();

        rows.forEach((row, idx) => {
          const line = idx + 1;
          const name = (row.name || '').trim();
          const phone = (row.phone || '').trim();
          const cleanPhone = phone.replace(/[- ]/g, '');

          if (!name) {
            errors.push({ line, field: 'name', message: 'Customer name is missing.' });
            return;
          }
          if (!phone || cleanPhone.length < 10) {
            errors.push({ line, field: 'phone', message: 'Valid telephone number is required.' });
            return;
          }
          if (seenPhones.has(cleanPhone)) {
            duplicates.push({ line, field: 'phone', value: phone, message: 'Duplicate telephone number in uploaded dataset.' });
            return;
          }
          seenPhones.add(cleanPhone);

          if (existingPhones.has(cleanPhone)) {
            duplicates.push({ line, field: 'phone', value: phone, message: 'Customer with this phone already exists in ERP database.' });
            return;
          }

          validRows.push({
            name,
            phone,
            email: row.email || '',
            address: row.address || '',
            nid: row.nid || '',
            creditLimit: Number(row.creditLimit || 0)
          });
        });
        break;
      }

      case 'SUPPLIERS': {
        const existingCompanies = new Set(db.prepare('SELECT company FROM suppliers').all().map(r => r.company.toLowerCase()));

        rows.forEach((row, idx) => {
          const line = idx + 1;
          const company = (row.company || row.name || '').trim();
          if (!company) {
            errors.push({ line, field: 'company', message: 'Company name is missing.' });
            return;
          }
          if (existingCompanies.has(company.toLowerCase())) {
            duplicates.push({ line, field: 'company', value: company, message: 'Supplier company already exists in ERP database.' });
            return;
          }

          validRows.push({
            name: row.contactPerson || row.name || company,
            company,
            phone: row.phone || '',
            email: row.email || '',
            address: row.address || '',
            category: row.category || 'General Tech',
            openingBalance: Number(row.openingBalance || 0)
          });
        });
        break;
      }

      case 'EMPLOYEES': {
        const existingPhones = new Set(db.prepare('SELECT phone FROM employees').all().map(r => r.phone.replace(/[- ]/g, '')));
        rows.forEach((row, idx) => {
          const line = idx + 1;
          const name = (row.name || '').trim();
          const phone = (row.phone || '').trim();
          const cleanPhone = phone.replace(/[- ]/g, '');
          if (!name) {
            errors.push({ line, field: 'name', message: 'Employee name is missing.' });
            return;
          }
          if (!phone || cleanPhone.length < 10) {
            errors.push({ line, field: 'phone', message: 'Valid telephone number is required.' });
            return;
          }
          if (existingPhones.has(cleanPhone)) {
            duplicates.push({ line, field: 'phone', value: phone, message: 'Employee with this phone already exists in ERP database.' });
            return;
          }
          validRows.push({
            name,
            phone,
            email: row.email || '',
            designation: row.designation || 'Staff',
            department: row.department || 'General',
            branchId: row.branchId || 'branch-1',
            salary: Number(row.salary || 0),
            status: row.status || 'ACTIVE'
          });
        });
        break;
      }

      default:
        return res.status(400).json({ success: false, error: 'Unsupported entity type for validation.' });
    }

    res.json({
      success: true,
      summary: {
        totalRows: rows.length,
        validCount: validRows.length,
        duplicateCount: duplicates.length,
        errorCount: errors.length,
        isValid: errors.length === 0 && duplicates.length === 0
      },
      errors,
      duplicates,
      preview: validRows.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Commit Validated Data to Central Database
 */
importRouter.post('/commit', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { entityType, validRows } = req.body;

    if (!entityType || !validRows || !Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ success: false, error: 'No validated rows to commit.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const importedCount = transaction(() => {
      let count = 0;

      if (entityType === 'PRODUCTS') {
        const ins = db.prepare(`
          INSERT INTO products (
            id, name, sku, category, brand, model, description,
            image_url, purchase_price, cost_price, retail_price,
            wholesale_price, emi_price, current_stock, min_stock,
            warranty_period_months, is_serialized, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
        `);

        for (let i = 0; i < validRows.length; i++) {
          const p = validRows[i];
          const newId = `prod-imp-${Date.now()}-${i}`;
          ins.run(
            newId, p.name, p.sku, p.category, p.brand, p.model || '',
            p.description || '', p.purchasePrice, p.costPrice, p.retailPrice,
            p.wholesalePrice, p.emiPrice, p.currentStock, p.minStock,
            p.warrantyPeriodMonths, p.isSerialized ? 1 : 0, nowIso
          );
          count++;
        }
      } else if (entityType === 'CUSTOMERS') {
        const ins = db.prepare(`
          INSERT INTO customers (
            id, customer_id, name, phone, email, address, nid,
            credit_limit, current_balance, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `);

        const baseCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

        for (let i = 0; i < validRows.length; i++) {
          const c = validRows[i];
          const newId = `cust-imp-${Date.now()}-${i}`;
          const customerId = `CUST-${String(baseCount + count + 1001)}`;
          ins.run(newId, customerId, c.name, c.phone, c.email || '', c.address || '', c.nid || '', c.creditLimit || 0, nowIso);
          count++;
        }
      } else if (entityType === 'SUPPLIERS') {
        const ins = db.prepare(`
          INSERT INTO suppliers (
            id, name, company, phone, email, address, category,
            opening_balance, current_payable, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (let i = 0; i < validRows.length; i++) {
          const s = validRows[i];
          const newId = `sup-imp-${Date.now()}-${i}`;
          ins.run(newId, s.name, s.company, s.phone || '', s.email || '', s.address || '', s.category || 'General', s.openingBalance || 0, s.openingBalance || 0, nowIso);
          count++;
        }
      } else if (entityType === 'EMPLOYEES') {
        const ins = db.prepare(`
          INSERT INTO employees (
            id, employee_id, name, phone, email, designation, department,
            branch_id, joining_date, salary, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const baseCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;

        for (let i = 0; i < validRows.length; i++) {
          const emp = validRows[i];
          const newId = `emp-imp-${Date.now()}-${i}`;
          const empId = `EMP-${String(baseCount + count + 101).padStart(3, '0')}`;
          ins.run(
            newId, empId, emp.name, emp.phone, emp.email || '',
            emp.designation || 'Staff', emp.department || 'General',
            emp.branchId || 'branch-1', today, Number(emp.salary || 0),
            emp.status || 'ACTIVE', nowIso
          );
          count++;
        }
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'DATA_IMPORTED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, entityType,
        `Super Admin imported ${count} ${entityType} records into central database.`,
        req.ip || '127.0.0.1'
      );

      return count;
    });

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} ${entityType} into the production database.`,
      importedCount
    });
  } catch (err) {
    console.error('Import commit error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
