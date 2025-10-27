import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { IVehicle } from "@/types/vehicle";

interface VehicleCarouselProps {
  vehicle: IVehicle;
}

export function VehicleCarousel({ vehicle }: VehicleCarouselProps) {
  const images: string[] = vehicle.image_urls && vehicle.image_urls.length > 0
    ? vehicle.image_urls
    : ["/placeholder.svg?height=600&width=800"];

  return (
    <Card className="overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, idx) => (
            <CarouselItem key={idx}>
              <div className="relative w-full h-96 bg-muted">
                <img
                  src={img}
                  alt={`${vehicle.model_name} view ${idx + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </Card>
  );
}
