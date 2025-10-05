import type { DealerOrderStatus } from "@/types/enums";

export interface DealerOrder {
  _id: string;
  dealer_id: string;
  allocation_id: string;
  total_amount: number;
  order_date: string;
  status: DealerOrderStatus;
  created_at?: string;
  updated_at?: string;
}