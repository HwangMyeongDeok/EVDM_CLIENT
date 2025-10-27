import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPaymentInfo } from "../api";
import type { PaymentInfo } from "../types";

export default function OrderPaymentPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      try {
        const data = await getPaymentInfo(id);
        setPayment(data);
      } catch (error) {
        toast.error("Không thể tải thông tin thanh toán");
      }
    };

    fetchPayment();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!payment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p>Đang tải thông tin thanh toán...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thanh toán đơn hàng</h1>
        <p className="text-muted-foreground">
          Vui lòng hoàn tất thanh toán để tiếp tục quy trình đặt hàng
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                <p className="font-medium">{payment.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người nhận hàng</p>
                <p className="font-medium">{payment.recipient}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ nhận hàng</p>
                <p className="font-medium">{payment.deliveryAddress}</p>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin chuyển khoản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyển khoản</CardTitle>
              <CardDescription>
                Vui lòng chuyển khoản theo thông tin bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Ngân hàng</p>
                <p className="font-medium">{payment.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số tài khoản</p>
                <p className="font-medium">{payment.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tên tài khoản</p>
                <p className="font-medium">{payment.accountName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Số tiền cần thanh toán</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Nội dung chuyển khoản
                </p>
                <p className="font-medium">{payment.orderId}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>Quét mã QR để thanh toán</CardTitle>
            <CardDescription>
              Sử dụng ứng dụng Mobile Banking để quét mã
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="w-72 h-72 bg-muted flex items-center justify-center">
              <img
                src={payment.qrCodeUrl}
                alt="QR Code thanh toán"
                className="max-w-full max-h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}