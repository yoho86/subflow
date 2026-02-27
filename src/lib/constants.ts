import type { BillingCycle } from "./types";

export interface CategoryItem {
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: "工具", color: "#3B82F6" },
  { name: "娱乐", color: "#EC4899" },
  { name: "生活", color: "#10B981" },
  { name: "硬件", color: "#F59E0B" },
  { name: "教育", color: "#8B5CF6" },
  { name: "云服务", color: "#06B6D4" },
  { name: "健康", color: "#EF4444" },
  { name: "金融", color: "#14B8A6" },
  { name: "其他", color: "#6B7280" },
];

const STORAGE_KEY_CATEGORIES = "subflow_categories";

export function getCategories(): CategoryItem[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fall through */ }
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(cats: CategoryItem[]) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
}

export function getCategoryNames(): string[] {
  return getCategories().map((c) => c.name);
}

export function getCategoryColor(name: string): string {
  const cats = getCategories();
  return cats.find((c) => c.name === name)?.color ?? "#6B7280";
}

// Keep backward-compatible exports
export const CATEGORIES = DEFAULT_CATEGORIES.map((c) => c.name);
export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.name, c.color])
);

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "每周",
  monthly: "每月",
  quarterly: "每季度",
  semi_annually: "每半年",
  yearly: "每年",
  biennially: "每两年",
  custom: "自定义",
};

export const STATUS_LABELS = {
  active: "生效中",
  paused: "已暂停",
  cancelled: "已取消",
} as const;

export const DEFAULT_CURRENCY = "CNY";

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  CNY: { CNY: 1, USD: 0.137, EUR: 0.126, JPY: 20.5, GBP: 0.109, HKD: 1.07 },
  USD: { USD: 1, CNY: 7.3, EUR: 0.92, JPY: 149.5, GBP: 0.79, HKD: 7.81 },
  EUR: { EUR: 1, CNY: 7.93, USD: 1.09, JPY: 162.5, GBP: 0.86, HKD: 8.49 },
  JPY: { JPY: 1, CNY: 0.049, USD: 0.0067, EUR: 0.0062, GBP: 0.0053, HKD: 0.052 },
  GBP: { GBP: 1, CNY: 9.22, USD: 1.26, EUR: 1.16, JPY: 189.2, HKD: 9.87 },
  HKD: { HKD: 1, CNY: 0.93, USD: 0.128, EUR: 0.118, JPY: 19.1, GBP: 0.101 },
};

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rate = EXCHANGE_RATES[from]?.[to];
  if (rate) return amount * rate;
  // fallback via USD
  const toUsd = EXCHANGE_RATES[from]?.["USD"] ?? 1;
  const fromUsd = EXCHANGE_RATES["USD"]?.[to] ?? 1;
  return amount * toUsd * fromUsd;
}

export function getDefaultCurrency(): string {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return localStorage.getItem("subflow_currency") || DEFAULT_CURRENCY;
}
