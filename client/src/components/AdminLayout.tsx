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
  BarChart3,
  ChevronDown,
  ChevronRight,
  FolderOpen
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
        className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 cursor-pointer ${
          active
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-l-4 border-blue-300'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <span className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
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
  const [resourcesOpen, setResourcesOpen] = useState(false);
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
    { icon: <BarChart3 size={20} />, label: 'Dashboard', href: '/admin' },
    { icon: <Users size={20} />, label: 'User Management', href: '/admin/users' },
    { icon: <FileText size={20} />, label: 'Analysis Reports', href: '/admin/analyses' },
    { icon: <Calendar size={20} />, label: 'Appointments', href: '/admin/appointments' },
    { icon: <Briefcase size={20} />, label: 'Professional Applications', href: '/admin/professional-applications' },
    { icon: <Bell size={20} />, label: 'Updates & Notifications', href: '/admin/updates' },
    { 
      icon: <FolderOpen size={20} />, 
      label: 'Resources Management', 
      isSubmenu: true,
      submenuItems: [
        { icon: <FileCheck size={18} />, label: 'Document Templates', href: '/admin/document-templates' },
        { icon: <ClipboardCheck size={18} />, label: 'Document Checklists', href: '/admin/document-checklists' },
      ]
    },
    { icon: <Settings size={20} />, label: 'System Settings', href: '/admin/settings' },
  ];

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this area.</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout (hidden on md and larger) */}
      <div className="md:hidden min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-lg font-semibold text-gray-900">Admin</span>
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

        {/* Mobile Sidebar Overlay */}
        <div 
          className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-400 mr-3" />
              <span className="text-lg font-semibold text-white">Study Abroad Admin</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto min-h-0 pb-32">
              {adminSidebarItems.map((item, index) => (
                <div key={item.href || `submenu-${index}`}>
                  {item.isSubmenu ? (
                    <div>
                      <button
                        onClick={() => setResourcesOpen(!resourcesOpen)}
                        className="w-full group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-700/50"
                      >
                        <span className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-400">
                          {item.icon}
                        </span>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {resourcesOpen ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      {resourcesOpen && item.submenuItems && (
                        <div className="ml-8 mt-2 space-y-1">
                          {item.submenuItems.map((subItem) => (
                            <div key={subItem.href} onClick={() => setSidebarOpen(false)}>
                              <AdminSidebarItem 
                                icon={subItem.icon}
                                label={subItem.label}
                                href={subItem.href}
                                active={location === subItem.href}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : item.href ? (
                    <div onClick={() => setSidebarOpen(false)}>
                      <AdminSidebarItem 
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        active={location === item.href}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>
            
            {/* Sticky Bottom Mobile User Profile & Logout */}
            <div className="sticky bottom-4 mt-auto p-4">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-lg">
                {/* User Profile */}
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-300 truncate">Administrator</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="p-4 pb-6 min-w-0 bg-slate-100">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full min-w-0 max-w-full">
            <div className="p-4 sm:p-6 min-w-0">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Desktop Layout (hidden below md) */}
      <div className="hidden md:flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="w-64 lg:w-72 xl:w-80 bg-gradient-to-b from-slate-900 to-slate-800 flex-shrink-0 relative">
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center h-16 px-6 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-400 mr-3" />
              <span className="text-lg font-semibold text-white">Study Abroad Admin</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
              {adminSidebarItems.map((item, index) => (
                <div key={item.href || `submenu-${index}`}>
                  {item.isSubmenu ? (
                    <div>
                      <button
                        onClick={() => setResourcesOpen(!resourcesOpen)}
                        className="w-full group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-700/50"
                      >
                        <span className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-400">
                          {item.icon}
                        </span>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {resourcesOpen ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      {resourcesOpen && item.submenuItems && (
                        <div className="ml-8 mt-2 space-y-1">
                          {item.submenuItems.map((subItem) => (
                            <AdminSidebarItem 
                              key={subItem.href}
                              icon={subItem.icon}
                              label={subItem.label}
                              href={subItem.href}
                              active={location === subItem.href}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : item.href ? (
                    <AdminSidebarItem 
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={location === item.href}
                    />
                  ) : null}
                </div>
              ))}
            </nav>
            
            {/* Sticky Bottom User Profile & Logout */}
            <div className="sticky bottom-4 mt-auto p-4">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-lg">
                {/* User Profile */}
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-300 truncate">Administrator</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
          <main className="flex-1 p-6 lg:p-8 min-w-0">
            <div className="max-w-none min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full min-w-0 max-w-full">
                <div className="p-6 lg:p-8 min-w-0">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}