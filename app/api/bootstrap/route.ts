// NEED ELECTRO ERP — High-Speed Unified Bootstrap Route (Prisma Engine)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';
import { syncStoredBalancesWithLedger } from '@/lib/accounting';

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

    // Ensure financial account balances match ledger entries
    try {
      await syncStoredBalancesWithLedger();
    } catch (e: any) {
      console.warn('Sync balances during bootstrap warning:', e.message);
    }

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

    let activeEmiPlans = emiPlans;
    if (activeEmiPlans.length === 0) {
      const defaultPlans = [
        {
          id: 'emi-plan-3m',
          name: '3 Months Quick Tech Plan',
          durationMonths: 3,
          minDownPaymentPercent: new Prisma.Decimal(30),
          interestRatePercent: new Prisma.Decimal(0),
          processingFee: new Prisma.Decimal(300),
          lateFeePerDay: new Prisma.Decimal(50),
          gracePeriodDays: 5,
          isActive: true,
          version: 1,
          description: 'Short 3-month plan with 30% down payment and 0% interest.',
          eligibilityRules: 'Requires National ID & verified local guarantor.',
          termsText: 'Default beyond 15 days results in hardware warranty suspension.'
        },
        {
          id: 'emi-plan-6m',
          name: '6 Months Popular Laptop Plan',
          durationMonths: 6,
          minDownPaymentPercent: new Prisma.Decimal(25),
          interestRatePercent: new Prisma.Decimal(0),
          processingFee: new Prisma.Decimal(500),
          lateFeePerDay: new Prisma.Decimal(50),
          gracePeriodDays: 5,
          isActive: true,
          version: 1,
          description: 'Standard 6-month laptop financing with 0% interest.',
          eligibilityRules: 'Original NID copy, utility bill, and one verified guarantor.',
          termsText: 'Monthly installment due within 10th of every calendar month.'
        },
        {
          id: 'emi-plan-9m',
          name: '9 Months Easy Installment',
          durationMonths: 9,
          minDownPaymentPercent: new Prisma.Decimal(20),
          interestRatePercent: new Prisma.Decimal(2),
          processingFee: new Prisma.Decimal(800),
          lateFeePerDay: new Prisma.Decimal(50),
          gracePeriodDays: 7,
          isActive: true,
          version: 1,
          description: 'Extended 9-month plan with flexible low monthly payments.',
          eligibilityRules: 'Valid trade license or employee salary slip required.',
          termsText: 'Hardware warranty remains valid subject to regular installment payments.'
        },
        {
          id: 'emi-plan-12m',
          name: '12 Months Enterprise Student/Pro Plan',
          durationMonths: 12,
          minDownPaymentPercent: new Prisma.Decimal(20),
          interestRatePercent: new Prisma.Decimal(4),
          processingFee: new Prisma.Decimal(1000),
          lateFeePerDay: new Prisma.Decimal(50),
          gracePeriodDays: 7,
          isActive: true,
          version: 1,
          description: 'Annual 12-month installment plan for students and professionals.',
          eligibilityRules: 'Strict background verification with two local guarantors.',
          termsText: 'Ownership transfer completed upon payment of final installment receipt.'
        }
      ];

      for (const dp of defaultPlans) {
        await prisma.eMIPlan.upsert({ where: { id: dp.id }, update: dp, create: dp });
      }
      activeEmiPlans = await prisma.eMIPlan.findMany({ where: { isActive: true }, orderBy: { durationMonths: 'asc' } });
    }

    let activeFinancialAccounts = financialAccounts;
    if (activeFinancialAccounts.length === 0) {
      const defaultAccounts = [
        {
          id: "acc-1",
          name: "Main Cash Drawer (Moulvibazar Showroom)",
          type: "CASH",
          accountNumber: "CASH-MB-01",
          bankName: "Cash in Hand Vault",
          branchName: "Moulvibazar Main",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        },
        {
          id: "acc-ebl-amdadur",
          name: "Eastern Bank - Amdadur Rahman",
          type: "BANK",
          accountNumber: "EBL-AMDADUR",
          bankName: "Eastern Bank PLC",
          branchName: "Moulvibazar Branch",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        },
        {
          id: "acc-pubali-amdadur",
          name: "Pubali Bank - Amdadur Rahman",
          type: "BANK",
          accountNumber: "PUBALI-AMDADUR",
          bankName: "Pubali Bank PLC",
          branchName: "Moulvibazar Branch",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        },
        {
          id: "acc-pubali-fulori",
          name: "Pubali Bank - Fulori Miha",
          type: "BANK",
          accountNumber: "PUBALI-FULORI",
          bankName: "Pubali Bank PLC",
          branchName: "Moulvibazar Branch",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        },
        {
          id: "acc-bkash-primary",
          name: "bKash Payment (01884599271)",
          type: "MOBILE_BANKING",
          accountNumber: "01884599271",
          bankName: "bKash Limited",
          branchName: "Official Payment Wallet",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        },
        {
          id: "acc-nagad-primary",
          name: "Nagad Payment Wallet (01733-983752)",
          type: "MOBILE_BANKING",
          accountNumber: "01733-983752",
          bankName: "Nagad (Bangladesh Post Office)",
          branchName: "Official Merchant Wallet",
          balance: new Prisma.Decimal(0),
          currency: "BDT",
          isActive: true
        }
      ];

      for (const da of defaultAccounts) {
        await prisma.financialAccount.upsert({ where: { id: da.id }, update: da, create: da });
      }
      activeFinancialAccounts = await prisma.financialAccount.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    }

    let activePaymentMethods = paymentMethodsConfig;
    if (activePaymentMethods.length === 0) {
      const defaultMethods = [
        { id: 'pm-1', name: 'Cash', code: 'CASH', type: 'CASH', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: new Prisma.Decimal(0), instructions: 'Accepted at counter. Verify currency security strips.', isActive: true, sortOrder: 1 },
        { id: 'pm-2', name: 'bKash Payment (01884599271)', code: 'BKASH', type: 'MFS', linkedAccountId: 'acc-bkash-primary', accountNumber: '01884599271', chargePercent: new Prisma.Decimal(0), instructions: 'Payment / Send Money to 01884599271. Verify TrxID at billing counter.', isActive: true, sortOrder: 2 },
        { id: 'pm-3', name: 'Eastern Bank - Amdadur Rahman', code: 'EASTERN_BANK', type: 'BANK', linkedAccountId: 'acc-ebl-amdadur', accountNumber: 'EBL-AMDADUR', chargePercent: new Prisma.Decimal(0), instructions: 'BEFTN / NPSB / RTGS transfer to Eastern Bank — Account: Amdadur Rahman.', isActive: true, sortOrder: 3 },
        { id: 'pm-4', name: 'Pubali Bank - Amdadur Rahman', code: 'PUBALI_AMDADUR', type: 'BANK', linkedAccountId: 'acc-pubali-amdadur', accountNumber: 'PUBALI-AMDADUR', chargePercent: new Prisma.Decimal(0), instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Amdadur Rahman.', isActive: true, sortOrder: 4 },
        { id: 'pm-5', name: 'Pubali Bank - Fulori Miha', code: 'PUBALI_FULORI', type: 'BANK', linkedAccountId: 'acc-pubali-fulori', accountNumber: 'PUBALI-FULORI', chargePercent: new Prisma.Decimal(0), instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Fulori Miha.', isActive: true, sortOrder: 5 },
        { id: 'pm-6', name: 'Credit / Debit Card (POS)', code: 'CARD_POS', type: 'CARD', linkedAccountId: 'acc-ebl-amdadur', accountNumber: '', chargePercent: new Prisma.Decimal(1.5), instructions: 'Visa, MasterCard, Amex via counter POS swipe.', isActive: true, sortOrder: 6 },
        { id: 'pm-7', name: 'Credit / Customer Due', code: 'CREDIT_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: new Prisma.Decimal(0), instructions: 'Allowed only for pre-approved credit accounts.', isActive: true, sortOrder: 7 },
        { id: 'pm-8', name: 'Laptop EMI Facility', code: 'EMI_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: new Prisma.Decimal(0), instructions: 'Financed via Need Electro EMI installment system.', isActive: true, sortOrder: 8 }
      ];

      for (const dm of defaultMethods) {
        await prisma.configurablePaymentMethod.upsert({ where: { id: dm.id }, update: dm, create: dm });
      }
      activePaymentMethods = await prisma.configurablePaymentMethod.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    }

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
      otherIncomes,
      ownerWithdrawals,
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
      prisma.otherIncome.findMany({ orderBy: { date: 'desc' }, take: 200 }),
      prisma.ownerWithdrawal.findMany({ orderBy: { date: 'desc' }, take: 200 }),
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
        paymentMethodsConfig: serializeRecord(activePaymentMethods),
        expenseCategoriesConfig: serializeRecord(expenseCategoriesConfig),
        serviceCategoriesConfig: serializeRecord(serviceCategoriesConfig),
        warrantyRulesConfig: serializeRecord(warrantyRulesConfig),
        notificationTemplatesConfig: serializeRecord(notificationTemplatesConfig),
        financialAccounts: serializeRecord(activeFinancialAccounts),
        emiPlans: serializeRecord(activeEmiPlans),
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
        otherIncomes: serializeRecord(otherIncomes),
        ownerWithdrawals: serializeRecord(ownerWithdrawals),
      },
    });
  } catch (err: any) {
    console.error('Bootstrap API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
