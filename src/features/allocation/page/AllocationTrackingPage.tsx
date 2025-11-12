import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Clock, Truck, CheckCircle, Calendar, Info, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import type { Allocation, AllocationItem } from '@/types/dealer_vehicle_allocation';
import { AllocationStatus } from '@/types/dealer_vehicle_allocation';
import instance from '@/lib/axios';
import { toast } from 'sonner';
import DepositPaymentButton from '@/features/allocation/page/DepositPaymentButton';

const ITEMS_PER_PAGE = 10;

const AllocationTrackingPage = () => {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [openDialogId, setOpenDialogId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'request_id' | 'delivery_date'>('request_id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [tablePages, setTablePages] = useState<Record<number, number>>({});

    useEffect(() => {
        fetchAllocations();
    }, []);

    const fetchAllocations = async () => {
        setLoading(true);
        try {
            const res = await instance.get('/dealer-allocations');
            console.log("dsadasdsadsa", res.data.data);
            setAllocations(res.data.data || []);
        } catch (error) {
            toast.error('Lỗi tải danh sách lô hàng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (allocationId: number) => {
        setConfirmingId(allocationId);
        try {
            const res = await instance.patch(`/dealer-allocations/${allocationId}/confirm-receipt`);
            setAllocations(prev =>
                prev.map(a =>
                    a.allocation_id === allocationId
                        ? { ...a, status: AllocationStatus.DELIVERED, actual_delivery_date: new Date().toISOString() }
                        : a
                )
            );
            toast.success('Xác nhận nhận hàng thành công');
            setOpenDialogId(null);
        } catch (error) {
            toast.error('Lỗi xác nhận nhận hàng');
            console.error(error);
        } finally {
            setConfirmingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: AllocationStatus) => {
        let variant: "default" | "secondary" | "outline" | "destructive" = "default";
        let icon;
        let textColor = "";
        let borderColor = "";

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
                textColor = "text-green-600";
                borderColor = "border-green-600";
                break;
        }

        return (
            <Badge variant={variant} className={cn(textColor, borderColor)}>
                {icon}
                {status}
            </Badge>
        );
    };

    const calculateTotalQuantity = (items: AllocationItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);

    let filteredAllocations = allocations.filter(alloc => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (alloc.request_id?.toString().includes(searchLower) ||
                alloc.allocation_id.toString().includes(searchLower) ||
                alloc.notes?.toLowerCase().includes(searchLower)) &&
            (statusFilter === 'all' || alloc.status === statusFilter)
        );
    });

    filteredAllocations = filteredAllocations.sort((a, b) => {
        let compare = 0;
        if (sortBy === 'request_id') compare = (a.request_id || 0) - (b.request_id || 0);
        else compare = new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
        return sortOrder === 'asc' ? compare : -compare;
    });

    const groupedAllocations = filteredAllocations.reduce((acc: Record<number | string, Allocation[]>, alloc) => {
        const key = alloc.request_id ?? 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(alloc);
        return acc;
    }, {});

    const getPaginatedItems = (allocationId: number, items: AllocationItem[]) => {
        const page = tablePages[allocationId] || 1;
        const start = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
    };

    const handlePageChange = (allocationId: number, newPage: number) => {
        setTablePages(prev => ({ ...prev, [allocationId]: newPage }));
    };

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
                <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Theo dõi Lô hàng</h1>

                {/* Search & Filter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-10"
                            placeholder="Tìm theo ID yêu cầu, lô hàng hoặc ghi chú..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Lọc theo trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="PENDING">PENDING</SelectItem>
                            <SelectItem value="IN_TRANSIT">IN_TRANSIT</SelectItem>
                            <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={value => {
                        const [by, order] = value.split('-');
                        setSortBy(by as 'request_id' | 'delivery_date');
                        setSortOrder(order as 'asc' | 'desc');
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="request_id-asc">ID Yêu cầu (Tăng dần)</SelectItem>
                            <SelectItem value="request_id-desc">ID Yêu cầu (Giảm dần)</SelectItem>
                            <SelectItem value="delivery_date-asc">Ngày giao (Tăng dần)</SelectItem>
                            <SelectItem value="delivery_date-desc">Ngày giao (Giảm dần)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-8">
                    {Object.entries(groupedAllocations).map(([requestKey, group]) => {
                        const requestId = requestKey === 'unknown' ? null : Number(requestKey);
                        const totalBatches = group.length;
                        const deliveredBatches = group.filter(a => a.status === AllocationStatus.DELIVERED).length;
                        const progressValue = (deliveredBatches / totalBatches) * 100;
                        const totalQuantity = group.reduce((sum, alloc) => sum + calculateTotalQuantity(alloc.items), 0);
                        const deliveredQuantity = group
                            .filter(a => a.status === AllocationStatus.DELIVERED)
                            .reduce((sum, alloc) => sum + calculateTotalQuantity(alloc.items), 0);

                        // Tính tổng 50% deposit đã thanh toán
                        const requestTotalAmount = group[0].request.items.reduce((sum, item) => {
                            return sum + item.requested_quantity * item.variant.retail_price;
                        }, 0);
                        const totalPaid = group.reduce((sum, a) => sum + (a.paid_amount || 0), 0);
                        const isDepositPaid = totalPaid >= requestTotalAmount * 0.5;

                        return (
                            <Card key={requestKey} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle className="text-2xl">Yêu cầu #{requestId ?? 'N/A'}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Tổng {totalBatches} đợt giao • {totalQuantity} xe
                                            </CardDescription>
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="outline" className="cursor-help">
                                                    <Info className="h-4 w-4 mr-1" />
                                                    Tiến độ: {deliveredBatches}/{totalBatches} đợt • {deliveredQuantity}/{totalQuantity} xe
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Tiến độ giao hàng tổng cho yêu cầu này</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="relative w-full h-4 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={cn(
                                                    "absolute left-0 top-0 h-full transition-all duration-500",
                                                    progressValue < 50 ? "bg-yellow-500" : progressValue < 100 ? "bg-blue-500" : "bg-green-600"
                                                )}
                                                style={{ width: `${progressValue}%` }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow">
                                                {Math.round(progressValue)}%
                                            </span>
                                        </div>
                                    </div>

                                    <Accordion type="multiple" className="w-full">
                                        {group.sort((a, b) => (a.delivery_batch ?? 0) - (b.delivery_batch ?? 0))
                                            .map(allocation => {
                                                const page = tablePages[allocation.allocation_id] || 1;
                                                const paginatedItems = getPaginatedItems(allocation.allocation_id, allocation.items);
                                                const totalPages = Math.ceil(allocation.items.length / ITEMS_PER_PAGE);

                                                return (
                                                    <AccordionItem
                                                        key={allocation.allocation_id}
                                                        value={`item-${allocation.allocation_id}`}
                                                        className="border-b last:border-b-0"
                                                    >
                                                        <AccordionTrigger className="py-4 hover:bg-muted/50 transition-colors px-4 rounded-md">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-4">
                                                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                                                    <span className="font-medium">
                                                                        Đợt {allocation.delivery_batch ?? 'N/A'} - Lô #{allocation.allocation_id}
                                                                    </span>
                                                                </div>
                                                                {getStatusBadge(allocation.status)}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pb-4">
                                                            {allocation.notes && <p className="mb-4 text-muted-foreground italic">{allocation.notes}</p>}

                                                            {/* Table */}
                                                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                                                <Table>
                                                                    <TableHeader className="sticky top-0 bg-background z-10">
                                                                        <TableRow>
                                                                            <TableHead>Hình ảnh</TableHead>
                                                                            <TableHead>Biến thể</TableHead>
                                                                            <TableHead className="text-right">Số lượng</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {paginatedItems.map(item => (
                                                                            <TableRow key={item.item_id} className="hover:bg-muted/50 transition-colors">
                                                                                <TableCell>
                                                                                    {item.image_url ? (
                                                                                        <img src={item.image_url} alt={item.variant.version} className="w-16 h-16 object-cover rounded-md shadow-sm" />
                                                                                    ) : (
                                                                                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">N/A</div>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell>{item.variant.version}</TableCell>
                                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                                {totalPages > 1 && (
                                                                    <Pagination className="mt-4">
                                                                        <PaginationContent>
                                                                            <PaginationPrevious onClick={() => handlePageChange(allocation.allocation_id, Math.max(1, page - 1))} aria-disabled={page === 1} />
                                                                            {Array.from({ length: totalPages }, (_, i) => (
                                                                                <PaginationItem key={i}>
                                                                                    <PaginationLink isActive={page === i + 1} onClick={() => handlePageChange(allocation.allocation_id, i + 1)}>
                                                                                        {i + 1}
                                                                                    </PaginationLink>
                                                                                </PaginationItem>
                                                                            ))}
                                                                            <PaginationNext onClick={() => handlePageChange(allocation.allocation_id, Math.min(totalPages, page + 1))} aria-disabled={page === totalPages} />
                                                                        </PaginationContent>
                                                                    </Pagination>
                                                                )}
                                                            </div>

                                                            <div className="mt-6 flex justify-end">
                                                                {allocation.status === AllocationStatus.DELIVERED ? (
                                                                    <p className="text-sm text-muted-foreground italic">
                                                                        Đã xác nhận vào {formatDate(allocation.actual_delivery_date!)}
                                                                    </p>
                                                                ) : (
                                                                    <Dialog open={openDialogId === allocation.allocation_id} onOpenChange={(val) => setOpenDialogId(val ? allocation.allocation_id : null)}>
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                variant="default"
                                                                                className="min-w-[150px]"
                                                                                disabled={
                                                                                    (allocation.status as AllocationStatus) === AllocationStatus.DELIVERED || confirmingId === allocation.allocation_id}
                                                                            >
                                                                                Xác nhận Đã nhận hàng
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>Xác nhận nhận hàng</DialogTitle>
                                                                                <DialogDescription>
                                                                                    {!isDepositPaid
                                                                                        ? "Chưa thanh toán cọc 50%, vui lòng thanh toán trước."
                                                                                        : `Bạn có chắc chắn muốn xác nhận đã nhận lô hàng #${allocation.allocation_id}?`}
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <DialogFooter className="flex flex-col space-y-2">

                                                                                {!isDepositPaid && (
                                                                                    <DepositPaymentButton
                                                                                        requestId={requestId!}
                                                                                        depositAmount={requestTotalAmount * 0.5}
                                                                                    />
                                                                                )}
                                                                            </DialogFooter>

                                                                        </DialogContent>
                                                                    </Dialog>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
};

export default AllocationTrackingPage;
