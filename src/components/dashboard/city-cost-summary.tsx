"use client";

import type { CitySubscription } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  cities: CitySubscription[];
  cityMonthlyTotal: number;
  overallMonthlyTotal: number;
  cityTotalsByCityId: Record<string, number>;
  defaultCurrency: string;
}

export function CityCostSummary({
  cities,
  cityMonthlyTotal,
  overallMonthlyTotal,
  cityTotalsByCityId,
  defaultCurrency,
}: Props) {
  const activeCities = cities.filter((city) => city.status === "active");
  const ratio =
    overallMonthlyTotal <= 0 ? 0 : (cityMonthlyTotal / overallMonthlyTotal) * 100;

  const highestCity = activeCities
    .map((city) => ({ city, total: cityTotalsByCityId[city.id] ?? 0 }))
    .sort((a, b) => b.total - a.total)[0];

  return (
    <div
      className="rounded-2xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        城市成本来源
      </h3>

      {activeCities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          暂无生效中的城市订阅
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">城市月总成本</p>
            <p className="font-mono text-xl font-semibold tracking-tighter mt-1">
              {formatCurrency(cityMonthlyTotal, defaultCurrency)}
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
            <p className="text-xs text-muted-foreground">成本最高城市</p>
            <p className="text-sm font-medium mt-1">
              {highestCity
                ? `${highestCity.city.name} · ${formatCurrency(
                    highestCity.total,
                    defaultCurrency
                  )}/月`
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
