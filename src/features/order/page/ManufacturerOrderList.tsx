import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 ĐÃ THÊM
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
import {
  Loader2,
  Check,
  X,
  Clock,
  RefreshCw,
  Eye, 
} from "lucide-react";

import {
  useGetDealerRequestsQuery,
  useUpdateDealerRequestStatusMutation,
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
  const navigate = useNavigate(); // 👈 ĐÃ THÊM

  const {
    data: dealerRequests = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetDealerRequestsQuery();

  const { data: vehicles = [] } = useGetVehiclesQuery();
  const [updateDealerRequestStatus, { isLoading: isUpdating }] =
    useUpdateDealerRequestStatusMutation();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Map variant_id -> variant object (để truy xuất nhanh)
  const variantMap = new Map<number, IVehicleVariant>();
  vehicles.forEach((v) =>
    v.variants.forEach((variant) =>
      variantMap.set(variant.variant_id, variant)
    )
  );

  // --- Hàm cập nhật trạng thái ---
  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    const confirmText =
      status === "APPROVED" ? "Duyệt yêu cầu này?" : "Từ chối yêu cầu này?";
    if (!confirm(confirmText)) return;

    try {
      setUpdatingId(id);
      await updateDealerRequestStatus({ id, status }).unwrap();

      alert(
        `✅ Đã ${
          status === "APPROVED" ? "duyệt" : "từ chối"
        } yêu cầu thành công!`
      );

      await refetch();
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setUpdatingId(null);
    }
  };

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
          {isFetching && (
            <div className="text-gray-500 flex items-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Đang cập nhật...
            </div>
          )}
        </CardHeader>

        <CardContent>
          {dealerRequests.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium text-gray-500">
                🎉 Không có yêu cầu nào.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Các yêu cầu mới sẽ hiển thị tại đây.
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
                  <TableHead className="text-center font-bold text-gray-700">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200">
                {dealerRequests.map((req: DealerVehicleRequest) => {
                  const variant = variantMap.get(req.variant_id);
                  const isCurrentUpdating =
                    isUpdating && updatingId === req.request_id;

                  return (
                    <TableRow
                      key={req.request_id}
                      className={`hover:bg-gray-50 ${
                        isCurrentUpdating ? "opacity-50" : ""
                      }`}
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

                      {/* 👇 ĐÃ THÊM NÚT XEM CHI TIẾT VÀO ĐÂY */}
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

                      <TableCell className="text-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                          disabled={isUpdating || req.status !== "PENDING"}
                          onClick={() =>
                            handleUpdateStatus(req.request_id, "APPROVED")
                          }
                        >
                          {isCurrentUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="disabled:bg-gray-300"
                          disabled={isUpdating || req.status !== "PENDING"}
                          onClick={() =>
                            handleUpdateStatus(req.request_id, "REJECTED")
                          }
                        >
                          {isCurrentUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Từ chối
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