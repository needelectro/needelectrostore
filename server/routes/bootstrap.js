// NEED ELECTRO ERP — Unified Bootstrap Route (High-Speed Initial Sync)
import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

export const bootstrapRouter = Router();

bootstrapRouter.get('/', authenticate, (req, res) => {
  try {
    // 1. Settings & Configs
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = ?').get('main') || {};
    const posSettings = db.prepare('SELECT * FROM pos_settings WHERE id = ?').get('main') || {};
    const inventoryRules = db.prepare('SELECT * FROM inventory_rules WHERE id = ?').get('main') || {};
    const setupStatus = db.prepare('SELECT * FROM setup_status WHERE id = ?').get('main') || {};

    const branches = db.prepare('SELECT * FROM branches ORDER BY is_warehouse ASC, name ASC').all();
    const financialAccounts = db.prepare('SELECT * FROM financial_accounts WHERE is_active = 1 ORDER BY name ASC').all();
    const paymentMethods = db.prepare('SELECT * FROM configurable_payment_methods WHERE is_active = 1 ORDER BY sort_order ASC').all();
    const categories = db.prepare('SELECT * FROM categories_config WHERE is_active = 1 ORDER BY sort_order ASC').all();
    const brands = db.prepare('SELECT * FROM brands_config WHERE is_active = 1 ORDER BY name ASC').all();
    const emiPlans = db.prepare('SELECT * FROM emi_plans WHERE is_active = 1 ORDER BY duration_months ASC').all();
    const expenseCategories = db.prepare('SELECT * FROM expense_categories_config WHERE is_active = 1 ORDER BY name ASC').all();
    const serviceCategories = db.prepare('SELECT * FROM service_categories_config WHERE is_active = 1 ORDER BY name ASC').all();
    const warrantyRules = db.prepare('SELECT * FROM warranty_rules_config WHERE is_active = 1').all();
    const notificationTemplates = db.prepare('SELECT * FROM notification_templates_config WHERE is_active = 1').all();

    // If unauthenticated, return public branding, branch list and setup status
    if (!req.user) {
      return res.json({
        success: true,
        authenticated: false,
        data: {
          settings: {
            companyName: settings.company_name || 'NEED ELECTRO',
            companyTagline: settings.company_tagline || 'Trusted Electrical & Technological Solutions',
            phone: settings.phone || '+880 1733-983752',
            email: settings.email || 'contact.amdadur@gmail.com',
            address: settings.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
            binNumber: settings.bin_number || 'BIN-NEED-2026-BD',
            currency: settings.currency || 'BDT',
            currencySymbol: settings.currency_symbol || '৳',
            invoicePrefix: settings.invoice_prefix || 'INV-2026-',
            emiPrefix: settings.emi_prefix || 'EMI-2026-',
            theme: settings.theme || 'dark',
            facebookUrl: settings.facebook_url || '',
            youtubeUrl: settings.youtube_url || '',
            linkedinUrl: settings.linkedin_url || '',
            whatsappNumber: settings.whatsapp_number || '',
            supportEmail: settings.support_email || 'contact.amdadur@gmail.com',
            footerText: settings.footer_text || 'NEED ELECTRO — Trusted Electrical & Technological Solutions.',
            accentColor: settings.accent_color || '#008CFF'
          },
          posSettings: {
            invoicePrefix: posSettings.invoice_prefix || 'INV-2026-',
            nextInvoiceNumber: posSettings.next_invoice_number || 1001,
            returnWindowDays: posSettings.return_window_days || 7,
            enablePosDiscounts: Boolean(posSettings.enable_pos_discounts),
            maxDiscountPercent: posSettings.max_discount_percent ?? 15,
            enableCreditSales: Boolean(posSettings.enable_credit_sales),
            requireCustomerPhone: Boolean(posSettings.require_customer_phone),
            defaultInvoiceNotes: posSettings.default_invoice_notes || '',
            receiptFooterText: posSettings.receipt_footer_text || '',
            taxPercent: posSettings.tax_percent ?? 5,
            printLogoOnReceipt: Boolean(posSettings.print_logo_on_receipt),
            printWarrantyOnReceipt: Boolean(posSettings.print_warranty_on_receipt)
          },
          inventoryRules: {
            lowStockThresholdDefault: inventoryRules.low_stock_threshold_default || 3,
            enableOutOfStockWarnings: Boolean(inventoryRules.enable_out_of_stock_warnings),
            allowNegativeStock: Boolean(inventoryRules.allow_negative_stock),
            serialTrackingMandatoryCategories: inventoryRules.serial_tracking_mandatory_categories ? JSON.parse(inventoryRules.serial_tracking_mandatory_categories) : [],
            autoGenerateBarcode: Boolean(inventoryRules.auto_generate_barcode),
            barcodePrefix: inventoryRules.barcode_prefix || 'NE',
            requireApprovalForInterBranchTransfer: Boolean(inventoryRules.require_approval_for_inter_branch_transfer)
          },
          setupStatus: {
            isSuperAdminConfigured: Boolean(setupStatus.is_super_admin_configured),
            isCompanyConfigured: Boolean(setupStatus.is_company_configured),
            isMainBranchConfigured: Boolean(setupStatus.is_main_branch_configured),
            isWarehouseConfigured: Boolean(setupStatus.is_warehouse_configured),
            isFinancialAccountsConfigured: Boolean(setupStatus.is_financial_accounts_configured),
            isPaymentMethodsConfigured: Boolean(setupStatus.is_payment_methods_configured),
            isEmiPlansConfigured: Boolean(setupStatus.is_emi_plans_configured),
            isInvoiceSettingsConfigured: Boolean(setupStatus.is_invoice_settings_configured),
            isNotificationConfigured: Boolean(setupStatus.is_notification_configured),
            isOpeningBalancesConfigured: Boolean(setupStatus.is_opening_balances_configured),
            initialSetupCompleted: Boolean(setupStatus.initial_setup_completed)
          },
          branches: branches.map(b => ({
            ...b,
            isWarehouse: Boolean(b.is_warehouse),
            active: Boolean(b.active)
          })),
          categoriesConfig: categories.map(c => ({
            ...c,
            requiresSerial: Boolean(c.requires_serial),
            isActive: Boolean(c.is_active),
            sortOrder: c.sort_order
          })),
          brandsConfig: brands.map(b => ({
            ...b,
            isActive: Boolean(b.is_active)
          })),
          paymentMethodsConfig: paymentMethods.map(pm => ({
            ...pm,
            linkedAccountId: pm.linked_account_id,
            accountNumber: pm.account_number,
            chargePercent: pm.charge_percent,
            isActive: Boolean(pm.is_active),
            sortOrder: pm.sort_order
          })),
          users: [],
          roles: [],
          permissionsList: [],
          products: [],
          serials: [],
          customers: [],
          suppliers: [],
          sales: [],
          purchases: [],
          returns: [],
          expenses: [],
          services: [],
          technicians: [],
          warrantyClaims: [],
          investments: [],
          financialAccounts: [],
          employees: [],
          attendance: [],
          emiPlans: [],
          emiAccounts: [],
          emiPayments: [],
          inventoryTransactions: [],
          ledgerEntries: [],
          auditLogs: [],
          expenseCategoriesConfig: [],
          serviceCategoriesConfig: [],
          warrantyRulesConfig: [],
          notificationTemplatesConfig: [],
          priceAuditLog: [],
          customerMergeAudit: [],
          openingBalances: []
        }
      });
    }

    // 2. RBAC & Users
    const roles = db.prepare('SELECT * FROM roles WHERE is_active = 1').all();
    const permissions = db.prepare('SELECT * FROM permissions').all();
    const users = db.prepare(`
      SELECT id, name, email, username, role, role_id, branch_id, primary_branch_id,
             allowed_branch_ids, phone, employee_id, avatar, active, status,
             must_change_password, last_login_at, created_at
      FROM users
    `).all();

    // 3. Operational Entities
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    const serials = db.prepare('SELECT * FROM product_serials ORDER BY purchase_date DESC').all();
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY created_at DESC').all();
    
    // Invoices and Line Items
    const sales = db.prepare('SELECT * FROM sales ORDER BY date DESC, created_at DESC LIMIT 500').all();
    const saleItems = db.prepare('SELECT * FROM sale_items').all();
    
    // Group sale items by sale_id
    const saleItemsMap = {};
    for (const item of saleItems) {
      if (!saleItemsMap[item.sale_id]) saleItemsMap[item.sale_id] = [];
      saleItemsMap[item.sale_id].push({
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

    // Attach items to sales
    const formattedSales = sales.map(s => ({
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
      items: saleItemsMap[s.id] || []
    }));

    // Purchases & Items
    const purchases = db.prepare('SELECT * FROM purchases ORDER BY date DESC LIMIT 300').all();
    const purchaseItems = db.prepare('SELECT * FROM purchase_items').all();
    const purchaseItemsMap = {};
    for (const item of purchaseItems) {
      if (!purchaseItemsMap[item.purchase_id]) purchaseItemsMap[item.purchase_id] = [];
      purchaseItemsMap[item.purchase_id].push({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        costPrice: item.cost_price,
        subtotal: item.subtotal,
        serialNumbers: item.serial_numbers ? JSON.parse(item.serial_numbers) : []
      });
    }
    const formattedPurchases = purchases.map(p => ({
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
      items: purchaseItemsMap[p.id] || []
    }));

    // EMI Accounts, Installments & Payments
    const emiAccounts = db.prepare('SELECT * FROM emi_accounts ORDER BY start_date DESC').all();
    const emiInstallments = db.prepare('SELECT * FROM emi_installments ORDER BY installment_number ASC').all();
    const emiPayments = db.prepare('SELECT * FROM emi_payments ORDER BY payment_date DESC').all();

    const installmentsMap = {};
    for (const inst of emiInstallments) {
      if (!installmentsMap[inst.emi_account_id]) installmentsMap[inst.emi_account_id] = [];
      installmentsMap[inst.emi_account_id].push({
        id: inst.id,
        installmentNumber: inst.installment_number,
        dueDate: inst.due_date,
        amount: inst.amount,
        penaltyAmount: inst.penalty_amount,
        paidAmount: inst.paid_amount,
        paidDate: inst.paid_date,
        status: inst.status,
        receiptNumber: inst.receipt_number,
        paymentMethod: inst.payment_method
      });
    }

    const formattedEmiAccounts = emiAccounts.map(ea => ({
      id: ea.id,
      emiNumber: ea.emi_number,
      saleInvoiceId: ea.sale_invoice_id,
      customerId: ea.customer_id,
      customerName: ea.customer_name,
      customerPhone: ea.customer_phone,
      customerAddress: ea.customer_address,
      customerNid: ea.customer_nid,
      guarantor: ea.guarantor ? JSON.parse(ea.guarantor) : undefined,
      productId: ea.product_id,
      productName: ea.product_name,
      serialNumber: ea.serial_number,
      laptopPrice: ea.laptop_price,
      downPayment: ea.down_payment,
      financedAmount: ea.financed_amount,
      durationMonths: ea.duration_months,
      monthlyInstallment: ea.monthly_installment,
      totalPayable: ea.total_payable,
      totalPaid: ea.total_paid,
      remainingBalance: ea.remaining_balance,
      startDate: ea.start_date,
      endDate: ea.end_date,
      status: ea.status,
      contractTerms: ea.contract_terms,
      approvedBy: ea.approved_by,
      createdAt: ea.created_at,
      installments: installmentsMap[ea.id] || []
    }));

    // Returns, Expenses, Services, Technicians, Warranties
    const returns = db.prepare('SELECT * FROM product_returns ORDER BY date DESC').all().map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : []
    }));
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC LIMIT 300').all();
    const services = db.prepare('SELECT * FROM service_jobs ORDER BY created_at DESC').all().map(s => ({
      ...s,
      partsUsed: s.parts_used ? JSON.parse(s.parts_used) : []
    }));
    const technicians = db.prepare('SELECT * FROM technicians ORDER BY name ASC').all().map(t => ({
      ...t,
      specialization: t.specialization ? JSON.parse(t.specialization) : []
    }));
    const warrantyClaims = db.prepare('SELECT * FROM warranty_claims ORDER BY claim_date DESC').all();
    const investments = db.prepare('SELECT * FROM investments ORDER BY date DESC').all();
    const employees = db.prepare('SELECT * FROM employees ORDER BY name ASC').all();
    const attendance = db.prepare('SELECT * FROM attendance ORDER BY date DESC LIMIT 300').all();

    // Transactions, Ledgers, Audits
    const inventoryTransactions = db.prepare('SELECT * FROM inventory_transactions ORDER BY date DESC LIMIT 500').all().map(it => ({
      ...it,
      serialNumbers: it.serial_numbers ? JSON.parse(it.serial_numbers) : []
    }));
    const ledgerEntries = db.prepare('SELECT * FROM ledger_entries ORDER BY date DESC LIMIT 1000').all();
    const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500').all();
    const priceAuditLog = db.prepare('SELECT * FROM price_audits ORDER BY timestamp DESC LIMIT 200').all();
    const customerMergeAudit = db.prepare('SELECT * FROM customer_merge_audits ORDER BY timestamp DESC').all();
    const openingBalances = db.prepare('SELECT * FROM opening_balances ORDER BY date DESC').all();

    // Cleaned up & normalized payload matching frontend TypeScript interfaces
    res.json({
      success: true,
      data: {
        settings: {
          companyName: settings.company_name || 'NEED ELECTRO',
          companyTagline: settings.company_tagline || 'Trusted Electrical & Technological Solutions',
          sisterConcern: settings.sister_concern || 'A sister Concern Of AMDADS GROUP',
          mainBranchName: settings.main_branch_name || 'Main Branch Moulvibazar',
          phone: settings.phone || '01733-983752',
          email: settings.email || 'needelectro23@gmail.com',
          website: settings.website || 'www.needelectro.com',
          address: settings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
          vatRegistrationNo: settings.vat_registration_no || 'BIN: 002948123-0102',
          invoicePrefix: settings.invoice_prefix || 'INV-2026-',
          emiPrefix: settings.emi_prefix || 'EMI-2026-',
          defaultVatPercent: settings.default_vat_percent ?? 5,
          currencySymbol: settings.currency_symbol || '৳',
          currencyCode: settings.currency_code || 'BDT',
          enableSmsNotifications: Boolean(settings.enable_sms_notifications),
          enableWhatsappNotifications: Boolean(settings.enable_whatsapp_notifications),
          notificationTemplateDueSoonEn: settings.notification_template_due_soon_en,
          notificationTemplateDueSoonBn: settings.notification_template_due_soon_bn,
          notificationTemplateOverdueEn: settings.notification_template_overdue_en,
          notificationTemplateOverdueBn: settings.notification_template_overdue_bn,
          theme: settings.theme || 'dark',
          logoUrl: settings.logo_url || '',
          faviconUrl: settings.favicon_url || '',
          facebookUrl: settings.facebook_url || '',
          youtubeUrl: settings.youtube_url || '',
          linkedinUrl: settings.linkedin_url || '',
          whatsappNumber: settings.whatsapp_number || '',
          supportEmail: settings.support_email || 'contact.amdadur@gmail.com',
          footerText: settings.footer_text || 'NEED ELECTRO — Trusted Electrical & Technological Solutions.',
          accentColor: settings.accent_color || '#008CFF'
        },
        posSettings: {
          invoicePrefix: posSettings.invoice_prefix || 'INV-2026-',
          nextInvoiceNumber: posSettings.next_invoice_number || 1001,
          returnWindowDays: posSettings.return_window_days || 7,
          enablePosDiscounts: Boolean(posSettings.enable_pos_discounts),
          maxDiscountPercent: posSettings.max_discount_percent ?? 15,
          enableCreditSales: Boolean(posSettings.enable_credit_sales),
          requireCustomerPhone: Boolean(posSettings.require_customer_phone),
          defaultInvoiceNotes: posSettings.default_invoice_notes || '',
          receiptFooterText: posSettings.receipt_footer_text || '',
          taxPercent: posSettings.tax_percent ?? 5,
          printLogoOnReceipt: Boolean(posSettings.print_logo_on_receipt),
          printWarrantyOnReceipt: Boolean(posSettings.print_warranty_on_receipt)
        },
        inventoryRules: {
          lowStockThresholdDefault: inventoryRules.low_stock_threshold_default || 3,
          enableOutOfStockWarnings: Boolean(inventoryRules.enable_out_of_stock_warnings),
          allowNegativeStock: Boolean(inventoryRules.allow_negative_stock),
          serialTrackingMandatoryCategories: inventoryRules.serial_tracking_mandatory_categories ? JSON.parse(inventoryRules.serial_tracking_mandatory_categories) : [],
          autoGenerateBarcode: Boolean(inventoryRules.auto_generate_barcode),
          barcodePrefix: inventoryRules.barcode_prefix || 'NE',
          requireApprovalForInterBranchTransfer: Boolean(inventoryRules.require_approval_for_inter_branch_transfer)
        },
        setupStatus: {
          isSuperAdminConfigured: Boolean(setupStatus.is_super_admin_configured),
          isCompanyConfigured: Boolean(setupStatus.is_company_configured),
          isMainBranchConfigured: Boolean(setupStatus.is_main_branch_configured),
          isWarehouseConfigured: Boolean(setupStatus.is_warehouse_configured),
          isFinancialAccountsConfigured: Boolean(setupStatus.is_financial_accounts_configured),
          isPaymentMethodsConfigured: Boolean(setupStatus.is_payment_methods_configured),
          isEmiPlansConfigured: Boolean(setupStatus.is_emi_plans_configured),
          isInvoiceSettingsConfigured: Boolean(setupStatus.is_invoice_settings_configured),
          isNotificationConfigured: Boolean(setupStatus.is_notification_configured),
          isOpeningBalancesConfigured: Boolean(setupStatus.is_opening_balances_configured),
          initialSetupCompleted: Boolean(setupStatus.initial_setup_completed)
        },
        branches: branches.map(b => ({
          ...b,
          isWarehouse: Boolean(b.is_warehouse),
          active: Boolean(b.active)
        })),
        financialAccounts: financialAccounts.map(a => ({
          ...a,
          isActive: Boolean(a.is_active)
        })),
        paymentMethodsConfig: paymentMethods.map(pm => ({
          ...pm,
          linkedAccountId: pm.linked_account_id,
          accountNumber: pm.account_number,
          chargePercent: pm.charge_percent,
          isActive: Boolean(pm.is_active),
          sortOrder: pm.sort_order
        })),
        categoriesConfig: categories.map(c => ({
          ...c,
          subcategories: c.subcategories ? JSON.parse(c.subcategories) : [],
          attributes: c.attributes ? JSON.parse(c.attributes) : [],
          isSerializedDefault: Boolean(c.is_serialized_default),
          defaultWarrantyMonths: c.default_warranty_months,
          isActive: Boolean(c.is_active),
          sortOrder: c.sort_order
        })),
        brandsConfig: brands.map(b => ({
          ...b,
          categoryIds: b.category_ids ? JSON.parse(b.category_ids) : [],
          logoUrl: b.logo_url,
          isActive: Boolean(b.is_active)
        })),
        emiPlans: emiPlans.map(ep => ({
          ...ep,
          durationMonths: ep.duration_months,
          minDownPaymentPercent: ep.min_down_payment_percent,
          interestRatePercent: ep.interest_rate_percent,
          processingFee: ep.processing_fee,
          lateFeePerDay: ep.late_fee_per_day,
          gracePeriodDays: ep.grace_period_days,
          isActive: Boolean(ep.is_active),
          eligibilityRules: ep.eligibility_rules,
          termsText: ep.terms_text
        })),
        expenseCategoriesConfig: expenseCategories.map(ec => ({
          ...ec,
          isTaxDeductible: Boolean(ec.is_tax_deductible),
          isActive: Boolean(ec.is_active)
        })),
        serviceCategoriesConfig: serviceCategories.map(sc => ({
          ...sc,
          defaultLaborCost: sc.default_labor_cost,
          estimatedDurationHours: sc.estimated_duration_hours,
          warrantyDays: sc.warranty_days,
          isActive: Boolean(sc.is_active)
        })),
        warrantyRulesConfig: warrantyRules.map(wr => ({
          ...wr,
          categoryName: wr.category_name,
          defaultMonths: wr.default_months,
          termsText: wr.terms_text,
          replacementAllowed: Boolean(wr.replacement_allowed),
          repairAllowed: Boolean(wr.repair_allowed),
          voidConditions: wr.void_conditions,
          isActive: Boolean(wr.is_active)
        })),
        notificationTemplatesConfig: notificationTemplates.map(nt => ({
          ...nt,
          subjectTemplate: nt.subject_template,
          templateEn: nt.template_en,
          templateBn: nt.template_bn,
          placeholders: nt.placeholders ? JSON.parse(nt.placeholders) : [],
          isActive: Boolean(nt.is_active)
        })),
        roles: roles.map(r => ({
          ...r,
          permissions: r.permissions ? JSON.parse(r.permissions) : [],
          isSystem: Boolean(r.is_system),
          isActive: Boolean(r.is_active)
        })),
        permissionsList: permissions.map(p => ({
          ...p,
          isSensitive: Boolean(p.is_sensitive)
        })),
        users: users.map(u => ({
          ...u,
          allowedBranchIds: u.allowed_branch_ids ? JSON.parse(u.allowed_branch_ids) : [u.branch_id],
          active: Boolean(u.active)
        })),
        products: products.map(p => ({
          ...p,
          purchasePrice: p.purchase_price,
          costPrice: p.cost_price,
          retailPrice: p.retail_price,
          wholesalePrice: p.wholesale_price,
          emiPrice: p.emi_price,
          currentStock: p.current_stock,
          minStock: p.min_stock,
          warrantyPeriodMonths: p.warranty_period_months,
          isSerialized: Boolean(p.is_serialized),
          specs: p.specs ? JSON.parse(p.specs) : undefined
        })),
        serials: serials.map(s => ({
          ...s,
          serialNumber: s.serial_number,
          productId: s.product_id,
          branchId: s.branch_id,
          purchaseId: s.purchase_id,
          purchaseDate: s.purchase_date,
          supplierId: s.supplier_id,
          purchaseCost: s.purchase_cost,
          saleInvoiceId: s.sale_invoice_id,
          saleDate: s.sale_date,
          customerId: s.customer_id,
          emiAccountId: s.emi_account_id,
          warrantyStartDate: s.warranty_start_date,
          warrantyEndDate: s.warranty_end_date,
          serviceHistory: s.service_history ? JSON.parse(s.service_history) : []
        })),
        customers: customers.map(c => ({
          ...c,
          customerId: c.customer_id,
          guarantor: c.guarantor ? JSON.parse(c.guarantor) : undefined,
          creditLimit: c.credit_limit,
          currentBalance: c.current_balance
        })),
        suppliers: suppliers.map(s => ({
          ...s,
          openingBalance: s.opening_balance,
          currentPayable: s.current_payable
        })),
        sales: formattedSales,
        purchases: formattedPurchases,
        returns,
        emiAccounts: formattedEmiAccounts,
        emiPayments: emiPayments.map(ep => ({
          ...ep,
          receiptNumber: ep.receipt_number,
          emiAccountId: ep.emi_account_id,
          emiNumber: ep.emi_number,
          installmentId: ep.installment_id,
          installmentNumber: ep.installment_number,
          customerId: ep.customer_id,
          customerName: ep.customer_name,
          amount: ep.amount,
          penaltyPaid: ep.penalty_paid,
          paymentDate: ep.payment_date,
          paymentMethod: ep.payment_method,
          transactionRef: ep.transaction_ref,
          collectedBy: ep.collected_by
        })),
        expenses: expenses.map(e => ({
          ...e,
          voucherNumber: e.voucher_number,
          paymentMethod: e.payment_method,
          branchId: e.branch_id,
          attachmentName: e.attachment_name,
          createdBy: e.created_by,
          createdAt: e.created_at
        })),
        services: services.map(s => ({
          ...s,
          jobCardNumber: s.job_card_number,
          customerId: s.customer_id,
          customerName: s.customer_name,
          customerPhone: s.customer_phone,
          customerAddress: s.customer_address,
          serviceType: s.service_type,
          deviceOrSite: s.device_or_site,
          serialNumber: s.serial_number,
          reportedIssue: s.reported_issue,
          assignedTechnicianId: s.assigned_technician_id,
          assignedTechnicianName: s.assigned_technician_name,
          laborCost: s.labor_cost,
          totalBill: s.total_bill,
          paymentStatus: s.payment_status,
          paymentMethod: s.payment_method,
          scheduledDate: s.scheduled_date,
          completedDate: s.completed_date
        })),
        technicians: technicians.map(t => ({
          ...t,
          activeJobsCount: t.active_jobs_count,
          completedJobsCount: t.completed_jobs_count,
          totalEarnings: t.total_earnings
        })),
        warrantyClaims: warrantyClaims.map(wc => ({
          ...wc,
          claimNumber: wc.claim_number,
          serialNumber: wc.serial_number,
          productName: wc.product_name,
          customerId: wc.customer_id,
          customerName: wc.customer_name,
          customerPhone: wc.customer_phone,
          invoiceNumber: wc.invoice_number,
          issueDescription: wc.issue_description,
          claimDate: wc.claim_date,
          resolutionNotes: wc.resolution_notes,
          resolvedDate: wc.resolved_date
        })),
        investments: investments.map(i => ({
          ...i,
          referenceNumber: i.reference_number,
          investorName: i.investor_name,
          investmentType: i.investment_type,
          depositAccountId: i.deposit_account_id,
          paymentMethod: i.payment_method,
          createdBy: i.created_by
        })),
        employees: employees.map(e => ({
          ...e,
          monthlySalary: e.monthly_salary,
          salesCommissionRate: e.sales_commission_rate,
          joinedDate: e.joined_date,
          emergencyContact: e.emergency_contact
        })),
        attendance: attendance.map(a => ({
          ...a,
          employeeId: a.employee_id,
          employeeName: a.employee_name,
          checkInTime: a.check_in_time,
          checkOutTime: a.check_out_time
        })),
        inventoryTransactions: inventoryTransactions.map(it => ({
          ...it,
          transactionNumber: it.transaction_number,
          productId: it.product_id,
          productName: it.product_name,
          branchId: it.branch_id,
          fromBranchId: it.from_branch_id,
          toBranchId: it.to_branch_id,
          unitCost: it.unit_cost,
          totalValue: it.total_value,
          openingStock: it.opening_stock,
          closingStock: it.closing_stock,
          referenceType: it.reference_type,
          referenceId: it.reference_id,
          createdBy: it.created_by
        })),
        ledgerEntries: ledgerEntries.map(le => ({
          ...le,
          partyType: le.party_type,
          partyId: le.party_id,
          referenceType: le.reference_type,
          referenceNumber: le.reference_number,
          runningBalance: le.running_balance
        })),
        auditLogs: auditLogs.map(al => ({
          ...al,
          userId: al.user_id,
          userName: al.user_name,
          recordId: al.record_id,
          ipAddress: al.ip_address
        })),
        priceAuditLog: priceAuditLog.map(pa => ({
          ...pa,
          productId: pa.product_id,
          productName: pa.product_name,
          priceType: pa.price_type,
          oldPrice: pa.old_price,
          newPrice: pa.new_price,
          changedBy: pa.changed_by
        })),
        customerMergeAudit: customerMergeAudit.map(cma => ({
          ...cma,
          sourceCustomerId: cma.source_customer_id,
          sourceCustomerName: cma.source_customer_name,
          targetCustomerId: cma.target_customer_id,
          targetCustomerName: cma.target_customer_name,
          movedInvoicesCount: cma.moved_invoices_count,
          movedEmiAccountsCount: cma.moved_emi_accounts_count,
          movedServiceJobsCount: cma.moved_service_jobs_count,
          performedBy: cma.performed_by
        })),
        openingBalances: openingBalances.map(ob => ({
          ...ob,
          targetId: ob.target_id,
          targetName: ob.target_name,
          approvedBy: ob.approved_by,
          createdAt: ob.created_at
        }))
      }
    });
  } catch (err) {
    console.error('Bootstrap query error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
