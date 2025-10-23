import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { createQuotation } from "../api";
import instance from "@/lib/axios.ts";

interface Customer {
  _id: string;
  full_name: string;
  phone?: string;
  email?: string;
}

interface VehicleVariant {
  _id: string;
  vehicle_id: string;
  version?: string;
  color?: string;
  base_price: number;
}

interface Vehicle {
  _id: string;
  model_name: string;
  variants?: VehicleVariant[];
}

interface QuotationItem {
  variantId: string;
  quantity: number;
  description?: string;
  unitPrice?: number;
}

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [variants, setVariants] = useState<VehicleVariant[]>([]);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([
    { variantId: "", quantity: 1 },
  ]);

  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await instance.get("/customers");
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load customers");
      console.error(error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await instance.get("/vehicles");
      const vehiclesData = response.data.data || [];
      setVehicles(vehiclesData);

      // Fetch variants for all vehicles
      const allVariants: VehicleVariant[] = [];
      for (const vehicle of vehiclesData) {
        try {
          const variantResponse = await instance.get(
            `/vehicles/${vehicle._id}/variants`
          );
          const vehicleVariants = variantResponse.data.data || [];
          allVariants.push(...vehicleVariants);
        } catch (error) {
          console.error(`Error fetching variants for vehicle ${vehicle._id}:`, error);
        }
      }
      setVariants(allVariants);
    } catch (error) {
      toast.error("Failed to load vehicles");
      console.error(error);
    }
  };

  const addItem = () => {
    setItems([...items, { variantId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error("Must have at least 1 item");
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

  const getVariantInfo = (variantId: string) => {
    const variant = variants.find((v) => v._id === variantId);
    if (!variant) return null;

    const vehicle = vehicles.find((v) => v._id === variant.vehicle_id);
    return {
      variant,
      vehicle,
      description: `${vehicle?.model_name || "N/A"} - ${variant.version || "N/A"} (${variant.color || "N/A"})`,
    };
  };

  const calculateTotal = () => {
    let subtotal = 0;

    for (const item of items) {
      const variantInfo = getVariantInfo(item.variantId);
      if (variantInfo) {
        const lineTotal = variantInfo.variant.base_price * item.quantity;
        subtotal += lineTotal;
      }
    }

    const taxRate = 10;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least 1 item");
      return;
    }

    const invalidItem = items.find((item) => !item.variantId || item.quantity <= 0);
    if (invalidItem) {
      toast.error("Please fill in all item information");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerId: selectedCustomerId,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        notes: notes || undefined,
      };

      await createQuotation(payload);
      toast.success("Quotation created successfully");
      navigate("/dealer/staff/quotations");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create quotation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>

      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Select customer for this quotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  required
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.full_name}
                        {customer.phone && ` - ${customer.phone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Select vehicles and quantities for this quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="w-32">Quantity</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-32">Line Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const variantInfo = getVariantInfo(item.variantId);
                      const unitPrice = variantInfo?.variant.base_price || 0;
                      const lineTotal = unitPrice * item.quantity;

                      return (
                        <TableRow key={item.variantId || `new-item-${index}`}>
                          <TableCell>
                            <Select
                              value={item.variantId}
                              onValueChange={(value) =>
                                updateItem(index, "variantId", value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle" />
                              </SelectTrigger>
                              <SelectContent>
                                {variants.map((variant) => {
                                  const vInfo = getVariantInfo(variant._id);
                                  return (
                                    <SelectItem
                                      key={variant._id}
                                      value={variant._id}
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
                              required
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({totals.taxRate}%):</span>
                  <span className="font-medium">
                    {formatCurrency(totals.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(totals.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder="E.g., VIP customer, priority delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dealer/staff/quotations")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Create Quotation"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}