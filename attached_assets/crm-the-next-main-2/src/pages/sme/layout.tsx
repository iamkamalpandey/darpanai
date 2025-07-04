import Sidebar from "@/components/shared/Sidebar/Sidebar";
import { cn } from "@/lib/utils";
import { AdminMenus, FrontdeskMenus, SmeMenus } from "@/types/sidebar-menus";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-screen flex-col w-full md:flex-row md:overflow-hidden font-sans"
      )}
    >
      <Sidebar menus={SmeMenus}>{children}</Sidebar>
    </div>
  );
}
