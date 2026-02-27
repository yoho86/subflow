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

    // Handle the OAuth code exchange via URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (!accessToken) {
      // For PKCE flow, the code is in the query string
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
          if (error) {
            window.location.href = "/login?error=auth";
          } else {
            window.location.href = "/";
          }
        });
      } else {
        // No token or code found, redirect to login
        window.location.href = "/login?error=auth";
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">登录中...</p>
    </div>
  );
}
