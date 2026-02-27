"use client";

import Link from "next/link";
import type { Subscription } from "@/lib/types";
import { getMonthlyCostConverted, formatCurrency, getDaysUntilBilling } from "@/lib/calculations";
import { getCategoryColor, BILLING_CYCLE_LABELS, STATUS_LABELS, getDefaultCurrency } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface Props {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription: sub }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const monthly = getMonthlyCostConverted(sub, defaultCurrency);
  const daysUntil = getDaysUntilBilling(sub);
  const categoryColor = getCategoryColor(sub.category ?? "");

  return (
    <Link href={`/subscriptions/detail?id=${sub.id}`} className="block">
      <div
        className="card-hover rounded-2xl border bg-card p-4 flex flex-col gap-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-medium shrink-0"
              style={{ backgroundColor: categoryColor }}
            >
              {sub.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{sub.name}</h3>
              {sub.category && (
                <span className="text-xs text-muted-foreground">{sub.category}</span>
              )}
            </div>
          </div>
          <Badge
            variant={sub.status === "active" ? "default" : "secondary"}
            className="text-[10px] shrink-0"
          >
            {STATUS_LABELS[sub.status]}
          </Badge>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-semibold tracking-tighter">
            {formatCurrency(monthly, defaultCurrency)}
          </span>
          <span className="text-xs text-muted-foreground">/月</span>
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5">
          {sub.type === "recurring" ? (
            <>
              <p>
                {formatCurrency(sub.amount ?? 0, sub.currency)} /{" "}
                {sub.billing_cycle ? BILLING_CYCLE_LABELS[sub.billing_cycle] : "—"}
              </p>
              {daysUntil !== null && (
                <p>
                  {daysUntil > 0
                    ? `${daysUntil} 天后续费`
                    : daysUntil === 0
                      ? "今天续费"
                      : "已逾期"}
                </p>
              )}
            </>
          ) : (
            <>
              <p>买断 {formatCurrency(sub.purchase_price ?? 0, sub.currency)}</p>
              <p>预期使用 {sub.expected_lifespan_months} 个月</p>
            </>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-[11px] text-muted-foreground">点击查看详情</p>
        </div>
      </div>
    </Link>
  );
}
