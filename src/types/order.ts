import type { DeliveryStatus, OrderStatus } from "@/types/enums";

export interface OrderItem {
  variant_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  line_total: number;
}

export interface Order {
  _id: string;
  quotation_id?: string;
  customer_id: string;
  dealer_id: string;
  user_id: string;
  items: OrderItem[];
  order_date?: string;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}
