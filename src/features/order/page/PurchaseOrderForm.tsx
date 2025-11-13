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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, PlusCircle, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetVehiclesQuery } from "@/features/vehicles/api";
import { useCreateDealerRequestMutation } from "@/features/order/api";
import type { IVehicle, IVehicleVariant } from "@/types/vehicle";

export const RequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PARTIAL: "PARTIAL",
} as const;

type RequestItem = {
  vehicle: IVehicle;
  variant: IVehicleVariant;
  qty: number;
  color: string;
};

export default function PurchaseRequestForm() {
  const navigate = useNavigate();

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<RequestItem[]>([]);

  const { data: vehicleOptions = [], isLoading } = useGetVehiclesQuery();
  const [createDealerRequest, { isLoading: isCreating }] = useCreateDealerRequestMutation();

  const dealer_id = "D001"; // giả lập - sau này lấy từ auth

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

  const handleAddItem = () => {
    if (!selectedVehicle || !selectedVariant || !selectedColor || quantity < 1) {
      alert("Vui lòng kiểm tra lại thông tin xe và số lượng.");
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

  // ✅ Gửi 1 request duy nhất chứa nhiều items
  const handleSubmitRequest = async () => {
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một xe vào yêu cầu.");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn gửi yêu cầu này đến hãng?")) {
      return;
    }

    try {
      const payload = {
        dealer_id,
        items: items.map((i) => ({
          variant_id: i.variant.variant_id.toString(),
          requested_quantity: i.qty,
        })),
        request_date: orderDate,
        notes,
        status: RequestStatus.PENDING,
      };

      console.log("📦 Payload gửi BE:", payload);
      await createDealerRequest(payload).unwrap();

      alert("✅ Yêu cầu đã gửi thành công! Bạn sẽ được chuyển hướng đến trang danh sách.");
      setItems([]);
      navigate("/dealer/manager/purchase-orders/list");
    } catch (error) {
      console.error(error);
      alert("❌ Gửi yêu cầu thất bại! Vui lòng kiểm tra kết nối và thử lại.");
    }
  };

  const formatPrice = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (isLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải danh sách xe...</p>
      </div>
    );

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-800">
        📋 Tạo Yêu cầu Đặt xe
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* --- CỘT 1: Thông tin chung --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="orderDate" className="font-medium">
                  Ngày yêu cầu
                </Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú đặc biệt cho yêu cầu này..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* --- CỘT 2 & 3: Chi tiết yêu cầu --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-blue-500/30">
            <CardHeader className="bg-blue-50/50 rounded-t-lg border-b p-4">
              <CardTitle className="text-xl font-bold text-blue-700 flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" /> Thêm Chi tiết Yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Chọn xe */}
                <div>
                  <Label>Mẫu xe</Label>
                  <Select
                    value={selectedVehicleId?.toString() ?? ""}
                    onValueChange={(val) => {
                      const id = val ? Number(val) : null;
                      setSelectedVehicleId(id);
                      setSelectedVariantId(null);
                      setSelectedColor("");
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="-- Chọn mẫu xe --" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleOptions.map((v: IVehicle) => (
                        <SelectItem key={v.vehicle_id} value={v.vehicle_id.toString()}>
                          {v.model_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chọn phiên bản */}
                <div>
                  <Label>Phiên bản</Label>
                  <Select
                    value={selectedVariantId?.toString() ?? ""}
                    onValueChange={(val) => {
                      const id = val ? Number(val) : null;
                      setSelectedVariantId(id);
                    }}
                    disabled={!selectedVehicle}
                  >
                    <SelectTrigger className="mt-1 w-full truncate">
                      <SelectValue placeholder="-- Chọn phiên bản --" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedVehicle?.variants.map((variant) => (
                        <SelectItem key={variant.variant_id} value={variant.variant_id.toString()}>
                          {variant.version} ({formatPrice(variant.retail_price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chọn màu */}
                <div>
                  <Label>Màu xe</Label>
                  <Select
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    disabled={!selectedVehicle}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="-- Chọn màu --" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Số lượng */}
                <div>
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="mt-1 text-center"
                  />
                </div>

                {/* Nút thêm */}
                <div className="flex items-end">
                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedVariantId || !selectedColor || quantity < 1}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Thêm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bảng danh sách chi tiết */}
          <Card className="shadow-lg">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-xl font-semibold">
                Các mục đã thêm ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có mục nào được thêm vào yêu cầu.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Mẫu xe</TableHead>
                      <TableHead>Phiên bản</TableHead>
                      <TableHead>Màu xe</TableHead>
                      <TableHead className="text-center">SL</TableHead>
                      <TableHead className="text-right">Giá (VND)</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((i, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{i.vehicle.model_name}</TableCell>
                        <TableCell>{i.variant.version}</TableCell>
                        <TableCell>{i.color}</TableCell>
                        <TableCell className="text-center">{i.qty}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(i.variant.retail_price)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatPrice(i.variant.retail_price * i.qty)}
                        </TableCell>
                        <TableCell className="text-center">
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
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={5} className="text-right font-bold">
                        Tổng cộng:
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-blue-600">
                        {formatPrice(total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Hủy / Quay lại
            </Button>
            <Button variant="secondary" disabled={isCreating}>
              Lưu nháp
            </Button>
            <Button
              onClick={handleSubmitRequest}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={items.length === 0 || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isCreating ? "Đang gửi..." : "Gửi hãng phê duyệt"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}