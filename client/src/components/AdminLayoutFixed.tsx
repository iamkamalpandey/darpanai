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
  FolderOpen,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

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
        className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200 cursor-pointer ${
          active
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span className={`h-5 w-5 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
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
  const [informationReportsOpen, setInformationReportsOpen] = useState(false);
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
    { 
      icon: <FileCheck size={20} />, 
      label: 'Information Reports', 
      isSubmenu: true,
      submenuItems: [
        { icon: <GraduationCap size={18} />, label: 'Offer Letter Information', href: '/admin/offer-letter-information' },
        { icon: <FileCheck size={18} />, label: 'COE Information', href: '/admin/coe-information' },
      ]
    },
    { icon: <MessageSquare size={20} />, label: 'User Feedback', href: '/admin/feedback' },
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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex flex-col flex-grow overflow-y-auto">
            <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <span className="text-lg font-semibold text-gray-900">Darpan Intelligence Admin</span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {adminSidebarItems.map((item, index) => (
                <div key={item.href || `submenu-${index}`}>
                  {item.isSubmenu ? (
                    <div>
                      <button
                        onClick={() => {
                          if (item.label === 'Resources Management') {
                            setResourcesOpen(!resourcesOpen);
                          } else if (item.label === 'Information Reports') {
                            setInformationReportsOpen(!informationReportsOpen);
                          }
                        }}
                        className="w-full group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <span className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500">
                          {item.icon}
                        </span>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {((item.label === 'Resources Management' && resourcesOpen) || (item.label === 'Information Reports' && informationReportsOpen)) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {((item.label === 'Resources Management' && resourcesOpen) || (item.label === 'Information Reports' && informationReportsOpen)) && item.submenuItems && (
                        <div className="ml-8 mt-1 space-y-1">
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
                  ) : (
                    <AdminSidebarItem 
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={location === item.href}
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-80 flex flex-col flex-1 min-h-screen">
          {/* Top Header for Mobile */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
          <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-lg font-semibold text-gray-900">Darpan Intelligence Admin</span>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
                {adminSidebarItems.map((item, index) => (
                  <div key={item.href || `submenu-${index}`}>
                    {item.isSubmenu ? (
                      <div>
                        <button
                          onClick={() => {
                            if (item.label === 'Resources Management') {
                              setResourcesOpen(!resourcesOpen);
                            } else if (item.label === 'Information Reports') {
                              setInformationReportsOpen(!informationReportsOpen);
                            }
                          }}
                          className="w-full group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <span className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500">
                            {item.icon}
                          </span>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {((item.label === 'Resources Management' && resourcesOpen) || (item.label === 'Information Reports' && informationReportsOpen)) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {((item.label === 'Resources Management' && resourcesOpen) || (item.label === 'Information Reports' && informationReportsOpen)) && item.submenuItems && (
                          <div className="ml-8 mt-1 space-y-1">
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
                    ) : (
                      <div onClick={() => setSidebarOpen(false)}>
                        <AdminSidebarItem 
                          icon={item.icon}
                          label={item.label}
                          href={item.href}
                          active={location === item.href}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </>
  );
}