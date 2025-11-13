import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Truck,
  CheckCircle,
  Calendar,
  Info,
  Search,
  RefreshCcw,
  Filter,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Allocation, AllocationItem } from "@/types/dealer_vehicle_allocation";
import { AllocationStatus } from "@/types/dealer_vehicle_allocation";
import instance from "@/lib/axios";
import { toast } from "sonner";
import DepositPaymentButton from "@/features/allocation/page/DepositPaymentButton";
import { useLocation } from "react-router-dom";

/* =================== Constants & Types =================== */
const ITEMS_PER_PAGE = 10;

const RequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

type RequestStatusFilter = "all" | keyof typeof RequestStatus;
type AllocationStatusFilter = "all" | keyof typeof AllocationStatus;

type GroupedEntry = {
  requestId: number | null;
  group: Allocation[];
  earliestDelivery: Date | null;
  totalBatches: number;
  deliveredBatches: number;
  progressValue: number; // 0..100
  totalQuantity: number;
  deliveredQuantity: number;
  totalPaid: number;           // = request.paid_amount
  requestTotalAmount: number;
  isDepositPaid: boolean;      // totalPaid >= 50% requestTotalAmount
  requestStatus: RequestStatus | "UNKNOWN";
  hasAnyNonPendingLot: boolean; // nếu true: ẩn Accept/Reject
};

