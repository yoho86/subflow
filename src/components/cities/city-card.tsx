"use client";

import Link from "next/link";
import type { CitySubscription } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { CITY_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface Props {
  city: CitySubscription;
  monthlyCost: number;
  costItemCount: number;
  defaultCurrency: string;
}

export function CityCard({ city, monthlyCost, costItemCount, defaultCurrency }: Props) {
  return (
    <Link href={`/cities/detail?id=${city.id}`} className="block">
      <div
        className="card-hover rounded-2xl border bg-card p-4 flex flex-col gap-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold truncate">{city.name}</h3>
          <Badge
            variant={city.status === "active" ? "default" : "secondary"}
            className="text-[10px]"
          >
            {CITY_STATUS_LABELS[city.status]}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {[city.country, city.region].filter(Boolean).join(" · ") || "未设置地区"}
        </p>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1">城市月度成本</p>
          <p className="font-mono text-2xl font-semibold tracking-tighter">
            {formatCurrency(monthlyCost, defaultCurrency)}
            <span className="text-xs text-muted-foreground ml-1">/月</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>成本项 {costItemCount} 个</span>
          <span>点击查看详情</span>
        </div>
      </div>
    </Link>
  );
}
