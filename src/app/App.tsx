import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import NotFoundPage from "@/features/misc/NotFoundPage";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";
import PaymentFormPage from "@/features/dealer/staff/page/PaymentFormPage";
import PaymentHistoryPage from "@/features/dealer/staff/page/PaymentHistoryPage"; 
import VehicleCatalog from "@/features/vehicles/page/VehicleCatalog";
import PurchaseOrderForm from "@/features/order/page/PurchaseOrderForm";
import QuotationListPage from "@/features/quotation/page/QuotationListPage";
import QuotationCreatePage from "@/features/quotation/page/QuotationCreatePage";
import ManufacturerOrderList from "@/features/order/page/ManufacturerOrderList";
import ManufacturerOrderDetail from "@/features/order/page/ManufacturerOrderDetail";
import ContractListPage from "@/features/contract/page/ContractListPage";
import ContractFormPage from "@/features/contract/page/ContractFormPage";
import RequireAuth from "@/features/auth/guards/RequireAuth";
import VehicleDetailPage from "@/features/vehicles/page/VehicleDetail";
import PaymentTestPage from "@/features/payments/page/ContractPaymentPage";
import OrderRequestList from "@/features/order/page/OrderRequestList";
import DealerRequestDetail from "@/features/order/page/DealerRequestDetail";

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
          <Route path="/dealer/staff/contracts/new" element={<ContractFormPage />} />
          <Route path="/dealer/staff/contracts/edit/:id" element={<ContractFormPage />} />
          <Route path="/dealer/staff/quotations" element={<QuotationListPage />} />
          <Route path="/dealer/staff/quotations/new" element={<QuotationCreatePage />} />        
          <Route path="/dealer/staff/quotations/create/:variantId" element={<QuotationCreatePage />} />
          <Route path="/dealer/staff/quotations/edit/:id" element={<QuotationCreatePage />} />

        <Route path="/dealer/staff/payment-test/:contractId?" element={<PaymentTestPage />} />

        </Route>
        </Route>


      <Route element={<RequireAuth allowedRoles={["DEALER_MANAGER"]} />}>
        <Route element={<DealerStaffLayout />}>
          <Route path="/dealer/manager/purchase-orders/new" element={<PurchaseOrderForm />} />
          <Route path="/dealer/manager/purchase-orders/list" element={<OrderRequestList />} />
          <Route path="/dealer/manager/purchase-orders/:requestCode" element={<DealerRequestDetail />} /> 
      </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["EVM_STAFF"]} />}>
        <Route element={<DealerStaffLayout />}>
          <Route path="/evm/staff/orders" element={<ManufacturerOrderList />} />
          <Route path="/evm/staff/orders/:id" element={<ManufacturerOrderDetail />} />         
      </Route>
      </Route>


        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
