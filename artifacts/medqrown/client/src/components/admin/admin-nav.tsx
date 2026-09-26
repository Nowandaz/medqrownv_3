import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MedQrownBrand } from "@/components/MedQrownBrand";
import { apiRequest } from "@/lib/queryClient";

export function AdminNav({ admin }: { admin: any }) {
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setLocation("/admin");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Classes", path: "/admin/classes" },
    { label: "Students", path: "/admin/students" },
    { label: "Payments", path: "/admin/payments" },
    { label: "Waitlist", path: "/admin/waitlist" },
    { label: "Site", path: "/admin/site" },
    { label: "Settings", path: "/admin/settings" },
  ];

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <MedQrownBrand size="sm" />
            {admin && <p className="text-xs text-muted-foreground mt-0.5">Welcome, {admin.name}</p>}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location.startsWith(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="text-sm font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile nav fallback if needed, but for now we rely on desktop or wrap in a scroll container */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-xs no-scrollbar">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location.startsWith(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs shrink-0"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
