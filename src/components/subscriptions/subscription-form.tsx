"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/motion/animated-number";
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionType,
  BillingCycle,
  Category,
  SubscriptionStatus,
} from "@/lib/types";
import { getCategoryNames, BILLING_CYCLE_LABELS, DEFAULT_CURRENCY } from "@/lib/constants";
import { getMonthlyCost, formatCurrency } from "@/lib/calculations";
import { getDefaultCurrency, convertCurrency } from "@/lib/constants";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onSubmit: (data: SubscriptionInsert) => Promise<void>;
}

const emptyForm: SubscriptionInsert = {
  name: "",
  icon_url: null,
  category: null,
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
};

export function SubscriptionForm({ open, onOpenChange, subscription, onSubmit }: Props) {
  const [form, setForm] = useState<SubscriptionInsert>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subscription) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, user_id, created_at, updated_at, ...rest } = subscription;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [subscription, open]);

  function update<K extends keyof SubscriptionInsert>(
    key: K,
    value: SubscriptionInsert[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const previewMonthly = getMonthlyCost({
    ...form,
    id: "",
    user_id: "",
    created_at: "",
    updated_at: "",
  } as Subscription);

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
          <SheetTitle>{subscription ? "编辑订阅" : "添加订阅"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6">
          <div className="space-y-1.5">
            <Label>名称</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Netflix / MacBook Pro ..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>分类</Label>
            <Select
              value={form.category ?? ""}
              onValueChange={(v) => update("category", v as Category)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {getCategoryNames().map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>类型</Label>
            <Select
              value={form.type}
              onValueChange={(v) => update("type", v as SubscriptionType)}
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

          <div className="space-y-1.5">
            <Label>货币</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => update("currency", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">人民币 (¥)</SelectItem>
                <SelectItem value="USD">美元 ($)</SelectItem>
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
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>周期</Label>
                  <Select
                    value={form.billing_cycle ?? "monthly"}
                    onValueChange={(v) => update("billing_cycle", v as BillingCycle)}
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
                  <Label>下次续费日</Label>
                  <Input
                    type="date"
                    value={form.next_billing ?? ""}
                    onChange={(e) =>
                      update("next_billing", e.target.value || null)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>开始日期</Label>
                  <Input
                    type="date"
                    value={form.started_at ?? ""}
                    onChange={(e) =>
                      update("started_at", e.target.value || null)
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>购买价格</Label>
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
                    placeholder="0.00"
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
                    placeholder="36"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>购买日期</Label>
                <Input
                  type="date"
                  value={form.purchase_date ?? ""}
                  onChange={(e) =>
                    update("purchase_date", e.target.value || null)
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v as SubscriptionStatus)}
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
              placeholder="可选备注..."
              rows={2}
            />
          </div>

          <CostPreview type={form.type} previewMonthly={previewMonthly} purchasePrice={form.purchase_price} lifespanMonths={form.expected_lifespan_months} currency={form.currency} />

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "保存中..." : subscription ? "保存修改" : "添加订阅"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function CostPreview({
  type,
  previewMonthly,
  purchasePrice,
  lifespanMonths,
  currency,
}: {
  type: string;
  previewMonthly: number;
  purchasePrice: number | null;
  lifespanMonths: number | null;
  currency: string;
}) {
  const defaultCurrency = getDefaultCurrency();
  const needsConversion = currency !== defaultCurrency;
  const convertedMonthly = needsConversion
    ? convertCurrency(previewMonthly, currency, defaultCurrency)
    : previewMonthly;

  const currencyFmt = useCallback(
    (v: number) => formatCurrency(v, defaultCurrency),
    [defaultCurrency]
  );
  const showBreakdown = type === "lifetime" && purchasePrice && lifespanMonths;

  return (
    <motion.div
      layout
      className="rounded-xl border p-3 text-center overflow-hidden"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <p className="text-xs text-muted-foreground mb-1">折算月度成本</p>

      <AnimatePresence mode="wait">
        {showBreakdown ? (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="mb-1"
          >
            <p className="text-xs text-muted-foreground">
              {formatCurrency(purchasePrice, currency)} &divide; {lifespanMonths}个月
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="font-mono text-xl font-semibold tracking-tighter">
        <AnimatedNumber value={convertedMonthly} formatter={currencyFmt} />
        <span className="text-xs font-normal text-muted-foreground ml-1">
          /月
        </span>
      </p>
      {needsConversion && (
        <p className="text-[10px] text-muted-foreground mt-1">
          原始: {formatCurrency(previewMonthly, currency)}/月
        </p>
      )}
    </motion.div>
  );
}
