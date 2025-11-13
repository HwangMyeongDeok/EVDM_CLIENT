import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import NotFoundPage from "@/features/misc/NotFoundPage";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";
import RequireAuth from "@/features/auth/guards/RequireAuth";

// Dealer Staff
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import PaymentFormPage from "@/features/dealer/staff/page/PaymentFormPage";
import PaymentHistoryPage from "@/features/dealer/staff/page/PaymentHistoryPage";
import PaymentCheckout from "@/features/payments/page/ContractPaymentPage";
import PaymentStatusPage from "@/features/payments/page/PaymentStatusPage";
import VehicleCatalog from "@/features/vehicles/page/VehicleCatalog";
import VehicleDetailPage from "@/features/vehicles/page/VehicleDetail";
import ContractListPage from "@/features/contract/page/ContractListPage";
import ContractFromQuotationPage from "@/features/contract/page/ContractFromQuotationPage";
import QuotationListPage from "@/features/quotation/page/QuotationListPage";
import QuotationCreatePage from "@/features/quotation/page/QuotationCreatePage";

// Dealer Manager
import { DealerManagerLayout } from "@/features/dealer/manager/dealer-manager-layout";
import PurchaseOrderForm from "@/features/order/page/PurchaseOrderForm";
import OrderRequestList from "@/features/order/page/OrderRequestList";
import AllocationTrackingPage from "@/features/allocation/page/AllocationTrackingPage";
import DepositStatusPage from "@/features/allocation/page/DepositStatusPage";

// EVM Staff
import { EvmLayout } from "@/features/evm-staff/evm-layout";
import EvmDashboard from "@/features/evm-staff/Dashboard";
import ManufacturerOrderList from "@/features/order/page/ManufacturerOrderList";
import ManufacturerOrderDetail from "@/features/order/page/ManufacturerOrderDetail";
import ManufacturerDeliveryCreate from "@/features/allocation/page/ManufacturerDeliveryCreate";

// Admin
import UserManagementPage from "@/features/admin/page/UserManagementPage";
import DealerManagementPage from "@/features/admin/page/DealerManagementPage";
import VehicleManagementPage from "@/features/admin/page/VehicleManagementPage";
import InventoryManagementPage from "@/features/admin/page/InventoryManagementPage";
import DealerPaymentManagementPage from "@/features/admin/page/DealerPaymentManagementPage";
import PromotionManagementPage from "@/features/admin/page/PromotionManagementPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* AuthGuard to manage login redirect */}
        <Route path="/" element={<AuthGuard />} />

        {/* Dealer Staff */}
        <Route element={<RequireAuth allowedRoles={["DEALER_STAFF"]} />}>
          <Route element={<DealerStaffLayout />}>
            <Route path="/dealer/staff/dashboard" element={<DealerStaffDashboard />} />
            <Route path="/dealer/staff/payment-form" element={<PaymentFormPage />} />
            <Route path="/dealer/staff/payment-history" element={<PaymentHistoryPage />} />
            <Route path="/dealer/staff/payment-checkout/:contractId?" element={<PaymentCheckout />} />
            <Route path="/dealer/staff/payment-status" element={<PaymentStatusPage />} />
            <Route path="/dealer/staff/vehicles" element={<VehicleCatalog />} />
            <Route path="/dealer/staff/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/dealer/staff/contracts" element={<ContractListPage />} />
            <Route path="/dealer/staff/contracts/new" element={<ContractFromQuotationPage />} />
            <Route path="/dealer/staff/contracts/edit/:id" element={<ContractFromQuotationPage />} />
            <Route path="/dealer/staff/quotations" element={<QuotationListPage />} />
            <Route path="/dealer/staff/quotations/new" element={<QuotationCreatePage />} />
            <Route path="/dealer/staff/quotations/create/:variantId" element={<QuotationCreatePage />} />
            <Route path="/dealer/staff/quotations/edit/:id" element={<QuotationCreatePage />} />
          </Route>
        </Route>

        {/* Dealer Manager */}
        <Route element={<RequireAuth allowedRoles={["DEALER_MANAGER"]} />}>
          <Route element={<DealerManagerLayout />}>
            <Route path="/dealer/manager/dashboard" element={<DealerStaffDashboard />} />
            <Route path="/dealer/manager/purchase-orders/new" element={<PurchaseOrderForm />} />
            <Route path="/dealer/manager/purchase-orders/list" element={<OrderRequestList />} />
            <Route path="/dealer/manager/allocation-tracking" element={<AllocationTrackingPage />} />
            <Route path="/dealer/manager/deposit-status" element={<DepositStatusPage />} />
          </Route>
        </Route>

        {/* EVM Staff */}
        <Route element={<RequireAuth allowedRoles={["EVM_STAFF"]} />}>
          <Route element={<EvmLayout />}>
            <Route path="/evm/dashboard" element={<EvmDashboard />} />
            <Route path="/evm/orders" element={<ManufacturerOrderList />} />
            <Route path="/evm/orders/:id" element={<ManufacturerOrderDetail />} />
            <Route path="/evm/delivery-batches/create/:request_id" element={<ManufacturerDeliveryCreate />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
          <Route element={<DealerManagerLayout />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/dealers" element={<DealerManagementPage />} />
            <Route path="/admin/vehicles" element={<VehicleManagementPage />} />
            <Route path="/admin/inventory" element={<InventoryManagementPage />} />
            <Route path="/admin/payments" element={<DealerPaymentManagementPage />} />
            <Route path="/admin/promotions" element={<PromotionManagementPage />} />

            =

          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
