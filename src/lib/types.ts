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
export type CitySubscriptionStatus = "active" | "paused" | "archived";

export type Category = string;

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

export type CityCostCategory =
  | "housing"
  | "water"
  | "electricity"
  | "gas"
  | "internet"
  | "property"
  | "transport"
  | "food"
  | "other";

export interface CitySubscription {
  id: string;
  user_id: string;
  name: string;
  country: string | null;
  region: string | null;
  status: CitySubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CitySubscriptionInsert = Omit<
  CitySubscription,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CitySubscriptionUpdate = Partial<CitySubscriptionInsert>;

export interface CityCostItem {
  id: string;
  city_id: string;
  user_id: string;
  name: string;
  category: CityCostCategory;
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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CityCostItemInsert = Omit<
  CityCostItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CityCostItemUpdate = Partial<CityCostItemInsert>;
