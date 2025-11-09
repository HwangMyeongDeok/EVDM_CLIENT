import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Users, Package, AlertTriangle, Trophy } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"

// --- Mock Data cho Manager ---

// (Giả sử bạn import các interface Vehicle, Contract, etc. từ một file chung)

// Dữ liệu hiệu suất hàng tháng (thêm lợi nhuận)
const monthlyPerformanceData = [
  { month: "Jul", revenue: 125000, profit: 15000 },
  { month: "Aug", revenue: 185000, profit: 22000 },
  { month: "Sep", revenue: 240000, profit: 29000 },
  { month: "Oct", revenue: 195000, profit: 23000 },
  { month: "Nov", revenue: 310000, profit: 38000 },
  { month: "Dec", revenue: 280000, profit: 34000 },
  { month: "Jan", revenue: 384000, profit: 45000 },
]

// Dữ liệu hiệu suất của nhân viên
const salesByStaffData = [
  { name: "An Nguyen", sales: 12, revenue: 580000 },
  { name: "Binh Tran", sales: 9, revenue: 430000 },
  { name: "Chi Le", sales: 7, revenue: 390000 },
  { name: "Dung Pham", sales: 5, revenue: 210000 },
]

// Cảnh báo tồn kho
const inventoryAlerts = [
  { model: "Tesla Model Y", inStock: 3, status: "Low" },
  { model: "Rivian R1T", inStock: 2, status: "Low" },
  { model: "Tesla Model 3", inStock: 5, status: "OK" },
]

// Hợp đồng giá trị cao gần đây cần duyệt
const mockHighValueContracts = [
  {
    id: "ct3",
    customerName: "Vinh Ho",
    vehicleModel: "Rivian R1T Adventure",
    totalAmount: 73000,
    salespersonName: "An Nguyen",
    status: "pending_approval",
  },
  {
    id: "ct4",
    customerName: "Thao Vu",
    vehicleModel: "Tesla Model Y Performance",
    totalAmount: 58000,
    salespersonName: "Binh Tran",
    status: "signed",
  },
]

// --- Component Dashboard của Manager ---

export default function DealerManagerDashboard() {
  const totalRevenue = monthlyPerformanceData.reduce((sum, d) => sum + d.revenue, 0)
  const totalProfit = monthlyPerformanceData.reduce((sum, d) => sum + d.profit, 0)
  const totalUnitsSold = salesByStaffData.reduce((sum, s) => sum + s.sales, 0)
  const totalStaff = salesByStaffData.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan về hiệu suất của đại lý.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tổng từ 7 tháng qua</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lợi Nhuận</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tỷ suất: {(totalProfit / totalRevenue * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe Đã Bán</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnitsSold}</div>
            <p className="text-xs text-muted-foreground">Tổng số xe đã bán</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân Viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Đại Lý</CardTitle>
            <CardDescription>Doanh thu và Lợi nhuận qua 7 tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "revenue" ? "Doanh thu" : "Lợi nhuận",
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Doanh thu"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Lợi nhuận"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Nhân Viên</CardTitle>
            <CardDescription>Doanh thu theo từng nhân viên tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByStaffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
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

      {/* Tables & Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hợp Đồng Cần Duyệt</CardTitle>
            <CardDescription>Các hợp đồng giá trị cao đang chờ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead>Số Tiền</TableHead>
                  <TableHead>Nhân Viên</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHighValueContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.customerName}</TableCell>
                    <TableCell>${contract.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{contract.salespersonName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={contract.status === "pending_approval" ? "destructive" : "default"}
                      >
                        {contract.status === "pending_approval" ? "Chờ duyệt" : "Đã ký"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cảnh Báo Tồn Kho</CardTitle>
            <CardDescription>Các mẫu xe sắp hết hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryAlerts.map((item) => (
              <div key={item.model} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{item.model}</p>
                  <p className="text-sm text-muted-foreground">Còn lại: {item.inStock}</p>
                </div>
                {item.status === "Low" && (
                  <Badge variant="destructive" className="gap-1.5">
                    <AlertTriangle className="h-3 w-3" />
                    Thấp
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}