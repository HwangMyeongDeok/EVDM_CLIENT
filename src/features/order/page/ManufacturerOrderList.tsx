import {
  useGetDealerRequestsQuery,
  useUpdateDealerRequestStatusMutation,
} from "@/features/order/api";

export default function ManufacturerDealerRequestList() {
  const { data: dealerRequests = [], isLoading } = useGetDealerRequestsQuery();
  const [updateDealerRequestStatus] = useUpdateDealerRequestStatusMutation();

  if (isLoading) return <p>Đang tải yêu cầu từ đại lý...</p>;

  const handleApprove = (id: string) =>
    updateDealerRequestStatus({ id, status: "APPROVED" });

  const handleReject = (id: string) =>
    updateDealerRequestStatus({ id, status: "REJECTED" });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách yêu cầu từ đại lý</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Mã yêu cầu</th>
            <th>Đại lý</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {dealerRequests.map((request) => (
            <tr key={request.request_id} className="border-t">
              <td>{request.request_id}</td>
              <td>{request.dealer_id}</td>
              <td>{request.requested_quantity}</td>
              <td>{request.status}</td>
              <td className="space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleApprove(request.request_id)}
                >
                  Duyệt
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleReject(request.request_id)}
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
