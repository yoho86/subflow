"use client";

import { useCallback } from "react";
import type { Subscription } from "@/lib/types";
import { formatCurrency, getDaysUntilBilling } from "@/lib/calculations";
import { getDefaultCurrency } from "@/lib/constants";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";
import { DollarSign, TrendingUp, Layers, CalendarClock } from "lucide-react";

interface Props {
  subscriptions: Subscription[];
  overallMonthly: number;
  overallYearly: number;
}

export function StatsCards({ subscriptions, overallMonthly, overallYearly }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const active = subscriptions.filter((s) => s.status === "active");

  const activeCount = active.length;
  const upcomingCount = active.filter((s) => {
    const days = getDaysUntilBilling(s);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  const currencyFormatter = useCallback((v: number) => formatCurrency(v, defaultCurrency), [defaultCurrency]);
  const intFormatter = useCallback((v: number) => String(Math.round(v)), []);

  const stats = [
    { label: "月度支出(含城市)", numValue: overallMonthly, formatter: currencyFormatter, icon: DollarSign },
    { label: "年度支出(含城市)", numValue: overallYearly, formatter: currencyFormatter, icon: TrendingUp },
    { label: "活跃订阅", numValue: activeCount, formatter: intFormatter, icon: Layers },
    { label: "本月续费", numValue: upcomingCount, formatter: intFormatter, icon: CalendarClock },
  ];

  return (
    <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StaggerItem key={stat.label}>
          <div
            className="card-hover rounded-2xl border p-4"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4" style={{ opacity: 0.4 }} />
              <span className="text-xs" style={{ opacity: 0.5 }}>
                {stat.label}
              </span>
            </div>
            <p className="font-mono text-2xl font-semibold tracking-tighter">
              <AnimatedNumber value={stat.numValue} formatter={stat.formatter} />
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
