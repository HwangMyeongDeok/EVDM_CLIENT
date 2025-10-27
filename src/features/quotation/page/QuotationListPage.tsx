import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, Check, X, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  getQuotations,
  deleteQuotation,
  approveQuotation,
  rejectQuotation,
  type QuotationResponse,
} from "../api";

export default function QuotationListPage() {
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationResponse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      toast.error("Failed to load quotations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (quotation: QuotationResponse) => {
    setSelectedQuotation(quotation);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuotationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteQuotation(quotationToDelete);
      toast.success("Quotation deleted successfully");
      fetchQuotations();
    } catch (error) {
      toast.error("Failed to delete quotation");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveQuotation(id);
      toast.success("Quotation approved successfully");
      fetchQuotations();
    } catch (error) {
      toast.error("Failed to approve quotation");
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectQuotation(id);
      toast.success("Quotation rejected successfully");
      fetchQuotations();
    } catch (error) {
      toast.error("Failed to reject quotation");
      console.error(error);
    }
  };

  const getStatusBadge = (status: QuotationResponse["status"]) => {
    const statusConfig = {
      DRAFT: { variant: "outline" as const, label: "Draft" },
      SENT: { variant: "secondary" as const, label: "Sent" },
      APPROVED: { variant: "default" as const, label: "Approved" },
      REJECTED: { variant: "destructive" as const, label: "Rejected" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCustomerName = (customer: QuotationResponse["customer"]) => {
    if (typeof customer === "string") return customer;
    return customer.fullName;
  };

  const getStaffName = (staff: QuotationResponse["staff"]) => {
    if (typeof staff === "string") return staff;
    return staff.fullName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation Management</h1>
        </div>
        <Link to="/dealer/staff/quotations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Quotation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation List</CardTitle>
          <CardDescription>
            Total: {quotations.length} quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No quotations found
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quotation) => (
                  <TableRow key={quotation._id}>
                    <TableCell className="font-medium">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell>{getCustomerName(quotation.customer)}</TableCell>
                    <TableCell>{getStaffName(quotation.staff)}</TableCell>
                    <TableCell>{formatCurrency(quotation.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(quotation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {quotation.status === "DRAFT" && (
                          <>
                            <Link to={`/dealer/staff/quotations/edit/${quotation._id}`}>
                              <Button size="sm" variant="outline">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(quotation._id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {quotation.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(quotation._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(quotation._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogDescription>
              No: {selectedQuotation?.quotationNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Customer
                  </div>
                  <p className="text-sm">
                    {getCustomerName(selectedQuotation.customer)}
                  </p>
                  {typeof selectedQuotation.customer !== "string" &&
                    selectedQuotation.customer.phone && (
                      <p className="text-xs text-muted-foreground">
                        {selectedQuotation.customer.phone}
                      </p>
                    )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Staff
                  </div>
                  <p className="text-sm">
                    {getStaffName(selectedQuotation.staff)}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(selectedQuotation.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </div>
                  <p className="text-sm">
                    {formatDate(selectedQuotation.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedQuotation.items.map((item) => (
                      <TableRow key={item.variantId}>
                        <TableCell>{item.description || item.variantId}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.discountAmount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedQuotation.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">
                    Tax ({selectedQuotation.taxRate}%):
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedQuotation.taxAmount)}
                  </span>
                </div>
                {selectedQuotation.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Total Discount:</span>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(selectedQuotation.discountTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(selectedQuotation.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Notes
                  </div>
                  <p className="text-sm mt-1">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
