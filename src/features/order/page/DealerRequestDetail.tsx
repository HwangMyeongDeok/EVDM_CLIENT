import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useGetDealerRequestsQuery } from "@/features/order/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Check,
  Clock,
  X,
  RefreshCw,
  DollarSign,
  Building2,
  Hash,
} from "lucide-react";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";
import type { RequestStatus } from "@/types/enums";

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
          <Clock className="w-3 h-3 mr-1" /> Chờ duyệt
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-300">
          <Check className="w-3 h-3 mr-1" /> Hãng đã duyệt
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-800 border border-red-300">
          <X className="w-3 h-3 mr-1" /> Hãng từ chối
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
          <RefreshCw className="w-3 h-3 mr-1" /> Giao một phần
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <X className="w-3 h-3 mr-1" /> Không xác định
        </Badge>
      );
  }
};

export default function DealerRequestDetail() {
  const { requestCode } = useParams();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useGetDealerRequestsQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  // --- Map variant_id -> thông tin xe ---
  const variantMap = useMemo(() => {
    const map = new Map<number, any>();
    vehicles.forEach((v) => {
      v.variants.forEach((variant) => {
        map.set(variant.variant_id, {
          model_name: v.model_name,
          version: variant.version,
          color: variant.color,
          retail_price: variant.retail_price,
        });
      });
    });
    return map;
  }, [vehicles]);

  // --- Gắn thông tin xe ---
  const enrichedRequests = useMemo(() => {
    return requests.map((r: any) => ({
      ...r,
      variant: variantMap.get(r.variant_id),
    }));
  }, [requests, variantMap]);

  const items = useMemo(
    () =>
      enrichedRequests.filter((r: DealerVehicleRequest) => {
        const rc =
          (r as any).request_code ??
          (r as any).request_id ??
          "";
        return rc == requestCode || (r as any).request_id == requestCode;
      }),
    [enrichedRequests, requestCode]
  );

  const first = items[0];
  const displayCode =
    (first &&
      ((first as any).request_code ?? (first as any).request_id)) ||
    requestCode;

  const totalValue = items.reduce(
    (sum, i) =>
      sum + ((i as any).variant?.retail_price ?? 0) * i.requested_quantity,
    0
  );
  const totalQuantity = items.reduce(
    (sum, i) => sum + i.requested_quantity,
    0
  );

  if (isLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">
          Đang tải thông tin yêu cầu...
        </p>
      </div>
    );

  if (!first)
    return (
      <div className="p-8 text-center text-gray-600">
        <p>
          Không tìm thấy yêu cầu với mã <b>{requestCode}</b>.
        </p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>
    );

  const formatPrice = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="flex items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Hash className="h-6 w-6 text-gray-500 mr-2" />
              Chi tiết yêu cầu #{displayCode}
            </CardTitle>
            <p className="text-gray-500 mt-1">
              Ngày tạo:{" "}
              {new Date(
                ((first as any).created_at ??
                  (first as any).request_date) ?? ""
              ).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
          </Button>
        </CardHeader>

        <CardContent className="mt-4">
          {/* --- Thông tin chung --- */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Building2 className="text-blue-500 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Đại lý</p>
                <p className="font-semibold">
                  {(first as any).dealer?.name ?? "Chưa xác định"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="text-yellow-500 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div>{getStatusBadge((first as any).status)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="text-green-500 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Tổng giá trị</p>
                <p className="font-semibold text-green-700 text-lg">
                  {formatPrice(totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* --- Bảng chi tiết --- */}
          <Table className="min-w-full border">
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">#</TableHead>
                <TableHead className="font-bold">Mẫu xe</TableHead>
                <TableHead className="font-bold">Phiên bản</TableHead>
                <TableHead className="font-bold">Màu sắc</TableHead>
                <TableHead className="font-bold text-center">
                  Số lượng
                </TableHead>
                <TableHead className="font-bold text-right">
                  Đơn giá
                </TableHead>
                <TableHead className="font-bold text-right">
                  Thành tiền
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const v = (item as any).variant ?? {};
                const price = v.retail_price ?? 0;
                const subtotal = price * item.requested_quantity;
                return (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{v.model_name ?? "Không rõ"}</TableCell>
                    <TableCell>{v.version ?? "N/A"}</TableCell>
                    <TableCell>{v.color ?? "N/A"}</TableCell>
                    <TableCell className="text-center">
                      {item.requested_quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(price)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(subtotal)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50">
                <TableCell colSpan={5}></TableCell>
                <TableCell className="text-right font-bold">
                  Tổng cộng
                </TableCell>
                <TableCell className="text-right font-bold text-blue-600">
                  {formatPrice(totalValue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
