import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Battery, Gauge, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuotationModal } from "@/features/quotations/component/QuotationModal";
import type { IVehicle } from "@/types/vehicle";
import { getColorHex, formatPrice } from "@/lib/format";

interface VariantSummaryProps {
  vehicle: IVehicle;
  selectedVariant: IVehicle["variants"][0];
}

export function VariantSummary({ vehicle, selectedVariant }: VariantSummaryProps) {
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);

  return (
    <>
      <Card className="lg:block hidden">
        <CardHeader>
          <CardTitle>Tóm Tắt Phiên Bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phiên bản</p>
            <p className="text-lg font-semibold">{selectedVariant.version}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Màu sắc</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: getColorHex(selectedVariant.color) }}
              />
              <span className="font-semibold">{selectedVariant.color}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
            <Badge variant={selectedVariant.status === "ACTIVE" ? "default" : "secondary"}>
              {selectedVariant.status}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Thông số nổi bật</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  Quãng đường: {selectedVariant.range_km ? `${selectedVariant.range_km} km` : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-red-500" />
                <span className="text-sm">
                  Tăng tốc: {selectedVariant.acceleration_0_100 ? `${selectedVariant.acceleration_0_100}s` : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Số ghế: {vehicle.seats}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span className="text-sm">Bảo hành: {vehicle.warranty_years} năm</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Giá bán lẻ</p>
            <p className="text-3xl font-bold text-primary">{formatPrice(selectedVariant.retail_price)}</p>
          </div>

          <div className="pt-4 space-y-2 border-t border-border">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setIsQuotationOpen(true)}
            >
              Yêu cầu báo giá
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <QuotationModal
        open={isQuotationOpen}
        onOpenChange={setIsQuotationOpen}
        variant={selectedVariant}
      />
    </>
  );
}