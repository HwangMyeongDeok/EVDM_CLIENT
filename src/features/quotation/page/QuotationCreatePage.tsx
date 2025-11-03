import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, ArrowLeft, FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createQuotation, getQuotationById, updateQuotation } from "../api";
import { useGetCustomersQuery } from "@/features/customers/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import type { IVehicleVariant } from "@/types/vehicle";

interface QuotationItem {
  variantId: number;
  quantity: number;
  description?: string;
  unitPrice?: number;
}

interface AddonItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  // Form state - Customer Info
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Form state - Vehicle Items
  const [items, setItems] = useState<QuotationItem[]>([
    { variantId: 0, quantity: 1 },
  ]);

  // Form state - Addons (Chi phí phụ: bảo hiểm, phụ kiện)
  const [addons, setAddons] = useState<AddonItem[]>([]);

  // Form state - Other
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Fetch data
  const { data: customersResponse } = useGetCustomersQuery();
  const { data: vehiclesData = [] } = useGetVehiclesQuery();
  const customers = customersResponse || [];

  // Flatten all variants from all vehicles
  const variants = vehiclesData.flatMap((vehicle) =>
    vehicle.variants.map((variant) => ({
      ...variant,
      vehicleModel: vehicle.model_name,
    }))
  );

  useEffect(() => {
    if (isEditMode && id) {
      loadQuotationData(Number.parseInt(id));
    }
  }, [isEditMode, id]);

  const loadQuotationData = async (quotationId: number) => {
    try {
      setLoadingData(true);
      const quotation = await getQuotationById(quotationId);

      setSelectedCustomerId(quotation.customer_id);
      setCustomerName(quotation.customer?.full_name || "");
      setCustomerPhone(quotation.customer?.phone || "");
      setCustomerEmail(quotation.customer?.email || "");
      setNotes(quotation.notes || "");
      setDiscount(Number.parseFloat(quotation.discount_total) || 0);

      // Map items from quotation
      const mappedItems = quotation.items.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
        description: item.description,
        unitPrice: Number.parseFloat(item.unit_price),
      }));

      setItems(mappedItems.length > 0 ? mappedItems : [{ variantId: 0, quantity: 1 }]);
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Không thể tải thông tin báo giá");
      navigate("/dealer/staff/quotations");
    } finally {
      setLoadingData(false);
    }
  };

  // Vehicle Items Management
  const addItem = () => {
    setItems([...items, { variantId: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error("Phải có ít nhất 1 xe");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Addon Management
  const addAddon = () => {
    setAddons([...addons, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  const updateAddon = (
    index: number,
    field: keyof AddonItem,
    value: string | number
  ) => {
    const newAddons = [...addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    setAddons(newAddons);
  };

  // Get variant info
  const getVariantInfo = (variantId: number) => {
    const variant = variants.find((v) => v.variant_id === variantId);
    if (!variant) return null;

    const vehicleModel = (variant as IVehicleVariant & { vehicleModel?: string }).vehicleModel || "N/A";
    const description = `${vehicleModel} - ${variant.version || "N/A"} (${variant.color || "N/A"})`;
    const price = variant.retail_price;

    return {
      variant,
      description,
      price,
    };
  };

  // Calculate totals
  const calculateTotal = () => {
    // Vehicle subtotal
    let vehicleSubtotal = 0;
    for (const item of items) {
      if (item.variantId === 0) continue;
      const variantInfo = getVariantInfo(item.variantId);
      if (variantInfo) {
        vehicleSubtotal += variantInfo.price * item.quantity;
      }
    }

    // Addon subtotal
    let addonSubtotal = 0;
    for (const addon of addons) {
      addonSubtotal += addon.quantity * addon.unitPrice;
    }

    const subtotal = vehicleSubtotal + addonSubtotal;
    const vatRate = 10; // 10% VAT
    const vatAmount = subtotal * (vatRate / 100);
    const totalBeforeDiscount = subtotal + vatAmount;
    const totalAmount = Math.max(0, totalBeforeDiscount - discount);

    return {
      vehicleSubtotal,
      addonSubtotal,
      subtotal,
      vatRate,
      vatAmount,
      totalBeforeDiscount,
      discount,
      totalAmount,
    };
  };

  const totals = calculateTotal();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Validate form
  const validateForm = () => {
    if (!selectedCustomerId) {
      toast.error("Vui lòng chọn khách hàng");
      return false;
    }

    if (items.every((item) => item.variantId === 0)) {
      toast.error("Vui lòng chọn ít nhất 1 xe");
      return false;
    }

    for (const item of items) {
      if (item.variantId !== 0 && item.quantity < 1) {
        toast.error("Số lượng xe phải lớn hơn 0");
        return false;
      }
    }

    for (const addon of addons) {
      if (!addon.description.trim()) {
        toast.error("Vui lòng nhập mô tả cho chi phí phụ");
        return false;
      }
      if (addon.quantity < 1) {
        toast.error("Số lượng chi phí phụ phải lớn hơn 0");
        return false;
      }
      if (addon.unitPrice < 0) {
        toast.error("Giá chi phí phụ không thể âm");
        return false;
      }
    }

    if (discount < 0) {
      toast.error("Giảm giá không thể âm");
      return false;
    }

    return true;
  };

  // Handle Save Draft
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const quotationData = {
        customerId: selectedCustomerId!,
        items: items
          .filter((item) => item.variantId !== 0)
          .map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        notes,
      };

      if (isEditMode && id) {
        await updateQuotation(Number.parseInt(id), {
          notes,
          discount_total: discount,
          total_amount: totals.totalAmount,
          status: "DRAFT",
        });
        toast.success("Đã lưu nháp báo giá");
      } else {
        await createQuotation(quotationData);
        toast.success("Đã tạo báo giá dạng nháp");
      }

      navigate("/dealer/staff/quotations");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Không thể lưu báo giá");
    } finally {
      setLoading(false);
    }
  };

  // Handle Send (mark as SENT)
  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateQuotation(Number.parseInt(id), {
          status: "SENT",
          discount_total: discount,
          total_amount: totals.totalAmount,
        });
        toast.success("Đã gửi báo giá cho khách hàng");
      } else {
        // Create and immediately mark as SENT
        const quotationData = {
          customerId: selectedCustomerId!,
          items: items
            .filter((item) => item.variantId !== 0)
            .map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          notes,
        };
        const created = await createQuotation(quotationData);
        await updateQuotation(created.quotation_id, { status: "SENT" });
        toast.success("Đã gửi báo giá cho khách hàng");
      }

      navigate("/dealer/staff/quotations");
    } catch (error) {
      console.error("Error sending quotation:", error);
      toast.error("Không thể gửi báo giá");
    } finally {
      setLoading(false);
    }
  };

  // Handle Preview (show PDF - placeholder)
  const handlePreview = () => {
    toast.info("Tính năng preview PDF sẽ được triển khai sau");
    // TODO: Implement PDF preview
  };

  // Auto-fill customer info when selecting from dropdown
  const handleCustomerSelect = (customerId: string) => {
    const id = Number.parseInt(customerId);
    setSelectedCustomerId(id);

    const customer = customers.find((c) => Number(c.customer_id) === id);
    if (customer) {
      setCustomerName(customer.full_name);
      setCustomerPhone(customer.phone || "");
      setCustomerEmail(customer.email || "");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dealer/staff/quotations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Chỉnh sửa Báo giá" : "Tạo Báo giá mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Cập nhật thông tin báo giá" : "Tạo báo giá chi tiết cho khách hàng"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
              <CardDescription>Chọn hoặc nhập thông tin khách hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Chọn khách hàng *</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={handleCustomerSelect}
                  disabled={isEditMode}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Chọn khách hàng từ danh sách" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                        <div className="flex flex-col">
                          <span>{customer.full_name}</span>
                          {customer.phone && (
                            <span className="text-xs text-muted-foreground">{customer.phone}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditMode && (
                  <p className="text-xs text-muted-foreground">
                    Không thể thay đổi khách hàng khi chỉnh sửa
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên khách hàng *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Số điện thoại</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0901234567"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn xe</CardTitle>
              <CardDescription>
                Chọn các xe từ danh sách, thông số sẽ được tự động điền
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Xe *</TableHead>
                        <TableHead className="w-32">Số lượng *</TableHead>
                        <TableHead className="w-40 text-right">Đơn giá</TableHead>
                        <TableHead className="w-40 text-right">Thành tiền</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const variantInfo = item.variantId ? getVariantInfo(item.variantId) : null;
                        const unitPrice = variantInfo?.price || 0;
                        const lineTotal = unitPrice * item.quantity;

                        return (
                          <TableRow key={`item-${index}`}>
                            <TableCell>
                              <Select
                                value={item.variantId?.toString() || "0"}
                                onValueChange={(value) =>
                                  updateItem(index, "variantId", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn xe" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0" disabled>
                                    Chọn xe
                                  </SelectItem>
                                  {variants.map((variant) => {
                                    const vInfo = getVariantInfo(variant.variant_id);
                                    return (
                                      <SelectItem
                                        key={variant.variant_id}
                                        value={variant.variant_id.toString()}
                                      >
                                        {vInfo?.description}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "quantity",
                                    Number.parseInt(e.target.value) || 1
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(lineTotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm xe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Costs (Addons) */}
          <Card>
            <CardHeader>
              <CardTitle>Chi phí phụ</CardTitle>
              <CardDescription>
                Thêm bảo hiểm, phụ kiện, hoặc các chi phí khác
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addons.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mô tả *</TableHead>
                          <TableHead className="w-32">Số lượng *</TableHead>
                          <TableHead className="w-40 text-right">Đơn giá *</TableHead>
                          <TableHead className="w-40 text-right">Thành tiền</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addons.map((addon, index) => {
                          const lineTotal = addon.quantity * addon.unitPrice;

                          return (
                            <TableRow key={`addon-${index}`}>
                              <TableCell>
                                <Input
                                  value={addon.description}
                                  onChange={(e) =>
                                    updateAddon(index, "description", e.target.value)
                                  }
                                  placeholder="Bảo hiểm toàn diện, phụ kiện..."
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={addon.quantity}
                                  onChange={(e) =>
                                    updateAddon(
                                      index,
                                      "quantity",
                                      Number.parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={addon.unitPrice}
                                  onChange={(e) =>
                                    updateAddon(
                                      index,
                                      "unitPrice",
                                      Number.parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(lineTotal)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeAddon(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có chi phí phụ nào
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAddon}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm chi phí phụ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú</CardTitle>
              <CardDescription>Thêm ghi chú cho báo giá (tùy chọn)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú, điều khoản, hoặc thông tin bổ sung..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Tổng kết giá</CardTitle>
              <CardDescription>Tính toán tự động</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng giá xe:</span>
                <span className="font-medium">{formatCurrency(totals.vehicleSubtotal)}</span>
              </div>

              {/* Addon Subtotal */}
              {totals.addonSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chi phí phụ:</span>
                  <span className="font-medium">{formatCurrency(totals.addonSubtotal)}</span>
                </div>
              )}

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="font-medium">Tạm tính:</span>
                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
              </div>

              {/* VAT */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT ({totals.vatRate}%):</span>
                <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
              </div>

              <Separator />

              {/* Total before discount */}
              <div className="flex justify-between">
                <span className="font-medium">Tổng trước giảm giá:</span>
                <span className="font-semibold">{formatCurrency(totals.totalBeforeDiscount)}</span>
              </div>

              {/* Discount Input */}
              <div className="space-y-2">
                <Label htmlFor="discount">Giảm giá (VNĐ)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}

              <Separator />

              {/* Total Amount */}
              <div className="flex justify-between text-lg">
                <span className="font-bold">Tổng cộng:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(totals.totalAmount)}
                </span>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Preview PDF
                </Button>

                <Button
                  onClick={handleSaveDraft}
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu nháp
                </Button>

                <Button
                  onClick={handleSend}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Gửi cho khách hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
