export interface ReportDetail {
  variant_id: string;
  sales_amount?: number;
  units?: number;
}

export interface SalesReport {
  _id: string;
  dealer_id: string;
  user_id: string;
  period_start?: string;
  period_end?: string;
  total_sales?: number;
  total_orders?: number;
  details?: ReportDetail[];
  created_at?: string;
}

export interface DemandForecast {
  _id: string;
  variant_id: string;
  dealer_id?: string;
  predicted_demand?: number;
  confidence_score?: number;
  forecast_date?: string;
  model_name?: string;
  training_date?: string;
  created_at?: string;
}
