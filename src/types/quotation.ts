import type { QuotationStatus } from "@/types/enums";

export interface QuotationItem {
  variant_id: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  line_total: number;
}

export interface Quotation {
  _id: string;
  customer_id: string;
  dealer_id: string;
  user_id: string;
  items: QuotationItem[];
  total_price: number;
  quotation_date?: string;
  status: QuotationStatus;
  created_at?: string;
  updated_at?: string;
}
