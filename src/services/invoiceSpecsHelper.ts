// NEED ELECTRO ERP — Invoice Product Specifications Helper
// Extracts and formats product specifications (especially Laptop specs)
// for A4 Invoices, Thermal Receipts, and Invoice Previews.

import { Product } from '../types';

export interface FormattedSpecItem {
  label: string;
  value: string;
}

/**
 * Checks whether an item or its matched product represents a Laptop.
 */
export function isLaptopItem(item: any, product?: Product | null): boolean {
  const cat = String(item?.category || product?.category || '').toLowerCase();
  const name = String(item?.productName || item?.name || product?.name || '').toLowerCase();
  const specs = item?.specs || product?.specs;

  if (cat.includes('laptop')) return true;
  if (name.includes('laptop') || name.includes('elitebook') || name.includes('thinkpad') || name.includes('latitude') || name.includes('macbook') || name.includes('zenbook') || name.includes('probook')) return true;
  if (specs && typeof specs === 'object') {
    if (specs.processor || specs.cpu || specs.ram || specs.storage || specs.ssd) return true;
  }
  return false;
}

/**
 * Retrieves clean, non-empty specifications for an invoice line item.
 * Searches:
 *  1. item.specs (direct attachment)
 *  2. item.product.specs (server-hydrated relation)
 *  3. catalog match via productId or SKU or productName
 */
