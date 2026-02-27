"use client";

import type { Subscription } from "@/lib/types";
import { getMonthlyTrendData, formatCurrency } from "@/lib/calculations";
import { getDefaultCurrency } from "@/lib/constants";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  subscriptions: Subscription[];
}

export function TrendChart({ subscriptions }: Props) {
  const defaultCurrency = getDefaultCurrency();
  const data = getMonthlyTrendData(subscriptions, 12, defaultCurrency);

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
        支出趋势（近 12 个月）
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, defaultCurrency)}
              width={55}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value), defaultCurrency), "月度支出"]}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#costGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
