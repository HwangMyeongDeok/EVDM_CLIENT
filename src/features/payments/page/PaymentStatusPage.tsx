import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IPayment } from "@/types/payment";
import instance from "@/lib/axios";


const VN_PAY_MESSAGE_MAP: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Trespassing cấp duyệt thanh toán",
  "09": "Giao dịch không tìm thấy trên hệ thống VNPAY",
  "10": "Khách hàng hủy giao dịch",
  "11": "Thanh toán bị hủy do hết hạn chờ",
  "12": "Lỗi: Thẻ/Tài khoản bị khóa",
  "13": "Sai mật khẩu thanh toán quá số lần quy định",
  "24": "Giao dịch bị hủy bởi người dùng",
  "51": "Tài khoản không đủ tiền",
  "65": "Tài khoản vượt quá hạn mức giao dịch",
  "75": "Ngân hàng từ chối giao dịch",
  "79": "KH nhập sai OTP quá số lần quy định",
  "99": "Lỗi hệ thống. Vui lòng thử lại sau",
};

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const txnRef = searchParams.get("txnRef") || "N/A";
  const responseCode = searchParams.get("responseCode") || "99";

  const isSuccess = responseCode === "00";
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txnRef || txnRef === "N/A") {
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/payments/${txnRef}`);
        if (!res.data) throw new Error("Failed to fetch payment");
        const data = res.data.data;
        console.log("object",data);
        setPayment(data);
      } catch (err) {
        console.error(err);
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [txnRef]);

  const errorMessage =
    VN_PAY_MESSAGE_MAP[responseCode] || "Giao dịch không thành công. Vui lòng thử lại.";

  const formatAmount = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <p className="text-gray-600 animate-pulse">Đang tải thông tin giao dịch...</p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-md backdrop-blur-md bg-white/80 shadow-2xl rounded-3xl border border-white/30">
        <CardHeader className="flex flex-col items-center py-8 border-b border-gray-200/50">
          <div className="mb-4">
            {isSuccess ? (
              <div className="animate-bounce">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="animate-pulse">
                <XCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <h1
            className={`text-2xl font-bold text-center ${isSuccess
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent"
                : "text-red-600"
              }`}
          >
            {isSuccess ? "✓ Thanh toán thành công!" : "✕ Thanh toán thất bại"}
          </h1>

          <p className="text-gray-600 text-sm mt-2 text-center">
            {isSuccess ? "Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn!" : errorMessage}
          </p>

          {isSuccess && (
            <p className="text-xs text-emerald-600 mt-1 italic">
              💌 Vui lòng kiểm tra email xác nhận thanh toán.
            </p>
          )}
        </CardHeader>

        <CardContent className="py-6 space-y-4">
          {payment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">Mã giao dịch:</span>
                <span className="text-sm font-semibold text-gray-900 font-mono">
                  {payment.transaction_id || txnRef}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">Số tiền:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatAmount(payment.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">Phương thức:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {payment.payment_method === "BANK_TRANSFER"
                    ? "Chuyển khoản"
                    : payment.payment_method === "CASH"
                      ? "Tiền mặt"
                      : "Thẻ tín dụng"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">Loại thanh toán:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {payment.payment_type || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">Thời gian:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(payment.payment_date).toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  {isSuccess ? "✓ Đã ghi nhận vào hệ thống DMS" : "⚠ Chưa xử lý giao dịch"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">Không tìm thấy thông tin giao dịch</div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-6 pt-2">
          <Button
            onClick={() => {
              window.location.href = isSuccess ? "/" : "/payment";
            }}
            className={`w-full max-w-xs py-6 text-base font-semibold rounded-lg transition-all duration-200 hover:shadow-lg ${isSuccess
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
              }`}
          >
            {isSuccess ? "← Quay về trang chủ" : "🔄 Thử lại thanh toán"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
