import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { IVehicle } from "@/types/vehicle";

interface MobilePriceBarProps {
  selectedVariant: IVehicle["variants"][0] | undefined;
}

export function MobilePriceBar({ selectedVariant }: MobilePriceBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 z-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Giá: {formatPrice(selectedVariant?.retailPrice || 0)}</p>
          {selectedVariant?.discountPercent ? selectedVariant.discountPercent > 0 && (
            <p className="text-xs text-green-600">
              Tiết kiệm {formatPrice((selectedVariant.retailPrice * selectedVariant.discountPercent) / 100)}
            </p>
          ) : null}
        </div>
        <Button className="flex-1" size="lg">
          Yêu cầu báo giá
        </Button>
      </div>
    </div>
  );
}