import type { DebtStatus } from "@/types/enums";

export interface DealerDebt {
  debt_id: string;
  dealer_id: string;
  amount: number;
  status: DebtStatus;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}