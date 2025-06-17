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
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarItems = [
    { icon: <Home size={16} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FileText size={16} />, label: 'My Analyses', href: '/analyses' },
    { icon: <Calendar size={16} />, label: 'Appointments', href: '/appointments' },
    { icon: <FileTemplate size={16} />, label: 'Document Templates', href: '/document-templates' },
    { icon: <ClipboardCheck size={16} />, label: 'Document Checklists', href: '/document-checklists' },
    { icon: <User size={16} />, label: 'Profile', href: '/profile' },
  ];

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
            <span className="text-lg font-semibold text-gray-900">VisaAnalyzer</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {sidebarItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <a 
                          className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors duration-200 ${
                            location === item.href
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`h-4 w-4 shrink-0 ${location === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </a>
                      </Link>
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
                      <p className="text-xs text-gray-500">
                        {user?.analysisCount || 0}/{user?.maxAnalyses || 3} analyses used
                      </p>
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

      {/* Desktop sidebar - Proportional width (20% of screen) */}
      <div className="hidden lg:flex lg:w-1/5 lg:min-w-[280px] lg:max-w-[320px] lg:flex-col bg-white border-r border-gray-200">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 -mx-6 px-6 mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-lg font-semibold text-gray-900">VisaAnalyzer</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {sidebarItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <a 
                          className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors duration-200 ${
                            location === item.href
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`h-4 w-4 shrink-0 ${location === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </a>
                      </Link>
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
                      <p className="text-xs text-gray-500">
                        {user?.analysisCount || 0}/{user?.maxAnalyses || 3} analyses used
                      </p>
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