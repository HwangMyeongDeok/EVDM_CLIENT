import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import instance from "@/lib/axios";
import { toast } from "sonner";

export default function ContractPaymentPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await instance.get(`/contracts/${contractId}`);
        const remaining = res.data?.remaining_amount || 0;
        setAmount(remaining);
      } catch {
        toast.error("Lỗi tải hợp đồng");
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
        setPaymentStatus(`Thanh toán thành công cho giao dịch ${txnRef}`);
        toast.success("Thanh toán thành công!");
        setAmount(0);
        setTimeout(() => navigate("/contracts"), 3000);
      } else {
        setPaymentStatus("Thanh toán thất bại. Vui lòng thử lại.");
        toast.error("Thanh toán thất bại");
      }
    }
  }, [location.search, navigate]);

  const handlePayment = async () => {
    if (amount <= 0) return toast.error("Số tiền không hợp lệ.");
    setLoading(true);
    try {
      const res = await instance.post("/payments/create", {
        contract_id: Number(contractId),
        amount,
        payment_method: "CREDIT_CARD",
      });

      const paymentUrl = res.data?.data?.paymentUrl;
      if (paymentUrl) window.location.href = paymentUrl;
    } catch {
      toast.error("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Thanh toán hợp đồng #{contractId}</CardTitle>
      </CardHeader>
      <CardContent>
        {paymentStatus && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className={paymentStatus.includes("thành công") ? "text-green-600" : "text-red-600"}>
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
        <div className="mb-4">
          <Label>Số tiền thanh toán</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1} 
            disabled={loading} 
          />
        </div>
        <Button onClick={handlePayment} disabled={loading || amount <= 0}>
          {loading ? "Đang xử lý..." : "Thanh toán VNPAY"}
        </Button>
      </CardContent>
    </Card>
  );
}