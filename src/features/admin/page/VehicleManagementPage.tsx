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
import { Plus, Edit, Trash2, Loader2, RefreshCw, Save, Image } from "lucide-react";
import instance from "@/lib/axios";

interface VehicleVariant {
  variant_id: number;
  vehicle_id: number;
  version: string;
  model_year: number;
  retail_price: number;
  status: string;
  image_urls?: string[];
}

export default function VehicleManagementPage() {
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<VehicleVariant | null>(null);

  const [form, setForm] = useState({
    version: "",
    model_year: new Date().getFullYear(),
    retail_price: 0,
    status: "ACTIVE",
    image_urls: "",
  });

  // 🟢 Load data từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/vehicle-variants");
      setVariants(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh mục xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      version: "",
      model_year: new Date().getFullYear(),
      retail_price: 0,
      status: "ACTIVE",
      image_urls: "",
    });
    setEditing(null);
  };

  // 🟢 Lưu
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.version.trim()) {
      toast.error("Phiên bản xe là bắt buộc!");
      return;
    }

    const payload = {
      ...form,
      image_urls: form.image_urls ? [form.image_urls.trim()] : [],
    };

    setSaving(true);
    try {
      if (editing) {
        await instance.patch(`/vehicle-variants/${editing.variant_id}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await instance.post(`/vehicle-variants`, payload);
        toast.success("Thêm xe mới thành công!");
      }

      await fetchData();
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Xóa
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa xe này?")) return;

    setDeleting(true);
    try {
      await instance.delete(`/vehicle-variants/${id}`);
      toast.success("Đã xóa thành công!");
      fetchData();
    } catch {
      toast.error("Không thể xóa xe (có thể đang được sử dụng)");
    } finally {
      setDeleting(false);
    }
  };

  // 🟢 Mở form sửa
  const openEdit = (v: VehicleVariant) => {
    setEditing(v);
    setForm({
      version: v.version,
      model_year: v.model_year,
      retail_price: v.retail_price,
      status: v.status,
      image_urls: v.image_urls?.[0] || "",
    });
    setOpenDialog(true);
  };

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            Quản lý Danh mục xe ({variants.length})
          </CardTitle>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
            <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Thêm xe
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
                  <TableHead>Mã xe</TableHead>
                  <TableHead>Tên xe</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead>Năm sản xuất</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {variants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Chưa có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  variants.map((v) => (
                    <TableRow key={v.variant_id}>
                      <TableCell>{v.variant_id}</TableCell>
                      <TableCell>{v.vehicle_id}</TableCell>
                      <TableCell>{v.version}</TableCell>
                      <TableCell>{v.model_year}</TableCell>
                      <TableCell>{v.retail_price.toLocaleString("vi-VN")} ₫</TableCell>

                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          v.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}>
                          {v.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        {v.image_urls?.[0] ? (
                          <img
                            src={v.image_urls[0]}
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                          <Image className="w-5 h-5 text-muted-foreground" />
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(v)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleting}
                          onClick={() => handleDelete(v.variant_id)}
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

      {/* Form thêm / sửa */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa xe" : "Thêm xe mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Phiên bản</Label>
              <Input
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Năm sản xuất</Label>
                <Input
                  type="number"
                  value={form.model_year}
                  onChange={(e) =>
                    setForm({ ...form, model_year: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Giá bán (VNĐ)</Label>
                <Input
                  type="number"
                  value={form.retail_price}
                  onChange={(e) =>
                    setForm({ ...form, retail_price: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Input
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
            </div>

            <div>
              <Label>Link ảnh (1 ảnh)</Label>
              <Input
                value={form.image_urls}
                onChange={(e) =>
                  setForm({ ...form, image_urls: e.target.value })
                }
                placeholder="https://example.com/car.jpg"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  