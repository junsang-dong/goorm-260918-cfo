export interface Summary {
  revenue: number;
  cogs: number;
  gross_profit: number;
  adjusted_profit: number;
  adjusted_margin: number;
  avg_discount: number;
  shipping: number;
  custom: number;
  count: number;
}
export interface Group extends Summary {
  id: string;
  product_name?: string;
  family?: string;
  customer_name?: string;
  region?: string;
}
export interface Transaction extends Summary {
  transaction_id: string;
  month: string;
  product_code: string;
  customer_name: string;
}
export interface Analysis extends Summary {
  analysis_id: string;
  file_id: string;
  is_demo: boolean;
  period: string;
  by_product: Group[];
  by_customer: Group[];
  by_month: Group[];
  transactions: Transaction[];
  products: Record<string, string | number>[];
  customers: Record<string, string | number>[];
  months: string[];
}
export interface Validation {
  validation_status: string;
  error_count: number;
  errors: {
    sheet: string;
    row: number;
    field: string;
    current_value: string;
    message: string;
    severity: string;
  }[];
}
export interface Report {
  title: string;
  executive_summary: string;
  key_findings: string[];
  risk_points: string[];
  recommended_actions: string[];
  generated_at: string;
  is_demo: boolean;
}
