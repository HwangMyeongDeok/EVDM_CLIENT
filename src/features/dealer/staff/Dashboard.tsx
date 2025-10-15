import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Car, FileText, Users, Calendar, Package, CheckCircle2, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Link } from "react-router-dom";
// Vehicle
export interface Vehicle {
  id: string;
  model: string;
  version: string;
  color: string;
  price: number;
  batteryCapacity: string;   // "82 kWh"
  range: string;             // "358 miles"
  chargingTime: string;      // "30 min (DC Fast)"
  image: string;
  inStock: number;
}

// Quotation
export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleModel: string;
  price: number;
  discount: number;
  finalPrice: number;
  status: "sent" | "accepted" | "rejected" | "expired";
  createdAt: string;   // ISO date
  validUntil: string;  // ISO date
}

// Contract
export interface Contract {
  id: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleModel: string;
  totalAmount: number;
  paymentMethod: "cash" | "bank_transfer" | "financing";
  status: "draft" | "signed" | "active" | "completed" | "cancelled";
  signedAt: string;      // ISO date
  deliveryStatus?: "pending" | "in_transit" | "delivered";
}

// Customer
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;   // ISO date
}

// TestDrive
export interface TestDrive {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleModel: string;
  scheduledDate: string;  // ISO date
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  feedback?: string;
}


// Mock Data
const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    model: "Tesla Model 3",
    version: "Long Range",
    color: "Pearl White",
    price: 45000,
    batteryCapacity: "82 kWh",
    range: "358 miles",
    chargingTime: "30 min (DC Fast)",
    image: "/tesla-model-3-sleek-profile.png",
    inStock: 5,
  },
  {
    id: "v2",
    model: "Tesla Model Y",
    version: "Performance",
    color: "Midnight Silver",
    price: 58000,
    batteryCapacity: "75 kWh",
    range: "303 miles",
    chargingTime: "27 min (DC Fast)",
    image: "/tesla-model-y.png",
    inStock: 3,
  },
  {
    id: "v3",
    model: "Rivian R1T",
    version: "Adventure",
    color: "Forest Green",
    price: 73000,
    batteryCapacity: "135 kWh",
    range: "314 miles",
    chargingTime: "40 min (DC Fast)",
    image: "/rivian-r1t-truck.jpg",
    inStock: 2,
  },
] 

const mockQuotations: Quotation[] = [
  {
    id: "q1",
    customerId: "c1",
    customerName: "John Smith",
    vehicleId: "v1",
    vehicleModel: "Tesla Model 3 Long Range",
    price: 45000,
    discount: 2000,
    finalPrice: 43000,
    status: "sent",
    createdAt: "2025-01-15",
    validUntil: "2025-02-15",
  },
  {
    id: "q2",
    customerId: "c2",
    customerName: "Sarah Johnson",
    vehicleId: "v2",
    vehicleModel: "Tesla Model Y Performance",
    price: 58000,
    discount: 3000,
    finalPrice: 55000,
    status: "accepted",
    createdAt: "2025-01-20",
    validUntil: "2025-02-20",
  },
]

const mockContracts: Contract[] = [
  {
    id: "ct1",
    quotationId: "q2",
    customerId: "c2",
    customerName: "Sarah Johnson",
    vehicleId: "v2",
    vehicleModel: "Tesla Model Y Performance",
    totalAmount: 55000,
    paymentMethod: "bank_transfer",
    status: "signed",
    signedAt: "2025-01-22",
    deliveryStatus: "in_transit",
  },
]

const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, San Francisco, CA",
    createdAt: "2025-01-10",
  },
  {
    id: "c2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA",
    createdAt: "2025-01-15",
  },
]

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
]

const monthlySalesData = [
  { month: "Jul", revenue: 125000, contracts: 3 },
  { month: "Aug", revenue: 185000, contracts: 4 },
  { month: "Sep", revenue: 240000, contracts: 5 },
  { month: "Oct", revenue: 195000, contracts: 4 },
  { month: "Nov", revenue: 310000, contracts: 7 },
  { month: "Dec", revenue: 280000, contracts: 6 },
  { month: "Jan", revenue: 384000, contracts: 8 },
]

export default function DealerStaffDashboard() {
  const totalVehicles = mockVehicles.reduce((sum, v) => sum + v.inStock, 0)
  const activeQuotations = mockQuotations.filter((q) => q.status === "sent" || q.status === "accepted").length
  const signedContracts = mockContracts.filter((c) => c.status === "signed").length
  const totalCustomers = mockCustomers.length

  return (
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your overview for today.</p>
          </div>

          {/* Stats Cards */}
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

          {/* Recent Quotations Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotations</CardTitle>
                <CardDescription>Latest quotations created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockQuotations.slice(0, 4).map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{quote.customerName}</p>
                        <p className="text-xs text-muted-foreground">{quote.vehicleModel}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={
                            quote.status === "accepted" ? "default" : quote.status === "sent" ? "secondary" : "outline"
                          }
                        >
                          {quote.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">${quote.finalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Revenue trend over the last 7 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `$${value.toLocaleString()}` : value,
                        name === "revenue" ? "Revenue" : "Contracts",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="contracts"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vehicles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vehicles">
                <Link to="/dealer/staff/vehicles"> Vehicles</Link></TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
            </TabsList>

            {/* Vehicles Tab */}
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
                    {mockVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.model}</TableCell>
                        <TableCell>{vehicle.version}</TableCell>
                        <TableCell>{vehicle.color}</TableCell>
                        <TableCell>${vehicle.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={vehicle.inStock > 0 ? "default" : "secondary"}>
                            {vehicle.inStock > 0 ? "Available" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>{vehicle.batteryCapacity}</TableCell>
                        <TableCell>{vehicle.range}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Create Quote
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Quotations Tab */}
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockQuotations.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{quote.customerName}</TableCell>
                        <TableCell>{quote.vehicleModel}</TableCell>
                        <TableCell>${quote.finalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              quote.status === "accepted"
                                ? "default"
                                : quote.status === "sent"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{quote.validUntil}</TableCell>
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

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-4" id="contracts">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Contracts</h2>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.id}</TableCell>
                        <TableCell>{contract.customerName}</TableCell>
                        <TableCell>{contract.vehicleModel}</TableCell>
                        <TableCell>${contract.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{contract.paymentMethod.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant="default">{contract.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contract.deliveryStatus === "delivered" ? "default" : "secondary"}>
                            {contract.deliveryStatus}
                          </Badge>
                        </TableCell>
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

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-4" id="customers">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Customers</h2>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>{customer.createdAt}</TableCell>
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

            {/* Test Drives Tab */}
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

          {/* Enhanced Reports Section */}
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

            {/* Full-width chart for better visibility */}
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `$${value.toLocaleString()}` : value,
                        name === "revenue" ? "Revenue" : "Contracts",
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="contracts"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                      name="Contracts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
  )
}
