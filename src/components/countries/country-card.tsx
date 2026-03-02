"use client";

import Link from "next/link";
import type { Country } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { COUNTRY_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface Props {
  country: Country;
  monthlyCost: number;
  costItemCount: number;
  linkedCityCount: number;
  defaultCurrency: string;
}

export function CountryCard({
  country,
  monthlyCost,
  costItemCount,
  linkedCityCount,
  defaultCurrency
}: Props) {
  return (
    <Link href={`/cities/country/${country.id}`} className="block">
      <div
        className="card-hover rounded-2xl border bg-card p-4 flex flex-col gap-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold truncate">{country.name}</h3>
          </div>
          <Badge
            variant={country.status === "active" ? "default" : "secondary"}
            className="text-[10px]"
          >
            {COUNTRY_STATUS_LABELS[country.status]}
          </Badge>
        </div>

        {country.country_code && (
          <p className="text-xs text-muted-foreground">
            代码: {country.country_code.toUpperCase()}
          </p>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1">国家月度成本</p>
          <p className="font-mono text-2xl font-semibold tracking-tighter">
            {formatCurrency(monthlyCost, defaultCurrency)}
            <span className="text-xs text-muted-foreground ml-1">/月</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>成本项 {costItemCount} 个</span>
          <span>关联城市 {linkedCityCount} 个</span>
        </div>
      </div>
    </Link>
  );
}
