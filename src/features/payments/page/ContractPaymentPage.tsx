import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import instance from "@/lib/axios";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function ContractPaymentPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [contract, setContract] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Lấy thông tin hợp đồng
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await instance.get(`/contracts/${contractId}`);
        const data = res.data.data;
        setContract(data);
        setAmount(data?.deposit_amount || 0); // hoặc remaining_amount nếu backend dùng trường này
      } catch {
        toast.error("Lỗi tải thông tin hợp đồng");
      }
    };
    fetchContract();
  }, [contractId]);

  // Xử lý redirect từ VNPAY
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    const responseCode = queryParams.get("responseCode");
    const txnRef = queryParams.get("txnRef");

    if (status) {
      if (status === "success" && responseCode === "00") {
        setPaymentStatus(`✅ Thanh toán thành công cho giao dịch ${txnRef}`);
        toast.success("Thanh toán thành công!");
        setTimeout(() => navigate("/contracts"), 2500);
      } else {
        setPaymentStatus("❌ Thanh toán thất bại. Vui lòng thử lại.");
        toast.error("Thanh toán thất bại");
      }
    }
  }, [location.search, navigate]);

  const handlePayment = async () => {
    if (amount <= 0) return toast.error("Số tiền không hợp lệ.");
    setPaymentLoading(true);
    try {
      const res = await instance.post("/payments/create", {
        contract_id: Number(contractId), // Ép kiểu số
        amount,
        payment_method: "CREDIT_CARD", // backend enum hợp lệ
      });

      const paymentUrl = res.data?.data?.paymentUrl; // backend bọc trong data
      if (paymentUrl) {
        toast.success("Đang chuyển đến cổng thanh toán VNPAY...");
        window.location.href = paymentUrl;
      } else {
        toast.error("Không thể tạo giao dịch thanh toán");
      }
    } catch (err) {
      toast.error("Lỗi khi tạo thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl rounded-xl border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl pb-6">
          <CardTitle className="text-2xl font-bold">
            Thanh toán hợp đồng #{contractId}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Hiển thị trạng thái thanh toán */}
          {paymentStatus && (
            <div className="mb-6 border rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-3">
                {paymentStatus.includes("thành công") ? (
                  <CheckCircle2 className="text-green-600 h-6 w-6" />
                ) : (
                  <AlertCircle className="text-red-600 h-6 w-6" />
                )}
                <p
                  className={`font-medium ${
                    paymentStatus.includes("thành công")
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {paymentStatus}
                </p>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="ml-auto text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Thông tin hợp đồng */}
          {contract && (
            <div className="mb-6 space-y-2 text-sm bg-slate-50 p-4 rounded-lg border">
              <p>
                <span className="font-semibold">Khách hàng:</span>{" "}
                {contract.customer_name}
              </p>
              <p>
                <span className="font-semibold">Xe:</span>{" "}
                {contract.vehicle_name}
              </p>
              <p>
                <span className="font-semibold">Số tiền cần thanh toán:</span>{" "}
                {amount.toLocaleString()} ₫
              </p>
            </div>
          )}

          {/* Input tiền (chỉ xem, không sửa) */}
          <div className="mb-4">
            <Label>Số tiền thanh toán</Label>
            <Input
              type="number"
              value={amount}
              readOnly
              className="border-slate-300 bg-slate-100 text-slate-700"
            />
          </div>

          {/* Nút thanh toán */}
          <Button
            onClick={handlePayment}
            disabled={paymentLoading || amount <= 0}
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paymentLoading ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}