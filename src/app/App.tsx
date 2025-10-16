import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import RequireAuth from "@/features/auth/guards/RequireAuth";
import NotFoundPage from "@/features/misc/NotFoundPage";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";

import PaymentFormPage from "@/features/dealer/staff/page/PaymentFormPage";
import PaymentHistoryPage from "@/features/dealer/staff/page/PaymentHistoryPage";

import { ContractFormPage } from "@/features/contract/page/ContractFormPage";
import { ContractListPage } from "@/features/contract/page/ContractListPage";
import VehicleCatalog from "@/features/dealer/staff/page/VehicleCatalog";
import VehicleDetail from "@/features/dealer/staff/page/VehicleDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<AuthGuard />} />
         


        {/* <Route element={<RequireAuth allowedRoles={["DEALER_MANAGER"]} />}> */}
        <Route element={<DealerStaffLayout />}>
          <Route
            path="/dealer/staff/dashboard"
            element={<DealerStaffDashboard />}
          />
   
            <Route
              path="/dealer/staff/vehicles"
              element={<VehicleCatalog />}
            />
            <Route
              path="/dealer/staff/vehicles/:id"
              element={<VehicleDetail />}
            />
            <Route
              path="/dealer/staff/PaymentFormPage"
              element={<PaymentFormPage />}
            />
            <Route
              path="/dealer/staff/PaymentHistoryPage"
              element={<PaymentHistoryPage />}
            />
            
          
          <Route path="/dealer/staff/contracts" element={<ContractListPage />} />
          <Route path="/dealer/staff/contracts/new" element={<ContractFormPage />} />
          <Route path="/dealer/staff/contracts/:id" element={<ContractFormPage />} />
        </Route>
        {/* </Route> */}


        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
