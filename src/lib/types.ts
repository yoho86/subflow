export type SubscriptionType = "recurring" | "lifetime";

export type BillingCycle =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annually"
  | "yearly"
  | "biennially"
  | "custom";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type Category =
  | "工具"
  | "娱乐"
  | "生活"
  | "硬件"
  | "教育"
  | "云服务"
  | "健康"
  | "金融"
  | "其他";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  icon_url: string | null;
  category: Category | null;
  type: SubscriptionType;
  amount: number | null;
  currency: string;
  billing_cycle: BillingCycle | null;
  custom_cycle_days: number | null;
  next_billing: string | null;
  started_at: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  expected_lifespan_months: number | null;
  status: SubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionInsert = Omit<
  Subscription,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type SubscriptionUpdate = Partial<SubscriptionInsert>;
