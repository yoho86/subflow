"use client";

import type { Subscription } from "@/lib/types";
import { getMonthlyCostConverted, formatCurrency, getDaysUntilBilling } from "@/lib/calculations";
import { getCategoryColor, BILLING_CYCLE_LABELS, STATUS_LABELS, getDefaultCurrency } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionListItem({ subscription: sub, onEdit, onDelete }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const monthly = getMonthlyCostConverted(sub, defaultCurrency);
  const daysUntil = getDaysUntilBilling(sub);
  const categoryColor = getCategoryColor(sub.category ?? "");

  return (
    <div
      className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3 hover:shadow-md transition-shadow"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm font-medium shrink-0"
        style={{ backgroundColor: categoryColor }}
      >
        {sub.name.slice(0, 1)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{sub.name}</span>
          <Badge
            variant={sub.status === "active" ? "default" : "secondary"}
            className="text-[10px] shrink-0"
          >
            {STATUS_LABELS[sub.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sub.category ?? "未分类"}
          {sub.type === "recurring" && sub.billing_cycle
            ? ` · ${formatCurrency(sub.amount ?? 0, sub.currency)}/${BILLING_CYCLE_LABELS[sub.billing_cycle]}`
            : ` · 买断 ${formatCurrency(sub.purchase_price ?? 0, sub.currency)}`}
          {daysUntil !== null && (
            <span>
              {" · "}
              {daysUntil === 0 ? "今天续费" : daysUntil > 0 ? `${daysUntil}天后续费` : "已逾期"}
            </span>
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span className="font-mono text-lg font-semibold tracking-tighter">
          {formatCurrency(monthly, defaultCurrency)}
        </span>
        <span className="text-xs text-muted-foreground ml-0.5">/月</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(sub)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(sub.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
