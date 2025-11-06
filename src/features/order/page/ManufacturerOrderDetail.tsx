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
  User,
  Calendar,
  Truck,
  Hash,
  Palette,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
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

  // Tìm variant tương ứng
  const variant = vehicles
    .flatMap((v) => v.variants)
    .find((v) => v.variant_id === request?.variant_id);

  // Tìm vehicle model
  const vehicle = vehicles.find((v) =>
    v.variants.some((variant) => variant.variant_id === request?.variant_id)
  );

  useEffect(() => {
    if (isSuccess) {
      alert("✅ Cập nhật trạng thái thành công!");
      navigate("/evm/staff/orders");
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
            <Button onClick={() => navigate("/evm/staff/orders")}>
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
          onClick={() => navigate("/evm/staff/orders")}
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
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Dòng xe</p>
                  <p className="font-bold text-gray-900 text-xl">
                    {vehicle?.model_name || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Phiên bản</p>
                  <p className="font-bold text-gray-900 text-xl">
                    {variant?.version || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Palette className="h-4 w-4 mr-1" />
                    Màu sắc
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-400"></div>
                    <p className="font-semibold text-gray-900">{variant?.color || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Giá bán (VNĐ)
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {variant?.base_price
                      ? new Intl.NumberFormat("vi-VN").format(variant.base_price)
                      : "N/A"}
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Mã phiên bản (Variant ID)</p>
                  <p className="font-semibold text-gray-900">{request.variant_id}</p>
                </div>
              </div>

              {vehicle?.description && (
                <div className="pt-6 border-t mt-6">
                  <p className="text-sm text-gray-500 mb-2 font-medium">Mô tả chi tiết</p>
                  <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lịch sử trạng thái */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Lịch sử trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">Yêu cầu được tạo</p>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at ?? "").toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Yêu cầu đặt hàng được khởi tạo bởi đại lý
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(request.created_at ?? "").toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                </div>

                {request.status !== "PENDING" && (
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${
                        request.status === "APPROVED" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">
                          {request.status === "APPROVED"
                            ? "Yêu cầu được phê duyệt"
                            : "Yêu cầu bị từ chối"}
                        </p>
                        <span className="text-sm text-gray-500">
                          {request.updated_at
                            ? new Date(request.updated_at).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.status === "APPROVED"
                          ? "Yêu cầu đã được nhà sản xuất phê duyệt và chuẩn bị giao hàng"
                          : "Yêu cầu bị từ chối bởi nhà sản xuất"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {request.updated_at
                          ? new Date(request.updated_at).toLocaleTimeString("vi-VN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                Số lượng yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-blue-600">
                  {request.requested_quantity}
                </p>
                <p className="text-gray-700 mt-2 text-lg font-medium">xe</p>
              </div>
            </CardContent>
          </Card>

          {/* Tổng giá trị */}
          {variant?.retail_price && (
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
                    {new Intl.NumberFormat("vi-VN").format(
                      variant.retail_price * request.requested_quantity
                    )}
                  </p>
                  <p className="text-gray-700 mt-1 text-lg">VNĐ</p>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đơn giá:</span>
                      <span className="font-semibold text-gray-800">
                        {new Intl.NumberFormat("vi-VN").format(variant.retail_price)} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Số lượng:</span>
                      <span className="font-semibold text-gray-800">
                        {request.requested_quantity} xe
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {request.status !== "PENDING" && (
            <Card className="shadow-lg border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  {request.status === "APPROVED" ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-10 w-10 text-green-600" />
                      </div>
                      <p className="font-bold text-green-700 text-lg">
                        Yêu cầu đã được phê duyệt
                      </p>
                      <p className="text-sm text-gray-600">
                        Đơn hàng đang được xử lý và chuẩn bị giao hàng
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-10 w-10 text-red-600" />
                      </div>
                      <p className="font-bold text-red-700 text-lg">
                        Yêu cầu đã bị từ chối
                      </p>
                      <p className="text-sm text-gray-600">
                        Yêu cầu này không được phê duyệt
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ghi chú */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {request.status === "PENDING"
                  ? "Vui lòng xem xét kỹ thông tin trước khi phê duyệt hoặc từ chối yêu cầu."
                  : request.status === "APPROVED"
                  ? "Yêu cầu đã được phê duyệt. Bạn có thể cập nhật thông tin giao hàng trong phần quản lý đơn hàng."
                  : "Yêu cầu đã bị từ chối. Đại lý có thể tạo yêu cầu mới nếu cần."}
              </p>
            </CardContent>
          </Card>
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