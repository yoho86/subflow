import type {
  BillingCycle,
  CityCostCategory,
  CitySubscriptionStatus,
  CountryCostCategory,
  CountrySubscriptionStatus,
} from "./types";

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
const STORAGE_KEY_DECIMAL_PLACES = "subflow_decimal_places";

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

export const CITY_STATUS_LABELS: Record<CitySubscriptionStatus, string> = {
  active: "生效中",
  paused: "已暂停",
  archived: "已归档",
};

export const CITY_COST_CATEGORY_LABELS: Record<CityCostCategory, string> = {
  housing: "住房",
  water: "水费",
  electricity: "电费",
  gas: "燃气",
  internet: "网络",
  property: "物业",
  transport: "交通",
  food: "餐饮",
  other: "其他",
};

export const COUNTRY_STATUS_LABELS: Record<CountrySubscriptionStatus, string> = {
  active: "生效中",
  paused: "已暂停",
  archived: "已归档",
};

export const COUNTRY_COST_CATEGORY_LABELS: Record<CountryCostCategory, string> = {
  social_security: "社保",
  housing_fund: "公积金",
  income_tax: "个税",
  pension: "养老保险",
  medical_insurance: "医疗保险",
  unemployment: "失业保险",
  work_injury: "工伤保险",
  maternity: "生育保险",
  visa: "签证费用",
  other: "其他",
};

export const DEFAULT_CURRENCY = "CNY";
export type CurrencyFractionDigits = 0 | 1 | 2;
export const DEFAULT_CURRENCY_FRACTION_DIGITS: CurrencyFractionDigits = 0;

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

export function getCurrencyFractionDigits(): CurrencyFractionDigits {
  if (typeof window === "undefined") return DEFAULT_CURRENCY_FRACTION_DIGITS;
  const raw = localStorage.getItem(STORAGE_KEY_DECIMAL_PLACES);
  if (!raw) return DEFAULT_CURRENCY_FRACTION_DIGITS;
  const parsed = Number(raw);
  if (parsed === 0 || parsed === 1 || parsed === 2) return parsed;
  return DEFAULT_CURRENCY_FRACTION_DIGITS;
}

export function setCurrencyFractionDigits(value: CurrencyFractionDigits) {
  localStorage.setItem(STORAGE_KEY_DECIMAL_PLACES, String(value));
}
