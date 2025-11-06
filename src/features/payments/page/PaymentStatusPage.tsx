
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const txnRef = searchParams.get("txnRef");
  const responseCode = searchParams.get("responseCode");

  const isSuccess = responseCode === "00";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="text-green-500" />
                Thanh toán thành công
              </>
            ) : (
              <>
                <XCircle className="text-red-500" />
                Thanh toán thất bại
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Mã giao dịch:</strong> {txnRef}</p>
            <p><strong>Mã phản hồi:</strong> {responseCode}</p>
            {isSuccess ? (
              <p className="text-green-600">Giao dịch đã được xử lý thành công.</p>
            ) : (
              <p className="text-red-600">Giao dịch không thành công. Vui lòng thử lại.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}