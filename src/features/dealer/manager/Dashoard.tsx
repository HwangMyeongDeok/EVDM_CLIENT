import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Package, AlertTriangle, Trophy } from "lucide-react";
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
} from "recharts";
import api from "@/lib/axios";
import type {
  ManagerDashboardResponse,
  MonthlyPerformanceItem,
  SalesByStaffItem,
  LowStockItem,
  HighValueContractItem,
  ManagerKpis,
} from "@/types/dashboard";

const mockMonthlyPerformance: MonthlyPerformanceItem[] = [
  { month: "Jul", revenue: 125000, profit: 15000 },
  { month: "Aug", revenue: 185000, profit: 22000 },
  { month: "Sep", revenue: 240000, profit: 29000 },
  { month: "Oct", revenue: 195000, profit: 23000 },
  { month: "Nov", revenue: 310000, profit: 38000 },
  { month: "Dec", revenue: 280000, profit: 34000 },
  { month: "Jan", revenue: 384000, profit: 45000 },
];

const mockSalesByStaff: SalesByStaffItem[] = [
  { name: "An Nguyen", sales: 12, revenue: 580000 },
  { name: "Binh Tran", sales: 9, revenue: 430000 },
  { name: "Chi Le", sales: 7, revenue: 390000 },
  { name: "Dung Pham", sales: 5, revenue: 210000 },
];

const mockLowStock: LowStockItem[] = [
  { variant_id: 1, model: "Tesla Model Y", inStock: 3 },
  { variant_id: 2, model: "Rivian R1T", inStock: 2 },
  { variant_id: 3, model: "Tesla Model 3", inStock: 5 },
];

const mockHighValueContracts: HighValueContractItem[] = [
  {
    id: "ct3",
    customerName: "Vinh Ho",
    totalAmount: 73000,
    salespersonName: "An Nguyen",
    status: "pending_approval",
  },
  {
    id: "ct4",
    customerName: "Thao Vu",
    totalAmount: 58000,
    salespersonName: "Binh Tran",
    status: "signed",
  },
];

export default function DealerManagerDashboard(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<ManagerKpis | null>(null);
  const [monthlyPerformance, setMonthlyPerformance] = useState<MonthlyPerformanceItem[]>([]);
  const [salesByStaff, setSalesByStaff] = useState<SalesByStaffItem[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [highValueContracts, setHighValueContracts] = useState<HighValueContractItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get<{ success: boolean; data: ManagerDashboardResponse }>("/dashboard");
        if (!mounted) return;
        if (!resp?.data?.success) {
          setError("Không lấy được dữ liệu dashboard (manager).");
          setLoading(false);
          return;
        }
        const payload = resp.data.data;
        setKpis(payload.kpis ?? null);
        setMonthlyPerformance(payload.monthlyPerformance ?? mockMonthlyPerformance);
        setSalesByStaff(payload.salesByStaff ?? mockSalesByStaff);
        setLowStock(payload.lowStock ?? mockLowStock);
        setHighValueContracts(payload.highValueContracts ?? mockHighValueContracts);
      } catch (err: any) {
        console.error("Manager dashboard API error:", err);
        setError(err?.response?.data?.message || "Lỗi khi tải Dashboard (Manager).");
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  // local fallbacks
  const k = kpis ?? {
    totalRevenue: monthlyPerformance.reduce((s, m) => s + (m.revenue ?? 0), 0),
    totalProfit: monthlyPerformance.reduce((s, m) => s + (m.profit ?? 0), 0),
    totalUnitsSold: salesByStaff.reduce((s, x) => s + (x.sales ?? 0), 0),
    totalStaff: salesByStaff.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan về hiệu suất của đại lý.</p>
        {loading && <p className="text-sm text-muted-foreground mt-2">Đang tải dữ liệu...</p>}
        {error && <p className="text-sm text-destructive mt-2">Lỗi: {error}</p>}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${k.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tổng từ khoảng thời gian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lợi Nhuận</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${k.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tỷ suất: {k.totalRevenue ? ((k.totalProfit / k.totalRevenue) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe Đã Bán</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{k.totalUnitsSold}</div>
            <p className="text-xs text-muted-foreground">Tổng số xe đã bán</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân Viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{k.totalStaff}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Đại Lý</CardTitle>
            <CardDescription>Doanh thu và Lợi nhuận theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Doanh thu" />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Lợi nhuận" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Nhân Viên</CardTitle>
            <CardDescription>Doanh thu theo từng nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByStaff} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
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
                {highValueContracts.map((contract) => (
                  <TableRow key={String(contract.id)}>
                    <TableCell className="font-medium">{contract.customerName}</TableCell>
                    <TableCell>${contract.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{contract.salespersonName}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === "pending_approval" ? "destructive" : "default"}>
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
            <CardDescription>Mẫu xe sắp hết hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStock.map((item) => (
              <div key={String(item.variant_id)} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{item.model}</p>
                  <p className="text-sm text-muted-foreground">Còn lại: {item.inStock}</p>
                </div>
                {item.inStock <= 5 && (
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
  );
}
