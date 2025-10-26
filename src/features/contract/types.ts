// Contract Types
export type ContractStatus = 
  | "DRAFT" 
  | "PENDING_APPROVAL" 
  | "APPROVED" 
  | "REJECTED" 
  | "SIGNED" 
  | "COMPLETED" 
  | "CANCELLED";

export type PaymentTerms = "CASH" | "INSTALLMENT" | "BANK_TRANSFER";

export interface ContractItem {
  item_id: number;
  contract_id: number;
  variant_id: number;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  line_total: string;
  variant?: {
    variant_id: number;
    version: string;
    color: string;
    retail_price: string;
  };
}

export interface ContractResponse {
  contract_id: number;
  contract_number: string;
  quotation_id?: number;
  customer_id: number;
  dealer_id: number;
  user_id: number;
  status: ContractStatus;
  payment_terms: PaymentTerms;
  deposit_amount: string;
  subtotal: string;
  tax_amount: string;
  discount_total: string;
  total_amount: string;
  delivery_deadline?: string;
  delivery_address?: string;
  terms_and_conditions?: string;
  notes?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  signed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
  customer?: {
    customer_id: number;
    full_name: string;
    phone?: string;
    email?: string;
    id_number?: string;
  };
  user?: {
    user_id: number;
    full_name: string;
    email: string;
  };
  approver?: {
    user_id: number;
    full_name: string;
    email: string;
  };
  items: ContractItem[];
}

export interface CreateContractDto {
  quotation_id?: number;
  customer_id: number;
  items: {
    variant_id: number;
    quantity: number;
    unit_price: string;
    discount_amount: string;
  }[];
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  payment_terms: PaymentTerms;
  deposit_amount: string;
  delivery_deadline?: string;
  delivery_address?: string;
  terms_and_conditions?: string;
  notes?: string;
  status: ContractStatus;
}

export interface UpdateContractDto {
  status?: ContractStatus;
  paymentTerms?: PaymentTerms;
  depositAmount?: number;
  deliveryDeadline?: string;
  termsConditions?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface ApproveContractDto {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
