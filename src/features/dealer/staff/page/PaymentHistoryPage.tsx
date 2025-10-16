import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const PaymentHistoryPage: React.FC = () => {
  // Dữ liệu mẫu giả lập (fake data)
  const paymentData = [
    {
      date: "12/10/2025",
      dealer: "Bình Minh",
      orderId: "DH00123",
      orderPrice: "500.000.000",
      paidAmount: "200.000.000",
      remainingAmount: "300.000.000",
      method: "Chuyển khoản",
      recorder: "Nguyễn A",
      note: "Thanh toán đợt 1",
    },
    {
      date: "14/10/2025",
      dealer: "Bình Minh",
      orderId: "DH00123",
      orderPrice: "500.000.000",
      paidAmount: "300.000.000",
      remainingAmount: "0",
      method: "Tiền mặt",
      recorder: "Nguyễn A",
      note: "Thanh toán đợt 2",
    },
    {
      date: "15/10/2025",
      dealer: "Đại Phát",
      orderId: "DH00125",
      orderPrice: "700.000.000",
      paidAmount: "300.000.000",
      remainingAmount: "400.000.000",
      method: "Chuyển khoản",
      recorder: "Lê C",
      note: "Thanh toán đợt 1",
    },
    {
      date: "16/10/2025",
      dealer: "Đại Phát",
      orderId: "DH00125",
      orderPrice: "700.000.000",
      paidAmount: "400.000.000",
      remainingAmount: "0",
      method: "Chuyển khoản",
      recorder: "Lê C",
      note: "Thanh toán đợt 2",
    },
    {
      date: "17/10/2025",
      dealer: "An Bình",
      orderId: "DH00126",
      orderPrice: "800.000.000",
      paidAmount: "800.000.000",
      remainingAmount: "0",
      method: "Chuyển khoản",
      recorder: "Phạm Z",
      note: "Thanh toán hoàn tất",
    },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            Lịch sử thanh toán
          </CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-900 border-b">
                <th className="p-2 border">Ngày</th>
                <th className="p-2 border">Đại lý</th>
                <th className="p-2 border">Đơn hàng</th>
                <th className="p-2 border">Giá đơn hàng (VNĐ)</th>
                <th className="p-2 border">Số tiền đã thanh toán (VNĐ)</th>
                <th className="p-2 border">Số tiền còn lại (VNĐ)</th>
                <th className="p-2 border">Hình thức</th>
                <th className="p-2 border">Người ghi nhận</th>
                <th className="p-2 border">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{item.date}</td>
                  <td className="p-2 border">{item.dealer}</td>
                  <td className="p-2 border">{item.orderId}</td>
                  <td className="p-2 border">{item.orderPrice}</td>
                  <td className="p-2 border text-green-700 font-semibold">
                    {item.paidAmount}
                  </td>
                  <td
                    className={`p-2 border font-semibold ${
                      item.remainingAmount === "0" ? "text-gray-500" : "text-red-600"
                    }`}
                  >
                    {item.remainingAmount}
                  </td>
                  <td className="p-2 border">{item.method}</td>
                  <td className="p-2 border">{item.recorder}</td>
                  <td className="p-2 border">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistoryPage;
