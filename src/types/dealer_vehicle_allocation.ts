export interface Dealer {
  dealer_id: string;
  dealer_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Variant {
  variant_id: string;
  vehicle_id: string;
  version?: string;
  color?: string;
  dealer_price?: number;
}

export interface DealerVehicleAllocation {
  allocation_id?: string;          
  request_id?: string;           
  dealer_id: string;
  variant_id: string;
  allocated_quantity: number;      
  delivery_batch?: string;
  delivery_date?: string;
  allocation_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  dealer: Dealer;                 
  variant?: Variant;               
  items: DealerVehicleAllocationItem[];
}
export interface DealerVehicleAllocationItem {
  item_id?: string;       
  allocation_id?: string; 
  variant_id: string;     
  quantity: number;     
  variant?: Variant;      
}