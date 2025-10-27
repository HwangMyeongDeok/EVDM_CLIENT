

export interface DealerVehicleAllocation {
  allocation_id: string;
  request_id?: string; 
  dealer_id: string;
  variant_id: string;
  allocated_quantity: number;
  delivery_batch: string;
  delivery_date?: string;
  allocation_date?: string;
  created_at?: string;
  updated_at?: string;
}
