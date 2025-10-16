import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, UserPlus, X, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddCustomerDialog } from "./Add-customer-dialog"
import { mockCustomers, mockVariants, generateContractCode } from "./data"
import type { Contract, Customer, VehicleVariant, ContractFormData } from "./type"

const CONTRACT_STATUS_COLORS = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGN: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  SIGNED: "bg-green-500/10 text-green-700 dark:text-green-400",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-green-600/10 text-green-800 dark:text-green-300",
  CANCELLED: "bg-destructive/10 text-destructive",
}

const contractFormSchema = z.object({
  contract_code: z.string().min(1, "Contract code is required"),
  customer_id: z.number().min(1, "Customer is required"),
  contract_date: z.string().min(1, "Contract date is required"),
  delivery_date: z.string().optional(),
  payment_plan: z.enum(["FULL", "DEPOSIT"]),
  deposit_amount: z.number().min(0),
  discount_amount: z.number().min(0),
  items: z
    .array(
      z.object({
        variant_id: z.number().min(1, "Vehicle variant is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unit_price: z.number().min(0),
        discount_amount: z.number().min(0),
        description: z.string().optional(),
      }),
    )
    .min(1, "At least one contract item is required"),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

interface ContractFormProps {
  contract: Contract | null
  onSaveDraft: (data: ContractFormData) => void
  onSubmit: (data: ContractFormData) => void
  onCancel: () => void
  loading: boolean
}

export function ContractForm({ contract, onSaveDraft, onSubmit, onCancel, loading }: ContractFormProps) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [variants, setVariants] = useState<VehicleVariant[]>(mockVariants)
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      contract_code: contract?.contract_code || generateContractCode(),
      customer_id: contract?.customer_id || 0,
      contract_date: contract?.contract_date || new Date().toISOString().split("T")[0],
      delivery_date: contract?.delivery_date || "",
      payment_plan: contract?.payment_plan || "FULL",
      deposit_amount: contract?.deposit_amount || 0,
      discount_amount: contract?.discount_amount || 0,
      items: contract ? [] : [{ variant_id: 0, quantity: 1, unit_price: 0, discount_amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchItems = form.watch("items")
  const watchPaymentPlan = form.watch("payment_plan")
  const watchDiscountAmount = form.watch("discount_amount")

  const calculateTotals = () => {
    const itemsTotal = watchItems.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unit_price - item.discount_amount
      return sum + lineTotal
    }, 0)

    const finalAmount = itemsTotal - watchDiscountAmount

    return {
      total: itemsTotal,
      final: finalAmount,
    }
  }

  const totals = calculateTotals()

  const handleAddCustomer = (customer: Customer) => {
    setCustomers([...customers, customer])
    form.setValue("customer_id", customer.customer_id)
    setShowAddCustomer(false)
  }

  const handleVariantChange = (index: number, variantId: number) => {
    const variant = variants.find((v) => v.variant_id === variantId)
    if (variant) {
      form.setValue(`items.${index}.unit_price`, variant.retail_price)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-6">
          {contract && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Status</p>
                    <Badge variant="secondary" className={`mt-1 ${CONTRACT_STATUS_COLORS[contract.contract_status]}`}>
                      {contract.contract_status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium mt-1">{new Date(contract.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contract_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Code</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contract_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCustomer(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                            {customer.full_name} {customer.phone && `- ${customer.phone}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contract Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ variant_id: 0, quantity: 1, unit_price: 0, discount_amount: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle Variant</TableHead>
                      <TableHead className="w-24">Quantity</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-32">Discount</TableHead>
                      <TableHead className="w-32">Line Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = watchItems[index]
                      const lineTotal = item.quantity * item.unit_price - item.discount_amount

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.variant_id`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    value={field.value?.toString()}
                                    onValueChange={(value) => {
                                      const variantId = Number.parseInt(value)
                                      field.onChange(variantId)
                                      handleVariantChange(index, variantId)
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select variant" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {variants.map((variant) => (
                                        <SelectItem key={variant.variant_id} value={variant.variant_id.toString()}>
                                          {variant.version} - {variant.color}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1000"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.discount_amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1000"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(lineTotal)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="payment_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Plan</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FULL" id="full" />
                          <label htmlFor="full" className="cursor-pointer">
                            Full Payment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="DEPOSIT" id="deposit" />
                          <label htmlFor="deposit" className="cursor-pointer">
                            Deposit Payment
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPaymentPlan === "DEPOSIT" && (
                <FormField
                  control={form.control}
                  name="deposit_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Discount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">-{formatCurrency(watchDiscountAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Amount:</span>
                  <span>{formatCurrency(totals.final)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={form.handleSubmit(onSaveDraft)} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </form>
      </Form>

      <AddCustomerDialog open={showAddCustomer} onOpenChange={setShowAddCustomer} onAdd={handleAddCustomer} />
    </>
  )
}
