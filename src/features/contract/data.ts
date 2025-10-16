import type { Contract, Customer, VehicleVariant, ContractItem } from "./type"

export const mockCustomers: Customer[] = [
  { customer_id: 1, full_name: "Nguyen Van A", phone: "0909123456", email: "a@gmail.com", address: "Ha Noi" },
  { customer_id: 2, full_name: "Tran Thi B", phone: "0911222333", email: "b@gmail.com", address: "Da Nang" },
  { customer_id: 3, full_name: "Le Van C", phone: "0933444555", email: "c@gmail.com", address: "Ho Chi Minh" },
  { customer_id: 4, full_name: "Pham Thi D", phone: "0944555666", email: "d@gmail.com", address: "Can Tho" },
]

export const mockVariants: VehicleVariant[] = [
  { variant_id: 1, version: "EV-SUV 2025", color: "White", retail_price: 950000000 },
  { variant_id: 2, version: "EV-Hatchback 2025", color: "Blue", retail_price: 780000000 },
  { variant_id: 3, version: "EV-Sedan 2025", color: "Black", retail_price: 850000000 },
  { variant_id: 4, version: "EV-SUV 2025", color: "Red", retail_price: 950000000 },
  { variant_id: 5, version: "EV-Hatchback 2025", color: "Silver", retail_price: 780000000 },
]

export const mockContractItems: ContractItem[] = [
  {
    item_id: 1,
    contract_id: 1,
    variant_id: 1,
    description: "EV-SUV 2025 White",
    quantity: 1,
    unit_price: 950000000,
    discount_amount: 0,
    line_total: 950000000,
  },
  {
    item_id: 2,
    contract_id: 2,
    variant_id: 2,
    description: "EV-Hatchback 2025 Blue",
    quantity: 2,
    unit_price: 780000000,
    discount_amount: 50000000,
    line_total: 1510000000,
  },
]

export const mockContracts: Contract[] = [
  {
    contract_id: 1,
    contract_code: "CT2025-001",
    customer_id: 1,
    dealer_id: 1,
    user_id: 1,
    contract_date: "2025-10-01",
    delivery_date: "2025-10-15",
    contract_status: "SIGNED",
    total_amount: 950000000,
    discount_amount: 0,
    final_amount: 950000000,
    payment_status: "PARTIAL",
    payment_plan: "DEPOSIT",
    deposit_amount: 200000000,
    remaining_amount: 750000000,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-01T10:00:00Z",
  },
  {
    contract_id: 2,
    contract_code: "CT2025-002",
    customer_id: 2,
    dealer_id: 1,
    user_id: 1,
    contract_date: "2025-10-05",
    delivery_date: "2025-10-20",
    contract_status: "PENDING_SIGN",
    total_amount: 1560000000,
    discount_amount: 50000000,
    final_amount: 1510000000,
    payment_status: "UNPAID",
    payment_plan: "FULL",
    deposit_amount: 0,
    remaining_amount: 1510000000,
    created_at: "2025-10-05T14:30:00Z",
    updated_at: "2025-10-05T14:30:00Z",
  },
  {
    contract_id: 3,
    contract_code: "CT2025-003",
    customer_id: 3,
    dealer_id: 1,
    user_id: 1,
    contract_date: "2025-10-08",
    contract_status: "DRAFT",
    total_amount: 850000000,
    discount_amount: 0,
    final_amount: 850000000,
    payment_status: "UNPAID",
    payment_plan: "DEPOSIT",
    deposit_amount: 150000000,
    remaining_amount: 700000000,
    created_at: "2025-10-08T09:15:00Z",
    updated_at: "2025-10-08T09:15:00Z",
  },
  {
    contract_id: 4,
    contract_code: "CT2025-004",
    customer_id: 4,
    dealer_id: 1,
    user_id: 1,
    contract_date: "2025-09-25",
    delivery_date: "2025-10-10",
    contract_status: "COMPLETED",
    total_amount: 950000000,
    discount_amount: 50000000,
    final_amount: 900000000,
    payment_status: "PAID",
    payment_plan: "FULL",
    deposit_amount: 0,
    remaining_amount: 0,
    created_at: "2025-09-25T11:00:00Z",
    updated_at: "2025-10-10T16:00:00Z",
  },
  {
    contract_id: 5,
    contract_code: "CT2025-005",
    customer_id: 1,
    dealer_id: 1,
    user_id: 1,
    contract_date: "2025-10-12",
    contract_status: "IN_PROGRESS",
    total_amount: 780000000,
    discount_amount: 0,
    final_amount: 780000000,
    payment_status: "PAID",
    payment_plan: "DEPOSIT",
    deposit_amount: 300000000,
    remaining_amount: 480000000,
    created_at: "2025-10-12T13:45:00Z",
    updated_at: "2025-10-12T13:45:00Z",
  },
]

export function generateContractCode(): string {
  const year = new Date().getFullYear()
  const maxCode = mockContracts.reduce((max, contract) => {
    const num = Number.parseInt(contract.contract_code.split("-")[1])
    return num > max ? num : max
  }, 0)
  return `CT${year}-${String(maxCode + 1).padStart(3, "0")}`
}
