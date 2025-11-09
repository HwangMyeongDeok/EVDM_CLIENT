import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Loader2, ArrowLeft, Save, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

// --- THAY ĐỔI 1: Thêm lại 'useGetDealerAllocationsQuery' ---
import {
  useGetDealerAllocationsQuery, // <-- Thêm lại hook này
  useCreateDealerAllocationMutation,
  useUpdateDealerAllocationMutation,
  useDeleteDealerAllocationMutation,
} from "@/features/allocation/api";

import { useGetDealerRequestByIdQuery } from "@/features/order/api";

import type {
  DealerVehicleAllocation,
} from "@/types/dealer_vehicle_allocation";
import type { IVehicleVariant } from "@/types/vehicle";
import type { Items } from "@/types/dealer_vehicle_request";

export default function ManufacturerDeliveryBatchCreatePage() {
  const { request_id } = useParams<{ request_id: string }>();
  const navigate = useNavigate();

  // --- API 1: Fetch request (Hợp đồng) ---
  const { 
    data: request, 
    isLoading: isLoadingRequest,
    // Không cần 'refetch' nữa
  } = useGetDealerRequestByIdQuery(request_id ?? "");

  // --- THAY ĐỔI 2: Thêm lại API 2 (Lấy đợt giao) ---
  const {
    data: allocationResponse,
    isLoading: isLoadingAllocations, // Thêm lại 'isLoading'
  } = useGetDealerAllocationsQuery({
    request_id: request_id ? Number(request_id) : undefined,
  });

  // --- THAY ĐỔI 3: Lấy 'allocations' từ API 2 ---
  const allocations: DealerVehicleAllocation[] = allocationResponse?.data ?? [];

  // --- Mutations (Giữ nguyên) ---
  const [addAllocation, { isLoading: isAdding }] = useCreateDealerAllocationMutation();
  const [updateAllocation, { isLoading: isUpdating }] = useUpdateDealerAllocationMutation();
  const [deleteAllocation] = useDeleteDealerAllocationMutation();

  // --- State (Giữ nguyên) ---
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [newAllocatedQuantity, setNewAllocatedQuantity] = useState<number>(0);
  const [newDeliveryBatch, setNewDeliveryBatch] = useState<string>("1");
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Lấy 'vehicles' từ 'request' (Đã sửa lỗi type/race condition) ---
  const vehicles: IVehicleVariant[] =
    (request?.items
      ?.map((item: Items) => item.variant) as (IVehicleVariant | undefined)[])
      ?.filter((v): v is IVehicleVariant => v !== undefined) 
    ?? [];

  // --- Map (Giữ nguyên) ---
  const variantMap = new Map<string, IVehicleVariant>();
  vehicles.forEach((v) =>
    variantMap.set(v.variant_id.toString(), v)
  );

  // --- useEffect (Giữ nguyên) ---
  useEffect(() => {
    if (vehicles.length && !selectedVariantId) {
      setSelectedVariantId(vehicles[0].variant_id.toString());
    }
  }, [vehicles, selectedVariantId]);

  // --- Filter allocations (Giữ nguyên) ---
  const filteredAllocations = allocations.filter((a) =>
    a.items.some((item) => item.variant_id.toString() === selectedVariantId)
  );

  // --- Tính toán (Giữ nguyên) ---
  const totalAllocated = filteredAllocations.reduce((sum, alloc) => {
    const item = alloc.items.find((i) => i.variant_id.toString() === selectedVariantId);
    return sum + (item?.quantity ?? 0);
  }, 0);

  const currentItem = request?.items?.find((i: Items) => i.variant_id.toString() === selectedVariantId);
  const remainingQuantity = (currentItem?.requested_quantity ?? 0) - totalAllocated;

  // --- Auto tăng batch (Giữ nguyên) ---
  useEffect(() => {
    if (filteredAllocations.length > 0) {
      const maxBatch = Math.max(
        ...filteredAllocations.map((a) => Number(a.delivery_batch) || 0),
        0
      );
      setNewDeliveryBatch((maxBatch + 1).toString());
    } else {
      setNewDeliveryBatch("1");
    }
  }, [filteredAllocations]);

  // --- Thêm/sửa allocation (Giữ nguyên logic) ---
  const handleSaveAllocation = async () => {
    // (Giữ nguyên logic kiểm tra và tính 'remaining')
    if (!selectedVariantId) {
      toast.error("Vui lòng chọn xe cần giao!");
      return;
    }
    if (newAllocatedQuantity <= 0 || !newDeliveryDate) {
      toast.warning("Vui lòng nhập số lượng và ngày giao hợp lệ!");
      return;
    }
    let remaining = (currentItem?.requested_quantity ?? 0) - totalAllocated;
    if (editingId) {
      const allocToEdit = filteredAllocations.find(
        (a) => Number(a.allocation_id) === editingId
      );
      const itemToEdit = allocToEdit?.items.find(
        (i) => i.variant_id.toString() === selectedVariantId
      );
      if (itemToEdit) {
        remaining += itemToEdit.quantity;
      }
    }
    if (newAllocatedQuantity > remaining) {
      toast.error("Số lượng giao vượt quá số lượng còn lại!");
      return;
    }

    // (Giữ nguyên logic try/catch)
    try {
      if (editingId) {
        // (Logic Sửa)
        const allocToEdit = filteredAllocations.find(
          (a) => Number(a.allocation_id) === editingId
        );
        if (!allocToEdit) throw new Error("Allocation không tồn tại!");
        const updatedItems = allocToEdit.items.map((item) => ({
          item_id: item.item_id,
          variant_id: item.variant_id,
          quantity:
            item.variant_id.toString() === selectedVariantId
              ? newAllocatedQuantity
              : item.quantity,
        }));
        await updateAllocation({
          id: editingId,
          body: {
            delivery_batch: newDeliveryBatch,
            delivery_date: newDeliveryDate,
            items: updatedItems,
          },
        }).unwrap();
        toast.success("✅ Cập nhật đợt giao hàng thành công!");
      } else {
        // (Logic Thêm)
        await addAllocation({
          request_id: Number(request_id),
          dealer_id: Number(request?.dealer_id ?? 0),
          delivery_batch: Number(newDeliveryBatch),
          delivery_date: newDeliveryDate,
          items: [
            {
              variant_id: Number(selectedVariantId),
              quantity: newAllocatedQuantity,
            },
          ],
        }).unwrap();
        toast.success("🚚 Thêm đợt giao hàng thành công!");
      }
      setNewAllocatedQuantity(0);
      setNewDeliveryDate("");
      setEditingId(null);
      
      // --- THAY ĐỔI 4: Xóa 'refetchRequest()' ---
      // refetchRequest(); // <-- KHÔNG CẦN NỮA
      
    } catch (err) {
      console.error(err);
      toast.error("❌ Có lỗi xảy ra khi lưu đợt giao hàng! (Kiểm tra lỗi 400 BE)");
    }
  };

  // --- Sửa (Giữ nguyên) ---
  const handleEditAllocation = (allocation: DealerVehicleAllocation) => {
    // (Logic giữ nguyên)
    const item = allocation.items.find(
      (i) => i.variant_id.toString() === selectedVariantId
    );
    if (!item) return;
    setNewAllocatedQuantity(item.quantity);
    setNewDeliveryBatch(allocation.delivery_batch?.toString() ?? "1");
    setNewDeliveryDate(
      allocation.delivery_date
        ? new Date(allocation.delivery_date).toISOString().split("T")[0]
        : ""
    );
    setEditingId(Number(allocation.allocation_id) ?? null);
    setSelectedVariantId(item.variant_id.toString());
  };

  // --- Xóa (Giữ nguyên) ---
  const handleDeleteAllocation = async (allocation_id: number) => {
    try {
      await deleteAllocation(allocation_id).unwrap();
      toast.success("🗑️ Đã xóa đợt giao hàng!");
      
      // --- THAY ĐỔI 5: Xóa 'refetchRequest()' ---
      // refetchRequest(); // <-- KHÔNG CẦN NỮA
      
    } catch (err) {
      console.error(err);
      toast.error("❌ Có lỗi xảy ra khi xóa!");
    }
  };

  // --- Loading / Error (Sửa lại) ---
  // --- THAY ĐỔI 6: Thêm lại 'isLoadingAllocations' ---
  if (isLoadingRequest || isLoadingAllocations) 
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  if (!request)
    return (
      <div className="p-8 text-center text-red-600">
        Không tìm thấy đơn hàng hoặc lỗi tải dữ liệu!
      </div>
    );

  // --- JSX (Giữ nguyên) ---
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Tạo đợt giao hàng cho từng xe
          </CardTitle>
        </CardHeader>
        <CardContent>
           {/* --- Chọn xe --- */}
           <div className="mb-6">
            <Label>Chọn xe cần giao:</Label>
            <select
              className="w-full border p-2 rounded-md"
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              {vehicles.map((variant) => {
                 const item = request.items.find(i => Number(i.variant_id) === variant.variant_id);
                 const requestedQty = item?.requested_quantity ?? 0;
                return (
                  <option key={variant.variant_id} value={variant.variant_id}>
                    {variant?.version ?? "Không rõ"} - {variant?.color ?? "Không rõ"}{" "}
                    (SL: {requestedQty})
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* --- Thông tin tổng --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <Label>ID Đơn hàng</Label>
              <Input value={request.request_id} readOnly />
            </div>
            <div>
              <Label>Đại lý</Label>
              <Input value={request.dealer?.dealer_name ?? ""} readOnly />
            </div>
            <div>
              <Label>Tổng SL đặt xe này</Label>
              <Input value={currentItem?.requested_quantity ?? 0} readOnly />
            </div>
            <div>
              <Label>SL đã giao</Label>
              <Input value={totalAllocated} readOnly />
            </div>
            <div>
              <Label>SL còn lại</Label>
              <Input value={remainingQuantity} readOnly />
            </div>
          </div>
          
          {/* --- Form thêm/sửa --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <Label>Ngày giao (dự kiến)</Label>
              <Input
                type="date"
                value={newDeliveryDate}
                onChange={(e) => setNewDeliveryDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Số lượng giao (đợt này)</Label>
              <Input
                type="number"
                value={newAllocatedQuantity}
                onChange={(e) =>
                  setNewAllocatedQuantity(parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label>Batch (Lô hàng)</Label>
              <Input value={newDeliveryBatch} readOnly />
            </div>
          </div>
          
          {/* --- Nút bấm --- */}
          <div className="flex justify-end mb-8">
            <Button
              onClick={handleSaveAllocation}
              disabled={isAdding || isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingId ? "Cập nhật" : "Thêm đợt giao"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setNewAllocatedQuantity(0);
                  setNewDeliveryDate("");
                  setEditingId(null);
                }}
              >
                Hủy
              </Button>
            )}
          </div>
          
          {/* --- Table allocations --- */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Tổng số lượng</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.length > 0 ? (
                  filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.allocation_id}>
                      <TableCell>{allocation.allocation_id}</TableCell>
                      <TableCell>
                        {allocation.items
                          .map((i) => {
                            const variant = variantMap.get(
                              i.variant_id.toString()
                            );
                            return `${variant?.version ?? "N/A"} - ${
                              variant?.color ?? ""
                            } (SL: ${i.quantity})`;
                          })
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        {allocation.items.reduce(
                          (sum, i) => sum + i.quantity,
                          0
                        )}
                      </TableCell>
                      <TableCell>{allocation.delivery_batch ?? "N/A"}</TableCell>
                      <TableCell>
                        {allocation.delivery_date
                          ? new Date(allocation.delivery_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {allocation.allocation_date
                          ? new Date(
                              allocation.allocation_date
                            ).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAllocation(allocation)}
                          disabled={!allocation.items.some(i => i.variant_id.toString() === selectedVariantId)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteAllocation(
                              Number(allocation.allocation_id!)
                            )
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Chưa có đợt giao hàng nào cho xe này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}