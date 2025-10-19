import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Battery, Gauge, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IVehicle } from "@/types/vehicle";
import { getColorHex, formatPrice } from "@/lib/format";

interface VariantSummaryProps {
  vehicle: IVehicle;
  selectedVariant: IVehicle["variants"][0] | undefined;
}

export function VariantSummary({ vehicle, selectedVariant }: VariantSummaryProps) {
  return (
    <Card className="lg:block hidden">
      <CardHeader>
        <CardTitle>Tóm Tắt Phiên Bản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Phiên bản</p>
          <p className="text-lg font-semibold">{selectedVariant?.version || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Màu sắc</p>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: getColorHex(selectedVariant?.color || "") }}
            />
            <span className="font-semibold">{selectedVariant?.color || "N/A"}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
          <Badge
            variant={selectedVariant?.status === "ACTIVE" ? "default" : "secondary"}
            className="text-sm"
          >
            {selectedVariant?.status || "N/A"}
          </Badge>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground mb-1">Thông số nổi bật</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                Quãng đường: {selectedVariant?.rangeKm ? `${selectedVariant.rangeKm} km` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-red-500" />
              <span className="text-sm">
                Tăng tốc: {selectedVariant?.acceleration0100 ? `${selectedVariant.acceleration0100}s` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Số ghế: {vehicle.seats || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-500" />
              <span className="text-sm">
                Tốc độ tối đa: {selectedVariant?.topSpeedKmh ? `${selectedVariant.topSpeedKmh} km/h` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">
                Bảo hành: {vehicle.warrantyYears ? `${vehicle.warrantyYears} năm` : "N/A"}
              </span>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground mb-1">Giá bán lẻ</p>
          <p className="text-3xl font-bold text-primary">{formatPrice(selectedVariant?.retailPrice || 0)}</p>
          {selectedVariant?.discountPercent ? selectedVariant.discountPercent > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              Tiết kiệm {formatPrice((selectedVariant.retailPrice * selectedVariant.discountPercent) / 100)}
            </p>
          ) : null}
        </div>
        <div className="pt-4 space-y-2 border-t border-border">
          <Button className="w-full" size="lg">
            Yêu cầu báo giá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}