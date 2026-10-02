/**
 * NEED ELECTRO ERP — Intelligent Product Category Matching Engine
 * Seamlessly maps showroom category pills to database product categories and names.
 */

export const SHOWROOM_CATEGORIES = [
  'Laptop',
  'Desktop',
  'CCTV',
  'Router',
  'Electrical Products',
  'Cables',
  'Chargers',
  'Accessories',
  'Services',
  'Others'
] as const;

/**
 * Checks if a given product matches a selected category filter.
 * Handles:
 * - Exact / case-insensitive match
 * - Singular / plural forms (e.g., 'Laptop' vs 'Laptops', 'Accessories' vs 'Accessory')
 * - Real-world catalog classifications (e.g. 'CCTV & Surveillance' -> 'CCTV', 'Computer Accessories' -> 'Accessories')
 * - Subcategory keywords in product name (e.g. 'HDMI Cable' -> 'Cables', '4G WiFi Modem' -> 'Router')
 */
export function isProductInCategory(product: { name?: string; category?: string }, filterCategory: string): boolean {
  if (!filterCategory || filterCategory === 'ALL') return true;

  const rawCat = (product.category || '').toLowerCase().trim();
  const rawName = (product.name || '').toLowerCase().trim();
  const target = filterCategory.toLowerCase().trim();

  // 1. Direct match
  if (rawCat === target) return true;

  // 2. Singular / Plural normalization
  const singular = (str: string) => str.replace(/ies$/, 'y').replace(/s$/, '');
  if (singular(rawCat) === singular(target)) return true;

  // 3. Category rules
  switch (target) {
    case 'laptop':
    case 'laptops':
      return (
        rawCat.includes('laptop') ||
        rawName.includes('laptop') ||
        rawName.includes('surface') ||
        rawName.includes('latitude') ||
        rawName.includes('elitebook') ||
        rawName.includes('thinkpad') ||
        rawName.includes('probook') ||
        rawName.includes('fujitso') ||
        rawName.includes('prelude')
      );

    case 'desktop':
    case 'desktops':
      return (
        (rawCat.includes('desktop') ||
          rawCat.includes('computer') ||
          rawCat.includes('pc') ||
          rawName.includes('desktop') ||
          rawName.includes('all-in-one') ||
          rawName.includes('gaming pc') ||
          rawName.includes('optiplex')) &&
        !rawCat.includes('accessories')
      );

    case 'cctv':
    case 'cctv & surveillance':
    case 'surveillance':
      return (
        rawCat.includes('cctv') ||
        rawCat.includes('surveillance') ||
        rawCat.includes('camera') ||
        rawName.includes('cctv') ||
        rawName.includes('camera') ||
        rawName.includes('ezviz') ||
        rawName.includes('dvr') ||
        rawName.includes('nvr') ||
        rawName.includes('hikvision') ||
        rawName.includes('dahua')
      );

    case 'router':
    case 'routers':
    case 'networking':
      return (
        rawCat.includes('router') ||
        rawCat.includes('networking') ||
        rawCat.includes('modem') ||
        rawName.includes('router') ||
        rawName.includes('modem') ||
        rawName.includes('wifi') ||
        rawName.includes('wi-fi') ||
        rawName.includes('switch') ||
        rawName.includes('access point')
      );

    case 'electrical products':
    case 'electrical':
      return (
        rawCat.includes('electrical') ||
        rawName.includes('electrical') ||
        rawName.includes('ups') ||
        rawName.includes('battery') ||
        rawName.includes('voltage') ||
        rawName.includes('circuit')
      );

    case 'cables':
    case 'cable':
      return (
        rawCat.includes('cable') ||
        rawName.includes('cable') ||
        rawName.includes('hdmi') ||
        rawName.includes('vga') ||
        rawName.includes('cat6') ||
        rawName.includes('rj45') ||
        rawName.includes('aux')
      );

    case 'chargers':
    case 'charger':
    case 'adapters':
    case 'adapter':
      return (
        rawCat.includes('charger') ||
        rawCat.includes('adapter') ||
        rawName.includes('charger') ||
        rawName.includes('adapter') ||
        rawName.includes('power supply') ||
        rawName.includes('power cord')
      );

    case 'accessories':
    case 'computer accessories':
    case 'laptop accessories':
      return (
        rawCat.includes('accessories') ||
        rawCat.includes('accessory') ||
        rawName.includes('mouse') ||
        rawName.includes('keyboard') ||
        rawName.includes('headphone') ||
        rawName.includes('pad') ||
        rawName.includes('stand') ||
        rawName.includes('cleaner') ||
        rawName.includes('pendrive') ||
        rawName.includes('hub')
      );

    case 'services':
    case 'service':
      return (
        rawCat.includes('service') ||
        rawName.includes('service') ||
        rawName.includes('repair') ||
        rawName.includes('servicing') ||
        rawName.includes('installation')
      );

    case 'others':
    case 'other':
    case 'other gadgets': {
      const isLaptop = isProductInCategory(product, 'laptop');
      const isDesktop = isProductInCategory(product, 'desktop');
      const isCCTV = isProductInCategory(product, 'cctv');
      const isRouter = isProductInCategory(product, 'router');
      const isElectrical = isProductInCategory(product, 'electrical');
      const isCable = isProductInCategory(product, 'cables');
      const isCharger = isProductInCategory(product, 'chargers');
      const isAccessory = isProductInCategory(product, 'accessories');
      const isService = isProductInCategory(product, 'services');

      return (
        !isLaptop &&
        !isDesktop &&
        !isCCTV &&
        !isRouter &&
        !isElectrical &&
        !isCable &&
        !isCharger &&
        !isAccessory &&
        !isService
      );
    }

    default:
      return rawCat.includes(target) || target.includes(rawCat) || rawName.includes(target);
  }
}
