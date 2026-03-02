"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Country,
  CountryInsert,
  CountryUpdate,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

function getSupabase() {
  return createClient();
}

function normalizeCountryError(error: { message: string; code?: string }) {
  const message = error.message || "";
  if (
    error.code === "PGRST205" ||
    message.includes("Could not find the table 'public.countries'")
  ) {
    return "国家模块数据库未初始化，请在 Supabase 执行最新 schema.sql 后重试";
  }
  return message;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    if (USE_MOCK) {
      setCountries([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("countries")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(normalizeCountryError(fetchError));
      setCountries([]);
    } else {
      setCountries(data as Country[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (USE_MOCK) {
      setCountries([]);
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from("countries")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (fetchError) {
        setError(normalizeCountryError(fetchError));
        setCountries([]);
      } else {
        setCountries(data as Country[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addCountry(country: CountryInsert) {
    if (USE_MOCK) {
      const newCountry: Country = {
        ...country,
        id: crypto.randomUUID(),
        user_id: "mock",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCountries((prev) => [newCountry, ...prev]);
      return newCountry;
    }

    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error: insertError } = await supabase
      .from("countries")
      .insert({ ...country, user_id: user.id })
      .select()
      .single();

    if (insertError) throw new Error(normalizeCountryError(insertError));
    setCountries((prev) => [data as Country, ...prev]);
    return data as Country;
  }

  async function updateCountry(id: string, updates: CountryUpdate) {
    if (USE_MOCK) {
      setCountries((prev) =>
        prev.map((country) =>
          country.id === id
            ? { ...country, ...updates, updated_at: new Date().toISOString() }
            : country
        )
      );
      return;
    }

    const supabase = getSupabase();
    const { data, error: updateError } = await supabase
      .from("countries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(normalizeCountryError(updateError));
    setCountries((prev) =>
      prev.map((country) => (country.id === id ? (data as Country) : country))
    );
  }

  async function deleteCountry(id: string) {
    if (USE_MOCK) {
      setCountries((prev) => prev.filter((country) => country.id !== id));
      return;
    }

    const supabase = getSupabase();
    const { error: deleteError } = await supabase
      .from("countries")
      .delete()
      .eq("id", id);

    if (deleteError) throw new Error(normalizeCountryError(deleteError));
    setCountries((prev) => prev.filter((country) => country.id !== id));
  }

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
    addCountry,
    updateCountry,
    deleteCountry,
  };
}
