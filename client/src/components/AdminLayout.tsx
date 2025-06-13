import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Shield,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const AdminSidebarItem = ({ icon, label, href, active }: AdminSidebarItemProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent cursor-pointer",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this area.</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Admin Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2 px-2 py-4 border-b mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          
          {user && (
            <div className="mb-6 px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="text-sm font-medium text-foreground truncate">{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</span>
                  <span className="text-xs text-muted-foreground truncate">Administrator</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1">
            <AdminSidebarItem
              icon={<BarChart3 className="h-5 w-5" />}
              label="Dashboard"
              href="/admin"
              active={location === "/admin"}
            />
            <AdminSidebarItem
              icon={<Users className="h-5 w-5" />}
              label="User Management"
              href="/admin/users"
              active={location === "/admin/users"}
            />
            <AdminSidebarItem
              icon={<FileText className="h-5 w-5" />}
              label="Analysis Reports"
              href="/admin/analyses"
              active={location === "/admin/analyses"}
            />
            <AdminSidebarItem
              icon={<Calendar className="h-5 w-5" />}
              label="Appointments"
              href="/admin/appointments"
              active={location === "/admin/appointments"}
            />
            <AdminSidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="System Settings"
              href="/admin/settings"
              active={location === "/admin/settings"}
            />
          </nav>

          <div className="mt-auto border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}