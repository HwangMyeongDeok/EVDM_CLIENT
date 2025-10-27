import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { QuotationModal } from "@/features/quotation/component/QuotationModal";
import type { IVehicleVariant } from "@/types/vehicle";

export function MobilePriceBar({ selectedVariant }: { selectedVariant: IVehicleVariant }) {
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Giá bán</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(selectedVariant.retail_price)}
            </p>
          </div>
          <Button 
            onClick={() => setIsQuotationOpen(true)} 
            className="ml-4 px-6"
          >
            Báo giá
          </Button>
        </div>
      </div>
      
      <QuotationModal
        open={isQuotationOpen}
        onOpenChange={setIsQuotationOpen}
        variant={selectedVariant}
      />
    </>
  );
}