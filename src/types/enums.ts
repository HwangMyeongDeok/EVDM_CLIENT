export type UserRole =
  | "DEALER_STAFF"
  | "DEALER_MANAGER"
  | "EVM_STAFF"
  | "ADMIN";

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export type DeliveryStatus = "PENDING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export type PaymentType = "FULL" | "INSTALLMENT";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type FeedbackType = "FEEDBACK" | "COMPLAINT";

export type FeedbackStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type DebtStatus = "PENDING" | "PAID" | "OVERDUE";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "PARTIAL";

export type DealerOrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type TestDriveStatus = "PENDING" | "COMPLETED" | "CANCELLED";
