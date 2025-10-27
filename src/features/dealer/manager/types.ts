export interface DealerOrderItem {
  id: number;
  vehicleName: string;
  color: string;
  quantity: number;
  price: number;
}

export interface DeliveryItem {
  vehicleName: string;
  color: string;
  quantity: number;
  price: number;
}

export interface DeliveryBatch {
  batchNumber: number;
  deliveryDate: string;
  items: DeliveryItem[];
  totalAmount: number;
}

export interface DealerOrder {
  orderId: string;
  orderDate: string;
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress: string;
  items: DealerOrderItem[];
  deliverySchedule: DeliveryBatch[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  totalAmount: number;
}

export interface PaymentInfo {
  orderId: string;
  recipient: string;
  deliveryAddress: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  qrCodeUrl: string;
}