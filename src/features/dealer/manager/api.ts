import type { DealerOrder, PaymentInfo } from './types';

// Mock data cho đơn hàng
const mockDealerOrder: DealerOrder = {
  orderId: "DH20251027-001",
  orderDate: "2025-10-27",
  companyName: "Công ty TNHH Phát triển Ô tô ABC",
  contactPhone: "0901234567",
  contactEmail: "contact@abc-auto.com",
  deliveryAddress: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  items: [
    {
      id: 1,
      vehicleName: "VinFast VF5",
      color: "Đen",
      quantity: 10,
      price: 650000000,
    },
    {
      id: 2,
      vehicleName: "VinFast VF8",
      color: "Trắng",
      quantity: 5,
      price: 1200000000,
    },
    {
      id: 3,
      vehicleName: "VinFast VF6",
      color: "Xám",
      quantity: 5,
      price: 800000000,
    }
  ],
  deliverySchedule: [
    {
      batchNumber: 1,
      deliveryDate: "2025-11-15",
      items: [
        {
          vehicleName: "VinFast VF5",
          color: "Đen",
          quantity: 5,
          price: 650000000
        },
        {
          vehicleName: "VinFast VF8",
          color: "Trắng",
          quantity: 2,
          price: 1200000000
        }
      ],
      totalAmount: (5 * 650000000) + (2 * 1200000000)
    },
    {
      batchNumber: 2,
      deliveryDate: "2025-12-15",
      items: [
        {
          vehicleName: "VinFast VF8",
          color: "Trắng",
          quantity: 3,
          price: 1200000000
        },
        {
          vehicleName: "VinFast VF6",
          color: "Xám",
          quantity: 3,
          price: 800000000
        }
      ],
      totalAmount: (3 * 1200000000) + (3 * 800000000)
    },
    {
      batchNumber: 3,
      deliveryDate: "2026-01-15",
      items: [
        {
          vehicleName: "VinFast VF5",
          color: "Đen",
          quantity: 5,
          price: 650000000
        },
        {
          vehicleName: "VinFast VF6",
          color: "Xám",
          quantity: 2,
          price: 800000000
        }
      ],
      totalAmount: (5 * 650000000) + (2 * 800000000)
    }
  ],
  status: 'PENDING',
  totalAmount: (10 * 650000000) + (5 * 1200000000) + (5 * 800000000), // 10 VF5 + 5 VF8 + 5 VF6
};

// Mock data cho thông tin thanh toán
const mockPaymentInfo: PaymentInfo = {
  orderId: "DH20251027-001",
  recipient: "Công ty TNHH Phát triển Ô tô ABC",
  deliveryAddress: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  bankName: "Vietcombank",
  accountNumber: "1234567890",
  accountName: "CÔNG TY TNHH VINFAST",
  amount: (10 * 650000000) + (5 * 1200000000) + (5 * 800000000), // Tổng giá trị đơn hàng
  qrCodeUrl: "https://example.com/qr-code.png"
};

// API functions
export const getDealerOrder = async (orderId: string): Promise<DealerOrder> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockDealerOrder;
};

export const updateOrderStatus = async (orderId: string, status: 'APPROVED' | 'REJECTED'): Promise<DealerOrder> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ...mockDealerOrder,
    status
  };
};

export const getPaymentInfo = async (orderId: string): Promise<PaymentInfo> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockPaymentInfo;
};