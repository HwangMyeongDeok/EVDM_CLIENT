import { useState } from "react";
import { Button } from "@/components/ui/button";
import instance from "@/lib/axios";
import { toast } from "sonner";

interface DepositPaymentButtonProps {
    requestId: number;
    depositAmount: number;
}

const DepositPaymentButton: React.FC<DepositPaymentButtonProps> = ({ requestId, depositAmount }) => {
    const [loading, setLoading] = useState(false);

    const handleDepositPayment = async () => {
        setLoading(true);
        try {
            const res = await instance.post("/payments/deposit", {
                request_id: requestId,
                amount: depositAmount,
                payment_method: "CREDIT_CARD",
                returnUrl: `localhost:5173/dealer/manager/deposit-status`
            });

            const paymentUrl = res.data?.data?.paymentUrl;
            if (paymentUrl) {
                toast.success("Chuyển tới cổng thanh toán VNPay...");
                window.location.href = paymentUrl;
            } else {
                toast.error("Không thể tạo giao dịch thanh toán cọc");
            }
        } catch (err) {
            toast.error("Lỗi khi tạo thanh toán cọc");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDepositPayment}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
            {loading ? "Đang xử lý..." : `Thanh toán cọc 50% (${depositAmount.toLocaleString('vi-VN')} VNĐ)`}
        </Button>
    );
};

export default DepositPaymentButton;
