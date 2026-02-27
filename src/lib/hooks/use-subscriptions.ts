"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_SUBSCRIPTIONS } from "@/lib/mock-data";
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

function getSupabase() {
  return createClient();
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    if (USE_MOCK) {
      setSubscriptions([...MOCK_SUBSCRIPTIONS]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .order("next_billing", { ascending: true, nullsFirst: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setSubscriptions(data as Subscription[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (USE_MOCK) {
      setSubscriptions([...MOCK_SUBSCRIPTIONS]);
      setLoading(false);
      return;
    }
    async function load() {
      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("next_billing", { ascending: true, nullsFirst: false });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSubscriptions(data as Subscription[]);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function addSubscription(sub: SubscriptionInsert) {
    if (USE_MOCK) {
      const newSub: Subscription = {
        ...sub,
        id: crypto.randomUUID(),
        user_id: "mock",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSubscriptions((prev) => [...prev, newSub]);
      return newSub;
    }
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error: insertError } = await supabase
      .from("subscriptions")
      .insert({ ...sub, user_id: user.id })
      .select()
      .single();

    if (insertError) throw insertError;
    setSubscriptions((prev) => [...prev, data as Subscription]);
    return data as Subscription;
  }

  async function updateSubscription(id: string, updates: SubscriptionUpdate) {
    if (USE_MOCK) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
      );
      return subscriptions.find((s) => s.id === id)!;
    }
    const supabase = getSupabase();
    const { data, error: updateError } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? (data as Subscription) : s))
    );
    return data as Subscription;
  }

  async function deleteSubscription(id: string) {
    if (USE_MOCK) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    const supabase = getSupabase();
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
}
