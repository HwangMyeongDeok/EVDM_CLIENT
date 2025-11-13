import { useState } from "react";
import instance from "@/lib/axios";
import { Button } from "@/components/ui/button";

type Props = {
  requestId: number;
  amount: number;                // VND: cọc 50% hoặc phần còn lại
  mode: "DEPOSIT" | "BALANCE";   // phân biệt luồng
};

export default function DepositPaymentButton({ requestId, amount, mode }: Props) {
  const [loading, setLoading] = useState(false);

  const onPay = async () => {
    setLoading(true);
    try {
      // Lưu context để trang return biết đang thanh toán gì
      sessionStorage.setItem(
        "dms:postAcceptCtx",
        JSON.stringify({ requestId, mode })
      );

      // Tạo giao dịch
      const res = await instance.post("/payments/deposit", {
        request_id: requestId,
        amount: Math.round(amount),       // BE đã *100 khi ký cho VNPAY
        payment_method: "CREDIT_CARD",
      });

      const paymentUrl: string | undefined = res?.data?.data?.paymentUrl;
      if (!paymentUrl) throw new Error("No paymentUrl from server");

      // Sang cổng thanh toán
      window.location.href = paymentUrl;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Button onClick={onPay} disabled={loading}>
      {loading
        ? "Đang chuyển đến cổng thanh toán..."
        : mode === "DEPOSIT"
        ? "Thanh toán cọc 50%"
        : "Thanh toán phần còn lại"}
    </Button>
  );
}
