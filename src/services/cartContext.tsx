'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category?: string;
  brand?: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  maxStock?: number;
  currentStock: number;
  warrantyPeriodMonths?: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    brand?: string;
    retailPrice: number;
    imageUrl?: string | null;
    currentStock?: number;
    warrantyPeriodMonths?: number;
  }, quantity?: number) => void;
  addItem: (product: {
    id: string;
    name: string;
    sku: string;
    price?: number;
    retailPrice?: number;
    imageUrl?: string | null;
    maxStock?: number;
    currentStock?: number;
    quantity?: number;
  }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'NEED_ELECTRO_CUSTOMER_CART_V1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item: any) => ({
            ...item,
            id: item.id || item.productId,
            productId: item.productId || item.id,
          }))
        : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = (product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    brand?: string;
    retailPrice: number;
    imageUrl?: string | null;
    currentStock?: number;
    warrantyPeriodMonths?: number;
  }, quantity: number = 1) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id || item.id === product.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        const existing = next[existingIdx];
        const maxStock = (product.currentStock && product.currentStock > 0) ? product.currentStock : ((existing.currentStock && existing.currentStock > 0) ? existing.currentStock : 99);
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        next[existingIdx] = {
          ...existing,
          quantity: newQty,
        };
        return next;
      }

      const newItem: CartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category || 'General',
        brand: product.brand || 'Generic',
        price: Number(product.retailPrice),
        quantity: Math.max(1, quantity),
        imageUrl: product.imageUrl || undefined,
        currentStock: product.currentStock ?? 0,
        maxStock: (product.currentStock && product.currentStock > 0) ? product.currentStock : 99,
        warrantyPeriodMonths: product.warrantyPeriodMonths || 0,
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const addItem = (product: {
    id: string;
    name: string;
    sku: string;
    price?: number;
    retailPrice?: number;
    imageUrl?: string | null;
    maxStock?: number;
    currentStock?: number;
    quantity?: number;
  }, quantity: number = 1) => {
    const unitPrice = product.price ?? product.retailPrice ?? 0;
    addToCart({
      id: product.id,
      name: product.name,
      sku: product.sku,
      retailPrice: unitPrice,
      imageUrl: product.imageUrl,
      currentStock: product.maxStock ?? product.currentStock ?? 99,
    }, product.quantity ?? quantity);
  };

  const removeFromCart = (idOrProductId: string) => {
    setItems(prev => prev.filter(item => item.productId !== idOrProductId && item.id !== idOrProductId));
  };

  const updateQuantity = (idOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(idOrProductId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.productId === idOrProductId || item.id === idOrProductId) {
        const maxStock = (item.maxStock && item.maxStock > 0) ? item.maxStock : (item.currentStock > 0 ? item.currentStock : 99);
        return {
          ...item,
          quantity: Math.min(quantity, maxStock),
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      addItem,
      removeFromCart,
      removeItem: removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      totalItems: itemCount,
      subtotal,
      isCartOpen,
      isOpen: isCartOpen,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
