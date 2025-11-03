import { useParams, useNavigate } from "react-router-dom";
import {
  useGetDealerRequestsQuery,
  useUpdateDealerRequestStatusMutation,
} from "@/features/order/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useEffect } from "react";

export default function ManufacturerDealerRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Lấy danh sách yêu cầu đại lý
  const { data: requests = [], isLoading } = useGetDealerRequestsQuery();

  // ✅ Mutation cập nhật trạng thái
  const [updateStatus, { isLoading: isUpdating, isSuccess }] =
    useUpdateDealerRequestStatusMutation();

  const request = requests.find((r) => String(r.request_id) === id);

  useEffect(() => {
    if (isSuccess) {
      alert("✅ Cập nhật trạng thái thành công!");
      navigate("/evm/staff/orders");
    }
  }, [isSuccess]);

  if (isLoading)
    return <div className="p-6 text-gray-600">Đang tải dữ liệu...</div>;

  if (!request)
    return <div className="p-6 text-gray-600">Không tìm thấy yêu cầu.</div>;

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id: String(request.request_id), status: newStatus });
    } catch (error) {
      console.error(error);
      alert("❌ Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        Chi tiết yêu cầu #{request.request_id}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Mã yêu cầu:</p>
            <p className="font-medium">{request.request_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Mã đại lý:</p>
            <p className="font-medium">{request.dealer_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Phiên bản xe:</p>
            <p className="font-medium">{request.variant_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Số lượng:</p>
            <p className="font-medium">{request.requested_quantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Trạng thái:</p>
            <Badge
              className={
                request.status === "PENDING"
                  ? "bg-yellow-500"
                  : request.status === "APPROVED"
                  ? "bg-green-600"
                  : request.status === "REJECTED"
                  ? "bg-red-600"
                  : "bg-blue-500"
              }
            >
              {request.status}
            </Badge>
          </div>
          <div>
            <p className="text-gray-500">Ngày tạo:</p>
            <p>{new Date(request.created_at ?? "").toLocaleString("vi-VN")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết (nếu cần mở rộng sau) */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên bản</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{request.variant_id}</TableCell>
                <TableCell>{request.requested_quantity}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        {request.status === "PENDING" && (
          <>
            <Button
              onClick={() => handleUpdateStatus("REJECTED")}
              variant="destructive"
              disabled={isUpdating}
            >
              Từ chối
            </Button>
            <Button
              onClick={() => handleUpdateStatus("APPROVED")}
              className="bg-green-600 hover:bg-green-700"
              disabled={isUpdating}
            >
              Phê duyệt
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
