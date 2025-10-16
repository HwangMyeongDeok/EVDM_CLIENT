export interface Contract {
  contract_id: number
  quotation_id?: number
  dealer_id: number
  customer_id: number
  user_id: number
  contract_code: string
  contract_date: string
  delivery_date?: string
  contract_status: "DRAFT" | "PENDING_SIGN" | "SIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  total_amount: number
  discount_amount: number
  final_amount: number
  payment_status: "UNPAID" | "PARTIAL" | "PAID"
  payment_plan: "FULL" | "DEPOSIT"
  deposit_amount: number
  remaining_amount: number
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface ContractItem {
  item_id: number
  contract_id: number
  variant_id: number
  description?: string
  color?: string
  quantity: number
  unit_price: number
  discount_amount: number
  line_total: number
  variant?: VehicleVariant
}

export interface Customer {
  customer_id: number
  full_name: string
  phone?: string
  email?: string
  address?: string
}

export interface VehicleVariant {
  variant_id: number
  version: string
  color: string
  retail_price: number
}

export interface Quotation {
  quotation_id: number
  quotation_code: string
  customer_id: number
  total_amount: number
}

export interface ContractFormData {
  contract_code: string
  customer_id: number
  quotation_id?: number
  contract_date: string
  delivery_date?: string
  payment_plan: "FULL" | "DEPOSIT"
  deposit_amount: number
  discount_amount: number
  items: ContractItemFormData[]
}

export interface ContractItemFormData {
  variant_id: number
  quantity: number
  unit_price: number
  discount_amount: number
  description?: string
}
