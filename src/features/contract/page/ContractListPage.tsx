import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mockContracts, mockCustomers } from "../data"

const CONTRACT_STATUS_COLORS = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_SIGN: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  SIGNED: "bg-green-500/10 text-green-700 dark:text-green-400",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-green-600/10 text-green-800 dark:text-green-300",
  CANCELLED: "bg-destructive/10 text-destructive",
}

const PAYMENT_STATUS_COLORS = {
  UNPAID: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400",
}

export function ContractListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const limit = 5

  const filteredContracts = useMemo(() => {
    let filtered = mockContracts.map((contract) => ({
      ...contract,
      customer: mockCustomers.find((c) => c.customer_id === contract.customer_id),
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (contract) =>
          contract.contract_code.toLowerCase().includes(searchLower) ||
          contract.customer?.full_name.toLowerCase().includes(searchLower),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contract) => contract.contract_status === statusFilter)
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((contract) => contract.payment_status === paymentFilter)
    }

    return filtered
  }, [search, statusFilter, paymentFilter])

  const paginatedContracts = useMemo(() => {
    const start = (page - 1) * limit
    return filteredContracts.slice(start, start + limit)
  }, [filteredContracts, page])

  const totalPages = Math.ceil(filteredContracts.length / limit)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">Manage customer vehicle sales agreements</p>
        </div>
        <Button onClick={() => navigate("/dealer/staff/contracts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by contract code or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Contract Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_SIGN">Pending Sign</SelectItem>
                <SelectItem value="SIGNED">Signed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contract Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Final Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No contracts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContracts.map((contract) => (
                  <TableRow key={contract.contract_id}>
                    <TableCell className="font-medium">{contract.contract_code}</TableCell>
                    <TableCell>{contract.customer?.full_name || "N/A"}</TableCell>
                    <TableCell>{formatDate(contract.contract_date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={CONTRACT_STATUS_COLORS[contract.contract_status]}>
                        {contract.contract_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={PAYMENT_STATUS_COLORS[contract.payment_status]}>
                        {contract.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(contract.final_amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dealer/staff/contracts/${contract.contract_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dealer/staff/contracts/${contract.contract_id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredContracts.length)} of{" "}
            {filteredContracts.length} contracts
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
