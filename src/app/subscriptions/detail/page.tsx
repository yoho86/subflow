"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import type { SubscriptionInsert } from "@/lib/types";
import {
  formatCurrency,
  getDaysUntilBilling,
  getMonthlyCostConverted,
} from "@/lib/calculations";
import {
  BILLING_CYCLE_LABELS,
  STATUS_LABELS,
  getCategoryColor,
  getDefaultCurrency,
} from "@/lib/constants";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function SubscriptionDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const { subscriptions, loading, error, updateSubscription, deleteSubscription } =
    useSubscriptions();
  const [formOpen, setFormOpen] = useState(false);

  const subscription = useMemo(
    () => subscriptions.find((item) => item.id === id) ?? null,
    [subscriptions, id]
  );

  const defaultCurrency = getDefaultCurrency();
  const monthlyCost = subscription
    ? getMonthlyCostConverted(subscription, defaultCurrency)
    : 0;
  const daysUntilBilling = subscription ? getDaysUntilBilling(subscription) : null;
  const categoryColor = getCategoryColor(subscription?.category ?? "");

  async function handleSave(data: SubscriptionInsert) {
    if (!subscription) return;
    await updateSubscription(subscription.id, data);
    setFormOpen(false);
  }

  async function handleDelete() {
    if (!subscription) return;
    if (!confirm("确定要删除这条订阅吗？删除后不可恢复。")) return;
    await deleteSubscription(subscription.id);
    router.push("/subscriptions");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 lg:px-10 py-6 space-y-6">
        <Link
          href="/subscriptions"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          返回订阅列表
        </Link>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !subscription ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-muted-foreground">未找到这条订阅</p>
            <Button asChild variant="outline">
              <Link href="/subscriptions">返回订阅列表</Link>
            </Button>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <Card style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-medium shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {subscription.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-xl truncate">{subscription.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          subscription.status === "active" ? "default" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {STATUS_LABELS[subscription.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {subscription.category ?? "未分类"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" onClick={() => setFormOpen(true)}>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    编辑
                  </Button>
                  <Button variant="destructive" onClick={() => void handleDelete()}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    删除
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">折算月度成本</p>
                  <p className="font-mono text-3xl font-semibold tracking-tighter">
                    {formatCurrency(monthlyCost, defaultCurrency)}
                    <span className="text-xs text-muted-foreground ml-1">/月</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <Field label="类型" value={subscription.type === "recurring" ? "周期订阅" : "买断制"} />
                  <Field label="原始货币" value={subscription.currency} />

                  {subscription.type === "recurring" ? (
                    <>
                      <Field
                        label="计费金额"
                        value={formatCurrency(subscription.amount ?? 0, subscription.currency)}
                      />
                      <Field
                        label="计费周期"
                        value={
                          subscription.billing_cycle
                            ? BILLING_CYCLE_LABELS[subscription.billing_cycle]
                            : "—"
                        }
                      />
                      <Field label="下次续费日" value={subscription.next_billing ?? "—"} />
                      <Field label="开始日期" value={subscription.started_at ?? "—"} />
                      <Field
                        label="距离续费"
                        value={
                          daysUntilBilling === null
                            ? "—"
                            : daysUntilBilling === 0
                              ? "今天"
                              : daysUntilBilling > 0
                                ? `${daysUntilBilling} 天后`
                                : "已逾期"
                        }
                      />
                    </>
                  ) : (
                    <>
                      <Field
                        label="买断价格"
                        value={formatCurrency(
                          subscription.purchase_price ?? 0,
                          subscription.currency
                        )}
                      />
                      <Field
                        label="预期使用"
                        value={
                          subscription.expected_lifespan_months
                            ? `${subscription.expected_lifespan_months} 个月`
                            : "—"
                        }
                      />
                      <Field label="购买日期" value={subscription.purchase_date ?? "—"} />
                    </>
                  )}

                  <Field
                    label="备注"
                    value={subscription.notes?.trim() ? subscription.notes : "—"}
                  />
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}
      </main>

      {subscription && (
        <SubscriptionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          subscription={subscription}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

export default function SubscriptionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="px-6 lg:px-10 py-6">
            <div className="text-center py-20 text-muted-foreground">加载中...</div>
          </main>
        </div>
      }
    >
      <SubscriptionDetailContent />
    </Suspense>
  );
}
