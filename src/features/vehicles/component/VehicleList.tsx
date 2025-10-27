import { motion, AnimatePresence } from "framer-motion";
import { VehicleSkeleton } from "./VehicleSkeleton";
import { Button } from "@/components/ui/button";
import type { IVehicle } from "@/types/vehicle";
import { VehicleCard } from "@/features/vehicles/component/VehicleCard";

interface Props {
  vehicles: IVehicle[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function VehicleList({ vehicles, isLoading, isError, refetch }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <VehicleSkeleton key={i} />)
        ) : isError ? (
          <div className="text-center col-span-full">
            <p className="text-red-500 mb-4">Không tải được danh sách xe. Vui lòng thử lại sau.</p>
            <Button variant="outline" onClick={refetch}>
              Thử lại
            </Button>
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">Không tìm thấy xe phù hợp.</p>
        ) : (
          vehicles.map((v) => <VehicleCard key={v.vehicle_id} vehicle={v} />)
        )}
      </motion.div>
    </AnimatePresence>
  );
}
