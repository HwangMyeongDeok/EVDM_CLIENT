import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea"; // Thêm Textarea cho ghi chú
import { Trash2 } from "lucide-react"; // Icon để xóa
import { useNavigate } from "react-router-dom";

// Định nghĩa kiểu dữ liệu cho xe
interface VehicleOption {
  id: string;
  modelName: string;
  variant: string;
  price: number;
}

// Nhà cung cấp duy nhất
const SOLE_SUPPLIER = {
  id: "S_VIN",
  name: "VinFast Auto",
};

// Mô phỏng dữ liệu xe từ API
const FAKE_VEHICLE_DATA: VehicleOption[] = [
  { id: "V001", modelName: "VF 5 Plus", variant: "Base", price: 458_000_000 },
  { id: "V002", modelName: "VF 7", variant: "Plus", price: 780_000_000 },
  { id: "V003", modelName: "VF 8", variant: "Eco", price: 1_050_000_000 },
  { id: "V004", modelName: "VF 9", variant: "Plus", price: 1_900_000_000 },
];

export default function PurchaseOrderForm() {
  const navigate = useNavigate();

  // State cho thông tin chung của đơn hàng
  const [poNumber, setPoNumber] = useState(`PO-${Date.now()}`); // Tự tạo mã PO tạm
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  // State cho việc tải dữ liệu
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho việc chọn xe và thêm vào bảng
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<{ vehicle: VehicleOption; qty: number }[]>(
    []
  );

  // --- MÔ PHỎNG TẢI DỮ LIỆU TỪ API ---
  useEffect(() => {
    // Đây là nơi bạn sẽ dùng fetch() hoặc axios() để gọi API thật
    setIsLoading(true);
    const timer = setTimeout(() => {
      setVehicleOptions(FAKE_VEHICLE_DATA);
      setIsLoading(false);
    }, 1000); // Giả lập 1 giây loading

    return () => clearTimeout(timer); // Cleanup
  }, []); // [] nghĩa là chỉ chạy 1 lần khi component mount

  // --- CÁC HÀM XỬ LÝ ---
  const handleAddItem = () => {
    const vehicle = vehicleOptions.find((v) => v.id === selectedVehicle);
    if (vehicle) {
      // Kiểm tra xem xe đã có trong danh sách chưa
      const existingItem = items.find(
        (i) => i.vehicle.id === vehicle.id
      );
      if (existingItem) {
        // Nếu đã có, chỉ cập nhật số lượng
        setItems(
          items.map((i) =>
            i.vehicle.id === vehicle.id ? { ...i, qty: i.qty + quantity } : i
          )
        );
      } else {
        // Nếu chưa có, thêm mới
        setItems([...items, { vehicle, qty: quantity }]);
      }
      // Reset form
      setSelectedVehicle("");
      setQuantity(1);
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitOrder = () => {
    // 1. Validation (Kiểm tra dữ liệu)
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một xe vào đơn hàng.");
      return;
    }

    // 2. Tạo đối tượng payload để gửi đi
    const orderPayload = {
      supplierId: SOLE_SUPPLIER.id, // Gán cứng ID nhà cung cấp
      poNumber,
      orderDate,
      notes,
      totalAmount: total,
      items: items.map((i) => ({
        vehicleId: i.vehicle.id,
        quantity: i.qty,
        unitPrice: i.vehicle.price,
      })),
    };

    // 3. Log ra console để xem (thay thế bằng API call thật)
    console.log("GỬI ĐƠN HÀNG LÊN API:", orderPayload);
    alert("Đã gửi đơn hàng thành công! (Kiểm tra console F12)");

    // 4. (Tùy chọn) Gọi API thật
    /*
    fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(res => res.json())
    .then(data => {
      alert('Gửi đơn hàng thành công!');
      navigate('/purchase-orders'); // Chuyển về trang danh sách
    })
    .catch(err => {
      alert('Có lỗi xảy ra khi gửi đơn hàng.');
      console.error(err);
    });
    */

    // 5. Sau khi gửi thành công, có thể điều hướng về trang danh sách
    // navigate('/admin/purchase-orders');
  };

  // Tính tổng tiền
  const total = items.reduce((sum, i) => sum + i.vehicle.price * i.qty, 0);

  if (isLoading) {
    return <div className="p-6">Đang tải dữ liệu... ⏳</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Tạo đơn hàng đặt xe</h2>

      {/* --- Card Thông Tin Chung --- */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Input
                id="supplier"
                value={SOLE_SUPPLIER.name}
                readOnly
                className="mt-1 bg-gray-100" // Nền xám để biết là read-only
              />
            </div>
            <div>
              <Label htmlFor="poNumber">Mã đơn hàng (PO)</Label>
              <Input
                id="poNumber"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="mt-1"
              />
            </div>
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
          </div>
          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Thêm ghi chú cho đơn hàng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* --- Card Thêm Xe --- */}
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
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelName} ({v.variant}) - {v.price.toLocaleString()} ₫
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
                  <TableHead>Đơn giá</TableHead>
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
                    <TableCell>{i.vehicle.price.toLocaleString()} ₫</TableCell>
                    <TableCell>
                      {(i.vehicle.price * i.qty).toLocaleString()} ₫
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

      {/* --- Nút Hành Động --- */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Hủy
        </Button>
        <Button variant="secondary">Lưu nháp</Button>
        <Button
          onClick={handleSubmitOrder}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={items.length === 0}
        >
          Gửi hãng phê duyệt
        </Button>
      </div>
    </div>
  );
}