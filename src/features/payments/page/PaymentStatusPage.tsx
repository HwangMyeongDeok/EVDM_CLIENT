import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const txnRef = searchParams.get("txnRef");
  const responseCode = searchParams.get("responseCode");

  const isSuccess = responseCode === "00";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-md w-full shadow-xl rounded-xl overflow-hidden">
        <CardHeader className={`text-center py-6 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <CheckCircle className="text-green-500 w-16 h-16 animate-bounce" />
            ) : (
              <XCircle className="text-red-500 w-16 h-16 animate-pulse" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-semibold">Mã giao dịch:</div>
            <div>{txnRef || "N/A"}</div>
            <div className="font-semibold">Mã phản hồi:</div>
            <div>{responseCode || "N/A"}</div>
          </div>
          {isSuccess ? (
            <p className="text-green-600 text-center font-medium">Giao dịch đã được xử lý thành công. Cảm ơn bạn!</p>
          ) : (
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p>Giao dịch không thành công. Vui lòng kiểm tra thông tin và thử lại.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button 
            variant={isSuccess ? "default" : "destructive"} 
            onClick={() => window.location.href = "/"} // Hoặc redirect đến trang chính
          >
            {isSuccess ? "Quay về trang chủ" : "Thử lại thanh toán"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}