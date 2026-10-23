// NEED ELECTRO ERP — Centralized Route Parser & URL Synchronization Engine
// Ensures seamless page refresh, deep linking, browser back/forward, and session persistence

export interface ParsedRoute {
  module: string;
  param?: string;
  isLogin: boolean;
  isLanding: boolean;
  isProtected: boolean;
  fullPath: string;
  pathname: string;
  searchParams: Record<string, string>;
}

// Canonical URL mapping for ERP modules
export function getModuleUrl(module: string, param?: string): string {
  switch (module) {
    case 'dashboard':
      return '/dashboard';
    case 'pos':
      return '/pos';
    case 'sales':
      return param === 'new' ? '/sales/new' : (param ? `/sales/${encodeURIComponent(param)}` : '/sales');
    case 'returns':
      return param ? `/returns/${encodeURIComponent(param)}` : '/returns';
    case 'emi':
      return param ? `/emi/${encodeURIComponent(param)}` : '/emi';
    case 'inventory':
      return '/inventory';
    case 'purchases':
      return param ? `/inventory/purchases/${encodeURIComponent(param)}` : '/inventory/purchases';
    case 'products':
      return param ? `/inventory/products/${encodeURIComponent(param)}` : '/inventory/products';
    case 'customers':
      return param ? `/customers/${encodeURIComponent(param)}` : '/customers';
    case 'suppliers':
      return param ? `/suppliers/${encodeURIComponent(param)}` : '/suppliers';
    case 'service':
      return param ? `/service/${encodeURIComponent(param)}` : '/service';
    case 'warranty':
      return param ? `/warranty/${encodeURIComponent(param)}` : '/warranty';
    case 'accounting':
      return '/accounting';
    case 'cash_management':
      return '/accounting/cash';
    case 'ledgers':
      return param ? `/ledgers/${encodeURIComponent(param)}` : '/ledgers';
    case 'expenses':
      return param ? `/expenses/${encodeURIComponent(param)}` : '/expenses';
    case 'reports':
      return param ? `/reports/${encodeURIComponent(param)}` : '/reports';
    case 'employees':
      return param ? `/employees/${encodeURIComponent(param)}` : '/employees';
    case 'branches':
      return param ? `/branches/${encodeURIComponent(param)}` : '/branches';
    case 'roles':
      return param ? `/roles/${encodeURIComponent(param)}` : '/roles';
    case 'audit':
      return '/audit';
    case 'settings':
      return '/settings';
    case 'control_center':
      return param ? `/control-center/${encodeURIComponent(param)}` : '/control-center';
    case 'seo_management':
      return '/seo-management';
    case 'guides_cms':
      return '/admin/guides';
    case 'website_management':
      return param ? `/admin/website-management/${encodeURIComponent(param)}` : '/admin/website-management';
    default:
      return `/${module}`;
  }
}

