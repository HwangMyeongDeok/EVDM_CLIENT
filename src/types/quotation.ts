import type { QuotationStatus } from "@/types/enums";

export interface IQuotationItem {
  item_id: number;
  quotation_id: string;
  variant_id: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
}

export interface IQuotation {
  quotation_id: string;
  quotation_number: string;
  customer_id: string;
  dealer_id: string;
  status: QuotationStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_total: number;
  total_amount: number;
  notes?: string;
  approved_by?: string;
}