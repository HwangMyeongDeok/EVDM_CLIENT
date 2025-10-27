import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import type { IVehicle } from "@/types/vehicle";
import { ArrowLeft } from "lucide-react";

interface VehicleHeaderProps {
  vehicle: IVehicle | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  minRetailPrice: number;
  selectedVariant: IVehicle["variants"][0] | undefined;
  refetch: () => void;
}

export function VehicleHeader({
  vehicle,
  isLoading,
  isError,
  isFetching,
  minRetailPrice,
  selectedVariant,
  refetch,
}: VehicleHeaderProps) {
  return (
    <header className="relative bg-gradient-to-r from-blue-600 via-green-500 to-teal-500 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dealer/staff/vehicles">
          <Button variant="ghost" className="mb-4 gap-2 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>

        {isLoading ? (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        ) : isError ? (
          <div className="text-center">
            <p className="text-red-300 mb-4">
              Không tải được chi tiết xe. Vui lòng thử lại sau.
            </p>
            <Button
              variant="outline"
              className="text-white border-white/30 hover:bg-white/20"
              onClick={refetch}
              disabled={isFetching}
            >
              {isFetching ? "Đang tải..." : "Thử lại"}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{vehicle?.model_name}</h1>
                <Badge variant="secondary" className="text-base px-3 py-1 bg-white/20 text-white">
                  {vehicle?.body_type}
                </Badge>
              </div>
              <p className="text-white/80 max-w-lg">{vehicle?.description || "Không có mô tả"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Giá từ</p>
              <p className="text-3xl font-bold">{formatPrice(minRetailPrice)}</p>
              {selectedVariant?.discount_percent ? selectedVariant.discount_percent > 0 && (
                <Badge className="mt-2 bg-gradient-to-r from-green-500 to-lime-500 text-white">
                  Tiết kiệm {selectedVariant.discount_percent}%!
                </Badge>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}