import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Home,
  FileText,
  CheckSquare,
  Calendar,
  Building2,
  LogOut,
  Users,
  BarChart3,
  Settings,
  Shield,
  Bell,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/" },
  { icon: <FileText className="h-5 w-5" />, label: "My Analysis", href: "/my-analysis" },
  { icon: <Shield className="h-5 w-5" />, label: "Visa Analysis", href: "/visa-analysis" },
  { icon: <FileCheck className="h-5 w-5" />, label: "Enrollment Analysis", href: "/enrollment-analysis" },
  { icon: <Calendar className="h-5 w-5" />, label: "Appointments", href: "/consultations" },
  { icon: <CheckSquare className="h-5 w-5" />, label: "Resources", href: "/document-templates" },
];

const adminNavItems: NavItem[] = [
  { icon: <BarChart3 className="h-5 w-5" />, label: "Admin Dashboard", href: "/admin" },
  { icon: <Users className="h-5 w-5" />, label: "User Management", href: "/admin/users" },
  { icon: <FileText className="h-5 w-5" />, label: "Analysis Reports", href: "/admin/analyses" },
  { icon: <Calendar className="h-5 w-5" />, label: "Appointments", href: "/admin/appointments" },
  { icon: <Building2 className="h-5 w-5" />, label: "Professional Applications", href: "/admin/professional-applications" },
  { icon: <Bell className="h-5 w-5" />, label: "Updates & Notifications", href: "/admin/updates" },
  { icon: <FileCheck className="h-5 w-5" />, label: "Document Templates", href: "/admin/document-templates" },
  { icon: <CheckSquare className="h-5 w-5" />, label: "Document Checklists", href: "/admin/document-checklists" },
  { icon: <Settings className="h-5 w-5" />, label: "System Settings", href: "/admin/settings" },
];

interface MobileNavigationProps {
  isAdmin?: boolean;
}

export function MobileNavigation({ isAdmin = false }: MobileNavigationProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logoutMutation.mutate();
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">
                  {isAdmin ? "Admin Panel" : "VisaAnalyzer"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b bg-muted/50">
                <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Role: {user.role === 'admin' ? 'Administrator' : 'User'}
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent cursor-pointer",
                      location === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-3 h-5 w-5" />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}