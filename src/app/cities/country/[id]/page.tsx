"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryForm } from "@/components/countries/country-form";
import { CountryCostItemForm } from "@/components/countries/country-cost-item-form";
import { CountryCostItemList } from "@/components/countries/country-cost-item-list";
import { useCountries } from "@/lib/hooks/use-countries";
import { useCountryCostItems } from "@/lib/hooks/use-country-cost-items";
import { useCitySubscriptions } from "@/lib/hooks/use-city-subscriptions";
import type {
  CountryCostItem,
  CountryCostItemInsert,
  CountryInsert,
} from "@/lib/types";
import { formatCurrency, getCountryCostItemMonthlyConverted } from "@/lib/calculations";
import { COUNTRY_STATUS_LABELS, getDefaultCurrency } from "@/lib/constants";

export const runtime = "edge";

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;

  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
    updateCountry,
    deleteCountry,
  } = useCountries();
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addCountryCostItem,
    updateCountryCostItem,
    deleteCountryCostItem,
  } = useCountryCostItems(countryId);
  const { cities } = useCitySubscriptions();

  const [countryFormOpen, setCountryFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CountryCostItem | null>(null);

  const country = useMemo(
    () => countries.find((item) => item.id === countryId) ?? null,
    [countries, countryId]
  );

  const linkedCities = useMemo(
    () => cities.filter((city) => city.country_id === countryId),
    [cities, countryId]
  );

  const defaultCurrency = getDefaultCurrency();
  const monthlyTotal = useMemo(
    () =>
      items
        .filter((item) => item.status === "active")
        .reduce(
          (sum, item) => sum + getCountryCostItemMonthlyConverted(item, defaultCurrency),
          0
        ),
    [items, defaultCurrency]
  );

  const loading = countriesLoading || itemsLoading;
  const error = countriesError || itemsError;

  async function handleSaveCountry(data: CountryInsert) {
    if (!country) return;
    await updateCountry(country.id, data);
    setCountryFormOpen(false);
  }

  async function handleDeleteCountry() {
    if (!country) return;
    if (!confirm("确定要删除这个国家吗？关联成本项会被一并删除。")) return;
    await deleteCountry(country.id);
    router.push("/cities");
  }

  function handleOpenNewItem() {
    setEditingItem(null);
    setItemFormOpen(true);
  }

  function handleEditItem(item: CountryCostItem) {
    setEditingItem(item);
    setItemFormOpen(true);
  }

  async function handleSaveItem(data: CountryCostItemInsert) {
    if (editingItem) {
      await updateCountryCostItem(editingItem.id, data);
      setItemFormOpen(false);
      return;
    }
    await addCountryCostItem(data);
    setItemFormOpen(false);
  }

  async function handleToggleItemStatus(item: CountryCostItem) {
    const nextStatus = item.status === "active" ? "paused" : "active";
    await updateCountryCostItem(item.id, { status: nextStatus });
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("确定删除这个成本项吗？")) return;
    await deleteCountryCostItem(id);
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
          返回地理订阅
        </Link>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : !country ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-muted-foreground">未找到国家订阅</p>
            <Button asChild variant="outline">
              <Link href="/cities">返回地理订阅</Link>
            </Button>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <Card style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{country.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={country.status === "active" ? "default" : "secondary"}>
                      {COUNTRY_STATUS_LABELS[country.status]}
                    </Badge>
                    {country.country_code && (
                      <span>代码: {country.country_code.toUpperCase()}</span>
                    )}
                    <span>货币: {country.currency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCountryFormOpen(true)}>
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void handleDeleteCountry()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">国家月度成本</p>
                    <p className="font-mono text-2xl font-semibold mt-1">
                      {formatCurrency(monthlyTotal, defaultCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">成本项数量</p>
                    <p className="font-mono text-2xl font-semibold mt-1">{items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">关联城市</p>
                    <p className="font-mono text-2xl font-semibold mt-1">{linkedCities.length}</p>
                  </div>
                </div>

                {linkedCities.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">关联城市列表</p>
                    <div className="flex flex-wrap gap-2">
                      {linkedCities.map((city) => (
                        <Link key={city.id} href={`/cities/detail?id=${city.id}`}>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                            {city.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {country.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">备注</p>
                    <p className="text-sm">{country.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">国家成本项</h2>
                <p className="text-sm text-muted-foreground">
                  支持周期订阅和买断制，统一折算为月度成本
                </p>
              </div>
              <Button onClick={handleOpenNewItem}>
                <Plus className="h-4 w-4 mr-1.5" />
                添加成本项
              </Button>
            </div>

            <CountryCostItemList
              items={items}
              defaultCurrency={defaultCurrency}
              onEdit={handleEditItem}
              onToggleStatus={handleToggleItemStatus}
              onDelete={handleDeleteItem}
            />
          </PageTransition>
        )}
      </main>

      {country && (
        <CountryForm
          open={countryFormOpen}
          onOpenChange={setCountryFormOpen}
          country={country}
          onSubmit={handleSaveCountry}
        />
      )}
      {countryId && (
        <CountryCostItemForm
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          countryId={countryId}
          item={editingItem}
          onSubmit={handleSaveItem}
        />
      )}
    </div>
  );
}
