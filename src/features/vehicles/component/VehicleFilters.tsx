import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { IVehicle } from "@/types/vehicle";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterBodyType: string;
  setFilterBodyType: (v: string) => void;
  filterRange: string;
  setFilterRange: (v: string) => void;
  resetFilters: () => void;
  bodyTypeCounts: Record<string, number>;
  vehicles: IVehicle[];
}

export function VehicleFilters({
  searchQuery,
  setSearchQuery,
  filterBodyType,
  setFilterBodyType,
  filterRange,
  setFilterRange,
  resetFilters,
  bodyTypeCounts,
  vehicles
}: Props) {
  const bodyTypes = Array.from(new Set(vehicles.map((v) => v.bodyType)));
  const isFilterApplied = searchQuery || filterBodyType !== "all" || filterRange !== "all";

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        <Input
          placeholder="Tìm kiếm theo tên model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:flex-1"
        />
        <Select value={filterRange} onValueChange={setFilterRange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Quãng đường" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ({bodyTypeCounts.all})</SelectItem>
            <SelectItem value="under300">Dưới 300km</SelectItem>
            <SelectItem value="300-400">300-400km</SelectItem>
            <SelectItem value="over400">Trên 400km</SelectItem>
          </SelectContent>
        </Select>

        {isFilterApplied && (
          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2 text-primary hover:bg-primary/10 mt-4 md:mt-0"
            onClick={resetFilters}
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <Tabs value={filterBodyType} onValueChange={setFilterBodyType} className="mb-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="all">
            Tất cả <Badge className="ml-2">{bodyTypeCounts.all}</Badge>
          </TabsTrigger>
          {bodyTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type} <Badge className="ml-2">{bodyTypeCounts[type] || 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
