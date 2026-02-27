"use client";

import type { Subscription } from "@/lib/types";
import { formatCurrency, getDaysUntilBilling } from "@/lib/calculations";
import { CATEGORY_COLORS } from "@/lib/constants";

interface Props {
  subscriptions: Subscription[];
}

export function UpcomingList({ subscriptions }: Props) {
  const upcoming = subscriptions
    .filter((s) => s.status === "active" && s.type === "recurring" && s.next_billing)
    .map((s) => ({ ...s, daysUntil: getDaysUntilBilling(s) ?? 999 }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);

  return (
    <div
      className="rounded-2xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        即将续费
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          暂无即将续费的订阅
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((sub) => {
            const categoryColor = sub.category
              ? CATEGORY_COLORS[sub.category] ?? "#6B7280"
              : "#6B7280";

            return (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-accent transition-colors"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-medium shrink-0"
                  style={{ backgroundColor: categoryColor }}
                >
                  {sub.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.next_billing}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-medium">
                    {formatCurrency(sub.amount ?? 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {sub.daysUntil === 0
                      ? "今天"
                      : sub.daysUntil < 0
                        ? "已逾期"
                        : `${sub.daysUntil}天后`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
