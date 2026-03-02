"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import { useCityCostItems } from "@/lib/hooks/use-city-cost-items";
import { useCountries } from "@/lib/hooks/use-countries";
import { useCountryCostItems } from "@/lib/hooks/use-country-cost-items";
import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { CityForm } from "@/components/cities/city-form";
import { CityCard } from "@/components/cities/city-card";
import { CountryForm } from "@/components/countries/country-form";
import { CountryCard } from "@/components/countries/country-card";
import { Button } from "@/components/ui/button";
import type {
  CitySubscription,
  CitySubscriptionInsert,
  Country,
  CountryInsert,
} from "@/lib/types";
import {
  formatCurrency,
  getCityCostItemMonthlyConverted,
  getCountryCostItemMonthlyConverted,
  getMonthlyCostConverted,
} from "@/lib/calculations";
import { getDefaultCurrency } from "@/lib/constants";
import { Plus, Globe, MapPin } from "lucide-react";

export default function CitiesPage() {
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
    addCity,
    updateCity,
  } = useCitySubscriptions();
  const {
    allItems: cityCostItems,
    loading: cityItemsLoading,
    error: cityItemsError,
  } = useCityCostItems();
  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
    addCountry,
    updateCountry,
  } = useCountries();
  const {
    allItems: countryCostItems,
    loading: countryItemsLoading,
    error: countryItemsError,
  } = useCountryCostItems();
  const {
    subscriptions,
    loading: subscriptionsLoading,
  } = useSubscriptions();

  const [cityFormOpen, setCityFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CitySubscription | null>(null);
  const [countryFormOpen, setCountryFormOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const defaultCurrency = getDefaultCurrency();
  const loading =
    citiesLoading ||
    cityItemsLoading ||
    countriesLoading ||
    countryItemsLoading ||
    subscriptionsLoading;
  const error = citiesError || cityItemsError || countriesError || countryItemsError;

  const activeCountries = useMemo(
    () => countries.filter((country) => country.status === "active"),
    [countries]
  );

  const activeCities = useMemo(
    () => cities.filter((city) => city.status === "active"),
    [cities]
  );

  // Calculate country totals
  const countryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const country of countries) {
      const total = countryCostItems
        .filter((item) => item.country_id === country.id && item.status === "active")
        .reduce(
          (sum, item) => sum + getCountryCostItemMonthlyConverted(item, defaultCurrency),
          0
        );
      map[country.id] = total;
    }
    return map;
  }, [countries, countryCostItems, defaultCurrency]);

  // Calculate city totals
  const cityTotals = useMemo(() => {
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

  // Count linked cities per country
  const linkedCityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const country of countries) {
      map[country.id] = cities.filter((city) => city.country_id === country.id).length;
    }
    return map;
  }, [countries, cities]);

  const countryMonthlyTotal = useMemo(
    () => activeCountries.reduce((sum, country) => sum + (countryTotals[country.id] ?? 0), 0),
    [activeCountries, countryTotals]
  );

  const cityMonthlyTotal = useMemo(
    () => activeCities.reduce((sum, city) => sum + (cityTotals[city.id] ?? 0), 0),
    [activeCities, cityTotals]
  );

  const normalMonthlyTotal = useMemo(() => {
    return subscriptions
      .filter((item) => item.status === "active")
      .reduce(
        (sum, item) => sum + getMonthlyCostConverted(item, defaultCurrency),
        0
      );
  }, [subscriptions, defaultCurrency]);

  const geographicMonthlyTotal = countryMonthlyTotal + cityMonthlyTotal;
  const overallMonthlyTotal = normalMonthlyTotal + geographicMonthlyTotal;
  const geographicRatio =
    overallMonthlyTotal <= 0 ? 0 : (geographicMonthlyTotal / overallMonthlyTotal) * 100;

  function handleOpenNewCountry() {
    setEditingCountry(null);
    setCountryFormOpen(true);
  }

  function handleOpenNewCity() {
    setEditingCity(null);
    setCityFormOpen(true);
  }

  async function handleCountrySubmit(data: CountryInsert) {
    if (editingCountry) {
      await updateCountry(editingCountry.id, data);
      return;
    }
    await addCountry(data);
  }

  async function handleCitySubmit(data: CitySubscriptionInsert) {
    if (editingCity) {
      await updateCity(editingCity.id, data);
      return;
    }
    await addCity(data);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 lg:px-10 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">地理订阅</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              管理你的国家成本（社保、税务）和城市成本（房租、水电）
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-2xl border bg-card p-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs text-muted-foreground">生效国家</p>
            <p className="font-mono text-2xl font-semibold mt-1">{activeCountries.length}</p>
          </div>
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
            <p className="text-xs text-muted-foreground">地理月总成本</p>
            <p className="font-mono text-2xl font-semibold mt-1">
              {formatCurrency(geographicMonthlyTotal, defaultCurrency)}
            </p>
          </div>
          <div
            className="rounded-2xl border bg-card p-4"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs text-muted-foreground">占总支出</p>
            <p className="font-mono text-2xl font-semibold mt-1">
              {Math.round(geographicRatio * 10) / 10}%
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border bg-card px-4 py-3 text-xs text-muted-foreground"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          地理成本已并入 Dashboard 总支出。为避免重复记账，社保/房租等不要在常规订阅重复录入。
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <PageTransition className="space-y-8">
            {/* Countries Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">国家层级</h2>
                </div>
                <Button onClick={handleOpenNewCountry} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  添加国家
                </Button>
              </div>

              {countries.length === 0 ? (
                <div
                  className="rounded-2xl border bg-card p-8 text-center"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <p className="text-muted-foreground mb-3">还没有国家订阅</p>
                  <Button onClick={handleOpenNewCountry} size="sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    创建第一个国家
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {countries.map((country) => (
                    <CountryCard
                      key={country.id}
                      country={country}
                      monthlyCost={countryTotals[country.id] ?? 0}
                      costItemCount={
                        countryCostItems.filter((item) => item.country_id === country.id).length
                      }
                      linkedCityCount={linkedCityCounts[country.id] ?? 0}
                      defaultCurrency={defaultCurrency}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cities Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">城市层级</h2>
                </div>
                <Button onClick={handleOpenNewCity} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  添加城市
                </Button>
              </div>

              {cities.length === 0 ? (
                <div
                  className="rounded-2xl border bg-card p-8 text-center"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <p className="text-muted-foreground mb-3">还没有城市订阅</p>
                  <Button onClick={handleOpenNewCity} size="sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    创建第一个城市
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {cities.map((city) => {
                    const linkedCountry = city.country_id
                      ? countries.find((c) => c.id === city.country_id)
                      : null;
                    return (
                      <CityCard
                        key={city.id}
                        city={city}
                        monthlyCost={cityTotals[city.id] ?? 0}
                        costItemCount={
                          cityCostItems.filter((item) => item.city_id === city.id).length
                        }
                        defaultCurrency={defaultCurrency}
                        linkedCountry={linkedCountry}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </PageTransition>
        )}
      </main>

      <CountryForm
        open={countryFormOpen}
        onOpenChange={setCountryFormOpen}
        country={editingCountry}
        onSubmit={handleCountrySubmit}
      />

      <CityForm
        open={cityFormOpen}
        onOpenChange={setCityFormOpen}
        city={editingCity}
        onSubmit={handleCitySubmit}
      />
    </div>
  );
}
