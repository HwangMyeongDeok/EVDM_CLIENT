import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, User, Phone, Mail, Home, ShoppingCart, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import instance from "@/lib/axios";
import { formatPrice } from "@/lib/format";
import { createQuotation } from "../api";
import type { IVehicle, IVehicleVariant } from "@/types/vehicle";
import type { ICustomer } from "@/types/customer";
  type ItemRow = {
    variant_id: number | "";
    quantity: number;
    manual_discount_vnd: number; 
    manual_discount_percent: number; 
    applied_promo_amount: number; 
  };

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId?: string }>(); 

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [variants, setVariants] = useState<IVehicleVariant[]>([]);
  const [promotionsLookup, setPromotionsLookup] = useState<Record<number, number>>({});

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
  const [items, setItems] = useState<ItemRow[]>([
    {
      variant_id: variantId ? Number(variantId) : "",
      quantity: 1,
      manual_discount_vnd: 0,
      manual_discount_percent: 0,
      applied_promo_amount: 0,
    },
  ]);

useEffect(() => {
  if (!customerSearch.trim()) {
    setCustomerSearchResults(customers);
    return;
  }

  const term = customerSearch.toLowerCase();

  const t = setTimeout(() => {
    const filtered = customers.filter((c) => {
      return (
        c.full_name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    });
    setCustomerSearchResults(filtered);
  }, 150);

  return () => clearTimeout(t);
}, [customerSearch, customers]);


  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      try {
        setInitialLoading(true);
        const [vRes] = await Promise.all([instance.get("/vehicles")]);
        const vehiclesData: IVehicle[] = vRes.data.data || [];
        if (!mounted) return;
        setVehicles(vehiclesData);

        const allVariants: IVehicleVariant[] = [];
        for (const v of vehiclesData) {
          try {
            const r = await instance.get(`/vehicles/${v.vehicle_id}/variants`);
            allVariants.push(...(r.data.data || []));
          } catch (err) {
            console.warn("variant fetch failed for vehicle", v.vehicle_id, err);
          }
        }
        if (!mounted) return;
        setVariants(allVariants);

        try {
          const promoRes = await instance.get("/promotions", {
            params: { variant_ids: allVariants.map((x) => x.variant_id).join(",") },
          });
          const promos: Array<{ variant_id: number; amount_vnd: number }> = promoRes.data.data || [];
          const lookup: Record<number, number> = {};
          promos.forEach((p) => (lookup[p.variant_id] = p.amount_vnd ?? 0));
          if (!mounted) return;
          setPromotionsLookup(lookup);
        } catch (err) {
          console.info("no promotions or promotions fetch failed", err);
        }

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
  }, []);

  const getVariantInfo = (variant_id: number | "") => {
    if (!variant_id) return null;
    const variant = variants.find((v) => v.variant_id === variant_id);
    if (!variant) return null;
    const vehicle = vehicles.find((veh) => veh.vehicle_id === variant.vehicle_id);
    return { variant, vehicle };
  };

  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        applied_promo_amount: it.variant_id ? (promotionsLookup[it.variant_id] ?? 0) : 0,
      }))
    );
  }, [promotionsLookup]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let promoTotal = 0;
    let manualDiscountTotal = 0;
    for (const it of items) {
      const info = getVariantInfo(it.variant_id);
      const unit = info?.variant.retail_price ?? 0;
      const base = unit * it.quantity;
      const promo = it.applied_promo_amount ?? 0;
      const manualDiscountFromPercent = (it.manual_discount_percent / 100) * base;
      const manualDiscount = (it.manual_discount_vnd ?? 0) + manualDiscountFromPercent;
      const lineNet = Math.max(0, base - promo - manualDiscount);
      subtotal += lineNet;
      promoTotal += promo;
      manualDiscountTotal += manualDiscount;
    }
    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return {
      subtotal,
      promoTotal,
      manualDiscountTotal,
      taxRate,
      taxAmount,
      total,
    };
  }, [items, variants, promotionsLookup]);

  const addRow = () =>
    setItems((s) => [
      ...s,
      { variant_id: "", quantity: 1, manual_discount_vnd: 0, manual_discount_percent: 0, applied_promo_amount: 0 },
    ]);
  const removeRow = (idx: number) =>
    setItems((s) => (s.length === 1 ? s : s.filter((_, i) => i !== idx)));
  const updateRow = (idx: number, patch: Partial<ItemRow>) =>
    setItems((s) => s.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNewCustomer && !selectedCustomerId) return toast.error("Vui lòng chọn khách hàng");
    if (isNewCustomer && (!newCustomer.full_name || !newCustomer.phone)) return toast.error("Vui lòng nhập thông tin khách hàng mới");
    if (items.some((it) => !it.variant_id || it.quantity <= 0)) return toast.error("Vui lòng chọn xe hợp lệ và số lượng");

    const payload: any = {
      notes: notes || undefined,
      items: items.map((it) => ({
        variant_id: Number(it.variant_id),
        quantity: it.quantity,
      })),
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

  const variantLabel = (v: IVehicleVariant) => {
    const veh = vehicles.find((x) => x.vehicle_id === v.vehicle_id);
    return `${veh?.model_name || "Xe"} — ${v.version} (${v.color})`;
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
          <CardTitle>Danh sách xe</CardTitle>
          <CardDescription>Chọn phiên bản, số lượng; thêm nhiều dòng nếu cần</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên bản</TableHead>
                <TableHead className="w-24 text-right">SL</TableHead>
                <TableHead className="w-40 text-right">Đơn giá</TableHead>
                <TableHead className="w-40 text-right">Khuyến mãi</TableHead>
                <TableHead className="w-48 text-right">Giảm thủ công (VNĐ / %)</TableHead>
                <TableHead className="w-40 text-right">Thành tiền</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row, idx) => {
                const info = row.variant_id ? getVariantInfo(row.variant_id) : null;
                const unit = info?.variant.retail_price ?? 0;
                const promo = row.applied_promo_amount ?? 0;
                const manualPercent = row.manual_discount_percent ?? 0;
                const manualVnd = row.manual_discount_vnd ?? 0;
                const base = unit * row.quantity;
                const manualFromPercent = (manualPercent / 100) * base;
                const net = Math.max(0, base - promo - manualFromPercent - manualVnd);

                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select
                        value={String(row.variant_id || "")}
                        onValueChange={(val) => {
                          const vid = val ? Number(val) : "";
                          const promoAmount = vid ? (promotionsLookup[vid] ?? 0) : 0;
                          updateRow(idx, { variant_id: vid, applied_promo_amount: promoAmount });
                        }}
                      >
                        <SelectTrigger className="w-[360px]">
                          <SelectValue placeholder={info ? variantLabel(info.variant) : "Chọn phiên bản"} />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((v) => (
                            <SelectItem key={v.variant_id} value={String(v.variant_id)}>
                              {variantLabel(v)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground mt-1">{info ? `${info.vehicle?.model_name}` : ""}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) || 1 })}
                      />
                    </TableCell>

                    <TableCell className="text-right">{formatPrice(unit)}</TableCell>

                    <TableCell className="text-right">
                      <div className="text-sm">{promo > 0 ? `-${formatPrice(promo)}` : "—"}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Input
                          type="number"
                          placeholder="VND"
                          value={row.manual_discount_vnd}
                          onChange={(e) => updateRow(idx, { manual_discount_vnd: Number(e.target.value) || 0 })}
                          className="w-28"
                        />
                        <Input
                          type="number"
                          placeholder="%"
                          value={row.manual_discount_percent}
                          onChange={(e) => updateRow(idx, { manual_discount_percent: Number(e.target.value) || 0 })}
                          className="w-20"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-medium">{formatPrice(net)}</TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeRow(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-2 w-4 h-4" /> Thêm dòng
            </Button>
          </div>
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
              <span>{formatPrice(totals.subtotal + totals.promoTotal + totals.manualDiscountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Khuyến mãi (tổng)</span>
              <span>- {formatPrice(totals.promoTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm thủ công (tổng)</span>
              <span>- {formatPrice(totals.manualDiscountTotal)}</span>
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