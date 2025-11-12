// src/features/admin/page/DealerManagementPage.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
  Save,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import instance from "@/lib/axios";

export interface IDealer {
  dealer_id: number;
  dealer_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function DealerManagementPage() {
  const [dealers, setDealers] = useState<IDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); // NEW: trạng thái xóa

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<IDealer | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    dealer_name: "",
    address: "",
    phone: "",
    email: "",
  });

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/dealers");
      const data = res.data.data;
      setDealers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Không thể tải danh sách đại lý");
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const resetForm = () => {
    setForm({ dealer_name: "", address: "", phone: "", email: "" });
    setEditingDealer(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dealer_name.trim()) {
      toast.error("Tên đại lý là bắt buộc!");
      return;
    }

    try {
      setSaving(true);
      const payload: any = { dealer_name: form.dealer_name.trim() };
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.email.trim()) payload.email = form.email.trim();

      if (editingDealer) {
        await instance.patch(`/dealers/${editingDealer.dealer_id}`, payload);
        toast.success("Cập nhật đại lý thành công!");
      } else {
        await instance.post("/dealers", payload);
        toast.success(`Thêm đại lý "${form.dealer_name}" thành công!`);
      }

      await fetchDealers();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Lỗi lưu:", err.response?.data);
      toast.error(err.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // CHỨC NĂNG XÓA ĐÃ HOÀN THIỆN 100%
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await instance.delete(`/dealers/${deleteId}`);
      toast.success("Xóa đại lý thành công!");
      await fetchDealers();
    } catch (err: any) {
      console.error("Lỗi xóa:", err.response?.data);
      const msg = err.response?.data?.message || "Không thể xóa đại lý này (có thể đang có dữ liệu liên quan)";
      toast.error(msg);
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const openEdit = (dealer: IDealer) => {
    setEditingDealer(dealer);
    setForm({
      dealer_name: dealer.dealer_name,
      address: dealer.address || "",
      phone: dealer.phone || "",
      email: dealer.email || "",
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mr-4" />
        <span className="text-lg">Đang tải danh sách đại lý...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Building2 className="h-7 w-7 text-blue-600" />
            Quản lý Đại lý ({dealers.length})
          </CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchDealers}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Đại lý
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Tên đại lý</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealers.map((d) => (
                <TableRow key={d.dealer_id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{d.dealer_id}</TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {d.dealer_name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{d.address || "—"}</TableCell>
                  <TableCell>{d.phone || "—"}</TableCell>
                  <TableCell>{d.email || "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteId(d.dealer_id);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {dealers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Chưa có đại lý nào. Nhấn "Thêm Đại lý" để bắt đầu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL SỬA / THÊM */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && (setIsModalOpen(false), resetForm())}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingDealer ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
            </DialogTitle>
            <DialogDescription>
              {editingDealer ? `ID: ${editingDealer.dealer_id}` : "Nhập thông tin đại lý"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            {/* Form fields giữ nguyên như cũ */}
            <div className="space-y-2">
              <Label htmlFor="dealer_name">
                Tên đại lý <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dealer_name"
                value={form.dealer_name}
                onChange={(e) => setForm({ ...form, dealer_name: e.target.value })}
                required
                placeholder="VD: Đại lý EV Miền Nam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline h-4 w-4 mr-1" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Số 1, đường..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0901234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="daily@evd.com"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT XÓA – ĐÃ CÓ SPINNER + DISABLE BUTTON KHI ĐANG XÓA */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đại lý</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đại lý này? <br />
              <strong>
                {deleteId && dealers.find(d => d.dealer_id === deleteId)?.dealer_name}
              </strong>
              <br />
              Hành động này <span className="text-red-600 font-semibold">không thể hoàn tác</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa đại lý"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}