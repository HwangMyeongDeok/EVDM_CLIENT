import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleSkeleton() {
  return (
    <Card className="border border-border">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48" />
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-1/2" />
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}
