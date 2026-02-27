"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BillingCycle,
  CityCostCategory,
  CityCostItem,
  CityCostItemInsert,
  SubscriptionStatus,
  SubscriptionType,
} from "@/lib/types";
import {
  BILLING_CYCLE_LABELS,
  CITY_COST_CATEGORY_LABELS,
  DEFAULT_CURRENCY,
  convertCurrency,
  getDefaultCurrency,
} from "@/lib/constants";
import { formatCurrency, getMonthlyCostFromCostLike } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cityId: string;
  item?: CityCostItem | null;
  onSubmit: (data: CityCostItemInsert) => Promise<void>;
}

function createEmptyForm(cityId: string): CityCostItemInsert {
  return {
    city_id: cityId,
    name: "",
    category: "housing",
    type: "recurring",
    amount: null,
    currency: DEFAULT_CURRENCY,
    billing_cycle: "monthly",
    custom_cycle_days: null,
    next_billing: null,
    started_at: null,
    purchase_price: null,
    purchase_date: null,
    expected_lifespan_months: null,
    status: "active",
    notes: null,
    sort_order: 0,
  };
}

export function CityCostItemForm({
  open,
  onOpenChange,
  cityId,
  item,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CityCostItemInsert>(createEmptyForm(cityId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, user_id, created_at, updated_at, ...rest } = item;
      setForm(rest);
    } else {
      setForm(createEmptyForm(cityId));
    }
  }, [item, cityId, open]);

  function update<K extends keyof CityCostItemInsert>(
    key: K,
    value: CityCostItemInsert[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const defaultCurrency = getDefaultCurrency();
  const monthlyCost = useMemo(
    () => getMonthlyCostFromCostLike(form),
    [form]
  );
  const convertedMonthly =
    form.currency === defaultCurrency
      ? monthlyCost
      : convertCurrency(monthlyCost, form.currency || "CNY", defaultCurrency);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? "编辑城市成本项" : "添加城市成本项"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6">
          <div className="space-y-1.5">
            <Label>项目名称</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="房租 / 水费 / 电费 / 物业..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>分类</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  update("category", value as CityCostCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CITY_COST_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  update("type", value as SubscriptionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">周期订阅</SelectItem>
                  <SelectItem value="lifetime">买断制</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>货币</Label>
            <Select value={form.currency} onValueChange={(value) => update("currency", value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">人民币 (¥)</SelectItem>
                <SelectItem value="USD">美元 ($)</SelectItem>
                <SelectItem value="JPY">日元 (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.type === "recurring" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>金额</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount ?? ""}
                    onChange={(e) =>
                      update("amount", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>周期</Label>
                  <Select
                    value={form.billing_cycle ?? "monthly"}
                    onValueChange={(value) =>
                      update("billing_cycle", value as BillingCycle)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.billing_cycle === "custom" && (
                <div className="space-y-1.5">
                  <Label>自定义周期（天）</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.custom_cycle_days ?? ""}
                    onChange={(e) =>
                      update(
                        "custom_cycle_days",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>下次扣费日</Label>
                  <Input
                    type="date"
                    value={form.next_billing ?? ""}
                    onChange={(e) => update("next_billing", e.target.value || null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>开始日期</Label>
                  <Input
                    type="date"
                    value={form.started_at ?? ""}
                    onChange={(e) => update("started_at", e.target.value || null)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>买断价格</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.purchase_price ?? ""}
                    onChange={(e) =>
                      update(
                        "purchase_price",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>预期使用（月）</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.expected_lifespan_months ?? ""}
                    onChange={(e) =>
                      update(
                        "expected_lifespan_months",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>购买日期</Label>
                <Input
                  type="date"
                  value={form.purchase_date ?? ""}
                  onChange={(e) => update("purchase_date", e.target.value || null)}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                update("status", value as SubscriptionStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>备注</Label>
            <Textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value || null)}
              rows={2}
            />
          </div>

          <div
            className="rounded-xl border p-3 text-center"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <p className="text-xs text-muted-foreground mb-1">折算月度成本</p>
            <p className="font-mono text-xl font-semibold tracking-tighter">
              {formatCurrency(convertedMonthly, defaultCurrency)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/月</span>
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "保存中..." : item ? "保存修改" : "添加成本项"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
