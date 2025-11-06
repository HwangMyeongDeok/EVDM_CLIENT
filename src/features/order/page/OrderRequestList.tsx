import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetDealerRequestsQuery } from "@/features/order/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api"; // 💡 Thêm import này
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  Check,
  X,
  Search,
  Box,
  PackageCheck,
  Truck,
  DollarSign,
  SearchX,
} from "lucide-react";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";
import type { RequestStatus } from "@/types/enums";

// --- Hàm hiển thị trạng thái ---
const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" /> Chờ Duyệt
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="w-3 h-3 mr-1" /> Đã Duyệt
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Truck className="w-3 h-3 mr-1" /> Đang Giao Hàng
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="w-3 h-3 mr-1" /> Từ Chối
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" /> Không xác định
        </Badge>
      );
  }
};

export default function DealerRequestList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --- Lấy dữ liệu ---
  const { data: flatRequests = [], isLoading, isFetching } = useGetDealerRequestsQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  // --- Map variant_id → thông tin xe ---
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

  // --- Gắn thêm variant info vào từng request ---
  const enrichedRequests = useMemo(() => {
    return flatRequests.map((r) => ({
      ...r,
      variant: variantMap.get(r.variant_id),
    }));
  }, [flatRequests, variantMap]);

  // --- Thống kê ---
  const summaryStats = useMemo(() => {
    return enrichedRequests.reduce(
      (acc, req) => {
        const price = req.variant?.retail_price ?? 0;
        const value = price * (req.requested_quantity ?? 0);

        if (req.status !== "REJECTED") acc.totalValue += value;
        if (req.status === "PENDING") acc.pendingCount++;
        if (req.status === "APPROVED") acc.approvedCount++;
        if (req.status === "PARTIAL") acc.shippingCount++;

        return acc;
      },
      { totalValue: 0, pendingCount: 0, approvedCount: 0, shippingCount: 0 }
    );
  }, [enrichedRequests]);

  // --- Lọc & tìm kiếm ---
  const filteredRequests = useMemo(() => {
    return enrichedRequests
      .filter((req) => {
        if (statusFilter === "ALL") return true;
        return req.status === statusFilter;
      })
      .filter((req) => {
        if (!searchTerm) return true;
        const code = String((req as any).request_code ?? req.request_id ?? "");
        const dealerName = String((req as any).dealer?.name ?? req.dealer_id ?? "");
        const variantName = String(req.variant?.model_name ?? "");
        const term = searchTerm.toLowerCase();
        return (
          code.toLowerCase().includes(term) ||
          dealerName.toLowerCase().includes(term) ||
          variantName.toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) => {
          const aCode = (a as any).request_code ?? a.request_id ?? 0;
          const bCode = (b as any).request_code ?? b.request_id ?? 0;
          return aCode - bCode; // Sắp xếp từ thấp đến cao (ascending)
        }
      );
  }, [enrichedRequests, searchTerm, statusFilter]);

  const formatPrice = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // --- Loading ---
  if (isLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải danh sách...</p>
      </div>
    );

  // --- Render ---
  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"> {/* Thêm bg để thoáng */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Quản Lý Đơn Hàng Đặt Xe</h1>
          <p className="text-gray-500 mt-1">Quản lý đơn hàng đại lý đặt lên hãng</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0"
          onClick={() => navigate("/dealer/manager/purchase-orders/new")}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Tạo yêu cầu mới
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo mã đơn, đại lý, mẫu xe..."
            className="pl-9 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] border-gray-300">
            <SelectValue placeholder="Tất Cả Trạng Thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="PENDING">Chờ Duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã Duyệt</SelectItem>
            <SelectItem value="PARTIAL">Đang Giao Hàng</SelectItem>
            <SelectItem value="REJECTED">Từ Chối</SelectItem>
          </SelectContent>
        </Select>
        {isFetching && (
          <div className="text-gray-500 flex items-center mt-4 md:mt-0 md:ml-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Đang làm mới...
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-md border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Chờ Duyệt</CardTitle>
            <Box className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Đã Duyệt</CardTitle>
            <PackageCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.approvedCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Đang Giao</CardTitle>
            <Truck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.shippingCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Tổng Giá Trị</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(summaryStats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto"> {/* Thêm responsive */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg flex flex-col items-center">
                <SearchX className="h-12 w-12 text-gray-400 mb-4" /> {/* Thêm icon */}
                <p className="text-lg font-medium text-gray-500">Không tìm thấy đơn hàng nào.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Mã Đơn</TableHead>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Đại Lý</TableHead>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Mẫu Xe</TableHead>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Ngày Tạo</TableHead>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Giờ Tạo</TableHead>
                    <TableHead className="text-center font-bold text-gray-700 px-6 py-3">Số Lượng</TableHead>
                    <TableHead className="text-right font-bold text-gray-700 px-6 py-3">Tổng Giá Trị</TableHead>
                    <TableHead className="font-bold text-gray-700 px-6 py-3">Trạng Thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {filteredRequests.map((req) => {
                    const price = req.variant?.retail_price ?? 0;
                    const lineValue = price * (req.requested_quantity ?? 0);
                    const reqCode = (req as any).request_code ?? req.request_id;
                    const reqDate = (req as any).created_at ?? new Date();

                    return (
                      <TableRow key={req.request_id} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell className="font-medium text-blue-600 px-6 py-4">
                          {reqCode}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {(req as any).dealer?.name ?? req.dealer_id ?? "N/A"} {/* Ưu tiên tên nếu có */}
                        </TableCell>

                        <TableCell className="font-medium px-6 py-4">
                          {req.variant?.model_name ?? "N/A"}
                          <div className="text-xs text-gray-400">
                            {req.variant?.version} – {req.variant?.color}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600">
                          {new Date(reqDate).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600">
                          {new Date(reqDate).toLocaleTimeString("vi-VN")}
                        </TableCell>

                        <TableCell className="text-center px-6 py-4">
                          {req.requested_quantity} xe
                        </TableCell>

                        <TableCell className="text-right font-semibold px-6 py-4">
                          {formatPrice(lineValue)}
                        </TableCell>

                        <TableCell className="px-6 py-4">{getStatusBadge(req.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}