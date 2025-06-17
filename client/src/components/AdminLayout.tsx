import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Menu, 
  LogOut,
  Users,
  FileText,
  Calendar,
  Briefcase,
  Bell,
  FileCheck,
  ClipboardCheck,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors duration-200 cursor-pointer ${
          active
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <span className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  }) as { data: any };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminSidebarItems = [
    { icon: <BarChart3 size={16} />, label: 'Dashboard', href: '/admin' },
    { icon: <Users size={16} />, label: 'User Management', href: '/admin/users' },
    { icon: <FileText size={16} />, label: 'Analysis Reports', href: '/admin/analyses' },
    { icon: <Calendar size={16} />, label: 'Appointments', href: '/admin/appointments' },
    { icon: <Briefcase size={16} />, label: 'Professional Applications', href: '/admin/professional-applications' },
    { icon: <Bell size={16} />, label: 'Updates & Notifications', href: '/admin/updates' },
    { icon: <FileCheck size={16} />, label: 'Document Templates', href: '/admin/document-templates' },
    { icon: <ClipboardCheck size={16} />, label: 'Document Checklists', href: '/admin/document-checklists' },
    { icon: <Settings size={16} />, label: 'System Settings', href: '/admin/settings' },
  ];

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
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 -mx-6 px-6 mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {adminSidebarItems.map((item) => (
                    <li key={item.href}>
                      <AdminSidebarItem 
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        active={location === item.href}
                      />
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 group"
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  Log out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar - Optimal proportional width (22% of screen) */}
      <div className="hidden lg:flex lg:w-[22%] lg:min-w-[300px] lg:max-w-[350px] lg:flex-col bg-white border-r border-gray-200">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 -mx-6 px-6 mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {adminSidebarItems.map((item) => (
                    <li key={item.href}>
                      <AdminSidebarItem 
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        active={location === item.href}
                      />
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 group"
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  Log out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content area - Proportional width (80% of screen) */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Mobile header */}
        <header className="lg:hidden">
          <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-1.5 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Clean, spacious design with optimal readability */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full p-6 lg:p-8">
            <div className="max-w-none mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
                <div className="p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}