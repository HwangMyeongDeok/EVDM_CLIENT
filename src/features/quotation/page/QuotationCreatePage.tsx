import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, User, Phone, Mail, Home, ShoppingCart, Sparkles, RotateCcw, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";
import instance from "@/lib/axios";
import { formatPrice } from "@/lib/format";
import { createQuotation } from "../api";
import type { IVehicle, IVehicleVariant } from "@/types/vehicle";
import type { ICustomer } from "@/types/customer";

type AppliedPromoCode = {
  code: string;
  amount_vnd: number;
  description?: string;
};

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId?: string }>();

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [variant, setVariant] = useState<IVehicleVariant | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<ICustomer[]>([]);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [searching, setSearching] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    paymentTerms: "",
    notes: "",
  });

  const [notes, setNotes] = useState("");

  // New states for promo code
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomerSearchResults(customers);
      setSearching(false);
      return;
    }

    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await instance.get("/customers/search", { params: { query: customerSearch.trim() } });
        setCustomerSearchResults(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Tìm kiếm thất bại");
        setCustomerSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [customerSearch, customers]);


  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      try {
        setInitialLoading(true);

        // 🟢 1️⃣ Lấy chi tiết variant và xe tương ứng
        const variantRes = await instance.get(`/vehicle-variants/${variantId}`);
        const variantData: IVehicleVariant = variantRes.data.data;

        // Nếu muốn lấy luôn thông tin xe gốc của variant (để hiển thị tên model, ảnh, ...)
        const vehicleRes = await instance.get(`/vehicles/${variantData.vehicle_id}`);
        const vehicleData: IVehicle = vehicleRes.data.data;

        if (!mounted) return;
        setVehicle(vehicleData);
        setVariant(variantData);

        // 🔵 3️⃣ Lấy recent customers
        try {
          const recent = await instance.get("/customers", { params: { recent: 10 } });
          if (!mounted) return;
          setCustomers(recent.data.data || []);
        } catch (err) {
          console.info("no recent customers or fetch failed", err);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, [variantId]);

  const totals = useMemo(() => {
    const unit = variant?.retail_price ?? 0;
    const subtotal = unit * 1;
    const promoCodeDiscount = appliedPromoCode ? appliedPromoCode.amount_vnd : 0;
    const discountedSubtotal = Math.max(0, subtotal - promoCodeDiscount);
    const taxRate = 10;
    const taxAmount = discountedSubtotal * (taxRate / 100);
    const total = discountedSubtotal + taxAmount;
    return {
      subtotal,
      promoCodeDiscount,
      discountedSubtotal,
      taxRate,
      taxAmount,
      total,
    };
  }, [variant, appliedPromoCode]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.full_name || !newCustomer.phone) {
      return toast.error("Vui lòng nhập họ tên và số điện thoại");
    }
    try {
      setCreatingCustomer(true);
      const res = await instance.post("/customers", {
        full_name: newCustomer.full_name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        paymentTerms: newCustomer.paymentTerms,
        notes: newCustomer.notes,
      });
      const created: ICustomer = res.data.data;
      setCustomers((s) => [created, ...s]);
      setSelectedCustomerId(String((created as any).customer_id));
      setIsNewCustomer(false);
      toast.success("Tạo khách hàng thành công");
    } catch (err) {
      console.error(err);
      toast.error("Tạo khách hàng thất bại");
    } finally {
      setCreatingCustomer(false);
    }
  };

  // New function to apply promo code
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      return toast.error("Vui lòng nhập mã khuyến mãi");
    }
    try {
      setApplyingPromo(true);
      const res = await instance.post("/promotions/apply-code", {
        code: promoCode.trim(),
        subtotal: totals.subtotal,
      });
      const applied: AppliedPromoCode = res.data.data;
      setAppliedPromoCode(applied);
      toast.success(`Áp dụng mã ${applied.code} thành công: -${formatPrice(applied.amount_vnd)}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Mã khuyến mãi không hợp lệ");
      setAppliedPromoCode(null);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCode("");
    toast.success("Đã xóa mã khuyến mãi");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNewCustomer && !selectedCustomerId) return toast.error("Vui lòng chọn khách hàng");
    if (isNewCustomer && (!newCustomer.full_name || !newCustomer.phone)) return toast.error("Vui lòng nhập thông tin khách hàng mới");
    if (!variantId) return toast.error("Vui lòng chọn xe hợp lệ");

    const payload: any = {
      notes: notes || undefined,
      variant_id: Number(variantId),
    };

    if (isNewCustomer) payload.customer = {
      full_name: newCustomer.full_name,
      phone: newCustomer.phone,
      email: newCustomer.email || undefined,
      address: newCustomer.address || undefined,
      paymentTerms: newCustomer.paymentTerms || undefined,
      notes: newCustomer.notes || undefined,
    };
    else payload.customer_id = Number(selectedCustomerId);

    if (appliedPromoCode) {
      payload.promo_code = appliedPromoCode.code;
    }

    try {
      setLoading(true);
      await createQuotation(payload);
      toast.success("Tạo báo giá thành công");
      navigate("/dealer/staff/quotations");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Tạo báo giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  const variantLabel = () => {
    return `${vehicle?.model_name || "Xe"} — ${variant?.version} (${variant?.color})`;
  };

  if (initialLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-4">
          <div className="h-40 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tải lại</Button>
      </div>
    );
  }

  if (!variant || !vehicle) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Không tìm thấy thông tin xe.</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Tạo báo giá</h1>
        <p className="text-sm text-muted-foreground">Tạo báo giá nhanh — chọn khách hàng, thêm xe, áp dụng khuyến mãi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Khách hàng</CardTitle>
          <CardDescription>Chọn khách hàng có sẵn hoặc tạo mới nhanh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label className="mb-2 block">Khách hàng có sẵn</Label>
              <Input
                placeholder="Tìm theo tên / SĐT / email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="mb-2"
              />

              <div className="border rounded-md h-[360px] overflow-y-auto">
                {initialLoading ? (
                  <div className="p-3 space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {searching ? (
                      <div className="p-3 space-y-3">
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Đang tìm kiếm...</span>
                        </div>
                      </div>
                    ) : (
                      (customerSearch.trim()
                        ? customerSearchResults
                        : customers
                      ).map((c) => (
                        <div
                          key={c.customer_id}
                          onClick={() => {
                            setSelectedCustomerId(String(c.customer_id));
                            setIsNewCustomer(false);
                          }}
                          className={`p-3 border-b cursor-pointer hover:bg-muted transition ${selectedCustomerId === String(c.customer_id)
                            ? "bg-muted"
                            : ""
                            }`}
                        >
                          <p className="font-medium">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.email || "—"}
                          </p>
                        </div>
                      ))
                    )}

                    {!searching && (customerSearch.trim()
                      ? customerSearchResults
                      : customers
                    ).length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-3">
                          {customerSearch.trim() ? "Không tìm thấy khách hàng" : "Không có khách hàng"}
                        </p>
                      )}
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => {
                  setIsNewCustomer(true);
                  setSelectedCustomerId("");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Khách hàng mới
              </Button>
            </div>

            <div className="md:col-span-2 h-full">
              <div className="h-full bg-gradient-to-br from-card to-muted/20 rounded-xl border border-border/50 shadow-lg p-6 flex flex-col transition-all duration-500 hover:shadow-xl">
                {!isNewCustomer ? (
                  selectedCustomerId ? (
                    (() => {
                      const c =
                        customers.find((x) => String(x.customer_id) === selectedCustomerId) ||
                        customerSearchResults.find((x) => String(x.customer_id) === selectedCustomerId);

                      return c ? (
                        <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                              <User className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary">{c.full_name}</h3>
                            <p className="text-muted-foreground">Khách hàng hiện tại</p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Số điện thoại
                              </Label>
                              <p className="font-semibold text-lg">{c.phone || "—"}</p>
                            </div>
                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Email
                              </Label>
                              <p className="font-semibold text-lg">{c.email || "—"}</p>
                            </div>
                            <div className="sm:col-span-2 space-y-2 p-3 bg-muted/50 rounded-lg">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <Home className="w-4 h-4 text-primary" />
                                Địa chỉ
                              </Label>
                              <p className="font-semibold text-lg">{c.address || "—"}</p>
                            </div>
                          </div>

                          <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedCustomerId("")}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Đổi khách hàng
                            </Button>
                            <Button
                              variant="secondary"
                              className="flex-1"
                              onClick={() => setIsNewCustomer(true)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Thêm khách hàng mới
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Không tìm thấy thông tin khách hàng.
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground animate-in fade-in slide-in-from-right-4">
                      <div className="mb-6">
                        <ShoppingCart className="w-16 h-16 mx-auto" />
                      </div>
                      <p className="text-xl font-semibold mb-3">Chưa chọn khách hàng</p>
                      <p className="mb-6 max-w-md">Chọn khách từ danh sách bên trái hoặc tạo khách hàng mới để bắt đầu báo giá.</p>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="px-8"
                        onClick={() => setIsNewCustomer(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo khách hàng mới
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col justify-start animate-in fade-in slide-in-from-right-4">
                    <div className="text-center mb-6">
                      <Sparkles className="w-10 h-10 mx-auto text-primary mb-2" />
                      <h3 className="text-2xl font-bold">Tạo khách hàng mới</h3>
                      <p className="text-sm text-muted-foreground">Điền thông tin cơ bản để thêm khách hàng nhanh chóng</p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <User className="w-4 h-4 text-primary" />
                          Họ tên *
                        </Label>
                        <Input
                          className="mt-1 h-12"
                          value={newCustomer.full_name}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, full_name: e.target.value })
                          }
                          placeholder="VD: Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <Phone className="w-4 h-4 text-primary" />
                          Số điện thoại *
                        </Label>
                        <Input
                          className="mt-1 h-12"
                          value={newCustomer.phone}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, phone: e.target.value })
                          }
                          placeholder="VD: 0987 123 456"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <Mail className="w-4 h-4 text-primary" />
                          Email
                        </Label>
                        <Input
                          className="mt-1 h-12"
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, email: e.target.value })
                          }
                          placeholder="VD: example@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold">
                          <Home className="w-4 h-4 text-primary" />
                          Địa chỉ
                        </Label>
                        <Input
                          className="mt-1 h-12"
                          value={newCustomer.address}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, address: e.target.value })
                          }
                          placeholder="VD: 123 Nguyễn Trãi, Q.1, TP.HCM"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="font-semibold">Điều khoản thanh toán</Label>
                        <Input
                          className="h-12"
                          value={newCustomer.paymentTerms}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, paymentTerms: e.target.value })
                          }
                          placeholder="VD: Thanh toán 30% đặt cọc, 70% khi giao xe"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="font-semibold">Ghi chú</Label>
                        <Textarea
                          className="h-20"
                          value={newCustomer.notes}
                          onChange={(e) =>
                            setNewCustomer({ ...newCustomer, notes: e.target.value })
                          }
                          placeholder="Ghi chú thêm về khách hàng..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        type="button"
                        className="px-6"
                        onClick={() => setIsNewCustomer(false)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        className="px-6"
                        onClick={handleCreateCustomer}
                        disabled={creatingCustomer}
                      >
                        {creatingCustomer ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Tạo & chọn khách
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Thông tin xe</CardTitle>
          <CardDescription>Phiên bản xe đã được chọn từ trang chi tiết</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên bản</TableHead>
                <TableHead className="w-24 text-right">SL</TableHead>
                <TableHead className="w-40 text-right">Đơn giá</TableHead>
                <TableHead className="w-40 text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">{variantLabel()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {vehicle?.model_name}
                  </div>
                </TableCell>

                <TableCell className="text-right">1</TableCell>
                <TableCell className="text-right">{formatPrice(variant.retail_price)}</TableCell>
                <TableCell className="text-right font-medium">{formatPrice(variant.retail_price)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Card for Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle>Áp dụng mã khuyến mãi</CardTitle>
          <CardDescription>Nhập mã code để nhận thêm ưu đãi cho báo giá này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã khuyến mãi (VD: SALE2025)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1"
              disabled={appliedPromoCode !== null}
            />
            <Button
              type="button"
              onClick={handleApplyPromoCode}
              disabled={applyingPromo || !promoCode.trim() || appliedPromoCode !== null}
            >
              {applyingPromo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Percent className="w-4 h-4" />
              )}
            </Button>
          </div>
          {appliedPromoCode && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Đã áp dụng: {appliedPromoCode.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-green-700">{appliedPromoCode.description || `Giảm ${formatPrice(appliedPromoCode.amount_vnd)}`}</p>
            </div>
          )}
          {!appliedPromoCode && promoCode.trim() && (
            <p className="text-sm text-muted-foreground">Nhấn "Áp dụng" để kiểm tra mã.</p>
          )}
        </CardContent>
      </Card>

      
      
      



      <Card>
        <CardHeader>
          <CardTitle>Tổng kết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            {appliedPromoCode && (
              <div className="flex justify-between">
                <span>Mã khuyến mãi ({appliedPromoCode.code})</span>
                <span>- {formatPrice(totals.promoCodeDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tạm sau khuyến mãi</span>
              <span>{formatPrice(totals.discountedSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({totals.taxRate}%)</span>
              <span>{formatPrice(totals.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng cộng</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú & điều khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Ghi chú thêm cho khách / điều kiện hợp đồng" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Đang lưu..." : "Tạo báo giá"}
        </Button>
      </div>
    </form>
  );
}