import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import NotFoundPage from "@/features/misc/NotFoundPage";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";
import PaymentFormPage from "@/features/dealer/staff/page/PaymentFormPage";

import PaymentHistoryPage from "@/features/dealer/staff/page/PaymentHistoryPage"; 
import ContractListPage from "@/features/contract/page/ContractListPage";
import VehicleCatalog from "@/features/vehicles/page/VehicleCatalog";
import PurchaseOrderForm from "@/features/order/page/PurchaseOrderForm";
import QuotationListPage from "@/features/quotation/page/QuotationListPage";
import QuotationCreatePage from "@/features/quotation/page/QuotationCreatePage";
import ManufacturerOrderList from "@/features/order/page/ManufacturerOrderList";
import ManufacturerOrderDetail from "@/features/order/page/ManufacturerOrderDetail";
import RequireAuth from "@/features/auth/guards/RequireAuth";
import VehicleDetailPage from "@/features/vehicles/page/VehicleDetail";
import OrderRequestList from "@/features/order/page/OrderRequestList";
import ManufacturerDeliveryCreate from "@/features/allocation/page/ManufacturerDeliveryCreate";
import { DealerManagerLayout } from "@/features/dealer/manager/dealer-manager-layout";
import EvmDashboard from "@/features/evm-staff/Dashboard";
import { EvmLayout } from "@/features/evm-staff/evm-layout";
import ContractFromQuotationPage from "@/features/contract/page/ContractFromQuotationPage";


import PaymentStatusPage from "@/features/payments/page/PaymentStatusPage";
import PaymentCheckout from "@/features/payments/page/ContractPaymentPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/" element={<AuthGuard />} />


        <Route element={<RequireAuth allowedRoles={["DEALER_STAFF"]} />}>
        <Route element={<DealerStaffLayout />}>
          <Route
            path="/dealer/staff/dashboard"
            element={<DealerStaffDashboard />}
          />

            <Route
              path="/dealer/staff/PaymentFormPage"
              element={<PaymentFormPage />}
            />
            <Route
              path="/dealer/staff/PaymentHistoryPage"
              element={<PaymentHistoryPage />}
            />

            
          <Route path="/dealer/staff/vehicles" element={<VehicleCatalog />} />
          <Route path="/dealer/staff/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/dealer/staff/contracts" element={<ContractListPage />} />
          <Route path="/dealer/staff/contracts/new" element={<ContractFromQuotationPage />} />
          <Route path="/dealer/staff/contracts/edit/:id" element={<ContractFromQuotationPage />} />

          <Route path="/dealer/staff/quotations" element={<QuotationListPage />} />
          <Route path="/dealer/staff/quotations/new" element={<QuotationCreatePage />} />        
          <Route path="/dealer/staff/quotations/create/:variantId" element={<QuotationCreatePage />} />
          <Route path="/dealer/staff/quotations/edit/:id" element={<QuotationCreatePage />} />
          <Route path="/dealer/staff/payment-test/:contractId?" element={<PaymentCheckout />} />
          <Route path="/dealer/staff/payment-status" element={<PaymentStatusPage />} />

        </Route>
        </Route>


      <Route element={<RequireAuth allowedRoles={["DEALER_MANAGER"]} />}>
        <Route element={<DealerManagerLayout />}>
          <Route path="/dealer/manager/dashboard" element={<DealerStaffDashboard />} />
          <Route path="/dealer/manager/purchase-orders/new" element={<PurchaseOrderForm />} />
          <Route path="/dealer/manager/purchase-orders/list" element={<OrderRequestList />} />
      </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["EVM_STAFF"]} />}>
        <Route element={<EvmLayout />}>
          <Route path="/evm/dashboard" element={<EvmDashboard />} />
          <Route path="/evm/orders" element={<ManufacturerOrderList />} />
          <Route path="/evm/orders/:id" element={<ManufacturerOrderDetail />} />         
          <Route path="/evm/delivery-batches/create/:request_id" element={<ManufacturerDeliveryCreate />} />
      </Route>
      </Route>


        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
