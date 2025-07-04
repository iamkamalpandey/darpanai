import Sidebar from "@/components/shared/Sidebar/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AdminMenus } from "@/types/sidebar-menus";
import Unauthorized from "@/components/shared/Unauthorized";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const isSuperAdmin = user?.role?.name?.toLowerCase() === "super_admin";

  if (!isSuperAdmin) {
    return <Unauthorized />;
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col w-full md:flex-row md:overflow-hidden font-sans"
      )}
    >
      <Sidebar menus={AdminMenus}>{children}</Sidebar>
    </div>
  );
}
