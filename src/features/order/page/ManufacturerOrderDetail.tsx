import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  X,
  Clock,
  ArrowLeft,
  Package,
  DollarSign,
  FileText,
  Truck,
  Palette,
  Calendar,
  Hash,
  Building2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  useGetDealerRequestsQuery,
  useUpdateDealerRequestStatusMutation,
} from "@/features/order/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";

const getStatusBadge = (status: DealerVehicleRequest["status"]) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-base px-4 py-2"
        >
          <Clock className="w-4 h-4 mr-2" /> Đang chờ xử lý
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-base px-4 py-2">
          <Check className="w-4 h-4 mr-2" /> Đã duyệt
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 hover:bg-red-100 text-base px-4 py-2"
        >
          <X className="w-4 h-4 mr-2" /> Đã từ chối
        </Badge>
      );
  }
};

export default function ManufacturerDealerRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useGetDealerRequestsQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const [updateStatus, { isLoading: isUpdating, isSuccess }] =
    useUpdateDealerRequestStatusMutation();

  const [dialogAction, setDialogAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  const request = requests.find((r) => String(r.request_id) === id);
  console.log(requests)
  // Tạo danh sách tất cả variant trong yêu cầu
  const variantsInRequest = (request?.items || []).map(item => {
  const v = vehicles
    .flatMap(vehicle => vehicle.variants)
    .find(variant => variant?.variant_id && variant.variant_id.toString() === item.variant_id?.toString());
  return { ...item, variant: v };
});
  console.log(variantsInRequest);

  // Tổng số lượng
  const totalQuantity = variantsInRequest.reduce(
    (sum, item) => sum + (item.requested_quantity ?? 0),
    0
  );

  // Tổng giá trị
  const totalValue = variantsInRequest.reduce(
    (sum, item) => sum + (item.variant?.retail_price ?? 0) * (item.requested_quantity ?? 0),
    0
  );

  useEffect(() => {
    if (isSuccess) {
      alert("✅ Cập nhật trạng thái thành công!");
      navigate("/evm/orders");
    }
  }, [isSuccess, navigate]);

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!request) return;

    try {
      await updateStatus({ id: String(request.request_id), status: newStatus });
      setDialogAction(null);
    } catch (error) {
      console.error(error);
      alert("❌ Cập nhật trạng thái thất bại!");
      setDialogAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <Card className="shadow-lg">
          <CardContent className="pt-6 text-center">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không tìm thấy yêu cầu
            </h2>
            <p className="text-gray-600 mb-6">
              Yêu cầu với mã "{id}" không tồn tại trong hệ thống.
            </p>
            <Button onClick={() => navigate("/evm/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/evm/orders")}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết yêu cầu #{request.request_id}
            </h1>
            <p className="text-gray-600 mt-1">
              Thông tin chi tiết về yêu cầu đặt hàng từ đại lý
            </p>
          </div>
          <div>{getStatusBadge(request.status)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin yêu cầu */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    Mã yêu cầu
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">{request.request_id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    Mã đại lý
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">{request.dealer_id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ngày tạo yêu cầu
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(request.created_at ?? "").toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ngày cập nhật cuối
                  </p>
                  <p className="font-semibold text-gray-900">
                    {request.updated_at
                      ? new Date(request.updated_at).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin xe */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Truck className="h-5 w-5 mr-2 text-purple-600" />
                Thông tin xe đặt hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {variantsInRequest.map((item, idx) => (
                <div key={idx} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <p className="text-sm text-gray-500">Dòng xe</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {item.variant?.vehicle?.model_name || "N/A"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">Phiên bản</p>
                  <p className="font-bold text-gray-900">{item.variant?.version || "N/A"}</p>

                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <Palette className="h-4 w-4 mr-1" />
                    Màu sắc
                  </p>
                  <p className="font-semibold text-gray-900">{item.variant?.color || "N/A"}</p>

                  <p className="text-sm text-gray-500 mt-1">Số lượng</p>
                  <p className="font-semibold text-gray-900">{item.requested_quantity} xe</p>

                  <p className="text-sm text-gray-500 mt-1">Giá bán (VNĐ)</p>
                  <p className="font-semibold text-gray-900">
                    {item.variant?.retail_price
                      ? new Intl.NumberFormat("vi-VN").format(item.variant.retail_price)
                      : "N/A"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">Tổng giá trị</p>
                  <p className="font-semibold text-gray-900">
                    {item.variant?.retail_price
                      ? new Intl.NumberFormat("vi-VN").format(
                          item.variant.retail_price * item.requested_quantity
                        )
                      : "N/A"}{" "}
                    VNĐ
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Số lượng yêu cầu */}
          <Card className="shadow-lg border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Tổng số lượng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-blue-600">{totalQuantity}</p>
                <p className="text-gray-700 mt-2 text-lg font-medium">xe</p>
              </div>
            </CardContent>
          </Card>

          {/* Tổng giá trị */}
          <Card className="shadow-lg border-green-300 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Tổng giá trị đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-green-600">
                  {new Intl.NumberFormat("vi-VN").format(totalValue)}
                </p>
                <p className="text-gray-700 mt-1 text-lg">VNĐ</p>
              </div>
            </CardContent>
          </Card>

          {/* Hành động */}
          {request.status === "PENDING" && (
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Xử lý yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={isUpdating}
                  onClick={() => setDialogAction("APPROVED")}
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5 mr-2" />
                  )}
                  Phê duyệt yêu cầu
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  size="lg"
                  disabled={isUpdating}
                  onClick={() => setDialogAction("REJECTED")}
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <X className="h-5 w-5 mr-2" />
                  )}
                  Từ chối yêu cầu
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog xác nhận */}
      <AlertDialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {dialogAction === "APPROVED" ? "Xác nhận phê duyệt" : "Xác nhận từ chối"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {dialogAction === "APPROVED"
                ? "Bạn có chắc chắn muốn phê duyệt yêu cầu này? Sau khi phê duyệt, đơn hàng sẽ được xử lý và chuẩn bị giao cho đại lý."
                : "Bạn có chắc chắn muốn từ chối yêu cầu này? Hành động này không thể hoàn tác và đại lý sẽ cần tạo yêu cầu mới."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogAction) {
                  handleUpdateStatus(dialogAction);
                }
              }}
              className={
                dialogAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {dialogAction === "APPROVED" ? "Phê duyệt" : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
