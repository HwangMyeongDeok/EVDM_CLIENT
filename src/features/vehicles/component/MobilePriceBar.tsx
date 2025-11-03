import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { IVehicleVariant } from "@/types/vehicle";
import { useNavigate } from "react-router-dom";

export function MobilePriceBar({ selectedVariant }: { selectedVariant: IVehicleVariant }) {
  const navigate = useNavigate();

  const handleCreateQuotation = () => {
    navigate(`/dealer/staff/quotations/create/${selectedVariant.variant_id}`);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Giá bán</p>
          <p className="text-xl font-bold text-primary">
            {formatPrice(selectedVariant.retail_price)}
          </p>
        </div>
        <Button 
          onClick={handleCreateQuotation}
          className="ml-4 px-6"
        >
          Báo giá
        </Button>
      </div>
    </div>
  );
}
