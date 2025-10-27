import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetVehiclesQuery } from "@/features/vehicles/api";
import { useCreateOrderMutation } from "@/features/order/api";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";

export default function PurchaseOrderForm() {
  const navigate = useNavigate();


  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0] 
  );
  const [notes, setNotes] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<{ vehicle: any; qty: number }[]>([]);

  const { data: vehicleOptions = [], isLoading } = useGetVehiclesQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();


  const dealer_id = "D001";


  const handleAddItem = () => {

    const vehicle = vehicleOptions.find(
      (v: any) => v._id === selectedVehicle || v.id === selectedVehicle
    );
    if (!vehicle) return;

    const exists = items.find((i) => i.vehicle._id === vehicle.vehicle_id); 
    if (exists) {
      setItems(
        items.map((i) =>
          i.vehicle._id === vehicle.vehicle_id ? { ...i, qty: i.qty + quantity } : i
        )
      );
    } else {
      setItems([...items, { vehicle, qty: quantity }]);
    }

    setSelectedVehicle("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, i) => sum + (i.vehicle.price || 0) * i.qty,
    0
  );

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một xe vào đơn hàng.");
      return;
    }

    try {
      const payloads: Partial<DealerVehicleRequest>[] = items.map((i) => ({
        dealer_id,
        variant_id: i.vehicle._id, 
        requested_quantity: i.qty,
        status: "PENDING",
      }));

      await Promise.all(payloads.map((body) => createOrder(body).unwrap()));
      alert("✅ Đơn hàng đã gửi thành công!");
      navigate("/dealer/orders");
    } catch (error) {
      console.error(error);
      alert("❌ Gửi đơn hàng thất bại!");
    }
  };

  // --- Loading ---
  if (isLoading) return <div className="p-6">Đang tải danh sách xe... ⏳</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Tạo đơn hàng đặt xe</h2>


      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

            <div>
              <Label htmlFor="orderDate">Ngày đặt hàng</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Mã Đại lý</Label>
              <Input value={dealer_id} readOnly className="mt-1 bg-gray-100" />
            </div>

            <div></div>
          </div>

          <Label htmlFor="notes">Ghi chú</Label>
          <Textarea
            id="notes"
            placeholder="Thêm ghi chú cho đơn hàng..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Chọn mẫu xe</Label>
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">-- Chọn xe --</option>
                {vehicleOptions.map((v: any) => (
                  <option key={v._id} value={v._id}>
                    {v.modelName} ({v.variant || "N/A"}) -{" "}
                    {(v.price || 0).toLocaleString()} ₫
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Số lượng</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="mt-1"

              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddItem} disabled={!selectedVehicle}>
                Thêm xe
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mẫu xe</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                  <TableHead>Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{i.vehicle.modelName}</TableCell>
                    <TableCell>{i.vehicle.variant}</TableCell>
                    <TableCell>{i.qty}</TableCell>
                    <TableCell>{(i.vehicle.price || 0).toLocaleString()} ₫</TableCell>
                    <TableCell>
                      {((i.vehicle.price || 0) * i.qty).toLocaleString()} ₫
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-end mt-4">
            <p className="text-xl font-semibold">
              Tổng cộng:{" "}
              <span className="text-blue-600">{total.toLocaleString()} ₫</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nút hành động */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Hủy
        </Button>
        <Button variant="secondary">Lưu nháp</Button>

        <Button
          onClick={handleSubmitOrder}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={items.length === 0 || isCreating}
        >
          {isCreating ? "Đang gửi..." : "Gửi hãng phê duyệt"}
        </Button>
      </div>
    </div>
  );
}