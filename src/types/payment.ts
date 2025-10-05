import type { PaymentStatus, PaymentType } from "@/types/enums";

export interface Payment {
  _id: string;
  order_id: string;
  customer_id: string;
  transaction_id?: string;
  amount: number;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
}
