"use client";

import type { CitySubscription, Country } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  countries: Country[];
  cities: CitySubscription[];
  countryMonthlyTotal: number;
  cityMonthlyTotal: number;
  overallMonthlyTotal: number;
  countryTotalsByCountryId: Record<string, number>;
  cityTotalsByCityId: Record<string, number>;
  defaultCurrency: string;
}

export function CityCostSummary({
  countries,
  cities,
  countryMonthlyTotal,
  cityMonthlyTotal,
  overallMonthlyTotal,
  countryTotalsByCountryId,
  cityTotalsByCityId,
  defaultCurrency,
}: Props) {
  const activeCountries = countries.filter((country) => country.status === "active");
  const activeCities = cities.filter((city) => city.status === "active");
  const geographicMonthlyTotal = countryMonthlyTotal + cityMonthlyTotal;
  const ratio =
    overallMonthlyTotal <= 0 ? 0 : (geographicMonthlyTotal / overallMonthlyTotal) * 100;

  const highestCountry = activeCountries
    .map((country) => ({ country, total: countryTotalsByCountryId[country.id] ?? 0 }))
    .sort((a, b) => b.total - a.total)[0];

  return (
    <div
      className="rounded-2xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        地理成本来源
      </h3>

      {activeCountries.length === 0 && activeCities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          暂无生效中的地理订阅
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">地理月总成本</p>
              <p className="font-mono text-xl font-semibold tracking-tighter mt-1">
                {formatCurrency(geographicMonthlyTotal, defaultCurrency)}
                <span className="text-xs text-muted-foreground ml-1">/月</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">占总支出比例</p>
              <p className="font-mono text-xl font-semibold tracking-tighter mt-1">
                {Math.round(ratio * 10) / 10}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">成本最高国家</p>
              <p className="text-sm font-medium mt-1">
                {highestCountry
                  ? `${highestCountry.country.name} · ${formatCurrency(
                      highestCountry.total,
                      defaultCurrency
                    )}/月`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">成本分布</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">国家成本</span>
                <span className="font-mono font-medium">
                  {formatCurrency(countryMonthlyTotal, defaultCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">城市成本</span>
                <span className="font-mono font-medium">
                  {formatCurrency(cityMonthlyTotal, defaultCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
