import { useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logout, selectAuth } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  Zap,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard, // Mới
  UsersRound,     // Mới
  Warehouse,      // Mới
  Banknote,       // Mới
  BarChart3,
     // Mới
} from "lucide-react";

// --- Menu Items cho Manager ---
const managerMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dealer/manager/dashboard" },
  { icon: UsersRound, label: "Đặt hàng", href: "/dealer/manager/purchase-orders/list" },
  { icon: UsersRound, label: "Quản Lý Nhân Viên", href: "/dealer/manager/staff" },
  { icon: Warehouse, label: "Quản Lý Kho", href: "/dealer/manager/inventory" },
  { icon: Banknote, label: "Tài Chính & Sales", href: "/dealer/manager/finance" },
  { icon: BarChart3, label: "Báo Cáo", href: "/dealer/manager/reports" },

];

export function DealerManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppSelector(selectAuth); // Giả sử user có thông tin 'Manager'
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header (Giữ nguyên logic) */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Car className="h-6 w-6 text-blue-600" />
              <Zap className="h-3 w-3 text-yellow-500 absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              <Link to="/dealer/manager/dashboard">EV DMS (Manager)</Link>
            </span>
          </div>

          <div className="flex-1" />

          {/* User Dropdown (Giữ nguyên logic) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.full_name?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.full_name || "Manager"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role?.replace("_", " ") || "Manager"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar & Content Area */}
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } top-16`}
        >
          {/* --- Navigation Mới cho Manager --- */}
          <nav className="flex flex-col gap-2 p-4">
            {managerMenuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content (Nơi <Outlet /> render DealerManagerDashboard) */}
        <main className="flex-1 md:ml-64 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay (Giữ nguyên) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}