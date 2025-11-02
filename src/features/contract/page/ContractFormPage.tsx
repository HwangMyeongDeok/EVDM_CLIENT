import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FileText,
  Save,
  Send,
  Upload,
  X,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  createContract,
  updateContract,
  getContractById,
  submitContractForApproval,
} from "../api";
import type { CreateContractDto, ContractResponse, PaymentTerms } from "../types";
import { useGetCustomersQuery } from "@/features/customers/api";
import { useGetVehiclesQuery } from "@/features/vehicles/api";
import { getQuotationById } from "@/features/quotation/api";

// Mock current user (TODO: get from auth context)

interface ContractItem {
  variant_id: number;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  version?: string;
  color?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

export default function ContractFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get("quotationId");

  const isEditMode = Boolean(id);
  const isFromQuotation = Boolean(quotationId);

  // Fetch data
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  // Form state
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Basic info
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<ContractItem[]>([]);
  const [subtotal, setSubtotal] = useState("0");
  const [taxAmount, setTaxAmount] = useState("0");
  const [totalAmount, setTotalAmount] = useState("0");

  // Payment terms
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("CASH");
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositPercentage, setDepositPercentage] = useState("30");
  const [installmentMonths, setInstallmentMonths] = useState("12");
  const [monthlyPayment, setMonthlyPayment] = useState("0");

  // Delivery
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Terms & Conditions
  const [termsAndConditions, setTermsAndConditions] = useState(`1. Khách hàng đồng ý với các điều khoản và điều kiện trong hợp đồng này.
2. Đặt cọc không hoàn lại trong trường hợp khách hàng hủy đơn hàng.
3. Thời gian giao xe có thể thay đổi tùy thuộc vào tình hình sản xuất và vận chuyển.
4. Khách hàng có trách nhiệm kiểm tra xe khi nhận hàng.
5. Bảo hành theo chính sách của nhà sản xuất.`);

  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Notes
  const [internalNotes, setInternalNotes] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load contract data if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadContractData(Number(id));
    }
  }, [isEditMode, id]);

  // Load quotation data if from quotation
  useEffect(() => {
    if (isFromQuotation && quotationId) {
      loadQuotationData(Number(quotationId));
    }
  }, [isFromQuotation, quotationId]);

  const loadContractData = async (contractId: number) => {
    setLoadingData(true);
    try {
      const contract = await getContractById(contractId);
      populateFormFromContract(contract);
      toast.success("Đã tải dữ liệu hợp đồng");
    } catch (error) {
      console.error("Error loading contract:", error);
      toast.error("Không thể tải dữ liệu hợp đồng");
    } finally {
      setLoadingData(false);
    }
  };

  const loadQuotationData = async (qId: number) => {
    setLoadingData(true);
    try {
      const quotation = await getQuotationById(qId);
      
      // Auto-fill from quotation
      setCustomerId(quotation.customer_id);
      
      // Map quotation items to contract items
      const contractItems: ContractItem[] = quotation.items.map((item: any) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || "0",
        version: item.variant?.version,
        color: item.variant?.color,
      }));
      setItems(contractItems);

      // Calculate totals
      calculateTotals(contractItems);

      toast.success("Đã tải dữ liệu từ báo giá");
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Không thể tải dữ liệu báo giá");
    } finally {
      setLoadingData(false);
    }
  };

  const populateFormFromContract = (contract: ContractResponse) => {
    setCustomerId(contract.customer_id);
    
    const contractItems: ContractItem[] = contract.items.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      version: item.variant?.version,
      color: item.variant?.color,
    }));
    setItems(contractItems);

    setSubtotal(contract.subtotal);
    setTaxAmount(contract.tax_amount);
    setTotalAmount(contract.total_amount);
    setPaymentTerms(contract.payment_terms);
    setDepositAmount(contract.deposit_amount || "0");
    setDeliveryDeadline(contract.delivery_deadline || "");
    setDeliveryAddress(contract.delivery_address || "");
    setTermsAndConditions(contract.terms_and_conditions || "");
    setInternalNotes(contract.notes || "");
  };

  // Calculate totals
  const calculateTotals = (contractItems: ContractItem[]) => {
    const sub = contractItems.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount_amount) || 0;
      const qty = item.quantity || 1;
      return sum + (price - discount) * qty;
    }, 0);

    const tax = sub * 0.1; // 10% VAT
    const total = sub + tax;

    setSubtotal(sub.toFixed(2));
    setTaxAmount(tax.toFixed(2));
    setTotalAmount(total.toFixed(2));

    // Calculate deposit (default 30%)
    const depositPct = parseFloat(depositPercentage) || 30;
    const deposit = (total * depositPct) / 100;
    setDepositAmount(deposit.toFixed(2));

    // Calculate monthly payment for installment
    if (paymentTerms === "INSTALLMENT") {
      const months = parseFloat(installmentMonths) || 12;
      const remaining = total - deposit;
      const monthly = remaining / months;
      setMonthlyPayment(monthly.toFixed(2));
    }
  };

  // Recalculate when items change
  useEffect(() => {
    calculateTotals(items);
  }, [items, depositPercentage, installmentMonths, paymentTerms]);

  // Add item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        variant_id: 0,
        quantity: 1,
        unit_price: "0",
        discount_amount: "0",
      },
    ]);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Update item
  const handleUpdateItem = (index: number, field: keyof ContractItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill price when variant selected
    if (field === "variant_id") {
      const selectedVariant = vehicles
        .flatMap((v) => v.variants || [])
        .find((variant) => variant.variant_id === Number(value));
      
      if (selectedVariant) {
        newItems[index].unit_price = selectedVariant.retail_price.toString();
        newItems[index].version = selectedVariant.version;
        newItems[index].color = selectedVariant.color;
      }
    }

    setItems(newItems);
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Mock upload (TODO: implement real upload to cloud storage)
      const mockFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        type: file.type,
      };
      setUploadedFiles((prev) => [...prev, mockFile]);
    });

    toast.success(`Đã tải lên ${files.length} file`);
  };

  // Remove file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.info("Đã xóa file");
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = "Vui lòng chọn khách hàng";
    }

    if (items.length === 0) {
      newErrors.items = "Vui lòng thêm ít nhất 1 sản phẩm";
    }

    items.forEach((item, index) => {
      if (!item.variant_id || item.variant_id === 0) {
        newErrors[`item_${index}_variant`] = "Chọn xe";
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Số lượng > 0";
      }
    });

    if (!deliveryDeadline) {
      newErrors.deliveryDeadline = "Vui lòng chọn thời hạn giao xe";
    }

    if (!deliveryAddress) {
      newErrors.deliveryAddress = "Vui lòng nhập địa chỉ giao xe";
    }

    if (uploadedFiles.length === 0) {
      newErrors.files = "Vui lòng upload CMND/CCCD khách hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!customerId || items.length === 0) {
      toast.error("Vui lòng nhập khách hàng và sản phẩm");
      return;
    }

    setLoading(true);
    try {
      const dto: CreateContractDto = {
        customer_id: customerId,
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })),
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_terms: paymentTerms,
        deposit_amount: depositAmount,
        delivery_deadline: deliveryDeadline,
        delivery_address: deliveryAddress,
        terms_and_conditions: termsAndConditions,
        notes: internalNotes,
        status: "DRAFT",
      };

      if (isEditMode && id) {
        await updateContract(Number(id), dto);
        toast.success("Đã lưu nháp hợp đồng");
      } else {
        await createContract(dto);
        toast.success("Đã tạo hợp đồng nháp");
      }

      navigate("/contracts");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Không thể lưu hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  // Submit for approval
  const handleSubmitForApproval = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    try {
      let contractId = id ? Number(id) : null;

      // Create contract first if not exists
      if (!contractId) {
        const dto: CreateContractDto = {
          customer_id: customerId!,
          items: items.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount,
          })),
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_terms: paymentTerms,
          deposit_amount: depositAmount,
          delivery_deadline: deliveryDeadline,
          delivery_address: deliveryAddress,
          terms_and_conditions: termsAndConditions,
          notes: internalNotes,
          status: "DRAFT",
        };

        const newContract = await createContract(dto);
        contractId = newContract.contract_id;
      }

      // Submit for approval
      await submitContractForApproval(contractId);
      toast.success("Đã gửi hợp đồng để duyệt");
      navigate("/contracts");
    } catch (error) {
      console.error("Error submitting contract:", error);
      toast.error("Không thể gửi hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            {isEditMode ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFromQuotation && "Dữ liệu được tự động điền từ báo giá"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/contracts")}>
            Hủy
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu nháp
          </Button>
          <Button onClick={handleSubmitForApproval} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi duyệt
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation errors alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng kiểm tra lại các trường bắt buộc: Khách hàng, Sản phẩm, Thời hạn giao xe, Địa chỉ giao xe, File CMND
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="delivery">Giao xe</TabsTrigger>
          <TabsTrigger value="terms">Điều khoản</TabsTrigger>
          <TabsTrigger value="files">File & Ghi chú</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
              <CardDescription>Chọn khách hàng cho hợp đồng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">
                  Khách hàng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={customerId?.toString()}
                  onValueChange={(value) => setCustomerId(Number(value))}
                >
                  <SelectTrigger id="customer" className={errors.customerId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem
                        key={customer.customer_id}
                        value={customer.customer_id.toString()}
                      >
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId}</p>
                )}
              </div>

              {customerId && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Thông tin khách hàng:</p>
                  {customers
                    .filter((c: any) => c.customer_id === customerId)
                    .map((customer: any) => (
                      <div key={customer.customer_id} className="mt-2 text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Tên:</span> {customer.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">SĐT:</span> {customer.phone}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Email:</span> {customer.email || "N/A"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Địa chỉ:</span> {customer.address || "N/A"}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
              <CardDescription>Danh sách xe trong hợp đồng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}
              
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sản phẩm #{index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Variant xe <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={item.variant_id.toString()}
                        onValueChange={(value) =>
                          handleUpdateItem(index, "variant_id", Number(value))
                        }
                      >
                        <SelectTrigger className={errors[`item_${index}_variant`] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Chọn variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle: any) =>
                            vehicle.variants?.map((variant: any) => (
                              <SelectItem
                                key={variant.variant_id}
                                value={variant.variant_id.toString()}
                              >
                                {vehicle.name} - {variant.version} ({variant.color})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors[`item_${index}_variant`] && (
                        <p className="text-sm text-red-500">{errors[`item_${index}_variant`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Số lượng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                        className={errors[`item_${index}_quantity`] ? "border-red-500" : ""}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="text-sm text-red-500">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Đơn giá</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleUpdateItem(index, "unit_price", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Giảm giá</Label>
                      <Input
                        type="number"
                        value={item.discount_amount}
                        onChange={(e) =>
                          handleUpdateItem(index, "discount_amount", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Thành tiền: {formatCurrency(
                      ((parseFloat(item.unit_price) - parseFloat(item.discount_amount)) * item.quantity).toString()
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>

              <Separator />

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (10%):</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payment Terms */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Điều khoản thanh toán</CardTitle>
              <CardDescription>Phương thức và kế hoạch thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Phương thức thanh toán</Label>
                <Select
                  value={paymentTerms}
                  onValueChange={(value) => setPaymentTerms(value as PaymentTerms)}
                >
                  <SelectTrigger id="paymentTerms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                    <SelectItem value="INSTALLMENT">Trả góp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Tỷ lệ đặt cọc (%)</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Số tiền đặt cọc</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(depositAmount)}
                  </p>
                </div>
              </div>

              {paymentTerms === "INSTALLMENT" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Thông tin trả góp</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="installmentMonths">Số tháng trả góp</Label>
                        <Select
                          value={installmentMonths}
                          onValueChange={setInstallmentMonths}
                        >
                          <SelectTrigger id="installmentMonths">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 tháng</SelectItem>
                            <SelectItem value="12">12 tháng</SelectItem>
                            <SelectItem value="24">24 tháng</SelectItem>
                            <SelectItem value="36">36 tháng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Số tiền trả hàng tháng</Label>
                        <Input
                          value={monthlyPayment}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(monthlyPayment)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Lưu ý:</strong> Số tiền trả góp hàng tháng được tính dựa trên tổng tiền còn lại sau khi trừ đặt cọc, chưa bao gồm lãi suất ngân hàng.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng giá trị hợp đồng:</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đặt cọc ({depositPercentage}%):</span>
                  <span className="font-medium">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Còn lại:</span>
                  <span className="font-medium">
                    {formatCurrency((parseFloat(totalAmount) - parseFloat(depositAmount)).toString())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Delivery */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao xe</CardTitle>
              <CardDescription>Thời hạn và địa điểm giao xe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDeadline">
                  Thời hạn giao xe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deliveryDeadline"
                  type="date"
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className={errors.deliveryDeadline ? "border-red-500" : ""}
                />
                {errors.deliveryDeadline && (
                  <p className="text-sm text-red-500">{errors.deliveryDeadline}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">
                  Địa chỉ giao xe <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Nhập địa chỉ giao xe..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className={errors.deliveryAddress ? "border-red-500" : ""}
                />
                {errors.deliveryAddress && (
                  <p className="text-sm text-red-500">{errors.deliveryAddress}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Ghi chú giao xe</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Ghi chú thêm về giao xe (không bắt buộc)..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Terms & Conditions */}
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Điều khoản & Điều kiện</CardTitle>
              <CardDescription>
                Các điều khoản và điều kiện của hợp đồng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Nhập điều khoản và điều kiện..."
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Files & Notes */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File đính kèm</CardTitle>
              <CardDescription>
                Upload CMND/CCCD khách hàng và các tài liệu liên quan
                <span className="text-red-500"> *</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.files && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.files}</AlertDescription>
                </Alert>
              )}

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <Label
                    htmlFor="fileUpload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Click để chọn file
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ: PDF, JPG, PNG (tối đa 10MB)
                  </p>
                </div>
                <Input
                  id="fileUpload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Các file đã tải lên:</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ghi chú nội bộ</CardTitle>
              <CardDescription>
                Ghi chú cho nội bộ (khách hàng không thấy)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Nhập ghi chú..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={6}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
