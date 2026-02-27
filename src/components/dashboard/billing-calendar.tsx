"use client";

import type { Subscription } from "@/lib/types";
import { getBillingCalendarData, formatCurrency } from "@/lib/calculations";
import { getCategoryColor, getDefaultCurrency, convertCurrency } from "@/lib/constants";

interface Props {
  subscriptions: Subscription[];
}

export function BillingCalendar({ subscriptions }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const calendarData = getBillingCalendarData(subscriptions);
  const now = new Date();
  const today = now.getDate();
  const monthName = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  if (calendarData.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-card p-5"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          续费日历 · {monthName}
        </h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          本月无续费安排
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        续费日历 · {monthName}
      </h3>
      <div className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        {calendarData.map(({ day, subscriptions: daySubs }) => {
          const isPast = day < today;
          const isToday = day === today;

          return (
            <div key={day} className="relative flex gap-4 py-2">
              <div className="relative z-10 flex flex-col items-center shrink-0 w-10">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : isPast
                        ? "bg-muted text-muted-foreground"
                        : "bg-card border text-foreground"
                  }`}
                >
                  {day}
                </div>
              </div>
              <div className="flex-1 space-y-1.5 pb-1">
                {daySubs.map((sub) => {
                  const color = getCategoryColor(sub.category ?? "");
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{sub.name}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatCurrency(convertCurrency(sub.amount ?? 0, sub.currency || "CNY", defaultCurrency), defaultCurrency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
