"use client";

import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import { useCityCostItems } from "@/lib/hooks/use-city-cost-items";
import { useCountries } from "@/lib/hooks/use-countries";
import { useCountryCostItems } from "@/lib/hooks/use-country-cost-items";
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
  getCountryCostItemMonthlyConverted,
  getMonthlyCostConverted,
} from "@/lib/calculations";
import { getDefaultCurrency } from "@/lib/constants";

export default function DashboardPage() {
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError } =
    useSubscriptions();
  const { cities, loading: citiesLoading, error: citiesError } = useCitySubscriptions();
  const { allItems: cityItems, loading: cityItemsLoading, error: cityItemsError } =
    useCityCostItems();
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  const { allItems: countryItems, loading: countryItemsLoading, error: countryItemsError } =
    useCountryCostItems();

  const loading = subscriptionsLoading;
  const error = subscriptionsError;
  const geoLoading = citiesLoading || cityItemsLoading || countriesLoading || countryItemsLoading;
  const geoError = citiesError || cityItemsError || countriesError || countryItemsError;
  const geoDataAvailable = !geoLoading && !geoError;
  const defaultCurrency = getDefaultCurrency();

  const regularMonthly = subscriptions
    .filter((item) => item.status === "active")
    .reduce(
      (sum, item) => sum + getMonthlyCostConverted(item, defaultCurrency),
      0
    );

  const effectiveCountries = geoDataAvailable ? countries : [];
  const effectiveCountryItems = geoDataAvailable ? countryItems : [];
  const effectiveCities = geoDataAvailable ? cities : [];
  const effectiveCityItems = geoDataAvailable ? cityItems : [];

  const activeCountries = effectiveCountries.filter((country) => country.status === "active");
  const activeCities = effectiveCities.filter((city) => city.status === "active");
  const activeCountryIds = new Set(activeCountries.map((country) => country.id));
  const activeCityIds = new Set(activeCities.map((city) => city.id));

  // Calculate country totals
  const countryTotalsByCountryId: Record<string, number> = {};
  for (const country of activeCountries) {
    countryTotalsByCountryId[country.id] = 0;
  }
  for (const item of effectiveCountryItems) {
    if (item.status !== "active" || !activeCountryIds.has(item.country_id)) continue;
    countryTotalsByCountryId[item.country_id] =
      (countryTotalsByCountryId[item.country_id] ?? 0) +
      getCountryCostItemMonthlyConverted(item, defaultCurrency);
  }

  // Calculate city totals
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

  const countryMonthly = Object.values(countryTotalsByCountryId).reduce((sum, value) => sum + value, 0);
  const cityMonthly = Object.values(cityTotalsByCityId).reduce((sum, value) => sum + value, 0);
  const geographicMonthly = countryMonthly + cityMonthly;
  const overallMonthly = regularMonthly + (geoDataAvailable ? geographicMonthly : 0);
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
            {geoLoading ? (
              <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                地理成本加载中...
              </div>
            ) : geoError ? (
              <div className="rounded-2xl border border-amber-300/60 bg-amber-50/60 p-5">
                <p className="text-sm text-amber-800">
                  地理模块暂不可用，已降级为仅统计常规订阅。请确认线上已执行最新数据库 schema。
                </p>
                <p className="text-xs text-amber-700 mt-1 break-all">{geoError}</p>
              </div>
            ) : (
              <CityCostSummary
                countries={effectiveCountries}
                cities={effectiveCities}
                countryMonthlyTotal={countryMonthly}
                cityMonthlyTotal={cityMonthly}
                overallMonthlyTotal={overallMonthly}
                countryTotalsByCountryId={countryTotalsByCountryId}
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
