import type { RequestStatus } from "@/types/enums";

export interface DealerVehicleRequestItem {
  variant_id: string;
  requested_quantity: number;
}

export interface DealerVehicleRequest {
  _id: string;
  dealer_id: string;
  items: DealerVehicleRequestItem[]; 
  status: RequestStatus;
  created_at?: string;
  updated_at?: string;
}
