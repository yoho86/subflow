"use client";

import { useCallback } from "react";
import type { Subscription } from "@/lib/types";
import { getMonthlyCost, formatCurrency, getDaysUntilBilling } from "@/lib/calculations";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";
import { DollarSign, TrendingUp, Layers, CalendarClock } from "lucide-react";

interface Props {
  subscriptions: Subscription[];
}

export function StatsCards({ subscriptions }: Props) {
  const active = subscriptions.filter((s) => s.status === "active");

  const monthlyTotal = active.reduce((sum, s) => sum + getMonthlyCost(s), 0);
  const yearlyTotal = monthlyTotal * 12;
  const activeCount = active.length;
  const upcomingCount = active.filter((s) => {
    const days = getDaysUntilBilling(s);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  const currencyFormatter = useCallback((v: number) => formatCurrency(v), []);
  const intFormatter = useCallback((v: number) => String(Math.round(v)), []);

  const stats = [
    { label: "月度支出", numValue: monthlyTotal, formatter: currencyFormatter, icon: DollarSign },
    { label: "年度支出", numValue: yearlyTotal, formatter: currencyFormatter, icon: TrendingUp },
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
