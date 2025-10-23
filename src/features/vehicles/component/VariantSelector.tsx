import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type { IVehicle } from "@/types/vehicle";
import { formatPrice, getColorHex } from "@/lib/format";

interface VariantSelectorProps {
  vehicle: IVehicle;
  selectedVariantIdx: number;
  setSelectedVariantIdx: (idx: number) => void;
}

export function VariantSelector({ vehicle, selectedVariantIdx, setSelectedVariantIdx }: VariantSelectorProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
      <CardHeader>
        <CardTitle>Chọn Phiên Bản</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {vehicle.variants.map((variant, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedVariantIdx(idx)}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{
                  opacity: selectedVariantIdx === idx ? 1 : 0.8,
                  scale: selectedVariantIdx === idx ? 1 : 0.98,
                }}
                transition={{ duration: 0.3 }}
                className={`border-2 rounded-lg p-4 space-y-3 transition-all cursor-pointer ${
                  selectedVariantIdx === idx
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg">{variant.version || "N/A"}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                        style={{ backgroundColor: getColorHex(variant.color || "") }}
                      />
                      <span className="text-sm text-muted-foreground">{variant.color || "N/A"}</span>
                    </div>
                  </div>
                  <Badge
                    variant={variant.status === "ACTIVE" ? "default" : "secondary"}
                    className="whitespace-nowrap"
                  >
                    {variant.status || "N/A"}
                  </Badge>
                </div>
                <div className="space-y-2 pt-2 border-t border-border text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Giá bán lẻ</span>
                    <span className="font-bold text-primary">{formatPrice(variant.retailPrice || 0)}</span>
                  </div>
                  {variant.discountPercent ? variant.discountPercent > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Giảm giá</span>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {variant.discountPercent}% OFF
                      </Badge>
                    </div>
                  ) : null}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}