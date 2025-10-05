import type { DebtStatus } from "@/types/enums";

export interface DealerDebt {
  _id: string;
  dealer_id: string;
  amount: number;
  status: DebtStatus;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerDebt {
  _id: string;
  customer_id: string;
  order_id: string;
  amount: number;
  status: DebtStatus;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}