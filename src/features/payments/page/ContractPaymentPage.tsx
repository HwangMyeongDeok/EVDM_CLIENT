import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import instance from "@/lib/axios";

export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CREDIT_CARD";

export default function PaymentTestPage() {
  const { contractId: paramId } = useParams<{ contractId: string }>();
  const contractId = paramId ?? "1"; // fallback fake id
  const [amount, setAmount] = useState<number>(1000000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handlePayment = async () => {
    if (amount <= 0) {
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    try {
      setSubmitting(true);

      // Gọi backend tạo payment
      const res = await instance.post("/payments/create", {
        contract_id: contractId,
        amount,
        payment_method: paymentMethod,
        payment_context: "CUSTOMER",
      });

      toast.success("Payment created!");

      // Lấy paymentUrl từ backend
      const paymentUrl = res.data?.data?.paymentUrl;

      // Nếu là CREDIT_CARD, redirect trình duyệt
      if (paymentMethod === "CREDIT_CARD" && paymentUrl) {
        window.location.href = paymentUrl; // **chuẩn, không bị CORS**
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý return từ VNPAY
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const responseCode = query.get("vnp_ResponseCode");
    const txnRef = query.get("vnp_TxnRef");

    if (responseCode) {
      if (responseCode === "00") {
        setPaymentStatus(`Thanh toán thành công cho hợp đồng ${txnRef}`);
        toast.success(`Thanh toán VNPAY thành công cho hợp đồng ${txnRef}`);
        // navigate(`/dealer/staff/payments/${contractId}`); // tuỳ chọn
      } else {
        setPaymentStatus("Thanh toán VNPAY thất bại. Vui lòng thử lại.");
        toast.error("Thanh toán VNPAY thất bại!");
      }
    }
  }, [location.search, contractId]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Payment Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus && (
            <div className="p-4 bg-gray-100 rounded mb-4">
              <p
                className={
                  paymentStatus.includes("thành công")
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {paymentStatus}
              </p>
              <Button
                onClick={() => setPaymentStatus(null)}
                className="mt-2 w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                Đóng
              </Button>
            </div>
          )}

          <div>
            <Label>Số tiền</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Phương thức</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handlePayment}
            disabled={submitting}
            className="w-full mt-4"
          >
            {submitting ? "Đang xử lý..." : "Thanh toán"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
