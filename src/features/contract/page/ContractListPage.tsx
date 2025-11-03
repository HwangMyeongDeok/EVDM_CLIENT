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
  FileDown,
  FileText,
  Download,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  getContracts,
  approveContract,
  deleteContract,
} from "../api";
import type { ContractResponse, ContractStatus } from "../types";

const statusConfig: Record<ContractStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Bản nháp", variant: "secondary" },
  PENDING_APPROVAL: { label: "Chờ duyệt", variant: "outline" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  SIGNED: { label: "Đã ký", variant: "default" },
  COMPLETED: { label: "Hoàn tất", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

// Mock current user role (TODO: get from auth context)
const CURRENT_USER_ROLE = "manager"; // Change to "staff" to test staff view

export default function ContractListPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [contractToApprove, setContractToApprove] = useState<ContractResponse | null>(null);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingApproval, setProcessingApproval] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, contracts]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await getContracts();
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((c) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          c.contract_number.toLowerCase().includes(searchLower) ||
          c.customer?.full_name.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredContracts(filtered);
  };

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
      await deleteContract(contractToDelete);
      toast.success("Đã xóa hợp đồng thành công");
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Không thể xóa hợp đồng");
    }
  };

  const handleApprovalClick = (contract: ContractResponse, action: "APPROVED" | "REJECTED") => {
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
      await approveContract(contractToApprove.contract_id, {
        status: approvalAction,
        rejectionReason: approvalAction === "REJECTED" ? rejectionReason : undefined,
      });

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

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getVehicleNames = (contract: ContractResponse) => {
    if (!contract.items || contract.items.length === 0) return "N/A";
    
    const vehicleNames = contract.items
      .map((item) => item.variant?.version || "N/A")
      .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index)
      .join(", ");
    
    return vehicleNames || "N/A";
  };

  const handleExportReport = () => {
    toast.info("Tính năng xuất báo cáo sẽ được triển khai sau");
    // TODO: Implement export to Excel/PDF
  };

  const handleExportPDF = (_contractId: number) => {
    toast.info("Đang xuất file PDF...");
    // TODO: Implement PDF export
    // Call API: exportContractPDF(contractId)
  };

  const handlePayment = (contractId: number) => {
    navigate(`/dealer/staff/payments/new?contractId=${contractId}`);
  };

  // Check if contract is editable
  const isEditable = (status: ContractStatus) => {
    return status === "DRAFT" || status === "PENDING_APPROVAL";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách Hợp đồng</h1>
          <p className="text-muted-foreground">
            Quản lý hợp đồng mua bán xe điện
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button onClick={() => navigate("/dealer/staff/contracts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo hợp đồng mới
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo mã hợp đồng hoặc tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="SIGNED">Đã ký</SelectItem>
                <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
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
              {!searchTerm && statusFilter === "ALL" && (
                <Button
                  onClick={() => navigate("/dealer/staff/contracts/new")}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo hợp đồng đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hợp đồng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead className="text-right">Tổng giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Trạng thái duyệt</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Người duyệt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.contract_id}>
                      <TableCell className="font-medium">
                        {contract.contract_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {contract.customer?.full_name || "N/A"}
                          </span>
                          {contract.customer?.phone && (
                            <span className="text-xs text-muted-foreground">
                              {contract.customer.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getVehicleNames(contract)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(contract.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[contract.status].variant}>
                          {statusConfig[contract.status].label}
                        </Badge>
                      </TableCell>
                      
                      {/* New Approval Status Column */}
                      <TableCell>
                        {contract.status === "PENDING_APPROVAL" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            Chờ duyệt
                          </Badge>
                        )}
                        {contract.status === "APPROVED" && (
                          <Badge variant="default" className="bg-green-50 text-green-700 border-green-300">
                            Đã duyệt
                          </Badge>
                        )}
                        {contract.status === "REJECTED" && (
                          <Badge variant="destructive">
                            Từ chối
                          </Badge>
                        )}
                        {(contract.status === "DRAFT" || contract.status === "SIGNED" || contract.status === "COMPLETED") && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contract.created_at)}
                      </TableCell>
                      <TableCell>
                        {contract.approver ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {contract.approver.full_name}
                            </span>
                            {contract.approved_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(contract.approved_at)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View/Edit button */}
                          {isEditable(contract.status) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/dealer/staff/contracts/edit/${contract.contract_id}`)}
                              title="Chỉnh sửa hợp đồng"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/dealer/staff/contracts/view/${contract.contract_id}`)}
                              title="Xem chi tiết"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Export PDF button (for approved contracts) */}
                          {contract.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportPDF(contract.contract_id)}
                              title="Xuất file PDF"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Payment button (for approved contracts) */}
                          {contract.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePayment(contract.contract_id)}
                              title="Thanh toán"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Thanh toán
                            </Button>
                          )}

                          {/* Approval buttons (Manager only, PENDING_APPROVAL status) */}
                          {CURRENT_USER_ROLE === "manager" && contract.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprovalClick(contract, "APPROVED")}
                                title="Duyệt hợp đồng"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleApprovalClick(contract, "REJECTED")}
                                title="Từ chối hợp đồng"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {/* Delete button (DRAFT only) */}
                          {contract.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(contract.contract_id, contract.status)}
                              title="Xóa hợp đồng"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Xóa
            </AlertDialogAction>
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
                ? `Bạn có chắc chắn muốn duyệt hợp đồng ${contractToApprove?.contract_number}?`
                : `Vui lòng nhập lý do từ chối hợp đồng ${contractToApprove?.contract_number}`}
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
    </div>
  );
}
