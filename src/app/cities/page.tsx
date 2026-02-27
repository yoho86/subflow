"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import { useCityCostItems } from "@/lib/hooks/use-city-cost-items";
import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { CityForm } from "@/components/cities/city-form";
import { CityCard } from "@/components/cities/city-card";
import { Button } from "@/components/ui/button";
import type { CitySubscription, CitySubscriptionInsert } from "@/lib/types";
import {
  formatCurrency,
  getCityCostItemMonthlyConverted,
  getMonthlyCostConverted,
} from "@/lib/calculations";
import { getDefaultCurrency, CITY_STATUS_LABELS } from "@/lib/constants";
import { Plus, Pencil, Archive, Undo2, Trash2 } from "lucide-react";

export default function CitiesPage() {
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
    addCity,
    updateCity,
    deleteCity,
  } = useCitySubscriptions();
  const {
    allItems: cityCostItems,
    loading: itemsLoading,
    error: itemsError,
  } = useCityCostItems();
  const {
    subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CitySubscription | null>(null);

  const defaultCurrency = getDefaultCurrency();
  const loading = citiesLoading || itemsLoading || subscriptionsLoading;
  const error = citiesError || itemsError || subscriptionsError;

  const activeCities = useMemo(
    () => cities.filter((city) => city.status === "active"),
    [cities]
  );

  const cityTotalsByCityId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const city of cities) {
      const total = cityCostItems
        .filter((item) => item.city_id === city.id && item.status === "active")
        .reduce(
          (sum, item) => sum + getCityCostItemMonthlyConverted(item, defaultCurrency),
          0
        );
      map[city.id] = total;
    }
    return map;
  }, [cities, cityCostItems, defaultCurrency]);

  const cityMonthlyTotal = useMemo(
    () => activeCities.reduce((sum, city) => sum + (cityTotalsByCityId[city.id] ?? 0), 0),
    [activeCities, cityTotalsByCityId]
  );

  const normalMonthlyTotal = useMemo(() => {
    return subscriptions
      .filter((item) => item.status === "active")
      .reduce(
        (sum, item) => sum + getMonthlyCostConverted(item, defaultCurrency),
        0
      );
  }, [subscriptions, defaultCurrency]);

  const overallMonthlyTotal = normalMonthlyTotal + cityMonthlyTotal;
  const cityRatio =
    overallMonthlyTotal <= 0 ? 0 : (cityMonthlyTotal / overallMonthlyTotal) * 100;

  function handleOpenNew() {
    setEditingCity(null);
    setFormOpen(true);
  }

  function handleEdit(city: CitySubscription) {
    setEditingCity(city);
    setFormOpen(true);
  }

  async function handleSubmit(data: CitySubscriptionInsert) {
    if (editingCity) {
      await updateCity(editingCity.id, data);
      return;
    }
    await addCity(data);
  }

  async function handleArchiveToggle(city: CitySubscription) {
    const nextStatus = city.status === "archived" ? "active" : "archived";
    await updateCity(city.id, { status: nextStatus });
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个城市订阅吗？关联成本项会一并删除。")) return;
    await deleteCity(id);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 lg:px-10 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">城市订阅</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              把住房、水电和生活成本当作你对城市的订阅
            </p>
          </div>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-1.5" />
            添加城市
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="rounded-2xl border bg-card p-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs text-muted-foreground">生效城市</p>
            <p className="font-mono text-2xl font-semibold mt-1">{activeCities.length}</p>
          </div>
          <div
            className="rounded-2xl border bg-card p-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs text-muted-foreground">城市月总成本</p>
            <p className="font-mono text-2xl font-semibold mt-1">
              {formatCurrency(cityMonthlyTotal, defaultCurrency)}
            </p>
          </div>
          <div
            className="rounded-2xl border bg-card p-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs text-muted-foreground">城市占总支出</p>
            <p className="font-mono text-2xl font-semibold mt-1">
              {Math.round(cityRatio * 10) / 10}%
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border bg-card px-4 py-3 text-xs text-muted-foreground"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          城市成本已并入 Dashboard 总支出。为避免重复记账，房租/水电等不要在常规订阅重复录入。
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground">还没有城市订阅</p>
            <Button onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-1.5" />
              创建第一个城市
            </Button>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  monthlyCost={cityTotalsByCityId[city.id] ?? 0}
                  costItemCount={
                    cityCostItems.filter((item) => item.city_id === city.id).length
                  }
                  defaultCurrency={defaultCurrency}
                />
              ))}
            </div>

            <div
              className="rounded-2xl border bg-card p-4"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">城市管理</h3>
              <div className="space-y-2">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="rounded-lg border px-3 py-2 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{city.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {CITY_STATUS_LABELS[city.status]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEdit(city)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => void handleArchiveToggle(city)}
                      >
                        {city.status === "archived" ? (
                          <>
                            <Undo2 className="h-3.5 w-3.5 mr-1" />
                            恢复
                          </>
                        ) : (
                          <>
                            <Archive className="h-3.5 w-3.5 mr-1" />
                            归档
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => void handleDelete(city.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PageTransition>
        )}
      </main>

      <CityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        city={editingCity}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
