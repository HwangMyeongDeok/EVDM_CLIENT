import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/page/LoginPage";
import RequireAuth from "@/features/auth/guards/RequireAuth";
import NotFoundPage from "@/features/misc/NotFoundPage";
import DealerStaffDashboard from "@/features/dealer/staff/Dashboard";
import { DealerStaffLayout } from "@/features/dealer/staff/dealer-staff-layout";
import UnauthorizedPage from "@/features/misc/UnauthorizedPage";
import AuthGuard from "@/features/auth/guards/AuthGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<AuthGuard />} />

        <Route element={<RequireAuth allowedRoles={["DEALER_MANAGER"]} />}>
          <Route element={<DealerStaffLayout />}>
            <Route
              path="/dealer/staff/dashboard"
              element={<DealerStaffDashboard />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
