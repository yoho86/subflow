"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  CountryCostItem,
  CountryCostItemInsert,
  CountryCostItemUpdate,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

function getSupabase() {
  return createClient();
}

function normalizeCountryCostError(error: { message: string; code?: string }) {
  const message = error.message || "";
  if (
    error.code === "PGRST205" ||
    message.includes("Could not find the table 'public.country_cost_items'")
  ) {
    return "国家成本项表未初始化，请在 Supabase 执行最新 schema.sql 后重试";
  }
  return message;
}

export function useCountryCostItems(countryId?: string | null) {
  const [items, setItems] = useState<CountryCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scopedItems = useMemo(() => {
    if (!countryId) return items;
    return items.filter((item) => item.country_id === countryId);
  }, [items, countryId]);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    if (USE_MOCK) {
      setItems([]);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    const query = supabase
      .from("country_cost_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const { data, error: fetchError } = countryId
      ? await query.eq("country_id", countryId)
      : await query;

    if (fetchError) {
      setError(normalizeCountryCostError(fetchError));
      setItems([]);
    } else {
      setItems((data ?? []) as CountryCostItem[]);
    }
    setLoading(false);
  }, [countryId]);

  useEffect(() => {
    let cancelled = false;

    if (USE_MOCK) {
      setItems([]);
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = getSupabase();
      const query = supabase
        .from("country_cost_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      const { data, error: fetchError } = countryId
        ? await query.eq("country_id", countryId)
        : await query;

      if (cancelled) return;
      if (fetchError) {
        setError(normalizeCountryCostError(fetchError));
        setItems([]);
      } else {
        setItems((data ?? []) as CountryCostItem[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [countryId]);

  async function addCountryCostItem(item: CountryCostItemInsert) {
    if (USE_MOCK) {
      const newItem: CountryCostItem = {
        ...item,
        id: crypto.randomUUID(),
        user_id: "mock",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    }

    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error: insertError } = await supabase
      .from("country_cost_items")
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (insertError) throw new Error(normalizeCountryCostError(insertError));
    setItems((prev) => [...prev, data as CountryCostItem]);
    return data as CountryCostItem;
  }

  async function updateCountryCostItem(id: string, updates: CountryCostItemUpdate) {
    if (USE_MOCK) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updated_at: new Date().toISOString() }
            : item
        )
      );
      return;
    }

    const supabase = getSupabase();
    const { data, error: updateError } = await supabase
      .from("country_cost_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(normalizeCountryCostError(updateError));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? (data as CountryCostItem) : item))
    );
  }

  async function deleteCountryCostItem(id: string) {
    if (USE_MOCK) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    const supabase = getSupabase();
    const { error: deleteError } = await supabase
      .from("country_cost_items")
      .delete()
      .eq("id", id);

    if (deleteError) throw new Error(normalizeCountryCostError(deleteError));
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return {
    items: scopedItems,
    allItems: items,
    loading,
    error,
    refetch: fetchItems,
    addCountryCostItem,
    updateCountryCostItem,
    deleteCountryCostItem,
  };
}
