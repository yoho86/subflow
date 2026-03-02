"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CityForm } from "@/components/cities/city-form";
import { CityCostItemForm } from "@/components/cities/city-cost-item-form";
import { CityCostItemList } from "@/components/cities/city-cost-item-list";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import { useCityCostItems } from "@/lib/hooks/use-city-cost-items";
import { useCountries } from "@/lib/hooks/use-countries";
import type {
  CityCostItem,
  CityCostItemInsert,
  CitySubscriptionInsert,
} from "@/lib/types";
import { formatCurrency, getCityCostItemMonthlyConverted } from "@/lib/calculations";
import { CITY_STATUS_LABELS, getDefaultCurrency } from "@/lib/constants";

function CityDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityId = searchParams.get("id");

  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
    updateCity,
    deleteCity,
  } = useCitySubscriptions();
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addCityCostItem,
    updateCityCostItem,
    deleteCityCostItem,
  } = useCityCostItems(cityId);
  const { countries } = useCountries();

  const [cityFormOpen, setCityFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CityCostItem | null>(null);

  const city = useMemo(
    () => cities.find((item) => item.id === cityId) ?? null,
    [cities, cityId]
  );

  const linkedCountry = useMemo(
    () => city?.country_id ? countries.find((c) => c.id === city.country_id) : null,
    [city, countries]
  );

  const defaultCurrency = getDefaultCurrency();
  const monthlyTotal = useMemo(
    () =>
      items
        .filter((item) => item.status === "active")
        .reduce(
          (sum, item) => sum + getCityCostItemMonthlyConverted(item, defaultCurrency),
          0
        ),
    [items, defaultCurrency]
  );

  const loading = citiesLoading || itemsLoading;
  const error = citiesError || itemsError;

  async function handleSaveCity(data: CitySubscriptionInsert) {
    if (!city) return;
    await updateCity(city.id, data);
    setCityFormOpen(false);
  }

  async function handleDeleteCity() {
    if (!city) return;
    if (!confirm("确定要删除这个城市吗？关联成本项会被一并删除。")) return;
    await deleteCity(city.id);
    router.push("/cities");
  }

  function handleOpenNewItem() {
    setEditingItem(null);
    setItemFormOpen(true);
  }

  function handleEditItem(item: CityCostItem) {
    setEditingItem(item);
    setItemFormOpen(true);
  }

  async function handleSaveItem(data: CityCostItemInsert) {
    if (editingItem) {
      await updateCityCostItem(editingItem.id, data);
      setItemFormOpen(false);
      return;
    }
    await addCityCostItem(data);
    setItemFormOpen(false);
  }

  async function handleToggleItemStatus(item: CityCostItem) {
    const nextStatus = item.status === "active" ? "paused" : "active";
    await updateCityCostItem(item.id, { status: nextStatus });
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("确定删除这个成本项吗？")) return;
    await deleteCityCostItem(id);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 lg:px-10 py-6 space-y-6">
        <Link
          href="/cities"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          返回城市列表
        </Link>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !city ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-muted-foreground">未找到城市订阅</p>
            <Button asChild variant="outline">
              <Link href="/cities">返回城市列表</Link>
            </Button>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <Card style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{city.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={city.status === "active" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {CITY_STATUS_LABELS[city.status]}
                    </Badge>
                    {linkedCountry && (
                      <Link href={`/cities/country/${linkedCountry.id}`}>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary/80">
                          {linkedCountry.name}
                        </Badge>
                      </Link>
                    )}
                    {!linkedCountry && (city.country || city.region) && (
                      <span className="text-xs text-muted-foreground">
                        {[city.country, city.region].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCityFormOpen(true)}>
                    编辑城市
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void handleDeleteCity()}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    删除城市
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">城市月度成本</p>
                <p className="font-mono text-3xl font-semibold tracking-tighter mt-1">
                  {formatCurrency(monthlyTotal, defaultCurrency)}
                  <span className="text-xs text-muted-foreground ml-1">/月</span>
                </p>
                {city.notes?.trim() && (
                  <p className="text-sm text-muted-foreground mt-3">{city.notes}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">城市成本项</h2>
                <p className="text-sm text-muted-foreground">
                  支持周期订阅和买断制，统一折算为月度成本
                </p>
              </div>
              <Button onClick={handleOpenNewItem}>
                <Plus className="h-4 w-4 mr-1.5" />
                添加成本项
              </Button>
            </div>

            <CityCostItemList
              items={items}
              defaultCurrency={defaultCurrency}
              onEdit={handleEditItem}
              onToggleStatus={handleToggleItemStatus}
              onDelete={handleDeleteItem}
            />
          </PageTransition>
        )}
      </main>

      {city && (
        <CityForm
          open={cityFormOpen}
          onOpenChange={setCityFormOpen}
          city={city}
          onSubmit={handleSaveCity}
        />
      )}
      {cityId && (
        <CityCostItemForm
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          cityId={cityId}
          item={editingItem}
          onSubmit={handleSaveItem}
        />
      )}
    </div>
  );
}

export default function CityDetailPage() {
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
      <CityDetailContent />
    </Suspense>
  );
}
