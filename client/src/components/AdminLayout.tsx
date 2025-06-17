import { ReactNode, useState } from "react";
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
  Building2,
  Bell,
  FileCheck,
  CheckSquare,
  Menu,
  X,
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
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-accent/70 cursor-pointer group",
          active 
            ? "bg-primary/10 text-primary font-medium shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className={cn(
          "transition-colors duration-200",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-sm transition-colors duration-200 leading-5",
          active ? "font-medium text-primary" : "font-normal"
        )}>
          {label}
        </span>
      </div>
    </Link>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {user && (
          <div className="mb-6 px-6 pt-4">
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

        <nav className="flex-1 space-y-1 px-4">
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
            icon={<Building2 className="h-5 w-5" />}
            label="Professional Applications"
            href="/admin/professional-applications"
            active={location === "/admin/professional-applications"}
          />
          <AdminSidebarItem
            icon={<Bell className="h-5 w-5" />}
            label="Updates & Notifications"
            href="/admin/updates"
            active={location === "/admin/updates"}
          />
          <AdminSidebarItem
            icon={<FileCheck className="h-5 w-5" />}
            label="Document Templates"
            href="/admin/document-templates"
            active={location === "/admin/document-templates"}
          />
          <AdminSidebarItem
            icon={<CheckSquare className="h-5 w-5" />}
            label="Document Checklists"
            href="/admin/document-checklists"
            active={location === "/admin/document-checklists"}
          />
          <AdminSidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="System Settings"
            href="/admin/settings"
            active={location === "/admin/settings"}
          />
        </nav>

        <div className="mt-auto border-t pt-4 px-4">
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

      {/* Desktop Admin Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 border-r bg-card flex-shrink-0">
        <div className="flex h-full flex-col py-4 px-3">
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-medium text-foreground">Admin Panel</span>
          </div>
          
          {user && (
            <div className="mb-8 px-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="text-sm font-medium text-foreground truncate">{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</span>
                  <span className="text-xs text-muted-foreground/80 truncate">Administrator</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-0.5">
            <AdminSidebarItem
              icon={<BarChart3 className="h-4 w-4" />}
              label="Dashboard"
              href="/admin"
              active={location === "/admin"}
            />
            <AdminSidebarItem
              icon={<Users className="h-4 w-4" />}
              label="User Management"
              href="/admin/users"
              active={location === "/admin/users"}
            />
            <AdminSidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Analysis Reports"
              href="/admin/analyses"
              active={location === "/admin/analyses"}
            />
            <AdminSidebarItem
              icon={<Calendar className="h-4 w-4" />}
              label="Appointments"
              href="/admin/appointments"
              active={location === "/admin/appointments"}
            />
            <AdminSidebarItem
              icon={<Building2 className="h-4 w-4" />}
              label="Professional Applications"
              href="/admin/professional-applications"
              active={location === "/admin/professional-applications"}
            />
            <AdminSidebarItem
              icon={<Bell className="h-4 w-4" />}
              label="Updates & Notifications"
              href="/admin/updates"
              active={location === "/admin/updates"}
            />
            <AdminSidebarItem
              icon={<FileCheck className="h-4 w-4" />}
              label="Document Templates"
              href="/admin/document-templates"
              active={location === "/admin/document-templates"}
            />
            <AdminSidebarItem
              icon={<CheckSquare className="h-4 w-4" />}
              label="Document Checklists"
              href="/admin/document-checklists"
              active={location === "/admin/document-checklists"}
            />
            <AdminSidebarItem
              icon={<Settings className="h-4 w-4" />}
              label="System Settings"
              href="/admin/settings"
              active={location === "/admin/settings"}
            />
          </nav>

          <div className="mt-auto pt-4">
            <div className="px-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/70 rounded-lg px-3 py-2.5 transition-colors duration-200"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-sm font-normal">
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-12 sm:h-14 items-center border-b px-3 sm:px-4 lg:px-6 bg-white sticky top-0 z-30 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 p-1.5 sm:p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
              Admin Panel
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}