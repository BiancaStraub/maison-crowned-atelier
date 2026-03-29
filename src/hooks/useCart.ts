import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/data/products';
import { getPersistedCart, setPersistedCart } from '@/lib/localStore';

export interface CartItem {
  product: Product;
  quantity: number;
  measurements?: Record<string, string>;
}

function loadCart(): CartItem[] {
  return getPersistedCart<CartItem>();
}

function saveCart(items: CartItem[]) {
  setPersistedCart(items);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((product: Product, measurements?: Record<string, string>) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, measurements: measurements || i.measurements }
            : i
        );
      }
      return [...prev, { product, quantity: 1, measurements }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev => prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      ));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count };
}
