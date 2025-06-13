import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Phone,
  User,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
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

export function DashboardSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-full flex-col border-r bg-card p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Visa Analyzer</span>
      </div>
      
      {user && (
        <div className="mb-8 mt-2 px-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate">{user.fullName}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Home"
          href="/"
          active={location === "/"}
        />
        <SidebarItem
          icon={<FileText className="h-5 w-5" />}
          label="Visa Analyzer"
          href="/analyzer"
          active={location === "/analyzer"}
        />
        <SidebarItem
          icon={<BarChart3 className="h-5 w-5" />}
          label="Analysis History"
          href="/history"
          active={location === "/history"}
        />
        <SidebarItem
          icon={<Phone className="h-5 w-5" />}
          label="Consultations"
          href="/consultations"
          active={location === "/consultations"}
        />
        {user?.role === "admin" && (
          <SidebarItem
            icon={<Shield className="h-5 w-5" />}
            label="Admin Panel"
            href="/admin"
            active={location === "/admin" || location.startsWith("/admin/")}
          />
        )}
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
  );
}