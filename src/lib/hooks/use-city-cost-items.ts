"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_CITY_COST_ITEMS } from "@/lib/mock-data";
import type {
  CityCostItem,
  CityCostItemInsert,
  CityCostItemUpdate,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

function getSupabase() {
  return createClient();
}

export function useCityCostItems(cityId?: string | null) {
  const [items, setItems] = useState<CityCostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scopedItems = useMemo(() => {
    if (!cityId) return items;
    return items.filter((item) => item.city_id === cityId);
  }, [items, cityId]);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    if (USE_MOCK) {
      setItems([...MOCK_CITY_COST_ITEMS]);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    const query = supabase
      .from("city_cost_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const { data, error: fetchError } = cityId
      ? await query.eq("city_id", cityId)
      : await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems((data ?? []) as CityCostItem[]);
    }
    setLoading(false);
  }, [cityId]);

  useEffect(() => {
    let cancelled = false;

    if (USE_MOCK) {
      setItems([...MOCK_CITY_COST_ITEMS]);
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = getSupabase();
      const query = supabase
        .from("city_cost_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      const { data, error: fetchError } = cityId
        ? await query.eq("city_id", cityId)
        : await query;

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setItems((data ?? []) as CityCostItem[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  async function addCityCostItem(item: CityCostItemInsert) {
    if (USE_MOCK) {
      const newItem: CityCostItem = {
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
      .from("city_cost_items")
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (insertError) throw insertError;
    setItems((prev) => [...prev, data as CityCostItem]);
    return data as CityCostItem;
  }

  async function updateCityCostItem(id: string, updates: CityCostItemUpdate) {
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
      .from("city_cost_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? (data as CityCostItem) : item))
    );
  }

  async function deleteCityCostItem(id: string) {
    if (USE_MOCK) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    const supabase = getSupabase();
    const { error: deleteError } = await supabase
      .from("city_cost_items")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return {
    items: scopedItems,
    allItems: items,
    loading,
    error,
    refetch: fetchItems,
    addCityCostItem,
    updateCityCostItem,
    deleteCityCostItem,
  };
}
