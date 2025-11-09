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
  Factory, // (MỚI) Biểu tượng hãng
  Zap,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  BarChart3,
  Building,       // (MỚI) Quản lý đại lý
  ClipboardList,  // (MỚI) Đơn hàng PO
  Warehouse,      // (MỚI) Kho tổng
  Truck,          // (MỚI) Vận chuyển
  BadgeDollarSign,// (MỚI) Quyết toán/Thưởng
} from "lucide-react";

// --- CẬP NHẬT MENU CHO EVM (HÃNG XE) ---
const evmMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/evm/dashboard" },
  {
    icon: Building,
    label: "Quản Lý Đại Lý",
    href: "/evm/dealers",
  }, // Quản lý thông tin, hạn mức
  {
    icon: ClipboardList,
    label: "Đơn Hàng (PO)",
    href: "/evm/orders",
  }, // (L2.2: Duyệt đơn)
  {
    icon: Warehouse,
    label: "Kho Xe (Tổng)",
    href: "/evm/inventory",
  }, // Quản lý sản xuất/nhập khẩu
  {
    icon: Truck,
    label: "Vận Chuyển",
    href: "/evm/logistics",
  }, // (L2.4: Giao hàng)
  {
    icon: BadgeDollarSign,
    label: "Quyết Toán",
    href: "/evm/settlements",
  }, // (L3: Thưởng sales)
  { icon: BarChart3, label: "Báo Cáo Toàn Quốc", href: "/evm/reports" },
];

export function EvmLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header --- */}
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

          {/* --- Logo/Title của Hãng --- */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Factory className="h-6 w-6 text-primary" />
              <Zap className="h-3 w-3 text-yellow-500 absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              <Link to="/evm/dashboard">EVM Portal</Link>
            </span>
          </div>

          <div className="flex-1" />

          {/* --- User Dropdown (Giả sử user là nhân viên của Hãng) --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.full_name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.full_name || "Admin Hãng"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role?.replace("_", " ") || "EVM Admin"}
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

      {/* --- Sidebar & Content Area --- */}
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } top-16`}
        >
          {/* --- Navigation MỚI của EVM --- */}
          <nav className="flex flex-col gap-2 p-4">
            {evmMenuItems.map((item) => (
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

        {/* --- Main Content --- */}
        <main className="flex-1 md:ml-64 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}