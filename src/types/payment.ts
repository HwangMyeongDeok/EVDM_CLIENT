export type PaymentType = "FULL" | "INSTALLMENT" | "DEPOSIT";
export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CREDIT_CARD";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type PaymentContext = "CUSTOMER" | "DEALER";

export interface IPayment {
  payment_id: number;
  contract_id: number;
  dealer_id: number;
  customer_id: number;
  transaction_id?: string | null;
  amount: number;
  payment_type?: PaymentType | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_context: PaymentContext;
  payment_date: string;
  created_at: string;
  updated_at?: string | null;
}
