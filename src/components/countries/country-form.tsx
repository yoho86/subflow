"use client";

import { useEffect, useState } from "react";
import type {
  Country,
  CountryInsert,
  CountrySubscriptionStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country | null;
  onSubmit: (data: CountryInsert) => Promise<void>;
}

const emptyForm: CountryInsert = {
  name: "",
  country_code: null,
  currency: "CNY",
  status: "active",
  notes: null,
};

export function CountryForm({ open, onOpenChange, country, onSubmit }: Props) {
  const [form, setForm] = useState<CountryInsert>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (country) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, user_id, created_at, updated_at, ...rest } = country;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [country, open]);

  function update<K extends keyof CountryInsert>(
    key: K,
    value: CountryInsert[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{country ? "编辑国家订阅" : "添加国家订阅"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6">
          <div className="space-y-1.5">
            <Label>国家名称</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="中国 / 日本 / 美国..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>国家代码</Label>
              <Input
                value={form.country_code ?? ""}
                onChange={(e) => update("country_code", e.target.value || null)}
                placeholder="CN / JP / US"
                maxLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>货币</Label>
              <Select
                value={form.currency}
                onValueChange={(value) => update("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">CNY (人民币)</SelectItem>
                  <SelectItem value="USD">USD (美元)</SelectItem>
                  <SelectItem value="EUR">EUR (欧元)</SelectItem>
                  <SelectItem value="JPY">JPY (日元)</SelectItem>
                  <SelectItem value="GBP">GBP (英镑)</SelectItem>
                  <SelectItem value="HKD">HKD (港币)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                update("status", value as CountrySubscriptionStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>备注</Label>
            <Textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value || null)}
              placeholder="可选备注..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "保存中..." : country ? "保存修改" : "创建国家"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
