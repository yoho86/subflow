"use client";

import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import { useCityCostItems } from "@/lib/hooks/use-city-cost-items";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { BillingCalendar } from "@/components/dashboard/billing-calendar";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { CityCostSummary } from "@/components/dashboard/city-cost-summary";
import {
  getCityCostItemMonthlyConverted,
  getMonthlyCostConverted,
} from "@/lib/calculations";
import { getDefaultCurrency } from "@/lib/constants";

export default function DashboardPage() {
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError } =
    useSubscriptions();
  const { cities, loading: citiesLoading, error: citiesError } = useCitySubscriptions();
  const { allItems: cityItems, loading: cityItemsLoading, error: cityItemsError } =
    useCityCostItems();

  const loading = subscriptionsLoading;
  const error = subscriptionsError;
  const cityLoading = citiesLoading || cityItemsLoading;
  const cityError = citiesError || cityItemsError;
  const cityDataAvailable = !cityLoading && !cityError;
  const defaultCurrency = getDefaultCurrency();

  const regularMonthly = subscriptions
    .filter((item) => item.status === "active")
    .reduce(
      (sum, item) => sum + getMonthlyCostConverted(item, defaultCurrency),
      0
    );

  const effectiveCities = cityDataAvailable ? cities : [];
  const effectiveCityItems = cityDataAvailable ? cityItems : [];

  const activeCities = effectiveCities.filter((city) => city.status === "active");
  const activeCityIds = new Set(activeCities.map((city) => city.id));

  const cityTotalsByCityId: Record<string, number> = {};
  for (const city of activeCities) {
    cityTotalsByCityId[city.id] = 0;
  }
  for (const item of effectiveCityItems) {
    if (item.status !== "active" || !activeCityIds.has(item.city_id)) continue;
    cityTotalsByCityId[item.city_id] =
      (cityTotalsByCityId[item.city_id] ?? 0) +
      getCityCostItemMonthlyConverted(item, defaultCurrency);
  }

  const cityMonthly = Object.values(cityTotalsByCityId).reduce((sum, value) => sum + value, 0);
  const overallMonthly = regularMonthly + (cityDataAvailable ? cityMonthly : 0);
  const overallYearly = overallMonthly * 12;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 lg:px-20 xl:px-32 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            你的订阅支出一览
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            加载中...
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <StatsCards
              subscriptions={subscriptions}
              overallMonthly={overallMonthly}
              overallYearly={overallYearly}
            />
            {cityLoading ? (
              <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                城市成本加载中...
              </div>
            ) : cityError ? (
              <div className="rounded-2xl border border-amber-300/60 bg-amber-50/60 p-5">
                <p className="text-sm text-amber-800">
                  城市模块暂不可用，已降级为仅统计常规订阅。请确认线上已执行最新数据库 schema。
                </p>
                <p className="text-xs text-amber-700 mt-1 break-all">{cityError}</p>
              </div>
            ) : (
              <CityCostSummary
                cities={effectiveCities}
                cityMonthlyTotal={cityMonthly}
                overallMonthlyTotal={overallMonthly}
                cityTotalsByCityId={cityTotalsByCityId}
                defaultCurrency={defaultCurrency}
              />
            )}
            <TrendChart subscriptions={subscriptions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <CategoryChart subscriptions={subscriptions} />
              <BillingCalendar subscriptions={subscriptions} />
            </div>
            <UpcomingList subscriptions={subscriptions} />
          </PageTransition>
        )}
      </main>
    </div>
  );
}
