import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

export function SimilarVehicles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xe Tương Tự</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 border-border hover:shadow-md transition-shadow">
            <h3 className="font-semibold">EV Model 2</h3>
            <p className="text-sm text-muted-foreground">SUV, Range: 400km, Giá: {formatPrice(650000000)}</p>
          </Card>
          <Card className="p-4 border-border hover:shadow-md transition-shadow">
            <h3 className="font-semibold">EV Model 3</h3>
            <p className="text-sm text-muted-foreground">Sedan, Range: 300km, Giá: {formatPrice(550000000)}</p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}