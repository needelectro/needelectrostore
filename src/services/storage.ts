// Storage Engine with LocalStorage persistence and seed initializers
import {
  INITIAL_SETTINGS, INITIAL_BRANCHES, INITIAL_USERS, INITIAL_EMI_PLANS,
  INITIAL_SUPPLIERS, INITIAL_PRODUCTS, INITIAL_PRODUCT_SERIALS,
  INITIAL_CUSTOMERS, INITIAL_EMI_ACCOUNTS, INITIAL_EMI_PAYMENTS,
  INITIAL_SALES, INITIAL_TECHNICIANS, INITIAL_SERVICES, INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS, INITIAL_INVENTORY_TRANSACTIONS
} from './mockData';

const STORAGE_PREFIX = 'NEED_ELECTRO_PROD_2026_';

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export function clearAllStoredData(): void {
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
}

export function exportAllDataJSON(): string {
  const data: Record<string, any> = {};
  const keys = [
    'settings', 'branches', 'users', 'emi_plans', 'suppliers',
    'products', 'serials', 'customers', 'emi_accounts', 'emi_payments',
    'sales', 'technicians', 'services', 'expenses', 'audit_logs', 'inventory_transactions',
    'purchases', 'financial_accounts', 'investments', 'employees', 'attendance', 'returns',
    'warranty_claims', 'ledger_entries', 'roles', 'permissions', 'setup_status', 'opening_balances',
    'categories_config', 'brands_config', 'payment_methods_config', 'expense_categories',
    'service_categories', 'warranty_rules', 'notification_templates', 'price_audit_log',
    'customer_merge_audit', 'pos_settings', 'inventory_rules'
  ];
  keys.forEach(k => {
    data[k] = getStoredData(k, null);
  });
  return JSON.stringify(data, null, 2);
}

export function importAllDataJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    Object.keys(data).forEach(k => {
      if (data[k] !== undefined) {
        setStoredData(k, data[k]);
      }
    });
    return true;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
}
