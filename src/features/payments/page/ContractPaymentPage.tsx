import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, CheckCircle2, AlertCircle, X } from "lucide-react";
import instance from "@/lib/axios";
import { toast } from "sonner";
import type { IContract } from "@/types/contract";

export default function ContractPaymentPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [contract, setContract] = useState<IContract>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<string>("Đặt cọc");
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await instance.get(`/contracts/${contractId}`);
        const data = res.data.data;
        setContract(data);
        setAmount(data?.deposit_amount || 0);
        setPaymentType(data?.payment_plan === "DEPOSIT" ? "Đặt cọc" : "Thanh toán toàn bộ");
      } catch {
        toast.error("Lỗi tải thông tin hợp đồng");
      }
    };
    fetchContract();
  }, [contractId]);

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
        contract_id: Number(contractId),
        amount,
        payment_method: paymentMethod, 
      });

      const paymentUrl = res.data?.data?.paymentUrl;
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
    <div className="flex items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-lg border border-gray-200">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg py-4 px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7" />
            <div>
              <CardTitle className="text-2xl font-bold">Xác nhận Thanh toán</CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Vui lòng kiểm tra thông tin hợp đồng và số tiền trước khi thanh toán qua VNPay.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Hiển thị trạng thái thanh toán */}
          {paymentStatus && (
            <div className="mb-4 border rounded-md p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                {paymentStatus.includes("thành công") ? (
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
                ) : (
                  <AlertCircle className="text-red-500 h-5 w-5" />
                )}
                <p
                  className={`font-medium text-sm ${
                    paymentStatus.includes("thành công")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {paymentStatus}
                </p>
                <button
                  onClick={() => setPaymentStatus(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {contract && (
            <div className="flex flex-col space-y-3">
              <div>
                <h3 className="text-lg font-semibold mb-2">Thông tin Hợp đồng</h3>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hợp đồng:</span>
                    <span className="font-medium">{contract.contract_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">{contract.customer.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nội dung:</span>
                    <span className="font-medium">{contract.quotation.notes}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Chi tiết Thanh toán</h3>
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
                  <span className="text-gray-600">Loại thanh toán</span>
                  <span className="font-medium text-right">{paymentType}</span>
                  <span className="text-gray-600">Tổng số tiền</span>
                  <span className="text-2xl font-bold text-blue-600 text-right">{amount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div>
                <Label htmlFor="payment-method" className="text-sm font-medium block mb-2">
                  Phương thức Thanh toán (VNPay)
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Ứng dụng Ngân hàng / Quét mã QR</SelectItem>
                    <SelectItem value="CREDIT_CARD">Thẻ Quốc tế (Visa, Master, JCB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <Button
            onClick={handlePayment}
            disabled={paymentLoading || amount <= 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
              alt="VNPay"
              className="mr-2 h-6 w-auto"
            />
            {paymentLoading ? "Đang xử lý..." : "Tiến hành Thanh toán VNPay"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}