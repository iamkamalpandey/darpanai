import { ReactNode, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-0 top-0 mr-2 mt-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with mobile menu button */}
        <header className="flex h-12 sm:h-14 items-center border-b px-3 sm:px-4 lg:px-6 bg-white sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden p-1.5 sm:p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
              VisaAnalyzer Pro
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-5 xl:p-6">
          <div className="mx-auto max-w-full xl:max-w-[1200px] 2xl:max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}