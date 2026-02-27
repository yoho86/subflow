"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.location.href = "/";
      }
    });

    // Implicit flow: tokens are in the URL hash,
    // createBrowserClient detects them automatically.
    // If no session detected after a moment, redirect to login.
    setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          window.location.href = "/login?error=auth";
        }
      });
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">登录中...</p>
    </div>
  );
}
