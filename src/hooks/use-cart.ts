import { useEffect, useSyncExternalStore } from "react";

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
  qty: number;
};

const STORAGE_KEY = "dona-dora-cart-v1";

type State = { items: CartItem[] };
let state: State = { items: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore storage quota/access error */
    }
  }
}

function loadOnce() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.items && Array.isArray(parsed.items)) state = { items: parsed.items };
    }
  } catch {
    /* ignore storage parse/access error */
  }
}
let loaded = false;

function keyOf(i: Pick<CartItem, "product_id" | "size" | "color">) {
  return `${i.product_id}|${i.size ?? ""}|${i.color ?? ""}`;
}

export const cart = {
  add(item: CartItem) {
    const k = keyOf(item);
    const idx = state.items.findIndex((it) => keyOf(it) === k);
    if (idx >= 0) {
      const next = [...state.items];
      next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + item.qty) };
      state = { items: next };
    } else {
      state = { items: [...state.items, item] };
    }
    emit();
  },
  remove(k: string) {
    state = { items: state.items.filter((i) => keyOf(i) !== k) };
    emit();
  },
  setQty(k: string, qty: number) {
    state = {
      items: state.items
        .map((i) => (keyOf(i) === k ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))
        .filter((i) => i.qty > 0),
    };
    emit();
  },
  clear() {
    state = { items: [] };
    emit();
  },
  key: keyOf,
};

function subscribe(l: () => void) {
  if (!loaded) {
    loaded = true;
    loadOnce();
  }
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => state;
const getServerSnapshot = () => ({ items: [] as CartItem[] });

export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // ensure rehydration after mount on client
  useEffect(() => {
    if (!loaded) {
      loaded = true;
      loadOnce();
      emit();
    }
  }, []);
  const subtotal = s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = s.items.reduce((sum, i) => sum + i.qty, 0);
  return { items: s.items, subtotal, count, ...cart };
}
