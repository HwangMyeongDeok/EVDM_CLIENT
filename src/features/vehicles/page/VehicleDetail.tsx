import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGetVehicleByIdQuery } from "@/features/vehicles/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleHeader } from "@/features/vehicles/component/VehicleHeader";
import { VehicleCarousel } from "@/features/vehicles/component/VehicleCarousel";
import { VariantSelector } from "@/features/vehicles/component/VariantSelector";
import { MainSpecs } from "@/features/vehicles/component/MainSpecs";
import { PerformanceSpecs } from "@/features/vehicles/component/PerformanceSpecs";
import { VehicleFAQ } from "@/features/vehicles/component/VehicleFAQ";
import { SimilarVehicles } from "@/features/vehicles/component/SimilarVehicles";
import { VariantSummary } from "@/features/vehicles/component/VariantSummary";
import { MobilePriceBar } from "@/features/vehicles/component/MobilePriceBar";
import { QuotationModal } from "@/features/quotations/component/QuotationModal";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  
  const { data: vehicle, isLoading, isError, refetch, isFetching } = useGetVehicleByIdQuery(id || "");

  if (!isLoading && !vehicle) {
    return <Navigate to="/404" replace />;
  }

  const selectedVariant = vehicle?.variants[selectedVariantIdx];
  const minRetailPrice = vehicle ? Math.min(...vehicle.variants.map((v) => v.retail_price || 0)) : 0;

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900">
      <VehicleHeader
        vehicle={vehicle}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        minRetailPrice={minRetailPrice}
        selectedVariant={selectedVariant}
        refetch={refetch}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-96" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : isError ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">
              Không tải được chi tiết xe. Vui lòng thử lại sau.
            </p>
            <Button
              variant="outline"
              className="text-primary hover:bg-primary/10"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Đang tải..." : "Thử lại"}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <VehicleCarousel vehicle={vehicle!} />
                <VariantSelector
                  vehicle={vehicle!}
                  selectedVariantIdx={selectedVariantIdx}
                  setSelectedVariantIdx={setSelectedVariantIdx}
                />
                <MainSpecs vehicle={vehicle!} selectedVariant={selectedVariant} />
                <PerformanceSpecs vehicle={vehicle!} selectedVariant={selectedVariant} />
                <VehicleFAQ />
                <SimilarVehicles />
              </div>
              <div className="space-y-6 lg:sticky lg:top-4">
                <VariantSummary 
                  vehicle={vehicle!} 
                  selectedVariant={selectedVariant!} 
                />
                <MobilePriceBar selectedVariant={selectedVariant!} />
              </div>
            </div>

            {/* Quotation Modal - Single instance cho cả Desktop + Mobile */}
            {selectedVariant && (
              <QuotationModal
                open={isQuotationOpen}
                onOpenChange={setIsQuotationOpen}
                variant={selectedVariant}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}