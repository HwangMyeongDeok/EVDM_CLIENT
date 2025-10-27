import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDealerOrder, updateOrderStatus } from "../api";
import type { DealerOrder } from "../types";

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<DealerOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      try {
        const data = await getDealerOrder(id);
        setOrder(data);
      } catch (error: any) {
        toast.error("Không thể tải thông tin đơn hàng: " + (error.message || "Lỗi không xác định"));
      }
    };

    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!id || !order) return;
    
    setLoading(true);
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrder(updatedOrder);
      
      if (status === "APPROVED") {
        navigate(`/dealer/manager/orders/${id}/payment`);
      } else {
        toast.success("Đã từ chối đơn hàng");
      }
    } catch (error: any) {
      toast.error("Không thể cập nhật trạng thái đơn hàng: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p>Đang tải thông tin đơn hàng...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
        <p className="text-muted-foreground">
          Xem xét và phê duyệt đơn hàng từ đại lý
        </p>
      </div>

      {/* Thông tin đơn hàng */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
            <p className="font-medium">{order.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
            <p className="font-medium">
              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Công ty</p>
            <p className="font-medium">{order.companyName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Số điện thoại</p>
            <p className="font-medium">{order.contactPhone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{order.contactEmail}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Địa chỉ nhận xe</p>
            <p className="font-medium">{order.deliveryAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trạng thái</p>
            <Badge
              variant={
                order.status === "REJECTED"
                  ? "destructive"
                  : order.status === "APPROVED"
                  ? "secondary"
                  : "default"
              }
            >
              {order.status === "PENDING"
                ? "Chờ duyệt"
                : order.status === "APPROVED"
                ? "Đã duyệt"
                : "Từ chối"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách xe */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách xe trong đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên xe</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.vehicleName}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  Tổng giá trị
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lịch giao hàng */}
      <Card>
        <CardHeader>
          <CardTitle>Các đợt giao hàng</CardTitle>
          <CardDescription>
            Kế hoạch giao xe theo từng đợt cho đại lý
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.deliverySchedule.map((batch) => (
            <div key={batch.batchNumber} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Đợt {batch.batchNumber} ({new Date(batch.deliveryDate).toLocaleDateString("vi-VN")})
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên xe</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.vehicleName}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Tổng giá trị đợt {batch.batchNumber}:
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(batch.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nút điều khiển */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => handleUpdateStatus("REJECTED")}
          disabled={loading || order.status !== "PENDING"}
        >
          Từ chối
        </Button>
        <Button
          onClick={() => handleUpdateStatus("APPROVED")}
          disabled={loading || order.status !== "PENDING"}
        >
          Đồng ý
        </Button>
      </div>
    </div>
  );
}