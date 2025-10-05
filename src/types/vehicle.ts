export interface Vehicle {
  _id: string;
  model_name: string;
  specifications?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleVariant {
  _id: string;
  vehicle_id: string;
  version?: string;
  color?: string;
  base_price: number;
  created_at?: string;
  updated_at?: string;
}
