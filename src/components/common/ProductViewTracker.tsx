'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/src/lib/analytics';

interface ProductViewTrackerProps {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
}

export function ProductViewTracker({ sku, name, category, brand, price }: ProductViewTrackerProps) {
  useEffect(() => {
    trackViewItem({
      item_id: sku,
      item_name: name,
      item_category: category,
      item_brand: brand,
      price,
      quantity: 1,
    });
  }, [sku, name, category, brand, price]);

  return null;
}

