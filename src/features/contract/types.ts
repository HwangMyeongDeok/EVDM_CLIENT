// src/features/contract/types.ts
// -------------------------------

export type ContractStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PENDING_SIGN"
  | "SIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export type PaymentPlan = "FULL" | "DEPOSIT";

// -------------------------------
// 🔹 Vehicle
// -------------------------------
export interface Vehicle {
  vehicle_id: number;
  model_name: string;
  specifications?: string;
  body_type: string;
  seats: number;
  doors: number;
  warranty_years: number;
  description?: string;
  image_urls?: string[];
}

// -------------------------------
// 🔹 VehicleVariant
// -------------------------------
export interface VehicleVariant {
  variant_id: number;
  vehicle_id: number;
  version?: string;
  color?: string;
  dealer_price: number;
  base_price: number;
  retail_price?: number;
  discount_percent: number;
  model_year: number;
  battery_capacity_kwh?: number;
  range_km?: number;
  motor_power_kw?: number;
  acceleration_0_100?: number;
  top_speed_kmh?: number;
  charging_time_hours?: number;
  status: "ACTIVE" | "DISCONTINUED";
  vehicle: Vehicle; // 🔗 quan hệ với Vehicle
}

// -------------------------------
// 🔹 Customer
// -------------------------------
export interface Customer {
  customer_id: number;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  dealer_id: number;
}

// -------------------------------
// 🔹 Dealer
// -------------------------------
export interface Dealer {
  dealer_id: number;
  dealer_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// -------------------------------
// 🔹 User (nhân viên)
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  dealer_id: number;
}

// -------------------------------
// 🔹 Quotation
// -------------------------------
export type QuotationStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

export interface Quotation {
  quotation_id: number;
  quotation_number?: string;
  customer_id: number;
  dealer_id: number;
  user_id: number;
  variant_id: number;
  status: QuotationStatus;
  subtotal?: number;
  tax_rate: number;
  tax_amount?: number;
  discount_total: number;
  total_amount?: number;
  notes?: string;
  approved_by?: number;
  created_at: string;
  updated_at?: string;

  // 🔗 quan hệ
  customer: Customer;
  dealer: Dealer;
  user: User;
  variant: VehicleVariant;
}

// -------------------------------
// 🔹 Contract
// -------------------------------
export interface Contract {
  contract_id: number;
  contract_code: string;
  quotation_id?: number;
  dealer_id: number;
  customer_id: number;
  user_id: number;
  approved_by?: number;
  contract_date: string;
  delivery_date?: string;
  status: ContractStatus;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_status: PaymentStatus;
  payment_plan: PaymentPlan;
  deposit_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at?: string;

  // 🔗 quan hệ
  dealer: Dealer;
  customer: Customer;
  user: User;
  quotation?: Quotation;
}
