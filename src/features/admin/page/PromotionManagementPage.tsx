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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, RefreshCw, Save } from "lucide-react";
import instance from "@/lib/axios";

interface Promotion {
  promotion_id: number;
  code: string;
  description: string | null;
  discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export default function PromotionManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_amount: 0,
    start_date: "",
    end_date: "",
    status: "ACTIVE",
  });

  // Load danh sách
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/promotions");
      setPromotions(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      discount_amount: 0,
      start_date: "",
      end_date: "",
      status: "ACTIVE",
    });
    setEditing(null);
  };

  // Validate ngày
  const validateDate = () => {
    if (form.start_date && form.end_date) {
      if (new Date(form.end_date) < new Date(form.start_date)) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
        return false;
      }
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Mã khuyến mãi là bắt buộc!");
      return;
    }

    if (!validateDate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_amount: Number(form.discount_amount) || 0,
      };

      if (editing) {
        await instance.patch(`/promotions/${editing.promotion_id}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await instance.post("/promotions", payload);
        toast.success("Thêm khuyến mãi thành công!");
      }

      fetchPromotions();
      resetForm();
      setOpenDialog(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    setDeleting(true);
    try {
      await instance.delete(`/promotions/${id}`);
      toast.success("Đã xóa!");
      fetchPromotions();
    } catch {
      toast.error("Không thể xóa!");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      code: p.code,
      description: p.description || "",
      discount_amount: p.discount_amount ?? 0,
      start_date: p.start_date ? p.start_date.split("T")[0] : "",
      end_date: p.end_date ? p.end_date.split("T")[0] : "",
      status: p.status,
    });
    setOpenDialog(true);
  };

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            Quản lý Khuyến mãi ({promotions.length})
          </CardTitle>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPromotions}>
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
            <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Thêm khuyến mãi
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã KM</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giảm (VNĐ)</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Chưa có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((p) => (
                    <TableRow key={p.promotion_id}>
                      <TableCell>{p.code}</TableCell>
                      <TableCell>{p.description || "—"}</TableCell>
                      <TableCell>{(p.discount_amount || 0).toLocaleString("vi-VN")} ₫</TableCell>
                      <TableCell>
                        {p.start_date ? new Date(p.start_date).toLocaleDateString("vi-VN") : "—"}
                      </TableCell>
                      <TableCell>
                        {p.end_date ? new Date(p.end_date).toLocaleDateString("vi-VN") : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : p.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleting}
                          onClick={() => handleDelete(p.promotion_id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            
            <div>
              <Label>Mã khuyến mãi</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Số tiền giảm (VNĐ)</Label>
              <Input
                type="number"
                value={form.discount_amount}
                onChange={(e) =>
                  setForm({ ...form, discount_amount: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <select
                className="border rounded p-2 w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
