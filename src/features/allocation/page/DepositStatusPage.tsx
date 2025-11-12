import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function DepositStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"success" | "failed" | "error" | null>(null);
  const [txnRef, setTxnRef] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("status");
    const txn = params.get("txnRef");
    if (s === "success" || s === "failed" || s === "error") {
      setStatus(s);
      setTxnRef(txn);
    } else {
      setStatus("error");
    }
  }, [location.search]);

  const renderMessage = () => {
    if (status === "success") return `✅ Thanh toán thành công! (TxnRef: ${txnRef})`;
    if (status === "failed") return `❌ Thanh toán thất bại! (TxnRef: ${txnRef})`;
    return "⚠️ Có lỗi xảy ra trong quá trình thanh toán.";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg rounded-lg border border-gray-200">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg py-4 px-6">
          <div className="flex items-center gap-3">
            {status === "success" ? (
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            ) : (
              <AlertCircle className="h-7 w-7 text-red-500" />
            )}
            <div>
              <CardTitle className="text-2xl font-bold">Kết quả Thanh toán</CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                {renderMessage()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Có thể hiển thị thêm thông tin VNPay nếu muốn */}
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <Button
            onClick={() => navigate("/dealer/manager/deposit-list")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all duration-200"
          >
            Quay lại danh sách cọc
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
