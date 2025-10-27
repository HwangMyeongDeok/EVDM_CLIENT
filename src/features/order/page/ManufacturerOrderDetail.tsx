import { useParams, useNavigate } from "react-router-dom";
import { useGetOrdersQuery } from "@/features/order/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState } from "react";
import axios from "axios";

export default function ManufacturerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orders = [] } = useGetOrdersQuery();

  const order = orders.find((o) => o.request_id === id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) {
    return <div className="p-6 text-gray-600">Không tìm thấy đơn hàng.</div>;
  }

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    try {
      setIsSubmitting(true);
      await axios.patch(`/orders/${order.request_id}`, { status: newStatus });
      alert(
        newStatus === "APPROVED"
          ? "✅ Đã phê duyệt đơn hàng."
          : "❌ Đã từ chối đơn hàng."
      );
      navigate("/manufacturer/orders");
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        Chi tiết đơn hàng #{order.request_id}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Mã đơn hàng:</p>
            <p className="font-medium">{order.request_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Đại lý:</p>
            <p className="font-medium">{order.dealer_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Phiên bản xe:</p>
            <p className="font-medium">{order.variant_id}</p>
          </div>
          <div>
            <p className="text-gray-500">Số lượng:</p>
            <p className="font-medium">{order.requested_quantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Trạng thái:</p>
            <Badge
              className={
                order.status === "PENDING"
                  ? "bg-yellow-500"
                  : order.status === "APPROVED"
                  ? "bg-green-600"
                  : order.status === "REJECTED"
                  ? "bg-red-600"
                  : "bg-blue-500"
              }
            >
              {order.status}
            </Badge>
          </div>
          <div>
            <p className="text-gray-500">Ngày tạo:</p>
            <p>{new Date(order.created_at ?? "").toLocaleString("vi-VN")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin chi tiết xe — nếu sau này mở rộng */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
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
                <TableCell>{order.variant_id}</TableCell>
                <TableCell>{order.requested_quantity}</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        {order.status === "PENDING" && (
          <>
            <Button
              onClick={() => handleUpdateStatus("REJECTED")}
              variant="destructive"
              disabled={isSubmitting}
            >
              Từ chối
            </Button>
            <Button
              onClick={() => handleUpdateStatus("APPROVED")}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              Phê duyệt
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
