// NEED ELECTRO ERP — High-Speed Unified Bootstrap Route (Prisma Engine)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to convert Prisma Decimals to Numbers for JSON frontend compatibility
function serializeRecord(record: any): any {
  if (record === null || record === undefined) return record;
  if (typeof record === 'bigint') return Number(record);
  if (record && typeof record === 'object') {
    // Check if Prisma Decimal
    if ('d' in record && 'e' in record && 's' in record) {
      return Number(record);
    }
    if (record instanceof Date) {
      return record.toISOString();
    }
    if (Array.isArray(record)) {
      return record.map(serializeRecord);
    }
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(record)) {
      res[k] = serializeRecord(v);
    }
    return res;
  }
  return record;
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);

    // 1. Settings & Configs
    const [
      settings,
      posSettings,
      inventoryRules,
      setupStatus,
      branches,
      categoriesConfig,
      brandsConfig,
      paymentMethodsConfig,
      expenseCategoriesConfig,
      serviceCategoriesConfig,
      warrantyRulesConfig,
      notificationTemplatesConfig,
      financialAccounts,
      emiPlans,
    ] = await Promise.all([
      prisma.systemSettings.findUnique({ where: { id: 'main' } }),
      prisma.posSettings.findUnique({ where: { id: 'main' } }),
      prisma.inventoryRules.findUnique({ where: { id: 'main' } }),
      prisma.setupStatus.findUnique({ where: { id: 'main' } }),
      prisma.branch.findMany({ orderBy: [{ isWarehouse: 'asc' }, { name: 'asc' }] }),
      prisma.categoryConfig.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.brandConfig.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.configurablePaymentMethod.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.expenseCategoryConfig.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.serviceCategoryConfig.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.warrantyRuleConfig.findMany({ where: { isActive: true } }),
      prisma.notificationTemplateConfig.findMany({ where: { isActive: true } }),
      prisma.financialAccount.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
      prisma.eMIPlan.findMany({ where: { isActive: true }, orderBy: { durationMonths: 'asc' } }),
    ]);

    const formattedSettings = settings ? {
      companyName: settings.companyName,
      companyTagline: settings.companyTagline,
      sisterConcern: settings.sisterConcern,
      mainBranchName: settings.mainBranchName,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      address: settings.address,
      binNumber: settings.binNumber,
      currency: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      invoicePrefix: settings.invoicePrefix,
      emiPrefix: settings.emiPrefix,
      defaultVatPercent: Number(settings.defaultVatPercent),
      enableSmsNotifications: settings.enableSmsNotifications,
      enableWhatsappNotifications: settings.enableWhatsappNotifications,
      theme: settings.theme,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      facebookUrl: settings.facebookUrl,
      youtubeUrl: settings.youtubeUrl,
      linkedinUrl: settings.linkedinUrl,
      whatsappNumber: settings.whatsappNumber,
      supportEmail: settings.supportEmail,
      footerText: settings.footerText,
      accentColor: settings.accentColor,
    } : {
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      address: 'Central Road, Moulvibazar, Sylhet, Bangladesh',
      currency: 'BDT',
      currencySymbol: '৳',
      invoicePrefix: 'INV-2026-',
      emiPrefix: 'EMI-2026-',
      defaultVatPercent: 5,
      theme: 'dark',
      accentColor: '#008CFF',
    };

    const formattedPosSettings = posSettings ? {
      invoicePrefix: posSettings.invoicePrefix,
      nextInvoiceNumber: posSettings.nextInvoiceNumber,
      returnWindowDays: posSettings.returnWindowDays,
      enablePosDiscounts: posSettings.enablePosDiscounts,
      maxDiscountPercent: Number(posSettings.maxDiscountPercent),
      enableCreditSales: posSettings.enableCreditSales,
      requireCustomerPhone: posSettings.requireCustomerPhone,
      defaultInvoiceNotes: posSettings.defaultInvoiceNotes || '',
      receiptFooterText: posSettings.receiptFooterText || '',
      taxPercent: Number(posSettings.taxPercent),
      printLogoOnReceipt: posSettings.printLogoOnReceipt,
      printWarrantyOnReceipt: posSettings.printWarrantyOnReceipt,
    } : {
      invoicePrefix: 'INV-2026-',
      nextInvoiceNumber: 1001,
      returnWindowDays: 7,
      enablePosDiscounts: true,
      maxDiscountPercent: 15,
      enableCreditSales: true,
      requireCustomerPhone: true,
      taxPercent: 5,
      printLogoOnReceipt: true,
      printWarrantyOnReceipt: true,
    };

    const formattedInventoryRules = inventoryRules ? {
      lowStockThresholdDefault: inventoryRules.lowStockThresholdDefault,
      enableOutOfStockWarnings: inventoryRules.enableOutOfStockWarnings,
      allowNegativeStock: inventoryRules.allowNegativeStock,
      requireSerialOnPurchase: inventoryRules.requireSerialOnPurchase,
      requireSerialOnSale: inventoryRules.requireSerialOnSale,
      autoGenerateSerials: inventoryRules.autoGenerateSerials,
      defaultSerialPrefix: inventoryRules.defaultSerialPrefix,
    } : {
      lowStockThresholdDefault: 3,
      enableOutOfStockWarnings: true,
      allowNegativeStock: false,
      requireSerialOnPurchase: true,
      requireSerialOnSale: true,
      autoGenerateSerials: true,
      defaultSerialPrefix: 'NEC-SN-',
    };

    // If unauthenticated, return public branding, branch list and setup status
    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        data: {
          settings: formattedSettings,
          posSettings: formattedPosSettings,
          inventoryRules: formattedInventoryRules,
          setupStatus: setupStatus ? { initialSetupCompleted: setupStatus.initialSetupCompleted } : { initialSetupCompleted: false },
          branches: branches.map(b => ({
            id: b.id,
            name: b.name,
            code: b.code,
            address: b.address || '',
            phone: b.phone || '',
            email: b.email || '',
            isWarehouse: b.isWarehouse,
            active: b.active,
          })),
        },
      });
    }

    // Authenticated: fetch complete business state
    const [
      roles,
      permissionsList,
      users,
      products,
      serials,
      customers,
      suppliers,
      sales,
      purchases,
      returns,
      expenses,
      services,
      technicians,
      warrantyClaims,
      investments,
      employees,
      attendance,
      emiAccounts,
      emiPayments,
      inventoryTransactions,
      ledgerEntries,
      auditLogs,
      priceAuditLog,
      customerMergeAudit,
      openingBalances,
    ] = await Promise.all([
      prisma.role.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }] }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          roleId: true,
          branchId: true,
          primaryBranchId: true,
          allowedBranchIds: true,
          phone: true,
          employeeId: true,
          avatar: true,
          active: true,
          status: true,
          mustChangePassword: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.productSerial.findMany({ orderBy: { serialNumber: 'asc' } }),
      prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.sale.findMany({
        include: { items: true },
        orderBy: { date: 'desc' },
        take: 500,
      }),
      prisma.purchase.findMany({
        include: { items: true },
        orderBy: { date: 'desc' },
        take: 200,
      }),
      prisma.productReturn.findMany({ orderBy: { date: 'desc' } }),
      prisma.expense.findMany({ orderBy: { date: 'desc' }, take: 300 }),
      prisma.serviceJob.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.technician.findMany({ orderBy: { name: 'asc' } }),
      prisma.warrantyClaim.findMany({ orderBy: { claimDate: 'desc' } }),
      prisma.investment.findMany({ orderBy: { date: 'desc' } }),
      prisma.employee.findMany({ orderBy: { joinedDate: 'desc' } }),
      prisma.attendance.findMany({ orderBy: { date: 'desc' }, take: 100 }),
      prisma.eMIAccount.findMany({
        include: { installments: { orderBy: { installmentNumber: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eMIPayment.findMany({ orderBy: { paymentDate: 'desc' }, take: 300 }),
      prisma.inventoryTransaction.findMany({ orderBy: { date: 'desc' }, take: 500 }),
      prisma.ledgerEntry.findMany({ orderBy: { date: 'desc' }, take: 500 }),
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 }),
      prisma.priceAudit.findMany({ orderBy: { timestamp: 'desc' }, take: 100 }),
      prisma.customerMergeAudit.findMany({ orderBy: { timestamp: 'desc' } }),
      prisma.openingBalance.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    // Shape sales and items to match erpStore expected interfaces
    const formattedSales = sales.map(s => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      customerId: s.customerId,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      branchId: s.branchId,
      date: s.date.toISOString().split('T')[0],
      createdAt: s.createdAt ? s.createdAt.toISOString() : s.date.toISOString(),
      subtotal: Number(s.subtotal),
      overallDiscount: Number(s.overallDiscount),
      vatAmount: Number(s.vatAmount),
      vatPercent: Number(s.vatPercent),
      grandTotal: Number(s.grandTotal),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      payments: s.payments || [],
      saleType: s.saleType,
      emiAccountId: s.emiAccountId,
      status: s.status,
      salespersonId: s.salespersonId,
      salespersonName: s.salespersonName,
      notes: s.notes,
      items: s.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        total: Number(item.total),
        warrantyMonths: item.warrantyMonths,
        isSerialized: item.isSerialized,
        serialNumbers: Array.isArray(item.serialNumbers) ? item.serialNumbers : [],
      })),
    }));

    // Shape emi accounts to match erpStore interfaces
    const formattedEmiAccounts = emiAccounts.map(e => ({
      id: e.id,
      emiNumber: e.emiNumber,
      saleInvoiceId: e.saleInvoiceId,
      customerId: e.customerId,
      customerName: e.customerName,
      customerPhone: e.customerPhone,
      customerAddress: e.customerAddress,
      customerNid: e.customerNid,
      guarantor: e.guarantor || {},
      productId: e.productId,
      productName: e.productName,
      serialNumber: e.serialNumber,
      laptopPrice: Number(e.laptopPrice),
      downPayment: Number(e.downPayment),
      financedAmount: Number(e.financedAmount),
      durationMonths: e.durationMonths,
      monthlyInstallment: Number(e.monthlyInstallment),
      totalPayable: Number(e.totalPayable),
      totalPaid: Number(e.totalPaid),
      remainingBalance: Number(e.remainingBalance),
      startDate: e.startDate.toISOString().split('T')[0],
      endDate: e.endDate.toISOString().split('T')[0],
      status: e.status,
      contractTerms: e.contractTerms,
      approvedBy: e.approvedBy,
      createdAt: e.createdAt.toISOString().split('T')[0],
      installments: e.installments.map(ins => ({
        id: ins.id,
        emiAccountId: ins.emiAccountId,
        installmentNumber: ins.installmentNumber,
        dueDate: ins.dueDate.toISOString().split('T')[0],
        amount: Number(ins.amount),
        penaltyAmount: Number(ins.penaltyAmount),
        paidAmount: Number(ins.paidAmount),
        paidDate: ins.paidDate ? ins.paidDate.toISOString().split('T')[0] : undefined,
        status: ins.status,
        receiptNumber: ins.receiptNumber,
        paymentMethod: ins.paymentMethod,
      })),
    }));

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        settings: formattedSettings,
        posSettings: formattedPosSettings,
        inventoryRules: formattedInventoryRules,
        setupStatus: setupStatus ? { initialSetupCompleted: setupStatus.initialSetupCompleted } : { initialSetupCompleted: true },
        branches: serializeRecord(branches),
        categoriesConfig: serializeRecord(categoriesConfig),
        brandsConfig: serializeRecord(brandsConfig),
        paymentMethodsConfig: serializeRecord(paymentMethodsConfig),
        expenseCategoriesConfig: serializeRecord(expenseCategoriesConfig),
        serviceCategoriesConfig: serializeRecord(serviceCategoriesConfig),
        warrantyRulesConfig: serializeRecord(warrantyRulesConfig),
        notificationTemplatesConfig: serializeRecord(notificationTemplatesConfig),
        financialAccounts: serializeRecord(financialAccounts),
        emiPlans: serializeRecord(emiPlans),
        roles: serializeRecord(roles),
        permissionsList: serializeRecord(permissionsList),
        users: serializeRecord(users),
        products: serializeRecord(products),
        serials: serializeRecord(serials),
        customers: serializeRecord(customers),
        suppliers: serializeRecord(suppliers),
        sales: formattedSales,
        purchases: serializeRecord(purchases),
        returns: serializeRecord(returns),
        expenses: serializeRecord(expenses),
        services: serializeRecord(services),
        technicians: serializeRecord(technicians),
        warrantyClaims: serializeRecord(warrantyClaims),
        investments: serializeRecord(investments),
        employees: serializeRecord(employees),
        attendance: serializeRecord(attendance),
        emiAccounts: formattedEmiAccounts,
        emiPayments: serializeRecord(emiPayments),
        inventoryTransactions: serializeRecord(inventoryTransactions),
        ledgerEntries: serializeRecord(ledgerEntries),
        auditLogs: serializeRecord(auditLogs),
        priceAuditLog: serializeRecord(priceAuditLog),
        customerMergeAudit: serializeRecord(customerMergeAudit),
        openingBalances: serializeRecord(openingBalances),
      },
    });
  } catch (err: any) {
    console.error('Bootstrap API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
