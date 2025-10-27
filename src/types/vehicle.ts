
export interface IVehicleUnit {
  unit_id: number;
  variant_id: number;
  dealer_id: number;
  vin: string;
  importDate: Date;
  status: 'IN_TRANSIT' | 'IN_DEALER' | 'SOLD';
}

export interface IVehicleVariant {
  variant_id: number;
  vehicle_id: number;
  version: string;
  color: string;
  dealer_price: number;
  base_price: number;
  retail_price: number;
  discount_percent: number;
  model_year: number;
  battery_capacity_kwh?: number;
  range_km?: number;
  motor_power_kw?: number;
  acceleration_0_100?: number;
  top_speed_kmh?: number;
  charging_time_hours?: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  units: IVehicleUnit[];
}

export interface IVehicle {
  vehicle_id: number;
  model_name: string;
  specifications?: string;
  body_type: 'SUV' | 'Sedan' | 'Hatchback' | 'Crossover' | 'Pickup' | 'MPV';
  seats: number;
  doors: number;
  warranty_years: number;
  description?: string;
  image_urls?: string[] | null;
  variants: IVehicleVariant[];
}