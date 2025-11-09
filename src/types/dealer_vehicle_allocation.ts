export const AllocationStatus = {
    PENDING: 'PENDING',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
} as const;
export type AllocationStatus = typeof AllocationStatus[keyof typeof AllocationStatus];

export interface AllocationItem {
    item_id: number;
    variant: {
        variant_id: number;
        version: string;
    };
    quantity: number;
    image_url?: string;
}

export interface Allocation {
    allocation_id: number;
    request_id: number | null;
    delivery_batch: number | null;
    delivery_date: string;
    notes: string | null;
    status: AllocationStatus;
    items: AllocationItem[];
    actual_delivery_date?: string;
}