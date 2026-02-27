"use client";

import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/motion/page-transition";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { BillingCalendar } from "@/components/dashboard/billing-calendar";
import { UpcomingList } from "@/components/dashboard/upcoming-list";

export default function DashboardPage() {
  const { subscriptions, loading, error } = useSubscriptions();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 lg:px-20 xl:px-32 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            你的订阅支出一览
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            加载中...
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <PageTransition className="space-y-6">
            <StatsCards subscriptions={subscriptions} />
            <TrendChart subscriptions={subscriptions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <CategoryChart subscriptions={subscriptions} />
              <BillingCalendar subscriptions={subscriptions} />
            </div>
            <UpcomingList subscriptions={subscriptions} />
          </PageTransition>
        )}
      </main>
    </div>
  );
}
