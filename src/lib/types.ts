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
export type CountrySubscriptionStatus = "active" | "paused" | "archived";

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

export type CountryCostCategory =
  | "social_security"    // 社保
  | "housing_fund"       // 公积金
  | "income_tax"         // 个税
  | "pension"            // 养老保险
  | "medical_insurance"  // 医疗保险
  | "unemployment"       // 失业保险
  | "work_injury"        // 工伤保险
  | "maternity"          // 生育保险
  | "visa"               // 签证费用
  | "other";

export interface CitySubscription {
  id: string;
  user_id: string;
  name: string;
  country: string | null;
  region: string | null;
  country_id: string | null;  // New: foreign key to countries table
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

export interface Country {
  id: string;
  user_id: string;
  name: string;
  country_code: string | null;
  currency: string;
  status: CountrySubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CountryInsert = Omit<Country, "id" | "user_id" | "created_at" | "updated_at">;
export type CountryUpdate = Partial<CountryInsert>;

export interface CountryCostItem {
  id: string;
  country_id: string;
  user_id: string;
  name: string;
  category: CountryCostCategory;
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

export type CountryCostItemInsert = Omit<
  CountryCostItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CountryCostItemUpdate = Partial<CountryCostItemInsert>;
