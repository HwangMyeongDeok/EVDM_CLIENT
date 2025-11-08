import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Plus,
  Pencil,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  FileDown,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { ContractService } from "../service";
import type { Contract, ContractStatus, PaymentStatus, PaymentPlan } from "../types";

// === Config status badges ===
const statusConfig: Record<
  ContractStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Bản nháp", variant: "secondary" },
  PENDING_APPROVAL: { label: "Chờ duyệt", variant: "outline" },
  PENDING_SIGN: { label: "Chờ ký", variant: "outline" },
  SIGNED: { label: "Đã ký", variant: "default" },
  IN_PROGRESS: { label: "Đang thực hiện", variant: "default" },
  COMPLETED: { label: "Hoàn tất", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

// Mapping Payment sang tiếng Việt
const paymentStatusVN: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PARTIAL: "Thanh toán một phần",
  PAID: "Đã thanh toán",
};

const paymentPlanVN: Record<PaymentPlan, string> = {
  FULL: "Thanh toán toàn bộ",
  DEPOSIT: "Đặt cọc",
};

// Mock current user role
const CURRENT_USER_ROLE = "manager";

export default function ContractListPage() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);

  // Approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [contractToApprove, setContractToApprove] = useState<Contract | null>(null);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingApproval, setProcessingApproval] = useState(false);

  // View contract detail
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState<Contract | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [searchTerm, statusFilter, contracts]);

  // === Fetch contracts ===
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await ContractService.fetchContracts();
      setContracts(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = [...contracts];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((c) =>
        c.contract_code.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredContracts(filtered);
  };

  // === Delete ===
  const handleDeleteClick = (contractId: number, status: ContractStatus) => {
    if (status !== "DRAFT") {
      toast.error("Chỉ có thể xóa hợp đồng ở trạng thái Bản nháp");
      return;
    }
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    try {
      // Nếu muốn tĩnh, không gọi API, chỉ hiển thị toast
      toast.success("Đã xóa hợp đồng thành công (tĩnh)");
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      // Nếu muốn, vẫn có thể gọi fetchContracts() để cập nhật UI
      // fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Không thể xóa hợp đồng");
    }
  };


  // === Approve / Reject ===
  const handleApprovalClick = (contract: Contract, action: "APPROVED" | "REJECTED") => {
    if (CURRENT_USER_ROLE !== "manager") {
      toast.error("Chỉ Manager mới có quyền duyệt hợp đồng");
      return;
    }

    if (contract.status !== "PENDING_APPROVAL") {
      toast.error("Chỉ có thể duyệt hợp đồng ở trạng thái Chờ duyệt");
      return;
    }

    setContractToApprove(contract);
    setApprovalAction(action);
    setRejectionReason("");
    setApprovalDialogOpen(true);
  };

  const handleApprovalConfirm = async () => {
    if (!contractToApprove) return;

    if (approvalAction === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setProcessingApproval(true);
      await ContractService.approveContract(contractToApprove.contract_id);
      toast.success(
        approvalAction === "APPROVED"
          ? "Đã duyệt hợp đồng thành công"
          : "Đã từ chối hợp đồng"
      );
      setApprovalDialogOpen(false);
      setContractToApprove(null);
      setRejectionReason("");
      fetchContracts();
    } catch (error) {
      console.error("Error approving contract:", error);
      toast.error("Không thể xử lý yêu cầu duyệt");
    } finally {
      setProcessingApproval(false);
    }
  };

  // === View contract detail ===
  const handleViewContract = async (contractId: number) => {
    setViewModalOpen(true);
    setLoadingDetail(true);
    try {
      const data = await ContractService.fetchContractById(contractId);
      setContractDetail(data);
    } catch (error) {
      console.error("Error fetching contract detail:", error);
      toast.error("Không thể tải chi tiết hợp đồng");
      setViewModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isEditable = (status: ContractStatus) => {
    return status === "DRAFT" || status === "PENDING_APPROVAL";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách Hợp đồng</h1>
          <p className="text-muted-foreground">Quản lý hợp đồng mua bán xe điện</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
          <Button >
            <Plus className="mr-2 h-4 w-4" /> Tạo hợp đồng mới
          </Button>

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc hợp đồng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã hợp đồng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {Object.keys(statusConfig).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status as ContractStatus].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "ALL"
                  ? "Không tìm thấy hợp đồng nào"
                  : "Chưa có hợp đồng nào"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hợp đồng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Giá bán lẻ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.contract_id}>
                      <TableCell>{contract.contract_code}</TableCell>
                      <TableCell>{contract.customer?.full_name || "N/A"}</TableCell>
                      <TableCell>{formatDate(contract.contract_date)}</TableCell>

                      <TableCell>
                        {contract.quotation?.variant?.vehicle?.model_name || "-"}
                      </TableCell>

                      <TableCell>
                        {contract.quotation?.variant?.retail_price !== undefined
                          ? contract.quotation.variant.retail_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={statusConfig[contract.status].variant}>
                          {statusConfig[contract.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {paymentStatusVN[contract.payment_status]} {/* <-- hiển thị payment status */}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {isEditable(contract.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/dealer/staff/contracts/edit/${contract.contract_id}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContract(contract.contract_id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}

                        {CURRENT_USER_ROLE === "manager" &&
                          contract.status === "PENDING_APPROVAL" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprovalClick(contract, "APPROVED")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                        {contract.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteClick(contract.contract_id, contract.status)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}

                        {contract.status === "SIGNED" && (
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Thanh toán
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "APPROVED" ? "Duyệt hợp đồng" : "Từ chối hợp đồng"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "APPROVED"
                ? `Bạn có chắc chắn muốn duyệt hợp đồng ${contractToApprove?.contract_code}?`
                : `Vui lòng nhập lý do từ chối hợp đồng ${contractToApprove?.contract_code}`}
            </DialogDescription>
          </DialogHeader>

          {approvalAction === "REJECTED" && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Lý do từ chối *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối hợp đồng..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={processingApproval}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprovalConfirm}
              disabled={processingApproval}
              variant={approvalAction === "APPROVED" ? "default" : "destructive"}
            >
              {processingApproval ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : approvalAction === "APPROVED" ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {approvalAction === "APPROVED" ? "Duyệt" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contract Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hợp đồng</DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : contractDetail ? (
            <div className="space-y-2">
              <p><strong>Mã hợp đồng:</strong> {contractDetail.contract_code}</p>
              <p><strong>Khách hàng:</strong> {contractDetail.customer?.full_name || "N/A"}</p>
              <p><strong>Số điện thoại:</strong> {contractDetail.customer?.phone || "-"}</p>
              <p><strong>Người tạo:</strong> {contractDetail.user?.full_name || "N/A"}</p>
              <p><strong>Ngày tạo hợp đồng:</strong> {formatDate(contractDetail.contract_date)}</p>
              <p><strong>Ngày giao hàng:</strong> {contractDetail.delivery_date ? formatDate(contractDetail.delivery_date) : "-"}</p>
              <p><strong>Trạng thái:</strong> {statusConfig[contractDetail.status]?.label}</p>
              <p><strong>Tổng tiền:</strong> {formatCurrency(contractDetail.total_amount)}</p>
              <p><strong>Giảm giá:</strong> {formatCurrency(contractDetail.discount_amount)}</p>
              <p><strong>Thanh toán cuối cùng:</strong> {formatCurrency(contractDetail.final_amount)}</p>
              <p><strong>Trạng thái thanh toán:</strong> {paymentStatusVN[contractDetail.payment_status]}</p>
              <p><strong>Kế hoạch thanh toán:</strong> {paymentPlanVN[contractDetail.payment_plan]}</p>
              <p><strong>Số tiền đặt cọc:</strong> {formatCurrency(contractDetail.deposit_amount)}</p>
              <p><strong>Số tiền còn lại:</strong> {formatCurrency(contractDetail.remaining_amount)}</p>
              <p><strong>Ngày tạo bản ghi:</strong> {formatDate(contractDetail.created_at)}</p>
            </div>

          ) : (
            <p>Không có dữ liệu</p>
          )}

          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
