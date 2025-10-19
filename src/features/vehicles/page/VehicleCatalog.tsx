import { useState, useMemo } from "react";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { IVehicle } from "@/types/vehicle";
import { VehicleList } from "@/features/vehicles/component/VehicleList";
import { VehicleFilters } from "@/features/vehicles/component/VehicleFilters";

export default function VehicleCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBodyType, setFilterBodyType] = useState<string>("all");
  const [filterRange, setFilterRange] = useState<string>("all");

  const { data: vehicles = [], isLoading, isError, refetch } = useGetVehiclesQuery();

  const bodyTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: vehicles.length };
    vehicles.forEach((v) => {
      counts[v.bodyType] = (counts[v.bodyType] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: IVehicle) => {
      const mainVariant = vehicle.variants[0];
      const matchesSearch = vehicle.modelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBodyType = filterBodyType === "all" || vehicle.bodyType === filterBodyType;
      const matchesRange =
        filterRange === "all" ||
        (filterRange === "under300" && (mainVariant?.rangeKm ?? 0) < 300) ||
        (filterRange === "300-400" && (mainVariant?.rangeKm ?? 0) >= 300 && (mainVariant?.rangeKm ?? 0) < 400) ||
        (filterRange === "over400" && (mainVariant?.rangeKm ?? 0) >= 400);
      return matchesSearch && matchesBodyType && matchesRange;
    });
  }, [vehicles, searchQuery, filterBodyType, filterRange]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterBodyType("all");
    setFilterRange("all");
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Danh Sách Xe Điện
      </h2>

      <VehicleFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterBodyType={filterBodyType}
        setFilterBodyType={setFilterBodyType}
        filterRange={filterRange}
        setFilterRange={setFilterRange}
        resetFilters={resetFilters}
        bodyTypeCounts={bodyTypeCounts}
        vehicles={vehicles}
      />

      <VehicleList
        vehicles={filteredVehicles}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
    </div>
  );
}
