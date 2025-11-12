import { useEffect, useState } from "react";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCcw, Search, Eye, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import instance from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/redux";
import { useNavigate } from "react-router-dom";

type Customer = {
  customer_id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
};

type Dealer = {
  dealer_id: number;
  dealer_name: string;
  address?: string;
  phone?: string;
  email?: string;
};

type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: "ADMIN" | "DEALER_MANAGER" | "DEALER_STAFF";
  dealer_id: number;
};

type Vehicle = {
  vehicle_id: number;
  model_name: string;
  body_type: string;
  doors: number;
  seats: number;
  image_urls: string[];
  description?: string;
  specifications?: string;
  warranty_years?: number;
  created_at: string;
  updated_at?: string | null;
};

type Variant = {
  variant_id: number;
  color: string;
  base_price: number;
  retail_price: number;
  dealer_price?: number;
  motor_power_kw?: number;
  battery_capacity_kwh?: number;
  range_km?: number;
  top_speed_kmh?: number;
  charging_time_hours?: number;
  model_year?: number;
  status?: string;
  version?: string;
  vehicle: Vehicle;
  created_at: string;
  updated_at?: string | null;
};

export type Quotation = {
  quotation_id: number;
  quotation_number: string;
  customer: Customer;
  dealer: Dealer;
  user: User;
  variant: Variant;
  subtotal: number;
  discount_total: number;
  discount_percent?: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  notes?: string;
  approved_by?: string | null;
  status?: string;
  created_at: string;
  updated_at?: string | null;
};

export default function QuotationListPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filtered, setFiltered] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/quotations");
      setQuotations(res.data.data);
      console.log(res.data.data);
      setFiltered(res.data.data);
    } catch {
      toast.error("Không tải được danh sách báo giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();

    if (!s) {
      setFiltered(quotations);
      return;
    }

    setFiltered(
      quotations.filter((q) => {
        const quotationNumber = q.quotation_number?.toLowerCase() ?? "";
        const customerName = q.customer?.full_name?.toLowerCase() ?? "";
        const modelName = q.variant?.vehicle?.model_name?.toLowerCase() ?? "";

        return (
          quotationNumber.includes(s) ||
          customerName.includes(s) ||
          modelName.includes(s)
        );
      })
    );
  }, [search, quotations]);


  const handleRefresh = async () => {
    setSearch("");
    await fetchQuotations();
    toast.success("Làm mới thành công");
  };

  const handleCreateContract = (quotationId: number) => {
    navigate(`/dealer/staff/contracts/new?quotationId=${quotationId}`);
  };
  return (
    <Card className="w-full mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Danh sách báo giá</CardTitle>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mã BG, KH, xe..."
              className="pl-8 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã BG</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Xe</TableHead>
              <TableHead>Tổng tiền</TableHead>
              {user!.role === "ADMIN" && <TableHead>Đại lý</TableHead>}
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => (
              <TableRow key={q.quotation_id}>
                <TableCell>{q.quotation_number}</TableCell>
                <TableCell>{q.customer?.full_name}</TableCell>
                <TableCell>{q.variant?.vehicle?.model_name} {q.variant?.version}</TableCell>
                <TableCell>{Number(q.total_amount).toLocaleString("vi-VN")} ₫</TableCell>
                {user!.role === "ADMIN" && <TableCell>{q.dealer?.dealer_name}</TableCell>}
                <TableCell>{format(new Date(q.created_at), "dd/MM/yyyy", { locale: vi })}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCreateContract(q.quotation_id)}>
                    <PlusCircle className="h-4 w-4 text-green-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={user!.role === "ADMIN" ? 7 : 6} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground justify-center">
        Tổng cộng {filtered.length} báo giá
      </CardFooter>
    </Card>
  );
}
