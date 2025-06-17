import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Menu, 
  LogOut,
  Home,
  FileText,
  Calendar,
  FileCheck,
  ClipboardCheck,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { icon: <FileText size={20} />, label: 'My Analyses', href: '/history' },
    { icon: <Calendar size={20} />, label: 'Appointments', href: '/consultations' },
    { icon: <FileCheck size={20} />, label: 'Document Templates', href: '/document-templates' },
    { icon: <ClipboardCheck size={20} />, label: 'Document Checklists', href: '/document-checklist' },
    { icon: <User size={20} />, label: 'Updates', href: '/updates' },
  ];

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
                <span className="text-lg font-semibold text-gray-900">VisaAnalyzer</span>
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
        <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <span className="text-lg font-semibold text-gray-900">VisaAnalyzer</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto min-h-0">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 cursor-pointer ${
                      location === item.href
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={`h-5 w-5 shrink-0 ${location === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.analysisCount || 0}/{user?.maxAnalyses || 3} analyses used
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] shadow-sm"
              >
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="p-4 pb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Desktop Layout (hidden below md) */}
      <div className="hidden md:flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="w-64 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="flex flex-col h-screen">
            <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <span className="text-lg font-semibold text-gray-900">VisaAnalyzer</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 cursor-pointer ${
                      location === item.href
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`h-5 w-5 shrink-0 ${location === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-3 lg:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center p-2 lg:p-3 bg-gray-50 rounded-lg mb-3 shadow-sm">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs lg:text-sm font-semibold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.analysisCount || 0}/{user?.maxAnalyses || 3} analyses used
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[36px] lg:min-h-[40px] shadow-sm"
              >
                <LogOut className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="truncate">Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-none">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 lg:p-8">
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