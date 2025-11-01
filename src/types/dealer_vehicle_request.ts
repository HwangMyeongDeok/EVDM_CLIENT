import type { RequestStatus } from "@/types/enums";


export interface DealerVehicleRequest {
  request_id: string;
  dealer_id: string;
  variant_id: number;
  requested_quantity: number;
  status: RequestStatus;
  created_at?: string;
  updated_at?: string;
}
