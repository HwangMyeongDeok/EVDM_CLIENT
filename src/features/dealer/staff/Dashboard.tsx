import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, FileText, Users, Calendar, Package, CheckCircle2, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import type {
  StaffDashboardResponse,
  InventoryItem,
  QuotationItem,
  StaffContractItem,
  PendingDeliveryItem,
  StaffKpis,
  MonthlyPerformanceItem,
} from "@/types/dashboard";

/* ---------------------------
   KEEP: Mock Test Drives (user requested)
   --------------------------- */
export interface TestDrive {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleModel: string;
  scheduledDate: string; // ISO date
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  feedback?: string;
}

const mockTestDrives: TestDrive[] = [
  {
    id: "td1",
    customerId: "c1",
    customerName: "John Smith",
    vehicleId: "v1",
    vehicleModel: "Tesla Model 3",
    scheduledDate: "2025-01-25",
    status: "scheduled",
  },
  {
    id: "td2",
    customerId: "c3",
    customerName: "Mike Wilson",
    vehicleId: "v3",
    vehicleModel: "Rivian R1T",
    scheduledDate: "2025-01-23",
    status: "completed",
    feedback: "Great experience! Very impressed with the power and handling.",
  },
];

export default function DealerStaffDashboard(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<StaffKpis | null>(null);
  const [recentQuotations, setRecentQuotations] = useState<QuotationItem[]>([]);
  const [recentContracts, setRecentContracts] = useState<StaffContractItem[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDeliveryItem[]>([]);
  const [inventorySample, setInventorySample] = useState<InventoryItem[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlyPerformanceItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi endpoint chung /dashboard — backend sẽ tự detect role
        const resp = await api.get<{ success: boolean; data: StaffDashboardResponse }>("/dashboard");
        if (!mounted) return;
        if (!resp?.data?.success) {
          setError("Lấy dữ liệu dashboard không thành công.");
          setLoading(false);
          return;
        }
        const payload = resp.data.data;

        // Gán data vào state (nếu server ko trả 1 trường nào thì để mặc định)
        setKpis(payload.kpis ?? null);
        setRecentQuotations(payload.recentQuotations ?? []);
        setRecentContracts(payload.recentContracts ?? []);
        setPendingDeliveries(payload.pendingDeliveries ?? []);
        setInventorySample(payload.inventorySample ?? []);
        // Nếu backend cũng trả monthlyPerformance, gán luôn, nếu không để rỗng (frontend sẽ hiển thị trống)
        setMonthlySalesData((payload as any).monthlyPerformance ?? []);
      } catch (err: any) {
        console.error("API error (staff dashboard):", err);
        setError(err?.response?.data?.message || "Lỗi khi tải dữ liệu Dashboard (Staff).");
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  // Fallbacks: nếu BE không trả tổng customers, hiển thị mock / 0
  const totalVehicles = inventorySample.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const activeQuotations = recentQuotations.filter(q => q.status === "sent" || q.status === "accepted").length;
  const signedContracts = recentContracts.filter(c => c.status === "signed").length;
  const totalCustomers = 0; // giữ nguyên mock nếu backend chưa trả count

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview for today.</p>
        {loading && <p className="text-sm text-muted-foreground mt-2">Đang tải dữ liệu...</p>}
        {error && <p className="text-sm text-destructive mt-2">Lỗi: {error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">In stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotations}</div>
            <p className="text-xs text-muted-foreground">Pending & accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signedContracts}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & recent */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>Latest quotations created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotations.slice(0, 5).map((quote) => (
                <div key={String(quote.id)} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{quote.quotation_number ?? quote.id}</p>
                    <p className="text-xs text-muted-foreground">{quote.createdAt}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={quote.status === "accepted" ? "default" : quote.status === "sent" ? "secondary" : "outline"}>
                      {quote.status ?? "-"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">${(quote.total_amount ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {recentQuotations.length === 0 && !loading && <p className="text-sm text-muted-foreground">Không có báo giá gần đây.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="contracts" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Nếu server không trả dữ liệu lịch sử, biểu đồ sẽ trống.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles"><Link to="/dealer/staff/vehicles"> Vehicles</Link></TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4" id="vehicles">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Electric Vehicles</h2>
            <Button>
              <Car className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventorySample.map((v) => (
                  <TableRow key={String(v.variant_id)}>
                    <TableCell className="font-medium">{v.model}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant={v.quantity > 0 ? "default" : "secondary"}>
                        {v.quantity > 0 ? "Available" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Create Quote</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {inventorySample.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">Không có dữ liệu kho.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4" id="quotations">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quotations</h2>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Quotation
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotations.map((q) => (
                  <TableRow key={String(q.id)}>
                    <TableCell className="font-medium">{q.quotation_number ?? q.id}</TableCell>
                    <TableCell>{q.createdAt}</TableCell>
                    <TableCell>
                      <Badge variant={q.status === "accepted" ? "default" : q.status === "sent" ? "secondary" : "outline"}>
                        {q.status ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>${(q.total_amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {recentQuotations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Không có báo giá.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4" id="contracts">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Contracts</h2>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContracts.map(c => (
                  <TableRow key={String(c.id)}>
                    <TableCell className="font-medium">{c.contract_code ?? c.id}</TableCell>
                    <TableCell>{c.contractDate}</TableCell>
                    <TableCell><Badge variant="default">{c.status}</Badge></TableCell>
                    <TableCell>${(c.final_amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell><Button size="sm" variant="outline">View</Button></TableCell>
                  </TableRow>
                ))}
                {recentContracts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Không có hợp đồng gần đây.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TEST DRIVES (KEEP MOCK) */}
        <TabsContent value="test-drives" className="space-y-4" id="test-drives">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Test Drives</h2>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Test Drive
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTestDrives.map((testDrive) => (
                  <TableRow key={testDrive.id}>
                    <TableCell className="font-medium">{testDrive.customerName}</TableCell>
                    <TableCell>{testDrive.vehicleModel}</TableCell>
                    <TableCell>{testDrive.scheduledDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          testDrive.status === "completed"
                            ? "default"
                            : testDrive.status === "scheduled"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {testDrive.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{testDrive.feedback || "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <div id="reports" className="space-y-4">
        <h2 className="text-2xl font-bold">Sales Report</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your sales performance this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quotations Created</span>
                <span className="text-2xl font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contracts Signed</span>
                <span className="text-2xl font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-2xl font-bold">67%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
              <CardDescription>Total revenue generated this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-3xl font-bold">$384,000</div>
                  <p className="text-sm text-muted-foreground">Average: $48,000 per sale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Test Drives</CardTitle>
              <CardDescription>Customer engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Scheduled</span>
                <span className="text-2xl font-bold">15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-2xl font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion</span>
                <span className="text-2xl font-bold">53%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Monthly revenue and contracts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="contracts" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4 }} name="Contracts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
