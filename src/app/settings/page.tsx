"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import {
  getCategories,
  saveCategories,
  DEFAULT_CATEGORIES,
  type CategoryItem,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, RotateCcw, Pencil, Save, Trash2 } from "lucide-react";

const CURRENCIES = [
  { code: "CNY", label: "人民币 (¥)" },
  { code: "USD", label: "美元 ($)" },
  { code: "EUR", label: "欧元 (€)" },
  { code: "JPY", label: "日元 (¥)" },
  { code: "GBP", label: "英镑 (£)" },
  { code: "HKD", label: "港币 (HK$)" },
];

const PRESET_COLORS = [
  "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6",
  "#06B6D4", "#EF4444", "#14B8A6", "#6B7280", "#F97316",
  "#A855F7", "#84CC16",
];

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("CNY");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editingNameDraft, setEditingNameDraft] = useState("");
  const [editingColorDraft, setEditingColorDraft] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    const saved = localStorage.getItem("subflow_currency");
    if (saved) setCurrency(saved);

    setCategories(getCategories());

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
    });
  }, []);

  function handleCurrencyChange(value: string) {
    setCurrency(value);
    localStorage.setItem("subflow_currency", value);
  }

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name || categories.some((c) => c.name === name)) return;
    const updated = [...categories, { name, color: newCatColor }];
    setCategories(updated);
    saveCategories(updated);
    setNewCatName("");
    // pick next unused color
    const usedColors = new Set(updated.map((c) => c.color));
    const nextColor = PRESET_COLORS.find((c) => !usedColors.has(c)) ?? PRESET_COLORS[0];
    setNewCatColor(nextColor);
  }

  function handleRemoveCategory(name: string) {
    const updated = categories.filter((c) => c.name !== name);
    setCategories(updated);
    saveCategories(updated);
    if (editingCategoryName === name) {
      cancelEditingCategory();
    }
  }

  function startEditingCategory(cat: CategoryItem) {
    setEditingCategoryName(cat.name);
    setEditingNameDraft(cat.name);
    setEditingColorDraft(cat.color);
  }

  function cancelEditingCategory() {
    setEditingCategoryName(null);
    setEditingNameDraft("");
    setEditingColorDraft(PRESET_COLORS[0]);
  }

  async function saveEditingCategory() {
    if (!editingCategoryName) return;
    const nextName = editingNameDraft.trim();
    if (!nextName) return;
    if (
      nextName !== editingCategoryName &&
      categories.some((c) => c.name === nextName)
    ) {
      return;
    }

    const updated = categories.map((c) =>
      c.name === editingCategoryName
        ? { ...c, name: nextName, color: editingColorDraft }
        : c
    );
    setCategories(updated);
    saveCategories(updated);

    if (nextName !== editingCategoryName) {
      await syncCategoryNameToSubscriptions(editingCategoryName, nextName);
    }
    cancelEditingCategory();
  }

  async function syncCategoryNameToSubscriptions(oldName: string, nextName: string) {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("subscriptions")
      .update({ category: nextName })
      .eq("user_id", userId)
      .eq("category", oldName);

    if (error) {
      console.error("同步分类名称失败:", error.message);
    }
  }

  function handleResetCategories() {
    setCategories([...DEFAULT_CATEGORIES]);
    saveCategories([...DEFAULT_CATEGORIES]);
    cancelEditingCategory();
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
                <p className="text-xs text-muted-foreground">
                  所有订阅的月度/年度成本将按此货币换算展示
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: "var(--shadow-sm)" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">分类管理</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleResetCategories}>
                <RotateCcw className="h-3 w-3 mr-1" />
                恢复默认
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditing = editingCategoryName === cat.name;
                  return (
                  <div
                    key={cat.name}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="color"
                          value={editingColorDraft}
                          onChange={(e) => setEditingColorDraft(e.target.value)}
                          className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <Input
                          value={editingNameDraft}
                          onChange={(e) => setEditingNameDraft(e.target.value)}
                          className="h-8 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void saveEditingCategory();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => void saveEditingCategory()}
                          disabled={!editingNameDraft.trim()}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          保存
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground"
                          onClick={cancelEditingCategory}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <div
                          className="h-6 w-6 rounded-full shrink-0 border"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm flex-1">{cat.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground"
                          onClick={() => startEditingCategory(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCategory(cat.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          删除
                        </Button>
                      </>
                    )}
                  </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                点击编辑后修改，保存才会生效
              </p>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="新分类名称..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageTransition>
      </main>
    </div>
  );
}
