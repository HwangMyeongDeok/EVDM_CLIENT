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
import {
  Loader2,
  ArrowLeft,
  Save,
  Edit,
  Trash,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import {
  useGetDealerVehicleAllocationsQuery,
  useCreateDealerVehicleAllocationMutation,
  useUpdateDealerVehicleAllocationMutation,
  useDeleteDealerVehicleAllocationMutation,
} from "@/features/allocation/api"; 
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { DealerVehicleAllocation } from "@/types/dealer_vehicle_allocation";
import { useGetDealerRequestByIdQuery } from "@/features/order/api";
import type { IVehicleVariant } from "@/types/vehicle";

export default function ManufacturerDeliveryBatchCreatePage() {
  const { request_id } = useParams<{ request_id: string }>();
  const navigate = useNavigate();

  // --- Fetch request ---
  const { data: request, isLoading: isLoadingRequest, isError: isErrorRequest } =
    useGetDealerRequestByIdQuery(request_id ?? "");

  // --- Fetch allocations ---
  const {
    data: allocations = [],
    isLoading: isLoadingAllocations,
    refetch: refetchAllocations,
    isError: isErrorAllocations,
  } = useGetDealerVehicleAllocationsQuery({ request_id: request_id ?? undefined });

  // --- Fetch vehicles ---
  const { data: vehicles = [] } = useGetVehiclesQuery();

  // --- Mutation hooks ---
  const [addAllocation, { isLoading: isAdding }] = useCreateDealerVehicleAllocationMutation();
  const [updateAllocation, { isLoading: isUpdating }] = useUpdateDealerVehicleAllocationMutation();
  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteDealerVehicleAllocationMutation();

  // --- Local state ---
  const [newAllocatedQuantity, setNewAllocatedQuantity] = useState<number>(0);
  const [newDeliveryBatch, setNewDeliveryBatch] = useState<string>("");
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Map variant_id -> variant object ---
  const variantMap = new Map<string, IVehicleVariant>();
  vehicles.forEach((v) =>
    v.variants.forEach((variant) =>
      variantMap.set(variant.variant_id.toString(), variant)
    )
  );
  const variant = request ? variantMap.get(request.variant_id.toString()) : null;

  // --- Tổng số lượng đã giao ---
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated_quantity, 0);

  // --- Số lượng còn lại ---
  const remainingQuantity = (request?.requested_quantity ?? 0) - totalAllocated;

  // --- Thêm/sửa allocation ---
  const handleSaveAllocation = async () => {
    if (newAllocatedQuantity <= 0 || !newDeliveryDate) {
      alert("Vui lòng nhập số lượng giao và ngày giao hợp lệ!");
      return;
    }

    const remaining =
      (request?.requested_quantity ?? 0) -
      totalAllocated +
      (editingId
        ? allocations.find((a) => a.allocation_id === editingId)?.allocated_quantity ?? 0
        : 0);

    if (newAllocatedQuantity > remaining) {
      alert("Số lượng giao vượt quá số lượng còn lại!");
      return;
    }

    const allocationData: Partial<DealerVehicleAllocation> = {
      request_id,
      dealer_id: request?.dealer_id ?? "",
      variant_id: request?.variant_id ?? "",
      allocated_quantity: newAllocatedQuantity,
      delivery_batch: newDeliveryBatch,
      delivery_date: newDeliveryDate,
    };

    try {
      if (editingId) {
        await updateAllocation({ id: editingId, body: allocationData }).unwrap();
        alert("Đã cập nhật đợt giao hàng!");
      } else {
        await addAllocation(allocationData).unwrap();
        alert("Đã thêm đợt giao hàng mới!");
      }

      // Reset input
      setNewAllocatedQuantity(0);
      setNewDeliveryBatch("");
      setNewDeliveryDate("");
      setEditingId(null);

      // Refetch allocations
      refetchAllocations();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    }
  };

  // --- Chỉnh sửa allocation ---
  const handleEditAllocation = (allocation: DealerVehicleAllocation) => {
    setNewAllocatedQuantity(allocation.allocated_quantity);
    setNewDeliveryBatch(allocation.delivery_batch ?? "");
    setNewDeliveryDate(allocation.delivery_date ?? "");
    setEditingId(allocation.allocation_id ?? null);
  };

  // --- Xóa allocation ---
  const handleDeleteAllocation = async (allocation_id: string) => {
    try {
      await deleteAllocation(allocation_id).unwrap();
      alert("Đã xóa đợt giao hàng!");
      refetchAllocations();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xóa!");
    }
  };

  // --- Loading / Error ---
  if (isLoadingRequest || isLoadingAllocations)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );

  if (isErrorRequest || isErrorAllocations || !request)
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-600">
          Không tìm thấy đơn hàng hoặc lỗi tải dữ liệu!
        </p>
      </div>
    );

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tạo đợt giao hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Thông tin read-only */}
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
              <Label>Phiên bản</Label>
              <Input value={variant?.version ?? "N/A"} readOnly />
            </div>
            <div>
              <Label>Mẫu xe</Label>
              <Input value={variant?.color ?? "N/A"} readOnly />
            </div>
            <div>
              <Label>Tổng số lượng đặt</Label>
              <Input value={request.requested_quantity} readOnly />
            </div>
            <div>
              <Label>Số lượng đã giao</Label>
              <Input value={totalAllocated} readOnly />
            </div>
            <div>
              <Label>Số lượng còn lại</Label>
              <Input value={remainingQuantity} readOnly />
            </div>
          </div>

          {/* Form thêm/sửa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <Label htmlFor="delivery-date">Ngày giao (dự kiến)</Label>
              <Input
                id="delivery-date"
                type="date"
                value={newDeliveryDate}
                onChange={(e) => setNewDeliveryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="allocated-quantity">Số lượng giao (đợt này)</Label>
              <Input
                id="allocated-quantity"
                type="number"
                value={newAllocatedQuantity}
                onChange={(e) => setNewAllocatedQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="delivery-batch">Batch (Lô hàng) (tùy chọn)</Label>
              <Input
                id="delivery-batch"
                value={newDeliveryBatch}
                onChange={(e) => setNewDeliveryBatch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <Button onClick={handleSaveAllocation} disabled={isAdding || isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {editingId ? "Cập nhật" : "Thêm đợt giao"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setNewAllocatedQuantity(0);
                  setNewDeliveryBatch("");
                  setNewDeliveryDate("");
                  setEditingId(null);
                }}
              >
                Hủy
              </Button>
            )}
          </div>

          {/* Table allocations */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>ID Allocation</TableHead>
                  <TableHead>Đại lý</TableHead>
                  <TableHead>ID Phiên bản</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead>Ngày allocation</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.length > 0 ? (
                  allocations.map((allocation: DealerVehicleAllocation) => (
                    <TableRow key={allocation.allocation_id}>
                      <TableCell>{allocation.allocation_id}</TableCell>
                      <TableCell>{allocation.dealer?.dealer_name}</TableCell>
                      <TableCell>{allocation.variant_id}</TableCell>
                      <TableCell>{allocation.allocated_quantity}</TableCell>
                      <TableCell>{allocation.delivery_batch}</TableCell>
                      <TableCell>{allocation.delivery_date ?? "N/A"}</TableCell>
                      <TableCell>{allocation.allocation_date ?? "N/A"}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAllocation(allocation)}
                          disabled={isUpdating || isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isUpdating || isDeleting}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa đợt giao này?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteAllocation(allocation.allocation_id!)
                                }
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Chưa có đợt giao hàng nào.
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
