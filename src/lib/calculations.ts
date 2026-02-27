import type { Subscription } from "./types";
import { convertCurrency, DEFAULT_CURRENCY } from "./constants";

export interface MonthlyTrendPoint {
  month: string; // "2025-07"
  label: string; // "7月"
  cost: number;
}

export function getMonthlyTrendData(
  subscriptions: Subscription[],
  months = 12,
  targetCurrency = DEFAULT_CURRENCY
): MonthlyTrendPoint[] {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getMonth() + 1}月`;

    let total = 0;
    for (const sub of subscriptions) {
      if (sub.status !== "active") continue;

      if (sub.type === "recurring") {
        const started = sub.started_at ? new Date(sub.started_at) : new Date(sub.created_at);
        if (started <= new Date(d.getFullYear(), d.getMonth() + 1, 0)) {
          total += convertCurrency(
            getMonthlyCost(sub),
            sub.currency || DEFAULT_CURRENCY,
            targetCurrency
          );
        }
      } else {
        if (!sub.purchase_date || !sub.expected_lifespan_months) continue;
        const purchaseDate = new Date(sub.purchase_date);
        const endDate = new Date(purchaseDate);
        endDate.setMonth(endDate.getMonth() + sub.expected_lifespan_months);
        const monthStart = d;
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        if (purchaseDate <= monthEnd && endDate >= monthStart) {
          total += convertCurrency(
            getMonthlyCost(sub),
            sub.currency || DEFAULT_CURRENCY,
            targetCurrency
          );
        }
      }
    }

    points.push({ month: monthKey, label, cost: Math.round(total * 100) / 100 });
  }

  return points;
}

export function getBillingCalendarData(subscriptions: Subscription[]): {
  day: number;
  subscriptions: Subscription[];
}[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const dayMap = new Map<number, Subscription[]>();

  for (const sub of subscriptions) {
    if (sub.status !== "active" || sub.type !== "recurring" || !sub.next_billing) continue;
    const billingDate = new Date(sub.next_billing);
    if (billingDate.getFullYear() === year && billingDate.getMonth() === month) {
      const day = billingDate.getDate();
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(sub);
    }
  }

  return Array.from(dayMap.entries())
    .map(([day, subs]) => ({ day, subscriptions: subs }))
    .sort((a, b) => a.day - b.day);
}

export function getMonthlyCost(sub: Subscription): number {
  if (sub.type === "lifetime") {
    if (!sub.purchase_price || !sub.expected_lifespan_months) return 0;
    return sub.purchase_price / sub.expected_lifespan_months;
  }

  if (!sub.amount) return 0;

  switch (sub.billing_cycle) {
    case "weekly":
      return sub.amount * (365.25 / 7 / 12);
    case "monthly":
      return sub.amount;
    case "quarterly":
      return sub.amount / 3;
    case "semi_annually":
      return sub.amount / 6;
    case "yearly":
      return sub.amount / 12;
    case "biennially":
      return sub.amount / 24;
    case "custom":
      if (!sub.custom_cycle_days) return 0;
      return sub.amount / (sub.custom_cycle_days / 30.44);
    default:
      return 0;
  }
}

export function getYearlyCost(sub: Subscription): number {
  return getMonthlyCost(sub) * 12;
}

export function formatCurrency(amount: number, currency = "CNY"): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getMonthlyCostConverted(sub: Subscription, targetCurrency: string): number {
  const rawCost = getMonthlyCost(sub);
  return convertCurrency(rawCost, sub.currency || "CNY", targetCurrency);
}

export function getDaysUntilBilling(sub: Subscription): number | null {
  if (sub.type === "lifetime" || !sub.next_billing) return null;
  const now = new Date();
  const billing = new Date(sub.next_billing);
  const diff = billing.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
