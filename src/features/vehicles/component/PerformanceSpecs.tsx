import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Gauge, Zap, Clock, Shield } from "lucide-react";
import type { IVehicle } from "@/types/vehicle";

interface PerformanceSpecsProps {
  vehicle: IVehicle;
  selectedVariant: IVehicle["variants"][0] | undefined;
}

export function PerformanceSpecs({ vehicle, selectedVariant }: PerformanceSpecsProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="performance">
        <AccordionTrigger className="text-lg font-semibold">
          Hiệu Suất & Thông Số Kỹ Thuật
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Tăng tốc (0-100km/h)</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {selectedVariant?.acceleration_0_100 ? `${selectedVariant.acceleration_0_100}s` : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Công suất</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {selectedVariant?.motor_power_kw ? `${selectedVariant.motor_power_kw} kW` : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">Tốc độ tối đa</span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {selectedVariant?.top_speed_kmh ? `${selectedVariant.top_speed_kmh} km/h` : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-medium">Thời gian sạc</span>
              </div>
              <span className="text-xl font-bold text-cyan-600">
                {selectedVariant?.charging_time_hours ? `${selectedVariant.charging_time_hours} giờ` : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium">Bảo hành</span>
              </div>
              <span className="text-xl font-bold text-indigo-600">
                {vehicle.warranty_years ? `${vehicle.warranty_years} năm` : "N/A"}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}