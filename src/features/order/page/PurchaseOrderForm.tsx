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
import { useCreateDealerRequestMutation } from "@/features/order/api";
import type { DealerVehicleRequest } from "@/types/dealer_vehicle_request";
import type { IVehicle, IVehicleVariant } from "@/types/vehicle";

export default function PurchaseRequestForm() {
  const navigate = useNavigate();

  // --- State ---
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [requestCode, setRequestCode] = useState(`REQ-${Date.now()}`);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<
    { vehicle: IVehicle; variant: IVehicleVariant; qty: number; color: string }[]
  >([]);

  const { data: vehicleOptions = [], isLoading } = useGetVehiclesQuery();
  const [createDealerRequest, { isLoading: isCreating }] =
    useCreateDealerRequestMutation();

  const dealer_id = "D001"; // Giả lập ID đại lý, sau này sẽ lấy từ auth

  // --- Derived ---
  const selectedVehicle = vehicleOptions.find(
    (v: IVehicle) => v.vehicle_id === selectedVehicleId
  );

  const selectedVariant = selectedVehicle?.variants.find(
    (variant) => variant.variant_id === selectedVariantId
  );

  const colorOptions =
    selectedVehicle?.variants
      .map((variant) => variant.color)
      .filter((value, index, self) => self.indexOf(value) === index) || [];

  // --- Functions ---
  const handleAddItem = () => {
    if (!selectedVehicle || !selectedVariant || !selectedColor) {
      alert("Vui lòng chọn đầy đủ mẫu xe, phiên bản và màu xe.");
      return;
    }

    const exists = items.find(
      (i) =>
        i.variant.variant_id === selectedVariant.variant_id && i.color === selectedColor
    );

    if (exists) {
      setItems(
        items.map((i) =>
          i.variant.variant_id === selectedVariant.variant_id && i.color === selectedColor
            ? { ...i, qty: i.qty + quantity }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          vehicle: selectedVehicle,
          variant: selectedVariant,
          qty: quantity,
          color: selectedColor,
        },
      ]);
    }

    setSelectedVehicleId(null);
    setSelectedVariantId(null);
    setSelectedColor("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, i) => sum + (i.variant.retail_price || 0) * i.qty,
    0
  );

  const handleSubmitRequest = async () => {
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một xe vào yêu cầu.");
      return;
    }

    try {
      const payloads: Partial<DealerVehicleRequest>[] = items.map((i) => ({
        dealer_id,
        request_code: requestCode,
        variant_id: i.variant.variant_id,
        color: i.color,
        requested_quantity: i.qty,
        request_date: orderDate,
        status: "PENDING",
      }));
      console.log("Payloads:", payloads);

      for (const body of payloads) {
        await createDealerRequest(body).unwrap();
      }

      alert("✅ Yêu cầu đã gửi thành công!");
      setItems([]);
      navigate("/dealer/requests");
    } catch (error) {
      console.error(error);
      alert("❌ Gửi yêu cầu thất bại!");
    }
  };

  const formatPrice = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // --- UI ---
  if (isLoading) return <div className="p-6">Đang tải danh sách xe... ⏳</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Tạo yêu cầu đặt xe</h2>

      {/* Thông tin chung */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="requestCode">Mã yêu cầu</Label>
              <Input
                id="requestCode"
                value={requestCode}
                onChange={(e) => setRequestCode(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="orderDate">Ngày yêu cầu</Label>
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
          </div>

          <Label htmlFor="notes">Ghi chú</Label>
          <Textarea
            id="notes"
            placeholder="Thêm ghi chú cho yêu cầu..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Chi tiết yêu cầu */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết yêu cầu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Chọn xe */}
            <div>
              <Label>Chọn mẫu xe</Label>
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedVehicleId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  setSelectedVehicleId(id);
                  setSelectedVariantId(null);
                  setSelectedColor("");
                }}
              >
                <option value="">-- Chọn xe --</option>
                {vehicleOptions.map((v: IVehicle) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.model_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn phiên bản */}
            <div>
              <Label>Phiên bản</Label>
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedVariantId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  setSelectedVariantId(id);
                }}
                disabled={!selectedVehicle}
              >
                <option value="">-- Chọn phiên bản --</option>
                {selectedVehicle?.variants.map((variant) => (
                  <option key={variant.variant_id} value={variant.variant_id}>
                    {variant.version} - {formatPrice(variant.retail_price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn màu */}
            <div>
              <Label>Màu xe</Label>
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                disabled={!selectedVehicle}
              >
                <option value="">-- Chọn màu --</option>
                {colorOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Nhập số lượng */}
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

            {/* Thêm xe */}
            <div className="flex items-end">
              <Button
                onClick={handleAddItem}
                disabled={!selectedVariantId || !selectedColor}
                className="w-full"
              >
                Thêm xe
              </Button>
            </div>
          </div>

          {/* Bảng hiển thị */}
          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mẫu xe</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead>Màu xe</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                  <TableHead>Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{i.vehicle.model_name}</TableCell>
                    <TableCell>{i.variant.version}</TableCell>
                    <TableCell>{i.color}</TableCell>
                    <TableCell>{i.qty}</TableCell>
                    <TableCell>{formatPrice(i.variant.retail_price)}</TableCell>
                    <TableCell>
                      {formatPrice(i.variant.retail_price * i.qty)}
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
              <span className="text-blue-600">{formatPrice(total)}</span>
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
          onClick={handleSubmitRequest}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={items.length === 0 || isCreating}
        >
          {isCreating ? "Đang gửi..." : "Gửi hãng phê duyệt"}
        </Button>
      </div>
    </div>
  );
}
