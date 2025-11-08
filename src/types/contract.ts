import type { ICustomer } from "@/types/customer";
import type { IDealer } from "@/types/dealer";
import type { IQuotation } from "@/types/quotation";
import type { IUser } from "@/types/user";

export interface IContract {
  approved_by: number;
  contract_code: string;
  contract_date: string;
  contract_id: number;
  created_at: string;
  customer: ICustomer;
  customer_id: number;
  dealer: IDealer;
  dealer_id: number;
  delivery_date: string;
  deposit_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_plan: string;
  payment_status: string;
  quotation: IQuotation;
  quotation_id: number;
  remaining_amount: number;
  status: string;
  total_amount: number;
  updated_at: string;
  user: IUser;
  user_id: number;
}