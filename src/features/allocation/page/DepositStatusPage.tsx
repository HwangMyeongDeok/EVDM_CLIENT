import { useEffect, useState } from "react";
import instance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Allocation } from "@/types/dealer_vehicle_allocation";
import { AllocationStatus } from "@/types/dealer_vehicle_allocation";

type ApiListResp<T> = { success: boolean; data: T[] };
type ApiOneResp<T>  = { success: boolean; data: T };

type DealerRequest = {
  request_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paid_amount: number;
  items: Array<{ requested_quantity: number; variant?: { retail_price?: number } }>;
};

type Ctx = { requestId: number; mode?: "DEPOSIT" | "BALANCE" };

// VNPAY success (kể cả sandbox/dev)
const parseVnpaySuccess = (search: string): boolean => {
  const qs = new URLSearchParams(search);
  const vnpOK =
    qs.get("vnp_ResponseCode") === "00" ||
    qs.get("vnp_TransactionStatus") === "00";
  const fallbackOK =
    qs.get("success") === "true" || qs.get("status") === "success";
  return vnpOK || fallbackOK;
};

const calcRequestTotal = (r: DealerRequest) =>
  (r.items || []).reduce(
    (s, it) => s + (it.requested_quantity || 0) * (it.variant?.retail_price || 0),
    0
  );

const getRequest = async (id: number) => {
  const res = await instance.get<ApiOneResp<DealerRequest>>(`/dealer-requests/${id}`);
  return res.data?.data;
};

// Poll helper
const poll = async (fn: () => Promise<boolean>, timeoutMs: number, intervalMs: number) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await fn()) return true;
    } catch {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
};

// Chờ đủ 50%
const waitDepositReached = (requestId: number) =>
  poll(async () => {
    const req = await getRequest(requestId);
    if (!req) return false;
    const total = calcRequestTotal(req);
    return total > 0 && req.paid_amount >= total * 0.5;
  }, 10_000, 800);

// Chờ tất toán (>= 100%)
const waitFullyPaid = (requestId: number) =>
  poll(async () => {
    const req = await getRequest(requestId);
    if (!req) return false;
    const total = calcRequestTotal(req);
    return total > 0 && req.paid_amount >= total;
  }, 10_000, 800);

export default function DepositStatusPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [running, setRunning] = useState(true);
  const [message, setMessage] = useState<string>("Đang xử lý...");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // 0) Kiểm tra kết quả từ VNPay
        if (!parseVnpaySuccess(search)) {
          if (mounted) setMessage("Thanh toán chưa được xác nhận thành công.");
          return;
        }

        // 1) Lấy ngữ cảnh
        const raw = sessionStorage.getItem("dms:postAcceptCtx");
        const ctx: Ctx | null = raw ? JSON.parse(raw) : null;
        if (!ctx?.requestId) {
          if (mounted) setMessage("Thiếu requestId. Vui lòng quay lại danh sách.");
          return;
        }
        const mode = ctx.mode || "DEPOSIT";

        if (mode === "DEPOSIT") {
          // ===== LUỒNG CỌC 50% =====
          const ok = await waitDepositReached(ctx.requestId);
          if (!ok) {
            // vẫn thử approve một lần (phòng GET chậm)
            try { await instance.patch(`/dealer-requests/${ctx.requestId}/accept`); }
            catch {
              if (mounted) setMessage("Đã nhận thanh toán, nhưng hệ thống chưa ghi nhận đủ 50%. Vui lòng mở lại sau ít phút.");
              return;
            }
          }

          // Approve request
          try { await instance.patch(`/dealer-requests/${ctx.requestId}/accept`); } catch {}

          // Đẩy các lô PENDING -> IN_TRANSIT
          try {
            const res = await instance.get<ApiListResp<Allocation>>("/dealer-allocations");
            const all = res.data?.data ?? [];
            const pendingLots = all.filter(
              a => Number(a.request_id) === Number(ctx.requestId) && a.status === AllocationStatus.PENDING
            );
            for (const lot of pendingLots) {
              try { await instance.patch(`/dealer-allocations/${lot.allocation_id}/in-transit`); } catch {}
            }
          } catch {}

          if (mounted) {
            setMessage(`Đã duyệt yêu cầu #${ctx.requestId} và chuyển các lô sang IN_TRANSIT.`);
            toast.success("Cọc 50% thành công, yêu cầu đã APPROVED.");
          }
        } else {
          // ===== LUỒNG THANH TOÁN PHẦN CÒN LẠI =====
          const ok = await waitFullyPaid(ctx.requestId);
          if (!ok) {
            if (mounted) setMessage("Đã nhận thanh toán, nhưng hệ thống chưa ghi nhận tất toán. Vui lòng kiểm tra lại sau ít phút.");
            return;
          }
          if (mounted) {
            setMessage(`Yêu cầu #${ctx.requestId} đã được tất toán.`);
            toast.success("Thanh toán phần còn lại thành công (đã đủ 100%).");
          }
        }
      } finally {
        // Cleanup + bật cờ để trang tracking refetch
        sessionStorage.removeItem("dms:postAcceptCtx");
        sessionStorage.setItem("dms:refreshAllocations", "1");
        setRunning(false);
      }
    };

    void run();
  }, [search, navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader><CardTitle>Kết quả sau thanh toán</CardTitle></CardHeader>
        <CardContent>
          {running ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
            </div>
          ) : (
            <div>{message}</div>
          )}

          <div className="mt-6">
            <Button
              onClick={() =>
                navigate("/dealer/manager/allocations-tracking?after=paid", { replace: true })
              }
            >
              Về trang Theo dõi Lô hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
