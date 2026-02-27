"use client";

import type { CityCostItem } from "@/lib/types";
import {
  formatCurrency,
  getCityCostItemMonthlyConverted,
} from "@/lib/calculations";
import {
  BILLING_CYCLE_LABELS,
  CITY_COST_CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Power, Trash2 } from "lucide-react";

interface Props {
  items: CityCostItem[];
  defaultCurrency: string;
  onEdit: (item: CityCostItem) => void;
  onToggleStatus: (item: CityCostItem) => void;
  onDelete: (id: string) => void;
}

export function CityCostItemList({
  items,
  defaultCurrency,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-card p-6 text-center text-muted-foreground"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        暂无成本项
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const monthlyCost = getCityCostItemMonthlyConverted(item, defaultCurrency);
        const recurringSummary =
          item.type === "recurring"
            ? `${formatCurrency(item.amount ?? 0, item.currency)} / ${
                item.billing_cycle ? BILLING_CYCLE_LABELS[item.billing_cycle] : "—"
              }`
            : `买断 ${formatCurrency(item.purchase_price ?? 0, item.currency)}`;

        return (
          <div
            key={item.id}
            className="rounded-xl border bg-card px-4 py-3 flex items-center gap-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {CITY_COST_CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {recurringSummary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-mono text-base font-semibold">
                {formatCurrency(monthlyCost, defaultCurrency)}
                <span className="text-xs text-muted-foreground ml-1">/月</span>
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(item)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onToggleStatus(item)}
                title={item.status === "active" ? "暂停" : "启用"}
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
