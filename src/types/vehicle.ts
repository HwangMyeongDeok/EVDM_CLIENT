
export interface IVehicleUnit {
  vin: string;
  dealer?: string;
  importDate: Date;
  status: 'IN_TRANSIT' | 'IN_DEALER' | 'SOLD';
}

export interface IVehicleVariant {
  version: string;
  color: string;
  dealerPrice: number;
  basePrice: number;
  retailPrice: number;
  discountPercent: number;
  modelYear: number;
  batteryCapacityKwh?: number;
  rangeKm?: number;
  motorPowerKw?: number;
  acceleration0100?: number;
  topSpeedKmh?: number;
  chargingTimeHours?: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  units: IVehicleUnit[]; 
}

export interface IVehicle {
  _id: string;
  modelName: string;
  specifications?: string;
  bodyType: 'SUV' | 'Sedan' | 'Hatchback' | 'Crossover' | 'Pickup' | 'MPV';
  seats: number;
  doors: number;
  warrantyYears: number;
  description?: string;
  imageUrl?: string;
  variants: IVehicleVariant[]; 
}