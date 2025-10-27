import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Users, DoorOpen } from "lucide-react";
import type { IVehicle } from "@/types/vehicle";

interface MainSpecsProps {
  vehicle: IVehicle;
  selectedVariant: IVehicle["variants"][0] | undefined;
}

export function MainSpecs({ vehicle, selectedVariant }: MainSpecsProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30">
      <CardHeader>
        <CardTitle>Thông Số Chính</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Battery className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Quãng đường</span>
            </div>
            <span className="text-3xl font-bold text-green-600">
              {selectedVariant?.range_km ? `${selectedVariant.range_km} km` : "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Số ghế</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{vehicle.seats || "N/A"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DoorOpen className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Số cửa</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">{vehicle.doors || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}