// Parse pathname and search parameters into ERP state
export function parseRoute(pathname: string = '', search: string = ''): ParsedRoute {
  let cleanPath = pathname.trim();
  // Strip trailing slashes unless it's just '/'
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (!cleanPath) {
    cleanPath = '/';
  }

  const urlSearchParams = new URLSearchParams(search);
  const searchParams: Record<string, string> = {};
  urlSearchParams.forEach((val, key) => {
    searchParams[key] = val;
  });

  const fullPath = search ? `${cleanPath}?${search.replace(/^\?/, '')}` : cleanPath;

  // 1. Explicit Login Route
  if (cleanPath === '/login' || cleanPath === '/admin/login' || searchParams['portal'] === 'login') {
    return {
      module: 'dashboard',
      isLogin: true,
      isLanding: false,
      isProtected: false,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 2. Admin Root
  if (cleanPath === '/admin' || cleanPath === '/admin/') {
    const requestedModule = searchParams['module'] || 'dashboard';
    return {
      module: requestedModule,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 3. Dashboard
  if (cleanPath === '/dashboard') {
    return {
      module: 'dashboard',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 4. POS / Direct Billing
  if (cleanPath === '/pos') {
    return {
      module: 'pos',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 5. Sales & Invoices
  if (cleanPath === '/sales/new') {
    return {
      module: 'pos',
      param: 'new',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath.startsWith('/sales/')) {
    const param = decodeURIComponent(cleanPath.slice('/sales/'.length));
    return {
      module: 'sales',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/sales') {
    return {
      module: 'sales',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 6. Inventory & Sub-modules
  if (cleanPath === '/inventory/products') {
    return {
      module: 'products',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath.startsWith('/inventory/products/')) {
    const param = decodeURIComponent(cleanPath.slice('/inventory/products/'.length));
    return {
      module: 'products',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/inventory/purchases') {
    return {
      module: 'purchases',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath.startsWith('/inventory/purchases/')) {
    const param = decodeURIComponent(cleanPath.slice('/inventory/purchases/'.length));
    return {
      module: 'purchases',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/inventory' || cleanPath.startsWith('/inventory/')) {
    return {
      module: 'inventory',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 7. Products Standalone
  if (cleanPath === '/products') {
    return {
      module: 'products',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath.startsWith('/products/')) {
    const param = decodeURIComponent(cleanPath.slice('/products/'.length));
    return {
      module: 'products',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 8. Purchases Standalone
  if (cleanPath === '/purchases') {
    return {
      module: 'purchases',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath.startsWith('/purchases/')) {
    const param = decodeURIComponent(cleanPath.slice('/purchases/'.length));
    return {
      module: 'purchases',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 9. Accounting & Cash Management
  if (cleanPath === '/accounting/cash' || cleanPath === '/cash-management' || cleanPath === '/cash_management') {
    return {
      module: 'cash_management',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/accounting' || cleanPath.startsWith('/accounting/')) {
    return {
      module: 'accounting',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 10. Customers
  if (cleanPath.startsWith('/customers/')) {
    const param = decodeURIComponent(cleanPath.slice('/customers/'.length));
    return {
      module: 'customers',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/customers') {
    return {
      module: 'customers',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 11. Suppliers
  if (cleanPath.startsWith('/suppliers/')) {
    const param = decodeURIComponent(cleanPath.slice('/suppliers/'.length));
    return {
      module: 'suppliers',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/suppliers') {
    return {
      module: 'suppliers',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 12. Returns & RMA
  if (cleanPath.startsWith('/returns/')) {
    const param = decodeURIComponent(cleanPath.slice('/returns/'.length));
    return {
      module: 'returns',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/returns') {
    return {
      module: 'returns',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 13. EMI Management
  if (cleanPath.startsWith('/emi/')) {
    const param = decodeURIComponent(cleanPath.slice('/emi/'.length));
    return {
      module: 'emi',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/emi') {
    return {
      module: 'emi',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 14. Service & Repair
  if (cleanPath.startsWith('/service/')) {
    const param = decodeURIComponent(cleanPath.slice('/service/'.length));
    return {
      module: 'service',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }
  if (cleanPath === '/service') {
    return {
      module: 'service',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 15. Warranty Claims
  if (cleanPath === '/warranty' || cleanPath.startsWith('/warranty/')) {
    return {
      module: 'warranty',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 16. Ledgers
  if (cleanPath === '/ledgers' || cleanPath.startsWith('/ledgers/')) {
    const param = cleanPath.startsWith('/ledgers/') ? decodeURIComponent(cleanPath.slice('/ledgers/'.length)) : undefined;
    return {
      module: 'ledgers',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 17. Expenses
  if (cleanPath === '/expenses' || cleanPath.startsWith('/expenses/')) {
    const param = cleanPath.startsWith('/expenses/') ? decodeURIComponent(cleanPath.slice('/expenses/'.length)) : undefined;
    return {
      module: 'expenses',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 18. Reports
  if (cleanPath === '/reports' || cleanPath.startsWith('/reports/')) {
    const param = cleanPath.startsWith('/reports/') ? decodeURIComponent(cleanPath.slice('/reports/'.length)) : undefined;
    return {
      module: 'reports',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 19. Employees
  if (cleanPath === '/employees' || cleanPath.startsWith('/employees/')) {
    return {
      module: 'employees',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 20. Branches
  if (cleanPath === '/branches' || cleanPath.startsWith('/branches/')) {
    return {
      module: 'branches',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 21. Roles & RBAC
  if (cleanPath === '/roles' || cleanPath.startsWith('/roles/')) {
    return {
      module: 'roles',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 22. Audit Logs
  if (cleanPath === '/audit' || cleanPath.startsWith('/audit/')) {
    return {
      module: 'audit',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 23. Settings
  if (cleanPath === '/settings' || cleanPath.startsWith('/settings/')) {
    return {
      module: 'settings',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 24. Control Center
  if (cleanPath === '/control-center' || cleanPath === '/control_center' || cleanPath.startsWith('/control-center/')) {
    const param = cleanPath.startsWith('/control-center/') ? decodeURIComponent(cleanPath.slice('/control-center/'.length)) : undefined;
    return {
      module: 'control_center',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 25. SEO Management
  if (cleanPath === '/seo-management' || cleanPath === '/seo_management') {
    return {
      module: 'seo_management',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 25.1 Guides & Content CMS
  if (cleanPath === '/admin/guides' || cleanPath === '/admin/guides-cms' || cleanPath === '/guides-cms') {
    return {
      module: 'guides_cms',
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 25.2 Website Management Hub
  if (cleanPath === '/admin/website-management' || cleanPath.startsWith('/admin/website-management/')) {
    const param = cleanPath.startsWith('/admin/website-management/') ? decodeURIComponent(cleanPath.slice('/admin/website-management/'.length)) : undefined;
    return {
      module: 'website_management',
      param,
      isLogin: false,
      isLanding: false,
      isProtected: true,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // 26. Root Landing Page
  if (cleanPath === '/') {
    return {
      module: 'dashboard',
      isLogin: false,
      isLanding: true,
      isProtected: false,
      fullPath,
      pathname: cleanPath,
      searchParams,
    };
  }

  // Default fallback for any other path
  return {
    module: 'dashboard',
    isLogin: false,
    isLanding: false,
    isProtected: false,
    fullPath,
    pathname: cleanPath,
    searchParams,
  };
}

const STORAGE_LAST_MODULE = 'NEED_ELECTRO_LAST_ACTIVE_MODULE_V1';
const STORAGE_LAST_PARAM = 'NEED_ELECTRO_LAST_ACTIVE_PARAM_V1';
const STORAGE_LAST_URL = 'NEED_ELECTRO_LAST_ACTIVE_URL_V1';

// Save currently active route to localStorage so refresh ALWAYS returns to the exact same page
export function saveActiveRoute(module: string, param?: string, url?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const targetUrl = url || getModuleUrl(module, param);
    localStorage.setItem(STORAGE_LAST_MODULE, module);
    if (param) {
      localStorage.setItem(STORAGE_LAST_PARAM, param);
    } else {
      localStorage.removeItem(STORAGE_LAST_PARAM);
    }
    localStorage.setItem(STORAGE_LAST_URL, targetUrl);
  } catch (e) {
    // ignore local storage errors
  }
}

// Retrieve last saved active route
export function getSavedActiveRoute(): { module: string; param?: string; url: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const module = localStorage.getItem(STORAGE_LAST_MODULE);
    if (!module) return null;
    const param = localStorage.getItem(STORAGE_LAST_PARAM) || undefined;
    const url = localStorage.getItem(STORAGE_LAST_URL) || getModuleUrl(module, param);
    return { module, param, url };
  } catch (e) {
    return null;
  }
}

// Clear saved active route on explicit user sign-out
export function clearSavedActiveRoute(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_LAST_MODULE);
    localStorage.removeItem(STORAGE_LAST_PARAM);
    localStorage.removeItem(STORAGE_LAST_URL);
  } catch (e) {}
}

// Push route to browser history and update URL bar without reload
export function navigateTo(module: string, param?: string, replace = false): void {
  if (typeof window === 'undefined') return;
  const targetUrl = getModuleUrl(module, param);
  saveActiveRoute(module, param, targetUrl);
  const currentUrl = window.location.pathname;
  if (currentUrl !== targetUrl) {
    if (replace) {
      window.history.replaceState({ module, param }, '', targetUrl);
    } else {
      window.history.pushState({ module, param }, '', targetUrl);
    }
  }
}

// Push raw URL to browser history
export function navigateToUrl(url: string, replace = false): void {
  if (typeof window === 'undefined') return;
  const parsed = parseRoute(url);
  saveActiveRoute(parsed.module, parsed.param, url);
  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl !== url) {
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  }
}