/* =================== Component =================== */
const AllocationTrackingPage = () => {
  const location = useLocation();

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [confirmingRequestId, setConfirmingRequestId] = useState<number | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [openConfirmDialogId, setOpenConfirmDialogId] = useState<number | null>(null);
  const [openRejectDialogId, setOpenRejectDialogId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(""); // debounced
  const [requestStatusFilter, setRequestStatusFilter] =
    useState<RequestStatusFilter>("all");
  const [lotStatusFilter, setLotStatusFilter] =
    useState<AllocationStatusFilter>("all");

  const [sortBy, setSortBy] = useState<"request_id" | "delivery_date">("request_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // per-allocation pagination (items table)
  const [tablePages, setTablePages] = useState<Record<number, number>>({});

  // debounce search
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(
      () => setSearchQuery(searchInput.trim()),
      300
    );
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    void fetchAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when tab gains focus (e.g., returning from payment gateway)
  useEffect(() => {
    const onFocus = () => {
      void fetchAllocations();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Refetch when ?after=paid
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("after") === "paid") {
      void fetchAllocations();
    }
  }, [location.search]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/dealer-allocations");
      setAllocations(res.data?.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách lô hàng");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ======== Actions: Approve / Reject (request level) ======== */
  const handleConfirmRequest = async (requestId: number) => {
    setConfirmingRequestId(requestId);
    try {
      await instance.patch(`/dealer-requests/${requestId}/approve`);

      // Cập nhật local: request → APPROVED
      setAllocations(prev =>
        prev.map(a =>
          Number(a.request_id) === Number(requestId)
            ? { ...a, request: { ...a.request, status: "APPROVED" } as any }
            : a
        )
      );

      // Nếu BE chưa auto chuyển lô: tự gọi IN_TRANSIT cho các lô PENDING của request này
      const pendingLots = allocations.filter(
        a => Number(a.request_id) === Number(requestId) && a.status === AllocationStatus.PENDING
      );
      for (const lot of pendingLots) {
        try {
          await instance.patch(`/dealer-allocations/${lot.allocation_id}/in-transit`);
        } catch { /* nuốt lỗi từng lô */ }
      }

      // Đồng bộ lại UI local
      setAllocations(prev =>
        prev.map(a =>
          Number(a.request_id) === Number(requestId) && a.status === AllocationStatus.PENDING
            ? { ...a, status: AllocationStatus.IN_TRANSIT }
            : a
        )
      );

      toast.success("Đã chấp nhận yêu cầu & chuyển các lô sang IN_TRANSIT");
      setOpenConfirmDialogId(null);
    } catch (error) {
      toast.error("Lỗi xác nhận chấp nhận yêu cầu");
      console.error(error);
    } finally {
      setConfirmingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setRejectingRequestId(requestId);
    try {
      await instance.patch(`/dealer-requests/${requestId}/reject`);
      setAllocations((prev) =>
        prev.filter((a) => Number(a.request_id) !== Number(requestId))
      );
      toast.success("Từ chối yêu cầu thành công");
      setOpenRejectDialogId(null);
    } catch (error) {
      toast.error("Lỗi từ chối yêu cầu");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setRejectingRequestId(null);
    }
  };

  /* ======== Actions: per-allocation ======== */
  const handleMarkDelivered = async (allocationId: number, reqStatus?: string, allocStatus?: AllocationStatus) => {
    if (reqStatus !== "APPROVED" || allocStatus !== AllocationStatus.IN_TRANSIT) {
      toast.error("Không thể xác nhận giao khi yêu cầu chưa được chấp nhận.");
      return;
    }
    try {
      await instance.patch(`/dealer-allocations/${allocationId}/deliver`);
      setAllocations((prev) =>
        prev.map((a) =>
          Number(a.allocation_id) === Number(allocationId)
            ? { ...a, status: AllocationStatus.DELIVERED }
            : a
        )
      );
      toast.success(`Lô #${allocationId} đã xác nhận DELIVERED`);
    } catch (error: any) {
      const status = error?.response?.status;
      toast.error(
        `Không thể xác nhận DELIVERED cho lô #${allocationId}${status ? ` (${status})` : ""
        }`
      );
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  /* ======== Utils ======== */
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "—";
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const relativeTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "";
    const target = typeof dateString === "string" ? new Date(dateString) : dateString;
    const diff = target.getTime() - Date.now();
    const abs = Math.abs(diff);
    const minutes = Math.round(abs / (60 * 1000));
    const hours = Math.round(abs / (60 * 60 * 1000));
    const days = Math.round(abs / (24 * 60 * 60 * 1000));

    if (abs < 60 * 1000) return diff >= 0 ? "sắp tới" : "vừa xong";
    if (minutes < 60) return diff >= 0 ? `còn ${minutes} phút` : `${minutes} phút trước`;
    if (hours < 24) return diff >= 0 ? `còn ${hours} giờ` : `${hours} giờ trước`;
    return diff >= 0 ? `còn ${days} ngày` : `${days} ngày trước`;
  };

  const toCurrencyVND = (value: number) =>
    (value || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });

  const getAllocationBadge = (status: AllocationStatus) => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "default";
    let icon: JSX.Element | null = null;
    let extra = "";
    switch (status) {
      case AllocationStatus.PENDING:
        variant = "secondary";
        icon = <Clock className="mr-1 h-4 w-4" />;
        break;
      case AllocationStatus.IN_TRANSIT:
        variant = "default";
        icon = <Truck className="mr-1 h-4 w-4" />;
        break;
      case AllocationStatus.DELIVERED:
        variant = "outline";
        icon = <CheckCircle className="mr-1 h-4 w-4" />;
        extra = "text-green-600 border-green-600";
        break;
      default:
        break;
    }
    return (
      <Badge variant={variant} className={cn('whitespace-nowrap px-2 py-0.5 text-xs', extra)}>
        {icon}{status}
      </Badge>
    );
  };

  const calculateTotalQuantity = (items: AllocationItem[]) =>
    items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const getPaginatedItems = (allocationId: number, items: AllocationItem[]) => {
    const page = tablePages[allocationId] || 1;
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (allocationId: number, newPage: number) => {
    setTablePages((prev) => ({ ...prev, [allocationId]: newPage }));
  };

  const isRequestPending = (status?: RequestStatus) => status === RequestStatus.PENDING;
  const isRequestApproved = (status?: RequestStatus) => status === RequestStatus.APPROVED;
  const isRequestRejected = (status?: RequestStatus) => status === RequestStatus.REJECTED;

  /* ======== Build groups + derive metrics (memo) ======== */
  const groupedEntries: GroupedEntry[] = useMemo(() => {
    if (!Array.isArray(allocations) || allocations.length === 0) return [];

    // group by request_id
    const map = new Map<number | string, Allocation[]>();
    allocations.forEach((a) => {
      const key = a.request_id ?? "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });

    const entries: GroupedEntry[] = [];
    for (const [key, group] of map.entries()) {
      const totalBatches = group.length;
      const deliveredBatches = group.filter((a) => a.status === AllocationStatus.DELIVERED).length;
      const progressValue = totalBatches > 0 ? (deliveredBatches / totalBatches) * 100 : 0;

      const totalQuantity = group.reduce(
        (sum, alloc) => sum + calculateTotalQuantity(alloc.items || []),
        0
      );
      const deliveredQuantity = group
        .filter((a) => a.status === AllocationStatus.DELIVERED)
        .reduce((sum, alloc) => sum + calculateTotalQuantity(alloc.items || []), 0);

      const first = group[0];

      // Tổng tiền request (từ items của request)
      const requestItems = first?.request?.items || [];
      const requestTotalAmount = requestItems.reduce(
        (sum: number, item: any) =>
          sum + (item?.requested_quantity || 0) * (item?.variant?.retail_price || 0),
        0
      );

      // Số tiền đã thanh toán của request
      const requestPaid = Number(first?.request?.paid_amount || 0);

      // Cọc đủ khi paid ≥ 50% tổng
      const isDepositPaid = requestPaid >= requestTotalAmount * 0.5;

      // earliest delivery date within group
      const dates = group
        .map((a) => (a.delivery_date ? new Date(a.delivery_date) : null))
        .filter(Boolean) as Date[];
      const earliestDelivery = dates.length
        ? new Date(Math.min(...dates.map((d) => d.getTime())))
        : null;

      const requestStatus: RequestStatus | "UNKNOWN" = first?.request?.status || "UNKNOWN";
      const hasAnyNonPendingLot = group.some(
        (a) => a.status === AllocationStatus.IN_TRANSIT || a.status === AllocationStatus.DELIVERED
      );

      entries.push({
        requestId: key === "unknown" ? null : Number(key),
        group,
        earliestDelivery,
        totalBatches,
        deliveredBatches,
        progressValue,
        totalQuantity,
        deliveredQuantity,
        totalPaid: requestPaid,
        requestTotalAmount,
        isDepositPaid,
        requestStatus,
        hasAnyNonPendingLot,
      });
    }
    return entries;
  }, [allocations]);

  /* ======== Filter + Sort (memo) ======== */
  const viewEntries = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const passSearch = (entry: GroupedEntry) => {
      if (!q) return true;
      const reqIdHit = (entry.requestId ? String(entry.requestId) : "").includes(q);
      const allocHit = entry.group.some(
        (a) =>
          String(a.allocation_id || "").includes(q) ||
          (a.notes || "").toLowerCase().includes(q) ||
          (a.items || []).some((it: any) =>
            (it?.variant?.version || "").toLowerCase().includes(q)
          )
      );
      return reqIdHit || allocHit;
    };

    const passRequestStatus = (entry: GroupedEntry) =>
      requestStatusFilter === "all" ? true : entry.requestStatus === requestStatusFilter;

    const passLotStatus = (entry: GroupedEntry) => {
      if (lotStatusFilter === "all") return true;
      return entry.group.some((a) => a.status === lotStatusFilter);
    };

    const sorted = groupedEntries
      .filter(passSearch)
      .filter(passRequestStatus)
      .filter(passLotStatus)
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "request_id") {
          const av = a.requestId ?? 0;
          const bv = b.requestId ?? 0;
          cmp = av - bv;
        } else {
          const av = a.earliestDelivery ? a.earliestDelivery.getTime() : Number.POSITIVE_INFINITY;
          const bv = b.earliestDelivery ? b.earliestDelivery.getTime() : Number.POSITIVE_INFINITY;
          cmp = av - bv;
        }
        return sortOrder === "asc" ? cmp : -cmp;
      });

    return sorted;
  }, [
    groupedEntries,
    searchQuery,
    requestStatusFilter,
    lotStatusFilter,
    sortBy,
    sortOrder,
  ]);

  /* ======== Top KPI (memo) ======== */
  const kpi = useMemo(() => {
    const totalRequests = groupedEntries.length;
    const totalBatches = groupedEntries.reduce((s, e) => s + e.totalBatches, 0);
    const totalDeliveredBatches = groupedEntries.reduce(
      (s, e) => s + e.deliveredBatches,
      0
    );
    const totalProgress = totalBatches
      ? Math.round((totalDeliveredBatches / totalBatches) * 100)
      : 0;

    const lotCounts = {
      PENDING: allocations.filter((a) => a.status === AllocationStatus.PENDING).length,
      IN_TRANSIT: allocations.filter((a) => a.status === AllocationStatus.IN_TRANSIT).length,
      DELIVERED: allocations.filter((a) => a.status === AllocationStatus.DELIVERED).length,
    };

    return { totalRequests, totalBatches, totalDeliveredBatches, totalProgress, lotCounts };
  }, [groupedEntries, allocations]);

  /* ======== Render ======== */
  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Title + KPI */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-3xl font-bold">Theo dõi Lô hàng</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAllocations}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Yêu cầu</div>
              <div className="text-2xl font-semibold">{kpi.totalRequests}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Đợt giao (đã/ tổng)</div>
              <div className="text-2xl font-semibold">
                {kpi.totalDeliveredBatches}/{kpi.totalBatches}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Tiến độ chung</div>
              <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full transition-all",
                    kpi.totalProgress < 50
                      ? "bg-yellow-500"
                      : kpi.totalProgress < 100
                        ? "bg-blue-500"
                        : "bg-green-600"
                  )}
                  style={{ width: `${kpi.totalProgress}%` }}
                />
              </div>
              <div className="mt-1 text-sm">{kpi.totalProgress}%</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {getAllocationBadge(AllocationStatus.PENDING)}
                  <span className="text-sm">{kpi.lotCounts.PENDING}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getAllocationBadge(AllocationStatus.IN_TRANSIT)}
                  <span className="text-sm">{kpi.lotCounts.IN_TRANSIT}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getAllocationBadge(AllocationStatus.DELIVERED)}
                  <span className="text-sm">{kpi.lotCounts.DELIVERED}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar: Search + Filters + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Tìm theo ID yêu cầu, lô hàng, ghi chú hoặc biến thể…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={requestStatusFilter}
              onValueChange={(v: RequestStatusFilter) => setRequestStatusFilter(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Trạng thái yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Yêu cầu: Tất cả</SelectItem>
                <SelectItem value="PENDING">Yêu cầu: PENDING</SelectItem>
                <SelectItem value="APPROVED">Yêu cầu: APPROVED</SelectItem>
                <SelectItem value="REJECTED">Yêu cầu: REJECTED</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={lotStatusFilter}
              onValueChange={(v: AllocationStatusFilter) => setLotStatusFilter(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái lô" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Lô: Tất cả</SelectItem>
                <SelectItem value="PENDING">Lô: PENDING</SelectItem>
                <SelectItem value="IN_TRANSIT">Lô: IN_TRANSIT</SelectItem>
                <SelectItem value="DELIVERED">Lô: DELIVERED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [by, order] = value.split("-");
              setSortBy(by as "request_id" | "delivery_date");
              setSortOrder(order as "asc" | "desc");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="request_id-asc">ID Yêu cầu (Tăng dần)</SelectItem>
              <SelectItem value="request_id-desc">ID Yêu cầu (Giảm dần)</SelectItem>
              <SelectItem value="delivery_date-asc">
                Ngày giao sớm nhất (Tăng dần)
              </SelectItem>
              <SelectItem value="delivery_date-desc">
                Ngày giao sớm nhất (Giảm dần)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {viewEntries.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center gap-3">
              <Info className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Không có kết quả phù hợp. Hãy thử từ khóa khác, đổi bộ lọc, hoặc làm mới dữ liệu.
              </p>
              <Button variant="outline" onClick={fetchAllocations}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {viewEntries.map((entry) => {
              const {
                requestId,
                group,
                earliestDelivery,
                totalBatches,
                deliveredBatches,
                progressValue,
                totalQuantity,
                deliveredQuantity,
                totalPaid,
                requestTotalAmount,
                isDepositPaid,
                requestStatus,
                hasAnyNonPendingLot,
              } = entry;

              const pending = isRequestPending(requestStatus as RequestStatus);
              const approved = isRequestApproved(requestStatus as RequestStatus);
              const rejected = isRequestRejected(requestStatus as RequestStatus);

              // TIỀN CÒN LẠI & CỌC CẦN THÊM ĐỂ ĐẠT 50%
              const remaining = Math.max(0, requestTotalAmount - totalPaid);
              const depositNeeded = Math.max(0, Math.ceil(requestTotalAmount * 0.5 - totalPaid));

              // Ẩn Accept/Reject khi đã có bất kỳ lô không còn PENDING
              const showDecisionButtons = pending && !hasAnyNonPendingLot;

              return (
                <Card
                  key={requestId ?? Math.random()}
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl">
                          Yêu cầu #{requestId ?? "N/A"}
                        </CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                          <span>
                            Tổng {totalBatches} đợt • {totalQuantity} xe
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span>
                            Giao gần nhất: <strong>{formatDate(earliestDelivery)}</strong>
                            {earliestDelivery && (
                              <i className="text-muted-foreground">
                                {" "}
                                ({relativeTime(earliestDelivery)})
                              </i>
                            )}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help">
                              <Info className="h-4 w-4 mr-1" />
                              Tiến độ: {deliveredBatches}/{totalBatches} đợt •{" "}
                              {deliveredQuantity}/{totalQuantity} xe
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tiến độ giao hàng tổng cho yêu cầu này</p>
                          </TooltipContent>
                        </Tooltip>

                        <Badge
                          variant={isDepositPaid ? "outline" : "destructive"}
                          className={cn(!isDepositPaid ? "border-red-500 text-red-600" : "")}
                        >
                          {isDepositPaid ? "Đã cọc ≥ 50%" : "Thiếu cọc 50%"}
                        </Badge>

                        <Badge variant="secondary">{requestStatus || "UNKNOWN"}</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="relative w-full h-4 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-full transition-all duration-500",
                            progressValue < 50
                              ? "bg-yellow-500"
                              : progressValue < 100
                                ? "bg-blue-500"
                                : "bg-green-600"
                          )}
                          style={{ width: `${Math.round(progressValue)}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow">
                          {Math.round(progressValue)}%
                        </span>
                      </div>
                    </div>

                    {/* Batches */}
                    <Accordion type="multiple" className="w-full">
                      {group
                        .slice()
                        .sort(
                          (a, b) =>
                            Number(a.delivery_batch ?? 0) -
                            Number(b.delivery_batch ?? 0)
                        )
                        .map((allocation) => {
                          const page =
                            tablePages[Number(allocation.allocation_id)] || 1;
                          const paginatedItems = getPaginatedItems(
                            Number(allocation.allocation_id),
                            allocation.items || []
                          );
                          const totalPages = Math.ceil(
                            (allocation.items?.length || 0) / ITEMS_PER_PAGE
                          );
                          const hasDate = allocation.delivery_date
                            ? new Date(allocation.delivery_date)
                            : null;

                          const canDeliver =
                            allocation.status === AllocationStatus.IN_TRANSIT &&
                            requestStatus === "APPROVED";

                          return (
                            <AccordionItem
                              key={allocation.allocation_id}
                              value={`item-${allocation.allocation_id}`}
                              className="border-b last:border-b-0"
                            >
                              <AccordionTrigger className="py-4 hover:bg-muted/50 transition-colors px-4 rounded-md">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-4 flex-wrap text-left">
                                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div className="leading-tight">
                                      <div className="font-medium">
                                        Đợt {allocation.delivery_batch ?? "N/A"} - Lô #
                                        {allocation.allocation_id}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Ngày giao:{" "}
                                        <strong>
                                          {formatDate(allocation.delivery_date as any)}
                                        </strong>
                                        {hasDate && (
                                          <span>
                                            {" "}
                                            • <i>{relativeTime(hasDate)}</i>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {getAllocationBadge(allocation.status)}
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="px-4 pb-4">
                                {allocation.notes && (
                                  <p className="mb-4 text-muted-foreground italic">
                                    “{allocation.notes}”
                                  </p>
                                )}

                                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border">
                                  <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                      <TableRow>
                                        <TableHead>Hình ảnh</TableHead>
                                        <TableHead>Biến thể</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paginatedItems.map((item) => {
                                        const anyItem: any = item as any;
                                        const img =
                                          anyItem.image_url || anyItem?.variant?.image_url;
                                        const version =
                                          anyItem?.variant?.version || "—";
                                        return (
                                          <TableRow
                                            key={item.item_id}
                                            className="hover:bgMuted/50 transition-colors"
                                          >
                                            <TableCell>
                                              {img ? (
                                                <img
                                                  src={img}
                                                  alt={version}
                                                  className="w-16 h-16 object-cover rounded-md shadow-sm"
                                                />
                                              ) : (
                                                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                  N/A
                                                </div>
                                              )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                              {version}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {item.quantity}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>

                                  {totalPages > 1 && (
                                    <Pagination className="mt-4">
                                      <PaginationContent>
                                        <PaginationPrevious
                                          onClick={() =>
                                            handlePageChange(
                                              Number(allocation.allocation_id),
                                              Math.max(1, page - 1)
                                            )
                                          }
                                          aria-disabled={page === 1}
                                        />
                                        {Array.from({ length: totalPages }, (_, i) => (
                                          <PaginationItem key={i}>
                                            <PaginationLink
                                              isActive={page === i + 1}
                                              onClick={() =>
                                                handlePageChange(
                                                  Number(allocation.allocation_id),
                                                  i + 1
                                                )
                                              }
                                            >
                                              {i + 1}
                                            </PaginationLink>
                                          </PaginationItem>
                                        ))}
                                        <PaginationNext
                                          onClick={() =>
                                            handlePageChange(
                                              Number(allocation.allocation_id),
                                              Math.min(totalPages, page + 1)
                                            )
                                          }
                                          aria-disabled={page === totalPages}
                                        />
                                      </PaginationContent>
                                    </Pagination>
                                  )}
                                </div>

                                {/* Per-lot actions: chỉ còn nút “Xác nhận đã giao” */}
                                {requestStatus === "APPROVED" && (
                                  <div className="mt-4 flex items-center gap-2 justify-end">
                                    <Button
                                      variant="default"
                                      disabled={!canDeliver}
                                      onClick={() =>
                                        handleMarkDelivered(
                                          Number(allocation.allocation_id),
                                          requestStatus,
                                          allocation.status
                                        )
                                      }
                                    >
                                      Xác nhận đã giao
                                    </Button>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                    </Accordion>

                    {/* Request-level actions */}
                    {showDecisionButtons && (
                      <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                          Tổng tiền dự kiến:&nbsp;
                          <strong>{toCurrencyVND(requestTotalAmount)}</strong> •&nbsp;Đã
                          thanh toán:&nbsp;<strong>{toCurrencyVND(totalPaid)}</strong>
                        </div>

                        <div className="flex justify-end gap-3">
                          {/* Approve */}
                          <Dialog
                            open={openConfirmDialogId === requestId}
                            onOpenChange={(val) =>
                              setOpenConfirmDialogId(val ? (requestId as number) : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                className="min-w-[160px]"
                                disabled={confirmingRequestId === requestId}
                              >
                                Chấp nhận Yêu cầu
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận chấp nhận yêu cầu</DialogTitle>
                                <DialogDescription>
                                  {!isDepositPaid
                                    ? "Chưa thanh toán cọc 50%, vui lòng thanh toán trước."
                                    : `Bạn có chắc chắn muốn chấp nhận yêu cầu #${requestId}?`}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="flex flex-col space-y-2">
                                {!isDepositPaid && (
                                  <DepositPaymentButton
                                    requestId={requestId as number}
                                    amount={depositNeeded}
                                    mode="DEPOSIT"
                                  />
                                )}
                                <Button
                                  onClick={() => void handleConfirmRequest(requestId as number)}
                                  disabled={!isDepositPaid || confirmingRequestId === requestId}
                                >
                                  Xác nhận Chấp nhận
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Reject */}
                          <Dialog
                            open={openRejectDialogId === requestId}
                            onOpenChange={(val) =>
                              setOpenRejectDialogId(val ? (requestId as number) : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                className="min-w-[160px]"
                                disabled={rejectingRequestId === requestId}
                              >
                                Từ chối Yêu cầu
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận từ chối yêu cầu</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn từ chối yêu cầu #{requestId}?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenRejectDialogId(null)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    void handleRejectRequest(requestId as number)
                                  }
                                  disabled={rejectingRequestId === requestId}
                                >
                                  Xác nhận Từ chối
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}

                    {/* Sau khi APPROVED: nếu còn thiếu tiền thì cho trả phần còn lại */}
                    {approved && (
                      <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <p className="text-sm text-muted-foreground italic">
                          Yêu cầu đã được chấp nhận.
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">
                            Tổng tiền: <strong>{toCurrencyVND(requestTotalAmount)}</strong>{" "}
                            • Đã thanh toán:&nbsp;
                            <strong>{toCurrencyVND(totalPaid)}</strong>
                          </div>
                          {remaining > 0 && (
                            <DepositPaymentButton
                              requestId={requestId as number}
                              amount={remaining}
                              mode="BALANCE"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {rejected && (
                      <div className="mt-6 flex justify-end">
                        <p className="text-sm text-red-600 italic">Yêu cầu đã bị từ chối</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AllocationTrackingPage;
