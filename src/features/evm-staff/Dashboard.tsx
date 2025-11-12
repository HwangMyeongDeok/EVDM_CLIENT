import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Building,
  Package,
  ClipboardCheck, // (MỚI) Duyệt PO
  BadgeDollarSign, // (MỚI) Quyết toán
  Truck,          // (MỚI) Giao hàng
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Link } from "react-router-dom"

// --- Mock Data cho Hãng xe ---

// (Giả sử các interface PO, Dealer, Settlement được định nghĩa ở đâu đó)
interface PurchaseOrder {
  id: string;
  dealerId: string;
  dealerName: string;
  model: string;
  quantity: number;
  totalAmount: number;
  status: "pending_approval" | "approved" | "rejected";
  creditUsed: number;
}

interface Dealer {
  id: string;
  name: string;
  creditLimit: number;
  creditUsed: number;
}

// Dữ liệu đơn hàng (PO) chờ duyệt
const pendingPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-101",
    dealerId: "d1",
    dealerName: "EV Auto (Hà Nội)",
    model: "Tesla Model Y",
    quantity: 20,
    totalAmount: 1160000,
    status: "pending_approval",
    creditUsed: 580000, // 50%
  },
  {
    id: "po-102",
    dealerId: "d2",
    dealerName: "Sài Gòn EV",
    model: "Rivian R1T",
    quantity: 10,
    totalAmount: 730000,
    status: "pending_approval",
    creditUsed: 365000, // 50%
  },
]

// Dữ liệu Top Đại lý
const topDealersData = [
  { name: "EV Auto (Hà Nội)", revenue: 1250000, units: 25 },
  { name: "Sài Gòn EV", revenue: 980000, units: 18 },
  { name: "Đà Nẵng Electric", revenue: 750000, units: 14 },
]

export default function EvmDashboard() {
  const totalDealers = 15; // Tổng số đại lý
  const totalRevenueYTD = 25_000_000; // Doanh thu cả năm
  const totalUnitsSoldYTD = 450;
  const pendingPOsCount = pendingPurchaseOrders.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">EVM Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan mạng lưới đại lý và vận hành.</p>
      </div>

      {/* --- (MỚI) Khu vực Hành động của Hãng xe --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Đơn Hàng (PO) Chờ Duyệt 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-2">{pendingPOsCount} đơn hàng mới</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cần kiểm tra hạn mức tín dụng và phê duyệt.
            </p>
            <Button asChild>
              <Link to="/evm/orders">Xem danh sách PO</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              Lô Hàng Chờ Giao (Luồng 2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-2">3 lô hàng</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Đã duyệt và chờ bộ phận logistics xuất kho.
            </p>
            <Button asChild variant="secondary">
              <Link to="/evm/logistics">Đến trang Vận chuyển</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
              Quyết Toán (Luồng 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-2">Kỳ Q4/2025</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Đã đến hạn quyết toán thưởng sales cho đại lý.
            </p>
            <Button asChild variant="secondary">
              <Link to="/evm/settlements">Thực hiện quyết toán</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <hr />

      {/* --- KPI Toàn Mạng Lưới --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenueYTD.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tính đến T11/2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Xe Bán (YTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnitsSoldYTD}</div>
            <p className="text-xs text-muted-foreground">+15% so với YTD 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đại Lý</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDealers}</div>
            <p className="text-xs text-muted-foreground">Trên toàn quốc</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe Tồn Kho (Tổng)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,200</div>
            <p className="text-xs text-muted-foreground">Sẵn sàng giao</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Charts & Tables --- */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn Hàng (PO) Chờ Duyệt</CardTitle>
            <CardDescription>Các đơn hàng mới nhất từ đại lý (Luồng 2.2)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đại Lý</TableHead>
                  <TableHead>Mẫu Xe</TableHead>
                  <TableHead>Số Lượng</TableHead>
                  <TableHead>Tổng Tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPurchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.dealerName}</TableCell>
                    <TableCell>{order.model}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Đại Lý (YTD)</CardTitle>
            <CardDescription>Hiệu suất bán hàng cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDealersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}