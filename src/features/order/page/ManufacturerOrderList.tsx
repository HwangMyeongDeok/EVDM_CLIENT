import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "@/features/order/api";

export default function ManufacturerOrderList() {
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  if (isLoading) return <p>Đang tải đơn hàng...</p>;

  const handleApprove = (id: string) => updateOrderStatus({ id, status: "APPROVED" });
  const handleReject = (id: string) => updateOrderStatus({ id, status: "REJECTED" });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách đơn hàng từ đại lý</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Mã đơn</th>
            <th>Đại lý</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.request_id} className="border-t">
              <td>{order.request_id}</td>
              <td>{order.dealer_id}</td>
              <td>{order.requested_quantity}</td>
              <td>{order.status}</td>
              <td className="space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleApprove(order.request_id)}
                >
                  Duyệt
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleReject(order.request_id)}
                >
                  Từ chối
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
