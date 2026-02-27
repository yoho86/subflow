"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/lib/types";

const CURRENCIES = [
  { code: "CNY", label: "人民币 (¥)" },
  { code: "USD", label: "美元 ($)" },
  { code: "EUR", label: "欧元 (€)" },
  { code: "JPY", label: "日元 (¥)" },
  { code: "GBP", label: "英镑 (£)" },
  { code: "HKD", label: "港币 (HK$)" },
];

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [currency, setCurrency] = useState("CNY");

  useEffect(() => {
    const saved = localStorage.getItem("subflow_currency");
    if (saved) setCurrency(saved);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  function handleCurrencyChange(value: string) {
    setCurrency(value);
    localStorage.setItem("subflow_currency", value);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 lg:px-20 xl:px-32 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">设置</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理你的账号和偏好
          </p>
        </div>

        <PageTransition className="grid gap-6 max-w-2xl">
          <Card style={{ boxShadow: "var(--shadow-sm)" }}>
            <CardHeader>
              <CardTitle className="text-base">账号信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">邮箱</Label>
                <p className="text-sm mt-0.5">{email ?? "未登录"}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                退出登录
              </Button>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: "var(--shadow-sm)" }}>
            <CardHeader>
              <CardTitle className="text-base">偏好设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>默认货币</Label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: "var(--shadow-sm)" }}>
            <CardHeader>
              <CardTitle className="text-base">分类管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat as Category] }}
                    />
                    <span className="text-sm">{cat}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                内置分类暂不支持自定义修改
              </p>
            </CardContent>
          </Card>
        </PageTransition>
      </main>
    </div>
  );
}
