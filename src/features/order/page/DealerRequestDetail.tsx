import { useNavigate } from "react-router-dom";
import { useGetDealerRequestsQuery } from "@/features/order/api";
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
import { Eye } from "lucide-react"; // Icon (tùy chọn)

export default function ManufacturerDealerRequestList() {
  const navigate = useNavigate();

  // ✅ Lấy danh sách TẤT CẢ yêu cầu
  const { data: requests = [], isLoading } = useGetDealerRequestsQuery();

  const handleViewDetail = (id: string | number) => {
    // Điều hướng đến trang chi tiết của bạn
    navigate(`/manufacturer/dealer-requests/${id}`);
  };

  if (isLoading) {
    return <div className="p-6 text-gray-600">Đang tải danh sách...</div>;
  }

  if (requests.length === 0) {
    return <div className="p-6 text-gray-600">Không có yêu cầu nào.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Danh sách yêu cầu từ đại lý</h2>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Yêu Cầu</TableHead>
                <TableHead>Mã Đại Lý</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead>Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell className="font-medium">
                    #{request.request_id}
                  </TableCell>
                  <TableCell>{request.dealer_id}</TableCell>
                  <TableCell>{request.requested_quantity}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at ?? "").toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(request.request_id)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> {/* Icon tùy chọn */}
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}