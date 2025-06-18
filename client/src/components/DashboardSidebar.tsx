import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  Bell,
  CheckSquare,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  compact?: boolean;
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

// Notification badge for updates
const UpdatesNotificationBadge = () => {
  const { user } = useAuth();
  
  const { data: updates = [] } = useQuery<any[]>({
    queryKey: ["/api/updates"],
    enabled: !!user,
    refetchInterval: 3600000, // Check for new updates every 1 hour (3600000ms)
  });

  const unreadCount = updates.filter((update: any) => !update.isViewed).length;

  if (unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
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
              <span className="text-sm font-medium text-foreground truncate">{user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</span>
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
          label="My Analysis"
          href="/my-analysis"
          active={location === "/my-analysis"}
        />
        <SidebarItem
          icon={<Shield className="h-5 w-5" />}
          label="Visa Rejection Analysis"
          href="/visa-analysis"
          active={location === "/visa-analysis"}
        />
        <SidebarItem
          icon={<FileCheck className="h-5 w-5" />}
          label="Enrollment Analysis"
          href="/enrollment-analysis"
          active={location === "/enrollment-analysis"}
        />
        <SidebarItem
          icon={<Phone className="h-5 w-5" />}
          label="Consultations"
          href="/consultations"
          active={location === "/consultations"}
        />
        {/* Resources Section with Collapsible Submenu */}
        <div className="space-y-2">
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              (location === "/document-templates" || location === "/document-checklist") 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5" />
              <span>Resources</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", resourcesOpen && "rotate-180")} />
          </button>
          
          {resourcesOpen && (
            <div className="ml-8 space-y-1">
              <SidebarItem
                icon={<FileCheck className="h-4 w-4" />}
                label="Document Templates"
                href="/document-templates"
                active={location === "/document-templates"}
                compact
              />
              <SidebarItem
                icon={<CheckSquare className="h-4 w-4" />}
                label="Document Checklists"
                href="/document-checklist"
                active={location === "/document-checklist"}
                compact
              />
            </div>
          )}
        </div>

        <SidebarItem
          icon={<Phone className="h-5 w-5" />}
          label="Appointments"
          href="/consultations"
          active={location === "/consultations"}
        />
        
        <div className="relative">
          <SidebarItem
            icon={<Bell className="h-5 w-5" />}
            label="Updates"
            href="/updates"
            active={location === "/updates"}
          />
          <UpdatesNotificationBadge />
        </div>
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