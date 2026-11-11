// Safe client-side e-commerce & conversion analytics helpers (GA4 + GTM dataLayer)
// Only pushes events when GTM dataLayer or gtag is active in browser.

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsProductItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price: number;
  quantity?: number;
}

function pushEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event: eventName, ecommerce: params, ...params });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Non-blocking analytics
  }
}

export function trackViewItem(item: AnalyticsProductItem) {
  pushEvent('view_item', {
    currency: 'BDT',
    value: item.price,
    items: [{ ...item, quantity: item.quantity || 1 }],
  });
}

export function trackAddToCart(item: AnalyticsProductItem) {
  pushEvent('add_to_cart', {
    currency: 'BDT',
    value: item.price * (item.quantity || 1),
    items: [{ ...item, quantity: item.quantity || 1 }],
  });
}

export function trackBeginCheckout(items: AnalyticsProductItem[], value: number) {
  pushEvent('begin_checkout', {
    currency: 'BDT',
    value,
    items,
  });
}

export function trackPurchase(
  transactionId: string,
  items: AnalyticsProductItem[],
  value: number,
  shipping: number
) {
  pushEvent('purchase', {
    transaction_id: transactionId,
    currency: 'BDT',
    value,
    shipping,
    items,
  });
}

export function trackGenerateLead(serviceType: string, source: string) {
  pushEvent('generate_lead', {
    currency: 'BDT',
    service_type: serviceType,
    lead_source: source,
  });
}

