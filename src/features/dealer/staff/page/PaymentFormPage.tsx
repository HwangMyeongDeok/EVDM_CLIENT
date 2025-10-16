import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: number;
  agency: string;
  orderId: string;
  orderPrice: number;
  amountPaid: number;
  remaining: number;
  method: string;
  date: string;
  note: string;
}

const PaymentFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    agency: "Bình Minh",
    orderId: "DH00123",
    orderPrice: 0,
    amountPaid: 0,
    remaining: 0,
    method: "",
    date: "",
    note: "Thanh toán đợt 1",
  });

  
  const formatNumber = (num: number) => {
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN");
  };

  
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "orderPrice" || name === "amountPaid") {
      cleanValue = value.replace(/[^0-9]/g, ""); // bỏ dấu phẩy, ký tự khác
      cleanValue = cleanValue.replace(/^0+/, ""); // bỏ 0 ở đầu
      cleanValue = cleanValue === "" ? "0" : cleanValue;
    }

    const updatedPayment = {
      ...payment,
      [name]:
        name === "orderPrice" || name === "amountPaid"
          ? Number(cleanValue)
          : cleanValue,
    };

    
    if (name === "orderPrice" || name === "amountPaid") {
      updatedPayment.remaining =
        updatedPayment.orderPrice - updatedPayment.amountPaid;
    }

    setPayment(updatedPayment);
  };

  const handleSubmit = () => {
    if (!payment.agency || !payment.orderId || !payment.method) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const history = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
    history.push(payment);
    localStorage.setItem("paymentHistory", JSON.stringify(history));

    alert("💰 Ghi nhận thanh toán thành công!");
    navigate("/dealer/staff/payment-history");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
         Ghi nhận thanh toán
      </h1>

      <div className="space-y-4 text-gray-800">
        {/* Đại lý */}
        <div>
          <label className="block font-semibold">Đại lý</label>
          <input
            name="agency"
            value={payment.agency}
            onChange={handleChange}
            placeholder="Nhập tên đại lý (VD: Bình Minh)"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Mã đơn hàng */}
        <div>
          <label className="block font-semibold">Mã đơn hàng</label>
          <input
            name="orderId"
            value={payment.orderId}
            onChange={handleChange}
            placeholder="VD: DH00123"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Giá đơn hàng */}
        <div>
          <label className="block font-semibold">Giá đơn hàng (VNĐ)</label>
          <input
            name="orderPrice"
            inputMode="numeric"
            value={formatNumber(payment.orderPrice)}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Số tiền thanh toán */}
        <div>
          <label className="block font-semibold">Số tiền thanh toán (VNĐ)</label>
          <input
            name="amountPaid"
            inputMode="numeric"
            value={formatNumber(payment.amountPaid)}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Số tiền còn lại */}
        <div>
          <label className="block font-semibold">Số tiền còn lại (VNĐ)</label>
          <input
            name="remaining"
            value={formatNumber(payment.remaining)}
            readOnly
            className="border p-2 rounded w-full bg-gray-100 font-semibold text-red-600"
          />
        </div>

        {/* Hình thức */}
        <div>
          <label className="block font-semibold">Hình thức thanh toán</label>
          <select
            name="method"
            value={payment.method}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Chọn hình thức --</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Tiền mặt">Tiền mặt</option>
          </select>
        </div>

        {/* Ngày */}
        <div>
          <label className="block font-semibold">Ngày thanh toán</label>
          <input
            name="date"
            type="date"
            value={payment.date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block font-semibold">Ghi chú</label>
          <textarea
            name="note"
            value={payment.note}
            onChange={handleChange}
            placeholder="VD: Thanh toán đợt 1"
            className="border p-2 rounded w-full"
          ></textarea>
        </div>

        {/* Nút lưu */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition mt-4"
        >
           Lưu thanh toán
        </button>
      </div>
    </div>
  );
};

export default PaymentFormPage;
