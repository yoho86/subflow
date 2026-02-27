import type { Category, BillingCycle } from "./types";

export const CATEGORIES: Category[] = [
  "工具",
  "娱乐",
  "生活",
  "硬件",
  "教育",
  "云服务",
  "健康",
  "金融",
  "其他",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  工具: "#3B82F6",
  娱乐: "#EC4899",
  生活: "#10B981",
  硬件: "#F59E0B",
  教育: "#8B5CF6",
  云服务: "#06B6D4",
  健康: "#EF4444",
  金融: "#14B8A6",
  其他: "#6B7280",
};

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
