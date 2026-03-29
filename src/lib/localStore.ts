export const STORAGE_KEYS = {
  auth: 'auth',
  orders: 'maison_orders',
  measurements: 'maison_measurements',
  cart: 'maison_cart',
} as const;

const LEGACY_CART_KEY = 'maison-crowned-cart';
const STORAGE_SYNC_EVENT = 'maison:storage-sync';

export type AuthRole = 'client' | 'admin';

export interface PersistedAuth {
  isAuthenticated: boolean;
  role: AuthRole;
  email: string;
}

export interface PersistedOrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface PersistedOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string | null;
  user_email: string;
  order_items: PersistedOrderItem[];
}

export interface PersistedMeasurement {
  id: string;
  label: string;
  user_email: string;
  busto: string | null;
  cintura: string | null;
  quadril: string | null;
  pescoco: string | null;
  ombro: string | null;
  manga: string | null;
  altura: string | null;
  created_at: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emitStorageSync(key: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }));
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  emitStorageSync(key);
}

export function subscribeStorage(key: string, callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      callback();
    }
  };

  const onCustom = (event: Event) => {
    const customEvent = event as CustomEvent<{ key?: string }>;
    if (customEvent.detail?.key === key) {
      callback();
    }
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(STORAGE_SYNC_EVENT, onCustom as EventListener);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(STORAGE_SYNC_EVENT, onCustom as EventListener);
  };
}

export function getPersistedAuth(): PersistedAuth {
  return readJson<PersistedAuth>(STORAGE_KEYS.auth, {
    isAuthenticated: false,
    role: 'client',
    email: '',
  });
}

export function setPersistedAuth(auth: PersistedAuth) {
  writeJson(STORAGE_KEYS.auth, auth);
}

export function clearPersistedAuth() {
  localStorage.removeItem(STORAGE_KEYS.auth);
  emitStorageSync(STORAGE_KEYS.auth);
}

export function getPersistedOrders(): PersistedOrder[] {
  return readJson<PersistedOrder[]>(STORAGE_KEYS.orders, []);
}

export function setPersistedOrders(orders: PersistedOrder[]) {
  writeJson(STORAGE_KEYS.orders, orders);
}

export function appendPersistedOrder(order: PersistedOrder) {
  const next = [order, ...getPersistedOrders()];
  setPersistedOrders(next);
  return next;
}

export function getPersistedMeasurements(): PersistedMeasurement[] {
  return readJson<PersistedMeasurement[]>(STORAGE_KEYS.measurements, []);
}

export function setPersistedMeasurements(measurements: PersistedMeasurement[]) {
  writeJson(STORAGE_KEYS.measurements, measurements);
}

export function appendPersistedMeasurement(measurement: PersistedMeasurement) {
  const next = [measurement, ...getPersistedMeasurements()];
  setPersistedMeasurements(next);
  return next;
}

export function getPersistedCart<T>(): T[] {
  const current = readJson<T[]>(STORAGE_KEYS.cart, []);
  if (current.length > 0) {
    return current;
  }

  const legacy = readJson<T[]>(LEGACY_CART_KEY, []);
  if (legacy.length > 0) {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_CART_KEY);
    return legacy;
  }

  return [];
}

export function setPersistedCart<T>(items: T[]) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
  localStorage.removeItem(LEGACY_CART_KEY);
}