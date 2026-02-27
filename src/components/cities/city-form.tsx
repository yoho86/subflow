"use client";

import { useEffect, useState } from "react";
import type {
  CitySubscription,
  CitySubscriptionInsert,
  CitySubscriptionStatus,
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
  city?: CitySubscription | null;
  onSubmit: (data: CitySubscriptionInsert) => Promise<void>;
}

const emptyForm: CitySubscriptionInsert = {
  name: "",
  country: null,
  region: null,
  status: "active",
  notes: null,
};

export function CityForm({ open, onOpenChange, city, onSubmit }: Props) {
  const [form, setForm] = useState<CitySubscriptionInsert>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (city) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, user_id, created_at, updated_at, ...rest } = city;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [city, open]);

  function update<K extends keyof CitySubscriptionInsert>(
    key: K,
    value: CitySubscriptionInsert[K]
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
          <SheetTitle>{city ? "编辑城市订阅" : "添加城市订阅"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6">
          <div className="space-y-1.5">
            <Label>城市名称</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="上海 / 东京 / 新加坡..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>国家</Label>
              <Input
                value={form.country ?? ""}
                onChange={(e) => update("country", e.target.value || null)}
                placeholder="中国"
              />
            </div>
            <div className="space-y-1.5">
              <Label>区域</Label>
              <Input
                value={form.region ?? ""}
                onChange={(e) => update("region", e.target.value || null)}
                placeholder="华东"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                update("status", value as CitySubscriptionStatus)
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
            {saving ? "保存中..." : city ? "保存修改" : "创建城市"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
