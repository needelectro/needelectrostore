// NEED ELECTRO ERP — System Control Center & Master Settings Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requireSuperAdmin, requirePermission } from '../middleware/auth.js';

export const settingsRouter = Router();

/**
 * Update Company Master Settings (Dynamic DB Driven)
 */
settingsRouter.put('/', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const s = req.body;
    transaction(() => {
      db.prepare(`
        UPDATE system_settings
        SET company_name = COALESCE(?, company_name),
            company_tagline = COALESCE(?, company_tagline),
            sister_concern = COALESCE(?, sister_concern),
            main_branch_name = COALESCE(?, main_branch_name),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            website = COALESCE(?, website),
            address = COALESCE(?, address),
            vat_registration_no = COALESCE(?, vat_registration_no),
            invoice_prefix = COALESCE(?, invoice_prefix),
            emi_prefix = COALESCE(?, emi_prefix),
            default_vat_percent = COALESCE(?, default_vat_percent),
            currency_symbol = COALESCE(?, currency_symbol),
            currency_code = COALESCE(?, currency_code),
            enable_sms_notifications = COALESCE(?, enable_sms_notifications),
            enable_whatsapp_notifications = COALESCE(?, enable_whatsapp_notifications),
            notification_template_due_soon_en = COALESCE(?, notification_template_due_soon_en),
            notification_template_due_soon_bn = COALESCE(?, notification_template_due_soon_bn),
            notification_template_overdue_en = COALESCE(?, notification_template_overdue_en),
            notification_template_overdue_bn = COALESCE(?, notification_template_overdue_bn),
            theme = COALESCE(?, theme),
            logo_url = COALESCE(?, logo_url),
            favicon_url = COALESCE(?, favicon_url),
            facebook_url = COALESCE(?, facebook_url),
            youtube_url = COALESCE(?, youtube_url),
            linkedin_url = COALESCE(?, linkedin_url),
            whatsapp_number = COALESCE(?, whatsapp_number),
            support_email = COALESCE(?, support_email),
            footer_text = COALESCE(?, footer_text),
            accent_color = COALESCE(?, accent_color),
            updated_at = datetime('now')
        WHERE id = 'main'
      `).run(
        s.companyName, s.companyTagline, s.sisterConcern, s.mainBranchName,
        s.phone, s.email, s.website, s.address, s.vatRegistrationNo,
        s.invoicePrefix, s.emiPrefix, s.defaultVatPercent, s.currencySymbol,
        s.currencyCode, s.enableSmsNotifications !== undefined ? (s.enableSmsNotifications ? 1 : 0) : null,
        s.enableWhatsappNotifications !== undefined ? (s.enableWhatsappNotifications ? 1 : 0) : null,
        s.notificationTemplateDueSoonEn, s.notificationTemplateDueSoonBn,
        s.notificationTemplateOverdueEn, s.notificationTemplateOverdueBn,
        s.theme, s.logoUrl, s.faviconUrl, s.facebookUrl, s.youtubeUrl,
        s.linkedinUrl, s.whatsappNumber, s.supportEmail, s.footerText,
        s.accentColor
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'SETTINGS_UPDATED', 'SETTINGS', 'main', ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name,
        `Updated company profile & system settings. Phone: ${s.phone || 'N/A'}, Email: ${s.email || 'N/A'}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'System settings saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update POS Settings
 */
settingsRouter.put('/pos', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const p = req.body;
    transaction(() => {
      db.prepare(`
        UPDATE pos_settings
        SET invoice_prefix = COALESCE(?, invoice_prefix),
            next_invoice_number = COALESCE(?, next_invoice_number),
            return_window_days = COALESCE(?, return_window_days),
            enable_pos_discounts = COALESCE(?, enable_pos_discounts),
            max_discount_percent = COALESCE(?, max_discount_percent),
            enable_credit_sales = COALESCE(?, enable_credit_sales),
            require_customer_phone = COALESCE(?, require_customer_phone),
            default_invoice_notes = COALESCE(?, default_invoice_notes),
            receipt_footer_text = COALESCE(?, receipt_footer_text),
            tax_percent = COALESCE(?, tax_percent),
            print_logo_on_receipt = COALESCE(?, print_logo_on_receipt),
            print_warranty_on_receipt = COALESCE(?, print_warranty_on_receipt)
        WHERE id = 'main'
      `).run(
        p.invoicePrefix, p.nextInvoiceNumber, p.returnWindowDays,
        p.enablePosDiscounts !== undefined ? (p.enablePosDiscounts ? 1 : 0) : null,
        p.maxDiscountPercent,
        p.enableCreditSales !== undefined ? (p.enableCreditSales ? 1 : 0) : null,
        p.requireCustomerPhone !== undefined ? (p.requireCustomerPhone ? 1 : 0) : null,
        p.defaultInvoiceNotes, p.receiptFooterText, p.taxPercent,
        p.printLogoOnReceipt !== undefined ? (p.printLogoOnReceipt ? 1 : 0) : null,
        p.printWarrantyOnReceipt !== undefined ? (p.printWarrantyOnReceipt ? 1 : 0) : null
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'POS_SETTINGS_SAVED', 'SETTINGS', 'main', ?, ?)
      `).run('audit-' + Date.now(), req.user.id, req.user.name, 'Updated POS and billing parameters.', req.ip || '127.0.0.1');
    });

    res.json({ success: true, message: 'POS settings updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update Inventory Rules
 */
settingsRouter.put('/inventory-rules', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const ir = req.body;
    transaction(() => {
      db.prepare(`
        UPDATE inventory_rules
        SET low_stock_threshold_default = COALESCE(?, low_stock_threshold_default),
            enable_out_of_stock_warnings = COALESCE(?, enable_out_of_stock_warnings),
            allow_negative_stock = COALESCE(?, allow_negative_stock),
            serial_tracking_mandatory_categories = COALESCE(?, serial_tracking_mandatory_categories),
            auto_generate_barcode = COALESCE(?, auto_generate_barcode),
            barcode_prefix = COALESCE(?, barcode_prefix),
            require_approval_for_inter_branch_transfer = COALESCE(?, require_approval_for_inter_branch_transfer)
        WHERE id = 'main'
      `).run(
        ir.lowStockThresholdDefault,
        ir.enableOutOfStockWarnings !== undefined ? (ir.enableOutOfStockWarnings ? 1 : 0) : null,
        ir.allowNegativeStock !== undefined ? (ir.allowNegativeStock ? 1 : 0) : null,
        ir.serialTrackingMandatoryCategories ? JSON.stringify(ir.serialTrackingMandatoryCategories) : null,
        ir.autoGenerateBarcode !== undefined ? (ir.autoGenerateBarcode ? 1 : 0) : null,
        ir.barcodePrefix,
        ir.requireApprovalForInterBranchTransfer !== undefined ? (ir.requireApprovalForInterBranchTransfer ? 1 : 0) : null
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'INVENTORY_RULES_SAVED', 'SETTINGS', 'main', 'Updated inventory policy rules.', ?)
      `).run('audit-' + Date.now(), req.user.id, req.user.name, req.ip || '127.0.0.1');
    });

    res.json({ success: true, message: 'Inventory rules updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Branches & Warehouses
 */
settingsRouter.post('/branches', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.code) return res.status(400).json({ success: false, error: 'Branch name and unique code are required.' });

    const newId = 'branch-' + Date.now();
    transaction(() => {
      db.prepare(`
        INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `).run(newId, b.name.trim(), b.code.trim().toUpperCase(), b.address || '', b.phone || '', b.email || '', b.isWarehouse ? 1 : 0);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'BRANCH_CREATED', 'SETTINGS', ?, ?, ?)
      `).run('audit-' + Date.now(), req.user.id, req.user.name, newId, `Added branch/warehouse '${b.name}' (${b.code}).`, req.ip || '127.0.0.1');
    });

    res.json({ success: true, message: `Branch '${b.name}' created.`, branchId: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Categories Config CRUD
 */
settingsRouter.post('/categories', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const c = req.body;
    if (!c.name || !c.code) return res.status(400).json({ success: false, error: 'Category name and code are required.' });

    const catId = c.id || 'cat-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM categories_config WHERE id = ?').get(catId);
      if (existing) {
        db.prepare(`
          UPDATE categories_config
          SET name = ?, code = ?, description = ?, icon = ?,
              subcategories = ?, attributes = ?, is_serialized_default = ?,
              default_warranty_months = ?, is_active = ?, sort_order = ?
          WHERE id = ?
        `).run(
          c.name, c.code, c.description || '', c.icon || 'Package',
          c.subcategories ? JSON.stringify(c.subcategories) : '[]',
          c.attributes ? JSON.stringify(c.attributes) : '[]',
          c.isSerializedDefault ? 1 : 0, c.defaultWarrantyMonths || 12,
          c.isActive !== undefined ? (c.isActive ? 1 : 0) : 1,
          c.sortOrder || 0, catId
        );
      } else {
        db.prepare(`
          INSERT INTO categories_config (
            id, name, code, description, icon, subcategories,
            attributes, is_serialized_default, default_warranty_months,
            is_active, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          catId, c.name, c.code, c.description || '', c.icon || 'Package',
          c.subcategories ? JSON.stringify(c.subcategories) : '[]',
          c.attributes ? JSON.stringify(c.attributes) : '[]',
          c.isSerializedDefault ? 1 : 0, c.defaultWarrantyMonths || 12,
          c.isActive !== undefined ? (c.isActive ? 1 : 0) : 1,
          c.sortOrder || 0
        );
      }
    });

    res.json({ success: true, message: 'Category saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/categories/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM categories_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Payment Methods Config
 */
settingsRouter.post('/payment-methods', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const pm = req.body;
    const pmId = pm.id || 'pm-' + Date.now();

    transaction(() => {
      const existing = db.prepare('SELECT id FROM configurable_payment_methods WHERE id = ?').get(pmId);
      if (existing) {
        db.prepare(`
          UPDATE configurable_payment_methods
          SET name = ?, code = ?, type = ?, linked_account_id = ?,
              account_number = ?, charge_percent = ?, instructions = ?,
              is_active = ?, sort_order = ?
          WHERE id = ?
        `).run(
          pm.name, pm.code, pm.type || 'OTHER', pm.linkedAccountId || 'acc-1',
          pm.accountNumber || '', pm.chargePercent || 0, pm.instructions || '',
          pm.isActive !== undefined ? (pm.isActive ? 1 : 0) : 1,
          pm.sortOrder || 0, pmId
        );
      } else {
        db.prepare(`
          INSERT INTO configurable_payment_methods (
            id, name, code, type, linked_account_id, account_number,
            charge_percent, instructions, is_active, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          pmId, pm.name, pm.code, pm.type || 'OTHER', pm.linkedAccountId || 'acc-1',
          pm.accountNumber || '', pm.chargePercent || 0, pm.instructions || '',
          pm.isActive !== undefined ? (pm.isActive ? 1 : 0) : 1,
          pm.sortOrder || 0
        );
      }
    });

    res.json({ success: true, message: 'Payment method saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/payment-methods/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM configurable_payment_methods WHERE id = ?').run(id);
    res.json({ success: true, message: 'Payment method deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Brands Config
 */
settingsRouter.post('/brands', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const b = req.body;
    const bId = b.id || 'brand-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM brands_config WHERE id = ?').get(bId);
      if (existing) {
        db.prepare(`
          UPDATE brands_config
          SET name = ?, code = ?, category_ids = ?, logo_url = ?,
              website = ?, description = ?, is_active = ?
          WHERE id = ?
        `).run(
          b.name, b.code, b.categoryIds ? JSON.stringify(b.categoryIds) : '[]',
          b.logoUrl || '', b.website || '', b.description || '',
          b.isActive !== undefined ? (b.isActive ? 1 : 0) : 1, bId
        );
      } else {
        db.prepare(`
          INSERT INTO brands_config (
            id, name, code, category_ids, logo_url, website, description, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          bId, b.name, b.code, b.categoryIds ? JSON.stringify(b.categoryIds) : '[]',
          b.logoUrl || '', b.website || '', b.description || '',
          b.isActive !== undefined ? (b.isActive ? 1 : 0) : 1
        );
      }
    });
    res.json({ success: true, message: 'Brand saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/brands/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM brands_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Brand deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Expense Categories Config
 */
settingsRouter.post('/expense-categories', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const ec = req.body;
    const ecId = ec.id || 'ec-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM expense_categories_config WHERE id = ?').get(ecId);
      if (existing) {
        db.prepare(`
          UPDATE expense_categories_config
          SET name = ?, code = ?, description = ?, is_tax_deductible = ?, is_active = ?
          WHERE id = ?
        `).run(
          ec.name, ec.code, ec.description || '',
          ec.isTaxDeductible !== undefined ? (ec.isTaxDeductible ? 1 : 0) : 1,
          ec.isActive !== undefined ? (ec.isActive ? 1 : 0) : 1, ecId
        );
      } else {
        db.prepare(`
          INSERT INTO expense_categories_config (
            id, name, code, description, is_tax_deductible, is_active
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          ecId, ec.name, ec.code, ec.description || '',
          ec.isTaxDeductible !== undefined ? (ec.isTaxDeductible ? 1 : 0) : 1,
          ec.isActive !== undefined ? (ec.isActive ? 1 : 0) : 1
        );
      }
    });
    res.json({ success: true, message: 'Expense category saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/expense-categories/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM expense_categories_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Expense category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Service Categories Config
 */
settingsRouter.post('/service-categories', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const sc = req.body;
    const scId = sc.id || 'sc-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM service_categories_config WHERE id = ?').get(scId);
      if (existing) {
        db.prepare(`
          UPDATE service_categories_config
          SET name = ?, code = ?, default_labor_cost = ?, estimated_duration_hours = ?,
              warranty_days = ?, description = ?, is_active = ?
          WHERE id = ?
        `).run(
          sc.name, sc.code, sc.defaultLaborCost || 0, sc.estimatedDurationHours || 2,
          sc.warrantyDays || 30, sc.description || '',
          sc.isActive !== undefined ? (sc.isActive ? 1 : 0) : 1, scId
        );
      } else {
        db.prepare(`
          INSERT INTO service_categories_config (
            id, name, code, default_labor_cost, estimated_duration_hours,
            warranty_days, description, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          scId, sc.name, sc.code, sc.defaultLaborCost || 0, sc.estimatedDurationHours || 2,
          sc.warrantyDays || 30, sc.description || '',
          sc.isActive !== undefined ? (sc.isActive ? 1 : 0) : 1
        );
      }
    });
    res.json({ success: true, message: 'Service category saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/service-categories/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM service_categories_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Service category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Warranty Rules Config
 */
settingsRouter.post('/warranty-rules', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const wr = req.body;
    const wrId = wr.id || 'wr-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM warranty_rules_config WHERE id = ?').get(wrId);
      if (existing) {
        db.prepare(`
          UPDATE warranty_rules_config
          SET category_name = ?, default_months = ?, terms_text = ?,
              replacement_allowed = ?, repair_allowed = ?, void_conditions = ?, is_active = ?
          WHERE id = ?
        `).run(
          wr.categoryName, wr.defaultMonths || 12, wr.termsText || '',
          wr.replacementAllowed ? 1 : 0, wr.repairAllowed ? 1 : 0,
          wr.voidConditions || '', wr.isActive !== undefined ? (wr.isActive ? 1 : 0) : 1, wrId
        );
      } else {
        db.prepare(`
          INSERT INTO warranty_rules_config (
            id, category_name, default_months, terms_text,
            replacement_allowed, repair_allowed, void_conditions, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          wrId, wr.categoryName, wr.defaultMonths || 12, wr.termsText || '',
          wr.replacementAllowed ? 1 : 0, wr.repairAllowed ? 1 : 0,
          wr.voidConditions || '', wr.isActive !== undefined ? (wr.isActive ? 1 : 0) : 1
        );
      }
    });
    res.json({ success: true, message: 'Warranty rule saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/warranty-rules/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM warranty_rules_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Warranty rule deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Notification Templates Config
 */
settingsRouter.post('/notification-templates', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const nt = req.body;
    const ntId = nt.id || 'nt-' + Date.now();
    transaction(() => {
      const existing = db.prepare('SELECT id FROM notification_templates_config WHERE id = ?').get(ntId);
      if (existing) {
        db.prepare(`
          UPDATE notification_templates_config
          SET code = ?, name = ?, channel = ?, trigger_event = ?,
              subject_template = ?, template_en = ?, template_bn = ?,
              placeholders = ?, is_active = ?
          WHERE id = ?
        `).run(
          nt.code, nt.name, nt.channel, nt.triggerEvent,
          nt.subjectTemplate || '', nt.templateEn || '', nt.templateBn || '',
          nt.placeholders ? JSON.stringify(nt.placeholders) : '[]',
          nt.isActive !== undefined ? (nt.isActive ? 1 : 0) : 1, ntId
        );
      } else {
        db.prepare(`
          INSERT INTO notification_templates_config (
            id, code, name, channel, trigger_event,
            subject_template, template_en, template_bn, placeholders, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          ntId, nt.code, nt.name, nt.channel, nt.triggerEvent,
          nt.subjectTemplate || '', nt.templateEn || '', nt.templateBn || '',
          nt.placeholders ? JSON.stringify(nt.placeholders) : '[]',
          nt.isActive !== undefined ? (nt.isActive ? 1 : 0) : 1
        );
      }
    });
    res.json({ success: true, message: 'Notification template saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

settingsRouter.delete('/notification-templates/:id', requireAuth, requirePermission('settings.manage'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM notification_templates_config WHERE id = ?').run(id);
    res.json({ success: true, message: 'Notification template deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