export function getInvoiceItemSpecs(item: any, catalogProducts?: Product[]): FormattedSpecItem[] {
  if (!item) return [];

  // 1. Resolve product from catalog if available
  let matchedProduct: Product | undefined = item.product;
  if (!matchedProduct && Array.isArray(catalogProducts)) {
    if (item.productId) {
      matchedProduct = catalogProducts.find(p => p.id === item.productId);
    }
    if (!matchedProduct && item.sku) {
      matchedProduct = catalogProducts.find(p => p.sku === item.sku);
    }
    if (!matchedProduct && (item.productName || item.name)) {
      const targetName = String(item.productName || item.name).trim().toLowerCase();
      matchedProduct = catalogProducts.find(p => p.name.trim().toLowerCase() === targetName);
    }
  }

  // 2. Resolve specs object (could be stringified JSON or object)
  let rawSpecs = item.specs || matchedProduct?.specs;
  if (typeof rawSpecs === 'string') {
    try {
      rawSpecs = JSON.parse(rawSpecs);
    } catch {
      rawSpecs = {};
    }
  }
  const specs = (rawSpecs && typeof rawSpecs === 'object') ? rawSpecs : {};

  const isLaptop = isLaptopItem(item, matchedProduct);
  const result: FormattedSpecItem[] = [];

  const addIfValid = (label: string, val: any) => {
    if (val === null || val === undefined) return;
    const str = String(val).trim();
    if (str && str.toUpperCase() !== 'N/A' && str !== '-' && str !== 'null' && str !== 'undefined') {
      // Avoid duplicate labels
      if (!result.some(r => r.label.toLowerCase() === label.toLowerCase())) {
        result.push({ label, value: str });
      }
    }
  };

  if (isLaptop) {
    // 1. Brand & Model (if not already clearly in product title)
    const brand = item.brand || matchedProduct?.brand || specs.brand || '';
    const model = item.model || matchedProduct?.model || specs.model || '';
    const itemName = String(item.productName || item.name || matchedProduct?.name || '');

    if (brand && !itemName.toLowerCase().includes(brand.toLowerCase())) {
      addIfValid('Brand', brand);
    }
    if (model && !itemName.toLowerCase().includes(model.toLowerCase())) {
      addIfValid('Model', model);
    }

    // 2. Processor / CPU
    const processor = specs.processor || specs.cpu || specs.type || '';
    addIfValid('Processor', processor);

    // 3. Generation (if provided and not already included in processor)
    const generation = specs.generation || '';
    if (generation && (!processor || !processor.toLowerCase().includes(generation.toLowerCase()))) {
      addIfValid('Generation', generation);
    }

    // 4. RAM
    const ram = specs.ram || specs.memory || '';
    addIfValid('RAM', ram);

    // 5. Storage / SSD / HDD
    const storage = specs.storage || specs.ssd || specs.hdd || specs.rom || '';
    addIfValid('Storage', storage);

    // 6. Display / Screen
    const display = specs.display || specs.screen || specs.screenSize || '';
    addIfValid('Display', display);

    // 7. Graphics / GPU
    const graphics = specs.gpu || specs.graphics || specs.graphicsCard || specs.vga || '';
    addIfValid('Graphics', graphics);

    // 8. Operating System
    const os = specs.operatingSystem || specs.os || '';
    addIfValid('Operating System', os);

    // 9. Condition Grade
    const condition = specs.physicalCondition || specs.condition || specs.grade || '';
    addIfValid('Condition', condition);

    // 10. Battery Health
    const battery = specs.batteryCondition || specs.battery || specs.batteryHealth || '';
    addIfValid('Battery Health', battery);

    // 11. Color
    const color = specs.color || '';
    addIfValid('Color', color);
  } else {
    // Non-laptop devices (Smartphone, CCTV, Electrical, etc.)
    const cat = String(item.category || matchedProduct?.category || '').toLowerCase();

    if (cat.includes('smart') || cat.includes('phone') || cat.includes('mobile')) {
      if (specs.model) addIfValid('Model', specs.model);
      if (specs.ram) addIfValid('RAM', specs.ram);
      if (specs.storage || specs.rom) addIfValid('Storage', specs.storage || specs.rom);
      if (specs.color) addIfValid('Color', specs.color);
      if (specs.imei) addIfValid('IMEI', specs.imei);
    } else if (cat.includes('cctv') || cat.includes('camera')) {
      if (specs.resolution) addIfValid('Resolution', specs.resolution);
      if (specs.cameraType) addIfValid('Camera Type', specs.cameraType);
      if (specs.lens) addIfValid('Lens', specs.lens);
      if (specs.nightVision) addIfValid('Night Vision', specs.nightVision);
      if (specs.storageSupport) addIfValid('Storage Support', specs.storageSupport);
    } else if (cat.includes('electric') || cat.includes('cable')) {
      if (specs.voltageRating) addIfValid('Voltage', specs.voltageRating);
      if (specs.currentRating) addIfValid('Current', specs.currentRating);
      if (specs.powerWattage) addIfValid('Wattage', specs.powerWattage);
      if (specs.cableGauge) addIfValid('Gauge', specs.cableGauge);
      if (specs.phase) addIfValid('Phase', specs.phase);
    } else {
      // General specifications (generic key-value pairs if present)
      for (const [key, val] of Object.entries(specs)) {
        if (typeof val === 'string' && val.trim()) {
          const readable = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          addIfValid(readable, val);
        }
      }
    }
  }

  return result;
}

/**
 * Formats warranty duration and calculates expiry date.
 */
export function formatWarrantyInfo(
  warrantyMonths?: number | string | null,
  saleDate?: string | Date | null
): { durationText: string; expiryText?: string } {
  const months = Number(warrantyMonths || 0);

  if (months <= 0) {
    return { durationText: 'Official Warranty' };
  }

  let durationText = `${months} Months`;
  if (months % 12 === 0) {
    const years = months / 12;
    durationText = years === 1 ? '1 Year' : `${years} Years`;
  }

  let expiryText: string | undefined = undefined;
  if (saleDate) {
    const d = new Date(saleDate);
    if (!isNaN(d.getTime())) {
      const exp = new Date(d);
      exp.setMonth(exp.getMonth() + months);
      const day = String(exp.getDate()).padStart(2, '0');
      const mon = String(exp.getMonth() + 1).padStart(2, '0');
      const yr = exp.getFullYear();
      expiryText = `${day}/${mon}/${yr}`;
    }
  }

  return { durationText, expiryText };
}
