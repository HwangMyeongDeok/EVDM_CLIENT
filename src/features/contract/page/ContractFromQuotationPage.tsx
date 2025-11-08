import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Send } from "lucide-react";
import { ContractService } from "../service";
import { type Quotation } from "../types";

export default function ContractFromQuotationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quotationId = searchParams.get("quotationId");

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form state
  const [paymentPlan, setPaymentPlan] = useState<"FULL" | "DEPOSIT">("FULL");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  // UI state
  const [activeTab, setActiveTab] = useState("Thông tin cơ bản");

  // Fetch quotation
  useEffect(() => {
    if (!quotationId) return;
    setLoading(true);
    ContractService.fetchQuotationById(Number(quotationId))
      .then((data) => {
        setQuotation(data);
        setPaymentPlan("FULL");
        setDepositAmount(0);
        setDeliveryDate("");
      })
      .catch(() => toast.error("Không tải được thông tin báo giá"))
      .finally(() => setLoading(false));
  }, [quotationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationId) return;

    if (paymentPlan === "DEPOSIT" && depositAmount <= 0) {
      toast.error("Vui lòng nhập số tiền đặt cọc hợp lệ");
      return;
    }

    setSubmitLoading(true);
    try {
  const payload = {
    payment_plan: paymentPlan,
    deposit_amount: paymentPlan === "DEPOSIT" ? depositAmount : 0,
    delivery_date: deliveryDate || undefined,
  };

  await ContractService.createFromQuotation(
    Number(quotationId),
    payload
  );

  toast.success("Tạo hợp đồng thành công!");

  // 👉 Điều hướng về trang danh sách hợp đồng thay vì chi tiết hợp đồng
  navigate("/dealer/staff/contracts");
} catch (err: any) {
  const msg =
    err.response?.data?.message ||
    (err.response?.status === 500
      ? "Lỗi hệ thống khi tạo hợp đồng"
      : "Không thể tạo hợp đồng từ báo giá này");
  toast.error(msg);
} finally {
  setSubmitLoading(false);
}

  };

  if (loading)
    return <div className="p-6 text-center">Đang tải thông tin báo giá...</div>;
  if (!quotation)
    return (
      <div className="p-6 text-center text-red-500">
        Không tìm thấy báo giá
      </div>
    );

  // ✅ Cập nhật lại thứ tự tabs
  const tabs = [
    "Thông tin cơ bản",
    "Điều khoản",
    "Thanh toán",
    "Giao xe",
    "File & Ghi chú",
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold">Tạo hợp đồng mới</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            form="create-contract-form"
            disabled={submitLoading}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitLoading ? "Đang gửi..." : "Gửi duyệt"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl overflow-hidden text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 transition-colors ${activeTab === tab
              ? "bg-white shadow font-semibold text-black"
              : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form content */}
      <form id="create-contract-form" onSubmit={handleSubmit} className="space-y-6">
        {/* --- Thông tin cơ bản --- */}
        {activeTab === "Thông tin cơ bản" && (
          <>
            {/* Thông tin khách hàng */}
            <div className="p-4 border rounded-xl space-y-2">
              <h2 className="font-semibold text-lg">Thông tin khách hàng</h2>
              <p className="text-sm text-gray-500">
                Thông tin chi tiết khách hàng và CCCD
              </p>
              <div className="mt-3 space-y-1">
                <p>Họ tên: {quotation.customer?.full_name || "N/A"}</p>
                <p>SĐT: {quotation.customer?.phone || "N/A"}</p>
                <p>Email: {quotation.customer?.email || "N/A"}</p>
              </div>
            </div>

            {/* Thông tin xe */}
            <div className="p-4 border rounded-xl space-y-2">
              <h2 className="font-semibold text-lg">Thông tin xe</h2>
              <p className="text-sm text-gray-500">
                Danh sách xe và thông số kỹ thuật
              </p>
              <div className="mt-3 space-y-1">
                <p>Model: {quotation.variant?.vehicle?.model_name || "N/A"}</p>
                <p>Màu: {quotation.variant?.color || "N/A"}</p>
                <p>
                  Giá xe:{" "}
                  {quotation.total_amount
                    ? quotation.total_amount.toLocaleString() + " ₫"
                    : "0 ₫"}
                </p>
              </div>

              <div className="mt-6 border-t pt-3 text-right text-sm space-y-1">
                <p>
                  Tạm tính:{" "}
                  <span className="font-medium">
                    {quotation.total_amount?.toLocaleString()} ₫
                  </span>
                </p>
                <p>
                  VAT (10%):{" "}
                  <span className="font-medium">
                    {(
                      (quotation.total_amount || 0) * 0.1
                    ).toLocaleString()} ₫
                  </span>
                </p>
                <p className="text-lg font-semibold mt-1">
                  Tổng cộng:{" "}
                  <span>
                    {(
                      (quotation.total_amount || 0) * 1.1
                    ).toLocaleString()} ₫
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* --- Điều khoản (Read-only) --- */}
        {activeTab === "Điều khoản" && (
          <div className="p-6 border rounded-xl bg-gray-50 text-sm leading-relaxed space-y-3 overflow-y-auto max-h-[70vh]">
            <h2 className="text-lg font-semibold mb-1 text-left">
              Điều khoản & Điều kiện
            </h2>
            <p className="text-sm text-gray-500 mb-4 text-left">
              Các điều khoản và điều kiện của hợp đồng
            </p>


            <pre className="whitespace-pre-wrap font-sans text-gray-700">
              {`Điều 1: Đối tượng của hợp đồng
1.1. Bên bán cam kết bán và giao xe điện cho Bên mua theo đúng quy cách, chủng loại, số lượng và giá cả như đã thỏa thuận trong hợp đồng này.
1.2. Bên mua cam kết mua và thanh toán đầy đủ cho Bên bán theo các điều khoản đã thỏa thuận.

Điều 2: Giá trị hợp đồng và phương thức thanh toán
2.1. Tổng giá trị hợp đồng đã bao gồm thuế VAT và các chi phí liên quan.
2.2. Bên mua thanh toán theo phương thức đã chọn (thanh toán toàn bộ hoặc đặt cọc).
2.3. Trong trường hợp đặt cọc, Bên mua phải thanh toán số tiền còn lại trước khi nhận xe.
2.4. Tiền đặt cọc sẽ không được hoàn lại nếu Bên mua đơn phương hủy hợp đồng.

Điều 3: Thời gian và địa điểm giao xe
3.1. Bên bán cam kết giao xe theo đúng thời hạn đã thỏa thuận trong hợp đồng.
3.2. Địa điểm giao xe được xác định cụ thể trong hợp đồng.
3.3. Trong trường hợp chậm giao xe do lỗi của Bên bán, Bên mua có quyền hủy hợp đồng và được hoàn lại toàn bộ số tiền đã thanh toán.

Điều 4: Nghĩa vụ và quyền lợi của Bên bán
4.1. Giao xe đúng chủng loại, số lượng, chất lượng và thời gian đã cam kết.
4.2. Cung cấp đầy đủ giấy tờ xe, sách hướng dẫn sử dụng và chứng từ bảo hành.
4.3. Hướng dẫn Bên mua sử dụng xe và các thao tác bảo dưỡng cơ bản.
4.4. Được nhận đầy đủ số tiền thanh toán theo hợp đồng.

Điều 5: Nghĩa vụ và quyền lợi của Bên mua
5.1. Thanh toán đầy đủ và đúng hạn theo thỏa thuận.
5.2. Kiểm tra xe khi nhận hàng và ký xác nhận tình trạng xe.
5.3. Được hưởng chế độ bảo hành theo quy định của nhà sản xuất.
5.4. Từ chối nhận xe nếu xe không đúng quy cách hoặc có khuyết tật.

Điều 6: Bảo hành
6.1. Xe được bảo hành theo chính sách của nhà sản xuất.
6.2. Bảo hành không áp dụng trong các trường hợp: sử dụng sai mục đích, tự ý sửa chữa, tai nạn, thiên tai.
6.3. Chi phí bảo dưỡng định kỳ do Bên mua chịu.

Điều 7: Chuyển giao quyền sở hữu và rủi ro
7.1. Quyền sở hữu xe chuyển cho Bên mua khi đã thanh toán đầy đủ.
7.2. Rủi ro đối với xe chuyển cho Bên mua khi đã ký biên bản bàn giao.

Điều 8: Trách nhiệm do vi phạm hợp đồng
8.1. Bên vi phạm hợp đồng phải bồi thường thiệt hại cho bên bị vi phạm.
8.2. Trường hợp bất khả kháng, các bên được miễn trừ trách nhiệm theo quy định pháp luật.

Điều 9: Giải quyết tranh chấp
9.1. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng.
9.2. Nếu không thương lượng được, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.

Điều 10: Điều khoản cuối cùng
10.1. Hợp đồng có hiệu lực kể từ ngày ký.
10.2. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.
10.3. Mọi sửa đổi, bổ sung hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.`}
            </pre>
          </div>
        )}

        {/* --- Thanh toán --- */}
        {activeTab === "Thanh toán" && (
          <div className="p-4 border rounded-xl space-y-4">
            <div>
              <label className="block font-medium mb-1">Phương thức thanh toán</label>
              <p className="text-sm text-gray-500 mb-4 text-left">
                Chọn hình thức thanh toán
              </p>
              <label className="block font-medium mb-1">Hình thức thanh toán</label>
              <select
                value={paymentPlan}
                onChange={(e) =>
                  setPaymentPlan(e.target.value as "FULL" | "DEPOSIT")
                }
                className="border rounded-lg px-2 py-1"
                style={{ width: "auto", minWidth: "fit-content" }}
              >
                <option value="FULL">Thanh toán toàn bộ</option>
                <option value="DEPOSIT">Đặt cọc</option>
              </select>

            </div>

            {paymentPlan === "DEPOSIT" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="font-medium whitespace-nowrap">
                    Chọn tỷ lệ đặt cọc:
                  </label>
                  <select
                    onChange={(e) => {
                      const percent = Number(e.target.value);
                      const amount = ((quotation.total_amount || 0) * percent) / 100;
                      setDepositAmount(amount);
                    }}
                    className="w-[160px] border rounded-lg p-2"
                  >
                    <option value="">-- Chọn tỷ lệ --</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                    <option value="30">30%</option>
                    <option value="50">50%</option>
                  </select>
                </div>
                {/* Thông báo lưu ý */}
                <div className="border-l-4 border-yellow-400 bg-yellow-50 text-yellow-700 p-3 text-sm rounded">
                  Lưu ý: Số tiền còn lại phải được thanh toán đầy đủ trước khi nhận xe.
                  Tiền đặt cọc không được hoàn lại nếu khách hàng hủy đơn hàng.
                </div>
              </div>
            )}

            {/* Hiển thị chi tiết thanh toán (UI giống hình) */}
            
              <div className="border-b pb-2 mb-3 flex justify-between items-center">
                <span className="font-semibold text-base">Tổng giá trị hợp đồng:</span>
                <span className="font-bold text-lg text-black">
                  {quotation.total_amount?.toLocaleString() || 0} ₫
                </span>
              </div>

              {paymentPlan === "FULL" ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Thanh toán ngay:</span>
                  <span className="text-green-700 font-semibold">
                    {quotation.total_amount?.toLocaleString() || 0} ₫
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      Đặt cọc (
                      {((depositAmount / (quotation.total_amount || 1)) * 100).toFixed(0)}%)
                      :
                    </span>
                    <span className="text-green-700 font-semibold">
                      {depositAmount.toLocaleString()} ₫
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Còn lại:</span>
                    <span className="text-orange-600 font-semibold">
                      {Math.max(
                        (quotation.total_amount || 0) - depositAmount,
                        0
                      ).toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              )}
            </div>
         
        )}



        {/* --- Giao xe --- */}
        {activeTab === "Giao xe" && (
          <div className="p-4 border rounded-xl space-y-4">
            <label className="block font-medium mb-1">Thông tin giao xe</label>
            <p className="text-sm text-gray-500 mb-4 text-left">
              Thời hạn giao xe
            </p>
            <label className="block font-medium mb-1">
              Ngày giao xe
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
        )}

        {/* --- File & Ghi chú --- */}
        {activeTab === "File & Ghi chú" && (
          <div className="p-4 border rounded-xl text-gray-500 italic text-center">
            (Chưa có nội dung)
          </div>
        )}
      </form>
    </div>
  );
}
