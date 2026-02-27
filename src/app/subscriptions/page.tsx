"use client";

import { useMemo, useState } from "react";
import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { getMonthlyCost, getDaysUntilBilling } from "@/lib/calculations";
import type { Subscription, SubscriptionInsert, SubscriptionStatus } from "@/lib/types";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { SubscriptionListItem } from "@/components/subscriptions/subscription-list-item";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import {
  SubscriptionFilters,
  type SortKey,
  type ViewMode,
} from "@/components/subscriptions/subscription-filters";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SubscriptionsPage() {
  const {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"recurring" | "lifetime" | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("monthly_cost");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    let list = [...subscriptions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.category && s.category.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((s) => s.type === typeFilter);
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case "monthly_cost":
          return getMonthlyCost(b) - getMonthlyCost(a);
        case "next_billing": {
          const da = getDaysUntilBilling(a) ?? 9999;
          const db = getDaysUntilBilling(b) ?? 9999;
          return da - db;
        }
        case "name":
          return a.name.localeCompare(b.name, "zh-CN");
        default:
          return 0;
      }
    });

    return list;
  }, [subscriptions, search, categoryFilter, statusFilter, typeFilter, sortKey]);

  function handleEdit(sub: Subscription) {
    setEditing(sub);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这条订阅吗？")) return;
    await deleteSubscription(id);
  }

  async function handleSubmit(data: SubscriptionInsert) {
    if (editing) {
      await updateSubscription(editing.id, data);
    } else {
      await addSubscription(data);
    }
  }

  function handleOpenNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 lg:px-10 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">订阅管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              管理你的所有订阅和买断制商品
            </p>
          </div>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-1.5" />
            添加订阅
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">还没有任何订阅</p>
            <Button onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-1.5" />
              添加第一个订阅
            </Button>
          </div>
        ) : (
          <PageTransition className="space-y-5">
            <SubscriptionFilters
              search={search}
              onSearchChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              sortKey={sortKey}
              onSortKeyChange={setSortKey}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                没有匹配的订阅
              </div>
            ) : viewMode === "grid" ? (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((sub) => (
                  <StaggerItem key={sub.id}>
                    <SubscriptionCard
                      subscription={sub}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <StaggerContainer className="space-y-2">
                {filtered.map((sub) => (
                  <StaggerItem key={sub.id}>
                    <SubscriptionListItem
                      subscription={sub}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            <p className="text-xs text-muted-foreground text-center">
              共 {filtered.length} 条{filtered.length !== subscriptions.length && ` / ${subscriptions.length} 条`}
            </p>
          </PageTransition>
        )}

        <SubscriptionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          subscription={editing}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
