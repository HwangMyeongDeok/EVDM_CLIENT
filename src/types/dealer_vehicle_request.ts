import type { RequestStatus } from "@/types/enums";
import type { IVehicle } from "./vehicle";

export interface Dealer {
  dealer_id: string;
  dealer_name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface Variant {
  variant_id: string;
  vehicle_id: string;
  version?: string;
  color?: string;
  dealer_price?: number;
}

export interface DealerVehicleRequest {
  request_id: string;          
  dealer_id: string;      
  variant_id?: string;      
  status: RequestStatus;        
  created_at?: string;          
  updated_at?: string;          
  dealer?: Dealer;              
  items: Items[];         
  request_date: string; 
  notes?: string;
}

export interface Items{
  vehicle?: IVehicle;
  variant?: Variant;
  item_id?: string;
  variant_id: string;
  requested_quantity: number;
}
