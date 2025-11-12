import type { IDealer } from "@/types/dealer";
import type { IVehicleVariant } from "@/types/vehicle";

export const AllocationStatus = {
  PENDING: "PENDING",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
} as const;
export type AllocationStatus =
  (typeof AllocationStatus)[keyof typeof AllocationStatus];

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
  dealer: IDealer;
  variant?: IVehicleVariant;
  items: DealerVehicleAllocationItem[];
}
export interface DealerVehicleAllocationItem {
  item_id?: string | number;
  allocation_id?: string | number;
  variant_id: string | number;
  quantity: number;
  variant?: IVehicleVariant;
}
export interface Allocation {
  allocation_id: string | number;
  request_id: string | null;
  delivery_batch: string | null;
  delivery_date: string;
  notes: string | null;
  status: AllocationStatus;
  items: AllocationItem[];
  paid_amount: number;
  actual_delivery_date?: string;
  request: {
    items: {
      item_id: number;
      variant: {
        variant_id: number;
        version: string;
        retail_price: number;
      };
      requested_quantity: number;
    }[];
  };
}
