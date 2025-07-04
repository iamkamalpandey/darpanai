import Sidebar from "@/components/shared/Sidebar/Sidebar";

import { cn } from "@/lib/utils";
import { TelecallerMenus, VisaLodgmentMenus } from "@/types/sidebar-menus";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-screen flex-col w-full md:flex-row md:overflow-hidden font-sans"
      )}
    >
      <Sidebar menus={VisaLodgmentMenus}>{children}</Sidebar>
      {/* {children} */}
    </div>
  );
}
