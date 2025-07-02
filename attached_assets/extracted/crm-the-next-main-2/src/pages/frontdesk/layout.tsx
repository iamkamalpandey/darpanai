import Sidebar from "@/components/shared/Sidebar/Sidebar";
import Unauthorized from "@/components/shared/Unauthorized";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AdminMenus, FrontdeskMenus, SmeMenus } from "@/types/sidebar-menus";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const isSuperAdmin = user?.role?.name?.toLowerCase() === "frontdesk";

  if (!isSuperAdmin) {
    return <Unauthorized />;
  }
  return (
    <div
      className={cn(
        "flex h-screen flex-col w-full md:flex-row md:overflow-hidden font-sans"
      )}
    >
      <Sidebar menus={FrontdeskMenus}>{children}</Sidebar>
    </div>
  );
}
