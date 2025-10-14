import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import RequireAuth from "@/features/auth/guards/RequireAuth";
import NotFoundPage from "@/features/misc/NotFoundPage";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";
import VehicleCatalog from "@/components/staff-layout/VehicleCatalog";
import VehicleDetail from '@/components/staff-layout/VehicleDetail';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/"
          element={
            <AuthGuard
              roleRedirectMap={{
                DEALER_STAFF: "/dealer/staff/dashboard",
                DEALER_MANAGER: "/dealer/manager/dashboard",
                EVM_STAFF: "/evm/dashboard",
                ADMIN: "/admin/dashboard",
              }}
              fallbackPath="/login"
              unauthorizedRedirect="/unauthorized"
            />
          }
        />
         <Route element={<DealerStaffLayout />}>
          <Route path="dealer/staff/dashboard" element={<DealerStaffDashboard />} />
          <Route path="dealer/staff/vehicles" element={<VehicleCatalog />} />
          <Route path="dealer/staff/vehicles/:id" element={<VehicleDetail />} />
        </Route>


        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
