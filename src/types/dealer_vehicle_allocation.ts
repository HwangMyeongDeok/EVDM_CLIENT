export const AllocationStatus = {
    PENDING: 'PENDING',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
} as const;
export type AllocationStatus = typeof AllocationStatus[keyof typeof AllocationStatus];

export interface AllocationItem {
    item_id: number;
    variant: {
        variant_id: number;
        version: string;
    };
    quantity: number;
    image_url?: string;
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
export interface Allocation {
    allocation_id: number;
    request_id: number | null;
    delivery_batch: number | null;
    delivery_date: string;
    notes: string | null;
    status: AllocationStatus;
    items: AllocationItem[];
    actual_delivery_date?: string;
}