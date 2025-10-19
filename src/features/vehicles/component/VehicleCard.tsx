import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Battery, Gauge, DollarSign, Users } from "lucide-react";
import type { IVehicle } from "@/types/vehicle";

const formatPrice = (price: number) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export function VehicleCard({ vehicle }: { vehicle: IVehicle }) {
  const mainVariant = vehicle.variants[0];

  return (
    <Card className="group relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-border">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.modelName}
            className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
            loading="lazy"
          />
        </div>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-primary">{vehicle.modelName}</h3>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {vehicle.bodyType}
          </Badge>
        </div>

        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4 text-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Battery className="w-5 h-5 text-green-500" />
              <span>Quãng đường</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {mainVariant?.rangeKm ? `${mainVariant.rangeKm} km` : "N/A"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="w-5 h-5" />
              <span>Tăng tốc (0-100km/h)</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {mainVariant?.acceleration0100 ? `${mainVariant.acceleration0100}s` : "N/A"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>Số ghế</span>
            </div>
            <span className="font-medium">{vehicle.seats}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-5 h-5" />
            <span>Giá bán lẻ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {mainVariant ? formatPrice(mainVariant.retailPrice) : "N/A"}
            </span>
            {mainVariant?.discountPercent > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                {mainVariant.discountPercent}% OFF
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 flex justify-between">
        <Button
          variant="outline"
          className="text-primary hover:bg-primary/10"
          onClick={() => alert("So sánh xe - Tính năng sắp triển khai")}
        >
          So sánh
        </Button>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link to={`/dealer/staff/vehicles/${vehicle._id}`}>Xem Chi Tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
