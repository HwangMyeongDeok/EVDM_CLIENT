import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { RefreshCw, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import instance from "@/lib/axios";
import { toast } from "sonner";

interface DealerPayment {
  payment_id: number;
  dealer_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
}

export default function DealerPaymentManagementPage() {
  const [payments, setPayments] = useState<DealerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🟢 Lấy danh sách payment từ API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/payments", {
        params: { context: "DEALER" },
      });
      setPayments(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // 🟢 Duyệt / Hoàn tiền (giả lập PATCH)
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Xác nhận chuyển trạng thái sang "${newStatus}"?`)) return;
    try {
      setProcessing(true);
      await instance.patch(`/payments/${id}`, { payment_status: newStatus });
      toast.success(`Đã cập nhật trạng thái sang "${newStatus}"`);
      await fetchPayments();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại!");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            Quản lý Thanh toán Đại lý ({payments.length})
          </CardTitle>
          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead>Đại lý</TableHead>
                  <TableHead>Số tiền (VNĐ)</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Chưa có giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.payment_id}>
                      <TableCell className="font-mono text-sm">
                        #{p.payment_id}
                      </TableCell>
                      <TableCell>{p.dealer_name}</TableCell>
                      <TableCell>{p.amount.toLocaleString("vi-VN")} ₫</TableCell>
                      <TableCell>{p.payment_method}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            p.payment_status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : p.payment_status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(p.payment_date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processing}
                          onClick={() =>
                            handleUpdateStatus(p.payment_id, "COMPLETED")
                          }
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processing}
                          onClick={() =>
                            handleUpdateStatus(p.payment_id, "REFUNDED")
                          }
                        >
                          <RotateCcw className="w-4 h-4 mr-1" /> Hoàn tiền
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
