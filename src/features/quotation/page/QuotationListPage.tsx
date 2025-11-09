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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Pencil, Search, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  getQuotations,
  deleteQuotation,
  type QuotationResponse,
} from "../api";


export default function QuotationListPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchTerm, statusFilter, quotations]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Không thể tải danh sách báo giá");
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    if (searchTerm) {
      filtered = filtered.filter((q) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          q.quotation_number.toLowerCase().includes(searchLower) ||
          q.customer?.full_name.toLowerCase().includes(searchLower)
        );
      });
    }


    setFilteredQuotations(filtered);
  };

  const handleDeleteClick = (quotationId: number) => {
    if (status !== "DRAFT") {
      toast.error("Chỉ có thể xóa báo giá ở trạng thái Bản nháp");
      return;
    }
    setQuotationToDelete(quotationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteQuotation(quotationToDelete);
      toast.success("Đã xóa báo giá thành công");
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
      fetchQuotations();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Không thể xóa báo giá");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVehicleNames = (quotation: QuotationResponse) => {
    if (!quotation.items || quotation.items.length === 0) return "N/A";
    
    const vehicleNames = quotation.items
      .map((item) => item.variant?.version || "N/A")
      .filter((name, index, self) => self.indexOf(name) === index)
      .join(", ");
    
    return vehicleNames || "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách Báo giá</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả báo giá cho khách hàng
          </p>
        </div>
        <Button onClick={() => navigate("/dealer/staff/quotations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo báo giá mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc báo giá</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo mã báo giá hoặc tên khách hàng..."
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
                <SelectItem value="SENT">Đã gửi</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
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
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "ALL"
                  ? "Không tìm thấy báo giá nào"
                  : "Chưa có báo giá nào"}
              </p>
              {!searchTerm && statusFilter === "ALL" && (
                <Button
                  onClick={() => navigate("/dealer/staff/quotations/new")}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo báo giá đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã báo giá</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Xe liên quan</TableHead>
                    <TableHead className="text-right">Tổng giá</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.quotation_id}>
                      <TableCell className="font-medium">
                        {quotation.quotation_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {quotation.customer?.full_name || "N/A"}
                          </span>
                          {quotation.customer?.phone && (
                            <span className="text-xs text-muted-foreground">
                              {quotation.customer.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getVehicleNames(quotation)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(quotation.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(quotation.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Convert to Contract button - only for non-DRAFT status */}
                          
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => navigate(`/dealer/staff/contracts/new?quotationId=${quotation.quotation_id}`)}
                              title="Chuyển sang hợp đồng"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Hợp đồng
                            </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dealer/staff/quotations/edit/${quotation.quotation_id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button> 
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(quotation.quotation_id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
              Bạn có chắc chắn muốn xóa báo giá này? Hành động này không thể hoàn tác.
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
    </div>
  );
}
