import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Clock,
  RefreshCw,
  Eye,
  Check,
  X,
} from "lucide-react";

import {
  useGetDealerRequestsQuery,
} from "@/features/order/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";
import type { IVehicleVariant } from "@/types/vehicle";

// --- Badge trạng thái ---
const getStatusBadge = (status: DealerVehicleRequest["status"]) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          <Clock className="w-3 h-3 mr-1" /> Đang chờ
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="w-3 h-3 mr-1" /> Đã duyệt
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 hover:bg-red-100"
        >
          <X className="w-3 h-3 mr-1" /> Đã từ chối
        </Badge>
      );
  }
};

export default function ManufacturerDealerRequestList() {
  const navigate = useNavigate();

  const {
    data: dealerRequests = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetDealerRequestsQuery();

  const { data: vehicles = [] } = useGetVehiclesQuery();

  // Map variant_id -> variant object (để truy xuất nhanh)
  const variantMap = new Map<number, IVehicleVariant>();
  vehicles.forEach((v) =>
    v.variants.forEach((variant) =>
      variantMap.set(variant.variant_id, variant)
    )
  );

  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Lọc danh sách dựa trên tìm kiếm và bộ lọc
  const filteredRequests = dealerRequests.filter((req) => {
    const variant = variantMap.get(req.variant_id);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      String(req.request_id).toLowerCase().includes(searchLower) ||
      String(req.dealer_id).toLowerCase().includes(searchLower) ||
      (variant?.version || "").toLowerCase().includes(searchLower) ||
      (variant?.color || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "ALL" || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">
          Đang tải danh sách yêu cầu từ đại lý...
        </p>
      </div>
    );

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">
            Danh sách yêu cầu từ đại lý
          </CardTitle>
          <div className="flex items-center space-x-4">
            {isFetching && (
              <div className="text-gray-500 flex items-center">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Đang cập nhật...
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Thanh tìm kiếm và bộ lọc */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo mã yêu cầu, đại lý, phiên bản, màu xe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium text-gray-500">
                🎉 Không có yêu cầu nào phù hợp.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Thay đổi bộ lọc hoặc tìm kiếm để xem thêm.
              </p>
            </div>
          ) : (
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">
                    Mã yêu cầu
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Đại lý
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Phiên bản
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Màu xe
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    Số lượng
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Ngày yêu cầu
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200">
                {filteredRequests.map((req: DealerVehicleRequest) => {
                  const variant = variantMap.get(req.variant_id);

                  return (
                    <TableRow
                      key={req.request_id}
                      className={`hover:bg-gray-50`}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {req.request_id}
                      </TableCell>
                      <TableCell>{req.dealer_id}</TableCell>
                      <TableCell>{variant?.version || "N/A"}</TableCell>
                      <TableCell>{variant?.color || "N/A"}</TableCell>
                      <TableCell className="text-center">
                        {req.requested_quantity}
                      </TableCell>
                      <TableCell>
                        {new Date(req.created_at ?? "").toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/evm/staff/orders/${req.request_id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}