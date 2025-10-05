export interface DealerVehicleAllocationItem {
  variant_id: string;
  allocated_quantity: number;
}

export interface DealerVehicleAllocation {
  _id: string;
  request_id?: string; 
  dealer_id: string;
  items: DealerVehicleAllocationItem[];
  allocation_date?: string;
  created_at?: string;
}
