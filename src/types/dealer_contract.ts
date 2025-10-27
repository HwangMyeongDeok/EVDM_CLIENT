export interface DealerContract {
  dealer_contract_id: string
  contract_code: string
  dealer_id: string
  sales_target: number
  target_units: number
  discount_rate: number
  credit_limit: number
  start_date: string
  end_date: string
  remarks?: string
  created_at: string
  updated_at: string
}