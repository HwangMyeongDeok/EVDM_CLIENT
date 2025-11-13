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
import { Loader2, RefreshCw, Save, Plus, Minus } from "lucide-react";
import instance from "@/lib/axios";

interface Inventory {
  id: number;
  variant: {
    variant_id: number;
    version: string;
  };
  dealer: {
    dealer_id: number;
    dealer_name: string;
  };
  quantity: number;
  last_updated: string;
}

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Inventory | null>(null);
  const [quantityChange, setQuantityChange] = useState(0);
  const [dealerFilter, setDealerFilter] = useState("");

  // 🟢 Lấy danh sách tồn kho
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/inventory", {
        params: dealerFilter ? { dealer_id: dealerFilter } : {},
      });
      setInventory(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dealerFilter]);

  // 🟢 Hàm cập nhật nhập/xuất kho
  const handleUpdate = async (type: "import" | "export") => {
    if (!selected) return;
    const newQty =
      type === "import"
        ? selected.quantity + quantityChange
        : selected.quantity - quantityChange;

    if (quantityChange <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    if (newQty < 0) {
      toast.error("Số lượng không được âm!");
      return;
    }

    setSaving(true);
    try {
      await instance.patch(`/inventory/${selected.id}`, { quantity: newQty });
      toast.success("Cập nhật tồn kho thành công!");
      setSelected(null);
      setQuantityChange(0);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Cập nhật kho thất bại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold">
            Quản lý Kho xe ({inventory.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Lọc theo Dealer ID..."
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="w-[200px]"
            />
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
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
                  <TableHead>Phiên bản xe</TableHead>
                  <TableHead>Đại lý</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Cập nhật lần cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-10"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.variant?.version || "—"}</TableCell>
                      <TableCell>{item.dealer?.dealer_name || "—"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.last_updated
                          ? new Date(item.last_updated).toLocaleString("vi-VN")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(item)}
                        >
                          Cập nhật
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

      {/* 🟢 Dialog Nhập / Xuất kho */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  <b>{selected.variant.version}</b> —{" "}
                  {selected.dealer.dealer_name} <br />
                  Số lượng hiện tại:{" "}
                  <b className="text-blue-600">{selected.quantity}</b>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-3">
            <Label>Số lượng thay đổi</Label>
            <Input
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(Number(e.target.value))}
              placeholder="Nhập số lượng cần nhập hoặc xuất"
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => handleUpdate("import")}
              disabled={saving || quantityChange <= 0}
            >
              <Plus className="w-4 h-4 mr-1" /> Nhập
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleUpdate("export")}
              disabled={saving || quantityChange <= 0}
            >
              <Minus className="w-4 h-4 mr-1" /> Xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
