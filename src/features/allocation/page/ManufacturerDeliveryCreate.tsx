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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Save,
  Edit,
  Trash,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import {
  useGetDealerVehicleAllocationsQuery,
  useCreateDealerVehicleAllocationMutation,
  useUpdateDealerVehicleAllocationMutation,
  useDeleteDealerVehicleAllocationMutation,
} from "@/features/allocation/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { DealerVehicleAllocation } from "@/types/dealer_vehicle_allocation";
import type { IVehicleVariant } from "@/types/vehicle";



export default function ManufacturerDeliveryBatchCreatePage() {
  const { request_id } = useParams<{ request_id: string }>(); // Nếu liên kết với request_id
  const navigate = useNavigate();

  const {
    data: allocations = [],
    isLoading: isLoadingAllocations,
    refetch: refetchAllocations,
  } = useGetDealerVehicleAllocationsQuery({ request_id: request_id ?? undefined }); // Truyền optional

  const { data: vehicles = [] } = useGetVehiclesQuery();
  const [addAllocation, { isLoading: isAdding }] = useCreateDealerVehicleAllocationMutation();
  const [updateAllocation, { isLoading: isUpdating }] = useUpdateDealerVehicleAllocationMutation();
  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteDealerVehicleAllocationMutation();

  const [newDealerId, setNewDealerId] = useState<string>("");
  const [newVariantId, setNewVariantId] = useState<string>("");
  const [newAllocatedQuantity, setNewAllocatedQuantity] = useState<number>(0);
  const [newDeliveryBatch, setNewDeliveryBatch] = useState<string>("");
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Map variant_id -> variant object
  const variantMap = new Map<string, IVehicleVariant>();
  vehicles.forEach((v) =>
    v.variants.forEach((variant) =>
      variantMap.set(variant.variant_id.toString(), variant)
    )
  );

  // --- Hàm thêm/sửa allocation ---
  const handleSaveAllocation = async () => {
    if (!newDealerId || !newVariantId || newAllocatedQuantity <= 0 || !newDeliveryBatch || !newDeliveryDate) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const allocationData: Partial<DealerVehicleAllocation> = {
      request_id,
      dealer_id: newDealerId,
      variant_id: newVariantId,
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
      setNewDealerId("");
      setNewVariantId("");
      setNewAllocatedQuantity(0);
      setNewDeliveryBatch("");
      setNewDeliveryDate("");
      setEditingId(null);
      refetchAllocations();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    }
  };

  // --- Hàm chỉnh sửa allocation ---
  const handleEditAllocation = (allocation: DealerVehicleAllocation) => {
    setNewDealerId(allocation.dealer_id);
    setNewVariantId(allocation.variant_id);
    setNewAllocatedQuantity(allocation.allocated_quantity);
    setNewDeliveryBatch(allocation.delivery_batch);
    setNewDeliveryDate(allocation.delivery_date ?? "");
    setEditingId(allocation.allocation_id);
  };

  // --- Hàm xóa allocation ---
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

  if (isLoadingAllocations)
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">
          Đang tải danh sách đợt giao hàng...
        </p>
      </div>
    );

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tạo đợt giao hàng cho đại lý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <Label htmlFor="dealer-id">ID Đại lý</Label>
              <Input
                id="dealer-id"
                value={newDealerId}
                onChange={(e) => setNewDealerId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="variant-id">ID Phiên bản xe</Label>
              <Input
                id="variant-id"
                value={newVariantId}
                onChange={(e) => setNewVariantId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="allocated-quantity">Số lượng giao</Label>
              <Input
                id="allocated-quantity"
                type="number"
                value={newAllocatedQuantity}
                onChange={(e) => setNewAllocatedQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="delivery-batch">Đợt giao hàng</Label>
              <Input
                id="delivery-batch"
                value={newDeliveryBatch}
                onChange={(e) => setNewDeliveryBatch(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="delivery-date">Ngày giao</Label>
              <Input
                id="delivery-date"
                type="date"
                value={newDeliveryDate}
                onChange={(e) => setNewDeliveryDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
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
                    setNewDealerId("");
                    setNewVariantId("");
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
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>ID Allocation</TableHead>
                  <TableHead>ID Đại lý</TableHead>
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
                      <TableCell>{allocation.dealer_id}</TableCell>
                      <TableCell>{allocation.variant_id}</TableCell>
                      <TableCell>{allocation.allocated_quantity}</TableCell>
                      <TableCell>{allocation.delivery_batch}</TableCell>
                      <TableCell>{allocation.delivery_date || "N/A"}</TableCell>
                      <TableCell>{allocation.allocation_date || "N/A"}</TableCell>
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
                              <AlertDialogAction onClick={() => handleDeleteAllocation(allocation.allocation_id)}>
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