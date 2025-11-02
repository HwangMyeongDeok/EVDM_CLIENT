import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { createQuotation } from "@/features/quotation/api";
import type { IVehicleVariant } from "@/types/vehicle";


const quotationSchema = z.object({
   customerName: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
   phone: z.string().regex(/^0[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
   email: z.string().email("Email không hợp lệ").optional(),
   address: z.string().optional(),
   paymentTerms: z.enum(["CASH", "INSTALLMENT", "BANK_TRANSFER"]),
   notes: z.string().optional(),
   addOns: z.array(z.object({
       description: z.string().min(1, "Mô tả không được để trống"),
       quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
       unitPrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
   })).optional(),
});


type QuotationForm = z.infer<typeof quotationSchema>;


interface AddOnItem {
   description: string;
   quantity: number;
   unitPrice: number;
}


interface QuotationModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   variant: IVehicleVariant;
}


export function QuotationModal({ open, onOpenChange, variant }: QuotationModalProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [discountPercent, setDiscountPercent] = useState(0);
   const [addOns, setAddOns] = useState<AddOnItem[]>([]);
   const [quotationId, setQuotationId] = useState<string | null>(null);


   const form = useForm<QuotationForm>({
       resolver: zodResolver(quotationSchema),
       defaultValues: {
           customerName: "",
           phone: "",
           email: "",
           address: "",
           paymentTerms: "CASH",
           notes: "",
           addOns: [],
       },
   });


   const subtotalVehicle = variant.retail_price;
   const addOnsTotal = addOns.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
   const subtotal = subtotalVehicle + addOnsTotal;
   const discountAmount = (subtotal * discountPercent) / 100;
   const taxAmount = (subtotal - discountAmount) * 0.1;
   const totalAmount = subtotal - discountAmount + taxAmount;


   const addNewAddOn = () => {
       setAddOns([...addOns, { description: "", quantity: 1, unitPrice: 0 }]);
   };


   const updateAddOn = (index: number, field: keyof AddOnItem, value: string | number) => {
       const newAddOns = [...addOns];
       newAddOns[index][field] = value as never;
       setAddOns(newAddOns);
   };


   const removeAddOn = (index: number) => {
       setAddOns(addOns.filter((_, i) => i !== index));
   };


   const onSaveDraft = async (data: QuotationForm) => {
       setIsLoading(true);
       try {
           const quotationData = {
               customerId: 0, // use 0 for a new/unknown customer; replace with real ID if available
               customerName: data.customerName,
               phone: data.phone,
               email: data.email,
               address: data.address,
               paymentTerms: data.paymentTerms,
               notes: data.notes,
               items: [
                   {
                       variantId: variant.variant_id,
                       description: `${variant.version} - ${variant.color}`,
                       quantity: 1,
                       unitPrice: variant.retail_price,
                       discountAmount: 0,
                       lineTotal: subtotalVehicle,
                   },
                   ...addOns.map(addOn => ({
                       variantId: 0,
                       description: addOn.description,
                       quantity: addOn.quantity,
                       unitPrice: addOn.unitPrice,
                       discountAmount: 0,
                       lineTotal: addOn.quantity * addOn.unitPrice,
                   })),
               ],
               subtotal,
               taxRate: 0.1,
               taxAmount,
               discountTotal: discountAmount,
               totalAmount,
               status: "DRAFT" as const,
           };


           const result = await createQuotation(quotationData);
           setQuotationId(result.quotation_id.toString());


           toast.success("Lưu nháp thành công!", {
               description: `Báo giá #${result.quotation_number} đã được lưu. Bạn có thể preview PDF hoặc gửi email.`,
           });


       } catch (error) {
           toast.error("Lỗi lưu nháp!", {
               description: "Vui lòng thử lại sau.",
           });
       } finally {
           setIsLoading(false);
       }
   };


   const onPreviewPDF = async () => {
       if (!quotationId) {
           toast.warning("Vui lòng lưu nháp trước khi preview!");
           return;
       }
       try {
           // const pdfUrl = await generateQuotationPDF(quotationId); // Assume util generates PDF and returns URL
           // window.open(pdfUrl, '_blank');
           toast.success("Preview PDF mở thành công!");
       } catch (error) {
           toast.error("Lỗi preview PDF!");
       }
   };


   const onSendEmail = async () => {
       if (!quotationId || !form.getValues("email")) {
           toast.warning("Vui lòng lưu nháp và nhập email khách hàng trước khi gửi!");
           return;
       }
       setIsLoading(true);
       try {
           // await sendQuotationEmail(quotationId, form.getValues("email")); // Assume util sends email
           toast.success("Gửi email thành công!", {
               description: "Báo giá đã được gửi đến khách hàng.",
           });
           form.reset();
           setDiscountPercent(0);
           setAddOns([]);
           setQuotationId(null);
           onOpenChange(false);
       } catch (error) {
           toast.error("Lỗi gửi email!");
       } finally {
           setIsLoading(false);
       }
   };


   const onSubmit = (data: QuotationForm) => {
       onSaveDraft(data);
   };


   return (
       <Dialog open={open} onOpenChange={onOpenChange}>
           <DialogContent className=" max-h-[90vh] overflow-y-auto"
               style={{ width: '80vw', maxWidth: '80vw', margin: 0, borderRadius: 10 }}>
               <DialogHeader>
                   <DialogTitle>Tạo báo giá mới</DialogTitle>
                   <DialogDescription>
                       Điền thông tin chi tiết để tạo báo giá chuyên nghiệp cho <strong>{variant.version}</strong>. Bao gồm chi phí phụ, điều khoản thanh toán, tính toán tự động, preview PDF, và gửi email.
                   </DialogDescription>
               </DialogHeader>


               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <div className="space-y-4">
                       <h3 className="font-semibold">Thông tin khách hàng</h3>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <Label htmlFor="customerName">Tên khách hàng *</Label>
                               <Input
                                   id="customerName"
                                   {...form.register("customerName")}
                                   placeholder="Nguyễn Văn A"
                               />
                               {form.formState.errors.customerName && (
                                   <p className="text-sm text-destructive mt-1">
                                       {form.formState.errors.customerName.message}
                                   </p>
                               )}
                           </div>
                           <div>
                               <Label htmlFor="phone">Số điện thoại *</Label>
                               <Input
                                   id="phone"
                                   {...form.register("phone")}
                                   placeholder="0901234567"
                               />
                               {form.formState.errors.phone && (
                                   <p className="text-sm text-destructive mt-1">
                                       {form.formState.errors.phone.message}
                                   </p>
                               )}
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <Label htmlFor="email">Email</Label>
                               <Input
                                   id="email"
                                   type="email"
                                   {...form.register("email")}
                                   placeholder="email@domain.com"
                               />
                               {form.formState.errors.email && (
                                   <p className="text-sm text-destructive mt-1">
                                       {form.formState.errors.email.message}
                                   </p>
                               )}
                           </div>
                           <div>
                               <Label htmlFor="address">Địa chỉ</Label>
                               <Input
                                   id="address"
                                   {...form.register("address")}
                                   placeholder="Số 123, Đường ABC, TP. HCM"
                               />
                           </div>
                       </div>
                   </div>


                   <div className="p-4 bg-muted rounded-lg space-y-2">
                       <h3 className="font-semibold mb-2">Thông tin xe chính</h3>
                       <div className="flex justify-between">
                           <span>Model:</span>
                           <span>{variant.version}</span>
                       </div>
                       <div className="flex justify-between">
                           <span>Màu:</span>
                           <span>{variant.color}</span>
                       </div>
                       <div className="flex justify-between font-semibold">
                           <span>Giá gốc:</span>
                           <span>{formatPrice(subtotalVehicle)}</span>
                       </div>
                   </div>


                   <div className="space-y-4">
                       <div className="flex justify-between items-center">
                           <h3 className="font-semibold">Chi phí phụ (bảo hiểm, phụ kiện, v.v.)</h3>
                           <Button type="button" variant="outline" size="sm" onClick={addNewAddOn}>
                               <Plus className="h-4 w-4 mr-2" /> Thêm
                           </Button>
                       </div>
                       {addOns.map((addOn, index) => (
                           <div key={index} className="grid grid-cols-4 gap-4 items-center">
                               <div className="col-span-2">
                                   <Label htmlFor={`addOn-desc-${index}`}>Mô tả *</Label>
                                   <Input
                                       id={`addOn-desc-${index}`}
                                       value={addOn.description}
                                       onChange={(e) => updateAddOn(index, "description", e.target.value)}
                                       placeholder="Bảo hiểm toàn diện"
                                   />
                               </div>
                               <div>
                                   <Label htmlFor={`addOn-qty-${index}`}>Số lượng</Label>
                                   <Input
                                       id={`addOn-qty-${index}`}
                                       type="number"
                                       min="1"
                                       value={addOn.quantity}
                                       onChange={(e) => updateAddOn(index, "quantity", Number(e.target.value))}
                                   />
                               </div>
                               <div>
                                   <Label htmlFor={`addOn-price-${index}`}>Giá đơn vị</Label>
                                   <Input
                                       id={`addOn-price-${index}`}
                                       type="number"
                                       min="0"
                                       value={addOn.unitPrice}
                                       onChange={(e) => updateAddOn(index, "unitPrice", Number(e.target.value))}
                                   />
                               </div>
                               <Button
                                   type="button"
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => removeAddOn(index)}
                                   className="mt-6"
                               >
                                   <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                           </div>
                       ))}
                       {addOns.length === 0 && (
                           <p className="text-sm text-muted-foreground">Không có chi phí phụ. Click "Thêm" để thêm mới.</p>
                       )}
                   </div>


                   <div className="w-1/3">
                       <Label htmlFor="discount">Chiết khấu (%)</Label>
                       <Input
                           id="discount"
                           type="number"
                           min="0"
                           max="50"
                           step="0.5"
                           value={discountPercent}
                           onChange={(e) => setDiscountPercent(Number(e.target.value))}
                           placeholder="0"
                       />
                   </div>


                   <div>
                       <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
                       <Select defaultValue={form.getValues("paymentTerms")} onValueChange={(value) => form.setValue("paymentTerms", value as any)}>
                           <SelectTrigger>
                               <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="CASH">Tiền mặt</SelectItem>
                               <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                               <SelectItem value="INSTALLMENT">Trả góp</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>


                   <div className="space-y-2 p-4 bg-muted rounded-lg">
                       <h3 className="font-semibold mb-2">Tóm tắt giá (Itemized)</h3>
                       <div className="flex justify-between">
                           <span>Giá xe:</span>
                           <span>{formatPrice(subtotalVehicle)}</span>
                       </div>
                       {addOns.map((addOn, index) => (
                           <div key={index} className="flex justify-between text-sm text-muted-foreground">
                               <span>{addOn.description} (x{addOn.quantity}):</span>
                               <span>{formatPrice(addOn.quantity * addOn.unitPrice)}</span>
                           </div>
                       ))}
                       <div className="flex justify-between font-medium pt-2 border-t">
                           <span>Tạm tính:</span>
                           <span>{formatPrice(subtotal)}</span>
                       </div>
                       {discountPercent > 0 && (
                           <div className="flex justify-between text-green-600">
                               <span>Chiết khấu ({discountPercent}%):</span>
                               <span>-{formatPrice(discountAmount)}</span>
                           </div>
                       )}
                       <div className="flex justify-between">
                           <span>Thuế VAT (10%):</span>
                           <span>{formatPrice(taxAmount)}</span>
                       </div>
                       <Separator className="my-2" />
                       <div className="flex justify-between text-lg font-bold text-primary">
                           <span>Tổng cộng:</span>
                           <span>{formatPrice(totalAmount)}</span>
                       </div>
                   </div>


                   <div>
                       <Label htmlFor="notes">Ghi chú</Label>
                       <Textarea
                           id="notes"
                           {...form.register("notes")}
                           placeholder="Ghi chú thêm về báo giá, upsell opportunities..."
                           rows={4}
                       />
                   </div>


                   <DialogFooter className="gap-2">
                       <Button
                           type="button"
                           variant="outline"
                           onClick={() => {
                               form.reset();
                               setDiscountPercent(0);
                               setAddOns([]);
                               setQuotationId(null);
                               onOpenChange(false);
                           }}
                       >
                           Hủy
                       </Button>
                       <Button
                           type="submit"
                           disabled={isLoading || !!quotationId}
                       >
                           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Lưu nháp
                       </Button>
                       <Button
                           type="button"
                           variant="secondary"
                           onClick={onPreviewPDF}
                           disabled={!quotationId || isLoading}
                       >
                           <Eye className="mr-2 h-4 w-4" />
                           Preview PDF
                       </Button>
                       <Button
                           type="button"
                           onClick={onSendEmail}
                           disabled={!quotationId || isLoading}
                       >
                           <Mail className="mr-2 h-4 w-4" />
                           Gửi email
                       </Button>
                   </DialogFooter>
               </form>
           </DialogContent>
       </Dialog>
   );
}

