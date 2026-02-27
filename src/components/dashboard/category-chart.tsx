"use client";

import type { Subscription } from "@/lib/types";
import { getMonthlyCostConverted, formatCurrency } from "@/lib/calculations";
import { getCategoryColor, getDefaultCurrency } from "@/lib/constants";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  subscriptions: Subscription[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function CategoryChart({ subscriptions }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const active = subscriptions.filter((s) => s.status === "active");

  const categoryMap = new Map<string, number>();
  for (const sub of active) {
    const cat = sub.category ?? "其他";
    const cost = getMonthlyCostConverted(sub, defaultCurrency);
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + cost);
  }

  const data: ChartData[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: getCategoryColor(name),
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-card p-6 text-center text-muted-foreground"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        暂无数据
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        分类占比
      </h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 xl:w-52 xl:h-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), defaultCurrency)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(item.value, defaultCurrency)}/月
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
