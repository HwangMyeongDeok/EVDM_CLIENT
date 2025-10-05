export interface Promotion {
  _id: string;
  dealer_id?: string;
  variant_id?: string;
  discount_amount?: number;
  discount_percentage?: number;
  min_quantity?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
