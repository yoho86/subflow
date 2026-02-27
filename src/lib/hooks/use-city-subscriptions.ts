"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_CITY_SUBSCRIPTIONS } from "@/lib/mock-data";
import type {
  CitySubscription,
  CitySubscriptionInsert,
  CitySubscriptionUpdate,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

function getSupabase() {
  return createClient();
}

export function useCitySubscriptions() {
  const [cities, setCities] = useState<CitySubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    if (USE_MOCK) {
      setCities([...MOCK_CITY_SUBSCRIPTIONS]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("city_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCities(data as CitySubscription[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (USE_MOCK) {
      setCities([...MOCK_CITY_SUBSCRIPTIONS]);
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from("city_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCities(data as CitySubscription[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addCity(city: CitySubscriptionInsert) {
    if (USE_MOCK) {
      const newCity: CitySubscription = {
        ...city,
        id: crypto.randomUUID(),
        user_id: "mock",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCities((prev) => [newCity, ...prev]);
      return newCity;
    }

    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error: insertError } = await supabase
      .from("city_subscriptions")
      .insert({ ...city, user_id: user.id })
      .select()
      .single();

    if (insertError) throw insertError;
    setCities((prev) => [data as CitySubscription, ...prev]);
    return data as CitySubscription;
  }

  async function updateCity(id: string, updates: CitySubscriptionUpdate) {
    if (USE_MOCK) {
      setCities((prev) =>
        prev.map((city) =>
          city.id === id
            ? { ...city, ...updates, updated_at: new Date().toISOString() }
            : city
        )
      );
      return;
    }

    const supabase = getSupabase();
    const { data, error: updateError } = await supabase
      .from("city_subscriptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setCities((prev) =>
      prev.map((city) => (city.id === id ? (data as CitySubscription) : city))
    );
  }

  async function deleteCity(id: string) {
    if (USE_MOCK) {
      setCities((prev) => prev.filter((city) => city.id !== id));
      return;
    }

    const supabase = getSupabase();
    const { error: deleteError } = await supabase
      .from("city_subscriptions")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    setCities((prev) => prev.filter((city) => city.id !== id));
  }

  return {
    cities,
    loading,
    error,
    refetch: fetchCities,
    addCity,
    updateCity,
    deleteCity,
  };
}
