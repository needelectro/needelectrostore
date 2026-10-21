// NEED ELECTRO ERP — Centralized Typed API Client
// Communicates with backend Express server & SQLite production database

const TOKEN_KEY = 'NEED_ELECTRO_AUTH_TOKEN_V1';

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setSessionToken(token: string, rememberMe = true): void {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.error('Failed to store session token:', e);
  }
}

export function clearSessionToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear session token:', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // 1. Auth & RBAC
  auth: {
    getSetupStatus: () => request<{ success: boolean; data: any }>('/api/auth/setup-status'),
    initialSetup: (payload: any) => request<{ success: boolean; message: string }>('/api/auth/initial-setup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    login: (email: string, password: string, rememberMe = true, branchId?: string) =>
      request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe, branchId })
      }),
    logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
    getSession: () => request<{ success: boolean; user: any }>('/api/auth/session'),
    unlock: (password: string) => request<{ success: boolean }>('/api/auth/unlock', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
    changePassword: (oldPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      }),
    getUsers: () => request<{ success: boolean; data: any[] }>('/api/auth/users'),
    createUser: (userData: any) => request<{ success: boolean; message: string; user: any }>('/api/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    updateUser: (id: string, userData: any) => request<{ success: boolean; message: string }>(`/api/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
    setUserStatus: (id: string, status: string) => request<{ success: boolean; message: string }>(`/api/auth/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
    resetPassword: (id: string, newPassword: string) =>
      request<{ success: boolean; message: string }>(`/api/auth/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      }),
    deleteUser: (id: string, permanent: boolean = true) => request<{ success: boolean; message: string }>(`/api/auth/users/${id}${permanent ? '?permanent=true&force=true' : ''}`, {
      method: 'DELETE'
    }),
    getRoles: () => request<{ success: boolean; data: any[] }>('/api/auth/roles'),
    createRole: (roleData: any) => request<{ success: boolean; message: string; roleId: string }>('/api/auth/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    }),
    updateRole: (id: string, roleData: any) => request<{ success: boolean; message: string }>(`/api/auth/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    }),
    deleteRole: (id: string) => request<{ success: boolean; message: string }>(`/api/auth/roles/${id}`, {
      method: 'DELETE'
    }),
    getPermissions: () => request<{ success: boolean; data: any[] }>('/api/auth/permissions'),
    getLoginHistory: () => request<{ success: boolean; data: any[] }>('/api/auth/login-history')
  },

  // Database Configuration & Health Management
  database: {
    getStatus: () => request<{ success: boolean; data: any }>('/api/admin/database/status'),
    testConnection: (data: { databaseUrl: string }) =>
      request<{ success: boolean; data?: any; error?: string }>('/api/admin/database/test-connection', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    seedPermissions: () =>
      request<{ success: boolean; message: string; count: number }>('/api/admin/database/seed-permissions', {
        method: 'POST'
      }),
    repairSystem: () =>
      request<{ success: boolean; message: string; summary: any }>('/api/admin/database/repair-system', {
        method: 'POST'
      }),
  },

  // 2. High-Speed Bootstrap Sync
  bootstrap: {
    getAll: () => request<{ success: boolean; data: any }>('/api/bootstrap')
  },

  // 3. Sales & POS
  sales: {
    getSales: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[]; total?: number; stats?: any }>(`/api/sales${q}`);
    },
    getSale: (id: string) => request<{ success: boolean; data: any }>(`/api/sales/${id}`),
    createSale: (saleData: any, emiPlanConfig?: any, paymentAccountId?: string) =>
      request<{ success: boolean; message: string; sale: any }>('/api/sales', {
        method: 'POST',
        body: JSON.stringify({ saleData, emiPlanConfig, paymentAccountId })
      }),
    updateSale: (id: string, updates: any) =>
      request<{ success: boolean; data: any; message?: string }>(`/api/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    recordPayment: (id: string, paymentData: { amount: number; paymentMethod: string; accountId?: string; reference?: string; notes?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/api/sales/${id}/payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      }),
    deleteSale: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/sales/${id}`, {
        method: 'DELETE'
      })
  },

  // 4. Laptop EMI Subsystem
  emi: {
    getAccounts: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/emi/accounts${q}`);
    },
    updateAccount: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/api/emi/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteAccount: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/emi/accounts/${id}`, {
        method: 'DELETE'
      }),
    collectPayment: (payload: {
      emiAccountId: string;
      installmentId: string;
      amount: number;
      penaltyAmount?: number;
      paymentMethod?: string;
      ref?: string;
      notes?: string;
      accountId?: string;
    }) => request<{ success: boolean; message: string; receiptNumber: string; data: any }>('/api/emi/collect', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    getPlans: (params?: { reset?: boolean }) => {
      const q = params?.reset ? '?reset=true' : '';
      return request<{ success: boolean; data: any[] }>(`/api/emi/plans${q}`);
    },
    savePlan: (plan: any) => request<{ success: boolean; message: string; plan?: any }>('/api/emi/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),
    deletePlan: (id: string) => request<{ success: boolean; message: string }>(`/api/emi/plans?id=${id}`, {
      method: 'DELETE'
    })
  },

  // 5. Products & Inventory
  products: {
    getProducts: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/products${q}`);
    },
    createProduct: (productData: any, initialSerials?: string[]) =>
      request<{ success: boolean; message: string; product: any; expense?: any }>('/api/products', {
        method: 'POST',
        body: JSON.stringify({ productData, initialSerials })
      }),
    updateProduct: (id: string, productData: any) =>
      request<{ success: boolean; message: string }>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      }),
    deleteProduct: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/products/${id}`, {
        method: 'DELETE'
      }),
    updatePrice: (id: string, updates: any, reason: string) =>
      request<{ success: boolean; message: string }>(`/api/products/${id}/price`, {
        method: 'POST',
        body: JSON.stringify({ ...updates, reason })
      }),
    stockAdjust: (payload: { productId: string; branchId: string; quantityDiff: number; reason: string; serialNumbers?: string[] }) =>
      request<{ success: boolean; message: string }>('/api/products/stock-adjust', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    stockTransfer: (payload: { productId: string; fromBranchId: string; toBranchId: string; quantity: number; serialNumbers?: string[] }) =>
      request<{ success: boolean; message: string }>('/api/products/stock-transfer', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // 6. Customers & CRM
  customers: {
    getCustomers: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/customers${q}`);
    },
    createCustomer: (customerData: any) =>
      request<{ success: boolean; message: string; customer: any }>('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      }),
    updateCustomer: (id: string, customerData: any) =>
      request<{ success: boolean; message: string }>(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData)
      }),
    deleteCustomer: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/customers/${id}`, {
        method: 'DELETE'
      }),
    getLedger: (id: string) =>
      request<{ success: boolean; customer: any; ledger: any[] }>(`/api/customers/${id}/ledger`),
    mergeCustomers: (sourceCustomerId: string, targetCustomerId: string, reason: string) =>
      request<{ success: boolean; message: string; data: any }>('/api/customers/merge', {
        method: 'POST',
        body: JSON.stringify({ sourceCustomerId, targetCustomerId, reason })
      }),
    collectDue: (id: string, payload: { amount: number; paymentMethod?: string; accountId?: string; reference?: string; notes?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/api/customers/${id}/collect-due`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // 7. Suppliers & Purchases
  suppliers: {
    getSuppliers: () => request<{ success: boolean; data: any[] }>('/api/suppliers'),
    createSupplier: (supplierData: any) =>
      request<{ success: boolean; message: string; supplierId: string }>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData)
      }),
    updateSupplier: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteSupplier: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/suppliers/${id}`, {
        method: 'DELETE'
      }),
    recordPayment: (id: string, payload: any) =>
      request<{ success: boolean; message: string; data: any }>(`/api/suppliers/${id}/payment`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getLedger: (id: string) =>
      request<{ success: boolean; supplier: any; ledger: any[] }>(`/api/suppliers/${id}/ledger`)
  },
  purchases: {
    getPurchases: () => request<{ success: boolean; data: any[] }>('/api/purchases'),
    createPurchase: (payload: any) =>
      request<{ success: boolean; message: string; purchase: any }>('/api/purchases', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updatePurchase: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/api/purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deletePurchase: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/purchases/${id}`, {
        method: 'DELETE'
      })
  },

  // 8. Returns & RMA
  returns: {
    getReturns: () => request<{ success: boolean; data: any[] }>('/api/returns'),
    createReturn: (returnData: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/returns', {
        method: 'POST',
        body: JSON.stringify(returnData)
      }),
    updateReturn: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/api/returns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteReturn: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/returns/${id}`, {
        method: 'DELETE'
      })
  },

  // 9. Expenses
  expenses: {
    getExpenses: () => request<{ success: boolean; data: any[] }>('/api/expenses'),
    createExpense: (expenseData: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData)
      }),
    updateExpense: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/api/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteExpense: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
  },

  // 10. Services
  services: {
    getServices: () => request<{ success: boolean; data: any[] }>('/api/services'),
    createService: (jobData: any) =>
      request<{ success: boolean; message: string; jobId: string; jobCardNumber: string }>('/api/services', {
        method: 'POST',
        body: JSON.stringify(jobData)
      }),
    updateService: (id: string, updates: any) =>
      request<{ success: boolean; message: string }>(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteService: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/services/${id}`, {
        method: 'DELETE'
      })
  },

  // 11. Warranty
  warranty: {
    getClaims: () => request<{ success: boolean; data: any[] }>('/api/warranty/claims'),
    createClaim: (claimData: any) =>
      request<{ success: boolean; message: string; claimNumber: string }>('/api/warranty/claims', {
        method: 'POST',
        body: JSON.stringify(claimData)
      }),
    resolveClaim: (id: string, updates: any) =>
      request<{ success: boolean; message: string }>(`/api/warranty/claims/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteClaim: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/warranty/claims/${id}`, {
        method: 'DELETE'
      })
  },

  // 12. Accounting & Overview
  accounting: {
    getOverview: () => request<{ success: boolean; data: any }>('/api/accounting/overview'),
    transferFunds: (payload: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/accounting/transfer', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    recordInvestment: (payload: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/accounting/investments', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateInvestment: (payload: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/accounting/investments', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteInvestment: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/accounting/investments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      }),
    getInvestments: () =>
      request<{ success: boolean; data: any[] }>('/api/accounting/investments'),
    recordOpeningBalance: (payload: any) =>
      request<{ success: boolean; message: string }>('/api/accounting/opening-balances', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getLedger: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any }>(`/api/accounting/ledger${q}`);
    },
    reverseTransaction: (payload: { referenceNumber: string; reason: string }) =>
      request<{ success: boolean; message: string; data?: any }>('/api/accounting/ledger', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getCashFlow: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any }>(`/api/accounting/cash-flow${q}`);
    },
    recordOtherIncome: (payload: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/accounting/other-income', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getOtherIncomes: () =>
      request<{ success: boolean; data: any[] }>('/api/accounting/other-income'),
    recordWithdrawal: (payload: any) =>
      request<{ success: boolean; message: string; data: any }>('/api/accounting/withdrawals', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getWithdrawals: () =>
      request<{ success: boolean; data: any[] }>('/api/accounting/withdrawals')
  },

  // 12.1 Cash Management & Drawer Engine
  cashManagement: {
    getCashSummary: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any }>(`/api/cash-management${q}`);
    },
    createAdjustment: (payload: { amount: number; type: 'INFLOW' | 'OUTFLOW'; reason: string; accountId?: string; paymentMethod?: string; reference?: string; notes?: string; branchId?: string }) =>
      request<{ success: boolean; message: string; data: any }>('/api/cash-management/adjustments', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    recordAdjustment: (payload: { amount: number; type: 'INFLOW' | 'OUTFLOW'; reason: string; accountId?: string; paymentMethod?: string; reference?: string; notes?: string; branchId?: string }) =>
      request<{ success: boolean; message: string; data: any }>('/api/cash-management/adjustments', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    recordCashCount: (countData: any) =>
      request<{ success: boolean; message: string; countNumber: string; difference: number; adjustmentApplied: boolean; error?: string }>('/api/cash-management/count', {
        method: 'POST',
        body: JSON.stringify(countData)
      }),
    getReconciliations: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/cash-management/count${q}`);
    }
  },

  // 13. Reports
  reports: {
    generate: (params: { reportType: string; startDate?: string; endDate?: string; branchId?: string }) => {
      const q = '?' + new URLSearchParams(params).toString();
      return request<{ success: boolean; reportType: string; period: any; data: any[] }>(`/api/reports/generate${q}`);
    }
  },

  // 14. Settings & Control Center
  settings: {
    updateSettings: (settings: any) =>
      request<{ success: boolean; message: string }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      }),
    updatePosSettings: (pos: any) =>
      request<{ success: boolean; message: string }>('/api/settings/pos', {
        method: 'PUT',
        body: JSON.stringify(pos)
      }),
    updateInventoryRules: (rules: any) =>
      request<{ success: boolean; message: string }>('/api/settings/inventory-rules', {
        method: 'PUT',
        body: JSON.stringify(rules)
      }),
    addBranch: (branch: any) =>
      request<{ success: boolean; message: string; branchId: string; branch?: any }>('/api/settings/branches', {
        method: 'POST',
        body: JSON.stringify(branch)
      }),
    updateBranch: (id: string, branch: any) =>
      request<{ success: boolean; message: string; branch?: any }>(`/api/settings/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(branch)
      }),
    deleteBranch: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/branches/${id}`, {
        method: 'DELETE'
      }),
    saveCategory: (category: any) =>
      request<{ success: boolean; message: string }>('/api/settings/categories', {
        method: 'POST',
        body: JSON.stringify(category)
      }),
    deleteCategory: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/categories/${id}`, {
        method: 'DELETE'
      }),
    savePaymentMethod: (pm: any) =>
      request<{ success: boolean; message: string }>('/api/settings/payment-methods', {
        method: 'POST',
        body: JSON.stringify(pm)
      }),
    deletePaymentMethod: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/payment-methods/${id}`, {
        method: 'DELETE'
      }),
    saveBrand: (brand: any) =>
      request<{ success: boolean; message: string }>('/api/settings/brands', {
        method: 'POST',
        body: JSON.stringify(brand)
      }),
    deleteBrand: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/brands/${id}`, {
        method: 'DELETE'
      }),
    saveExpenseCategory: (cat: any) =>
      request<{ success: boolean; message: string }>('/api/settings/expense-categories', {
        method: 'POST',
        body: JSON.stringify(cat)
      }),
    deleteExpenseCategory: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/expense-categories/${id}`, {
        method: 'DELETE'
      }),
    saveServiceCategory: (sc: any) =>
      request<{ success: boolean; message: string }>('/api/settings/service-categories', {
        method: 'POST',
        body: JSON.stringify(sc)
      }),
    deleteServiceCategory: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/service-categories/${id}`, {
        method: 'DELETE'
      }),
    saveWarrantyRule: (wr: any) =>
      request<{ success: boolean; message: string }>('/api/settings/warranty-rules', {
        method: 'POST',
        body: JSON.stringify(wr)
      }),
    deleteWarrantyRule: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/warranty-rules/${id}`, {
        method: 'DELETE'
      }),
    saveNotificationTemplate: (tpl: any) =>
      request<{ success: boolean; message: string }>('/api/settings/notification-templates', {
        method: 'POST',
        body: JSON.stringify(tpl)
      }),
    deleteNotificationTemplate: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/settings/notification-templates/${id}`, {
        method: 'DELETE'
      })
  },

  // 15. Audit Logs
  audit: {
    getLogs: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/audit${q}`);
    }
  },

  // 16. Database Backup & Recovery
  backup: {
    create: () => request<{ success: boolean; message: string; backup: any }>('/api/backup/create', { method: 'POST' }),
    list: () => request<{ success: boolean; data: any[] }>('/api/backup/list'),
    restore: (filename: string) => request<{ success: boolean; message: string; safetySnapshot: string }>('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ filename })
    })
  },

  // 17. Data Import
  importData: {
    validate: (entityType: string, rows: any[]) =>
      request<{ success: boolean; summary: any; errors: any[]; duplicates: any[]; preview: any[] }>('/api/import/validate', {
        method: 'POST',
        body: JSON.stringify({ entityType, rows })
      }),
    commit: (entityType: string, validRows: any[]) =>
      request<{ success: boolean; message: string; importedCount: number }>('/api/import/commit', {
        method: 'POST',
        body: JSON.stringify({ entityType, validRows })
      })
  },

  // 18. Platform Data Reset System
  systemReset: {
    execute: (mode: 'CLEAN_BUSINESS_DATA' | 'FULL_FACTORY_RESET', confirmationKeyword: string) =>
      request<{ success: boolean; message: string; mode: string; purgedTables: string[]; timestamp?: string }>('/api/admin/reset-system', {
        method: 'POST',
        body: JSON.stringify({ mode, confirmationKeyword })
      })
  },

  // 19. Storage & Image Upload
  storage: {
    uploadFile: (file: File, folder: string = 'products') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      return uploadRequest<{ success: boolean; publicUrl: string; fileName: string; error?: string }>('/api/storage/upload', formData);
    }
  },

  // 20. Banners & Homepage Content
  banners: {
    getBanners: (params?: { activeOnly?: boolean; placement?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return request<{ success: boolean; data: any[] }>(`/api/banners${q}`);
    },
    createBanner: (bannerData: any) =>
      request<{ success: boolean; message: string; banner: any }>('/api/banners', {
        method: 'POST',
        body: JSON.stringify(bannerData)
      }),
    updateBanner: (id: string, updates: any) =>
      request<{ success: boolean; message: string; banner: any }>(`/api/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    deleteBanner: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/banners/${id}`, {
        method: 'DELETE'
      })
  },

  // 21. Website Orders & Online Checkout
  websiteOrders: {
    getOrders: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; data: any[]; count?: number }>(`/api/orders${q}`);
    },
    getOrder: (id: string) => request<{ success: boolean; data: any }>(`/api/orders/${id}`),
    createOrder: (orderData: any) =>
      request<{ success: boolean; message: string; order: any; sale?: any }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    updateOrderStatus: (id: string, updates: { orderStatus?: string; paymentStatus?: string; fulfillmentStatus?: string; notes?: string }) =>
      request<{ success: boolean; message: string; order: any }>(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
  },

  // 22. Website Dashboard & Analytics
  websiteDashboard: {
    getStats: () => request<{ success: boolean; data: any }>('/api/website-dashboard')
  },

  // 23. Website Pages & Dynamic CMS
  pages: {
    getPages: () => request<{ success: boolean; data: any[] }>('/api/pages'),
    getPageBySlug: (slug: string) => request<{ success: boolean; data: any }>(`/api/pages?slug=${encodeURIComponent(slug)}`),
    savePage: (pageData: any) => request<{ success: boolean; data: any }>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(pageData)
    }),
    updatePage: (id: string, updates: any) => request<{ success: boolean; data: any }>(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
    deletePage: (id: string) => request<{ success: boolean; message: string }>(`/api/pages/${id}`, {
      method: 'DELETE'
    })
  },

  // 24. Coupons & Discounts
  coupons: {
    getCoupons: () => request<{ success: boolean; data: any[] }>('/api/coupons'),
    createCoupon: (data: any) => request<{ success: boolean; data: any }>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateCoupon: (id: string, updates: any) => request<{ success: boolean; data: any }>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
    deleteCoupon: (id: string) => request<{ success: boolean; message: string }>(`/api/coupons/${id}`, {
      method: 'DELETE'
    }),
    validate: (code: string, subtotal: number) => request<{ success: boolean; message?: string; data?: any }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    })
  },

  // 25. Website Settings & Announcement Bar
  websiteSettings: {
    getSettings: () => request<{ success: boolean; data: any }>('/api/website-settings'),
    updateSettings: (settingsData: any) => request<{ success: boolean; data: any }>('/api/website-settings', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    })
  },

  // 26. AI Product Image Recovery Engine
  imageRecovery: {
    getStatus: () => request<{ success: boolean; data: any }>('/api/admin/image-recovery'),
    scanCatalog: () => request<{ success: boolean; data: any; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'scan' })
    }),
    startBatch: (limit?: number, forceAutoApprove?: boolean) => request<{ success: boolean; data: any; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'start_batch', limit, forceAutoApprove })
    }),
    pauseJob: () => request<{ success: boolean; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'pause' })
    }),
    resumeJob: () => request<{ success: boolean; message: string; data?: any }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'resume' })
    }),
    approveCandidate: (productId: string, customImageUrl?: string) => request<{ success: boolean; imageUrl?: string; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve_review', productId, customImageUrl })
    }),
    rejectCandidate: (productId: string, reason?: string) => request<{ success: boolean; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject_review', productId, reason })
    }),
    updateSettings: (settings: any) => request<{ success: boolean; data: any; message: string }>('/api/admin/image-recovery', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_settings', settings })
    })
  }
};


