import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useUnreadUpdates } from '@/hooks/use-unread-updates';
import { 
  Shield, 
  Menu, 
  LogOut,
  Home,
  FileText,
  Calendar,
  FileCheck,
  ClipboardCheck,
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  GraduationCap,
  Globe,
  BarChart3,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react';

const SidebarItem = ({ icon, label, href, active }: {
  icon: ReactNode;
  label: string;
  href: string;
  active: boolean;
}) => {
  return (
    <Link href={href}>
      <div className={`group flex gap-x-3 rounded-md p-2.5 text-sm font-medium leading-6 transition-all duration-200 ${
        active 
          ? 'bg-blue-50 text-blue-700 border-l-3 border-blue-600 shadow-sm' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
      }`}>
        <span className={`h-5 w-5 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
          {icon}
        </span>
        <span className="truncate font-medium">{label}</span>
      </div>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [documentInfoOpen, setDocumentInfoOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [location] = useLocation();
  const { unreadCount, hasUnread } = useUnreadUpdates();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  }) as { data: any };

  const { data: completionStatus } = useQuery({
    queryKey: ['/api/user/profile-completion'],
  }) as { data: any };

  const completionPercentage = completionStatus?.completionPercentage || 0;

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarItems = [
    // Priority 1: Core user actions
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Calendar size={20} />, label: 'Consultation Booking', href: '/consultations' },
    
    // Priority 2: Analysis tools (most used features)
    { 
      icon: <BarChart3 size={20} />, 
      label: 'AI Analysis Tools', 
      isSubmenu: true,
      submenuItems: [
        { icon: <Shield size={18} />, label: 'Visa Document Analysis', href: '/visa-analysis' },
        { icon: <FileText size={18} />, label: 'COE Certificate Analysis', href: '/coe-analysis' },
        { icon: <FileCheck size={18} />, label: 'Offer Letter Analysis', href: '/offer-letter-analysis' },
      ]
    },

    // Priority 3: User data and results
    { icon: <FileText size={20} />, label: 'My Analysis', href: '/my-analysis' },
    
    // Priority 4: Research and planning tools
    { icon: <MapPin size={20} />, label: 'AI Study Destination', href: '/personalized-destination-analysis' },
    { icon: <Award size={20} />, label: 'Scholarship Research', href: '/scholarship-research' },

    // Priority 5: Document information
    { 
      icon: <FolderOpen size={20} />, 
      label: 'Document Information', 
      isSubmenu: true,
      submenuItems: [
        { icon: <GraduationCap size={18} />, label: 'Offer Letter Details', href: '/offer-letter-info' },
        { icon: <FileCheck size={18} />, label: 'COE Information', href: '/coe-info' },
      ]
    },

    // Resources
    { 
      icon: <FolderOpen size={20} />, 
      label: 'Resources & Support', 
      isSubmenu: true,
      submenuItems: [
        { icon: <FileCheck size={18} />, label: 'Document Templates', href: '/document-templates' },
        { icon: <ClipboardCheck size={18} />, label: 'Document Checklists', href: '/document-checklist' },
      ]
    },

    // Updates
    { 
      icon: <div className="relative">
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>, 
      label: 'Updates & News', 
      href: '/updates' 
    },
  ];

  const handleSubmenuToggle = (label: string) => {
    if (label === 'AI Analysis Tools') {
      setAiAnalysisOpen(!aiAnalysisOpen);
    } else if (label === 'Document Information') {
      setDocumentInfoOpen(!documentInfoOpen);
    } else if (label === 'Resources & Support') {
      setResourcesOpen(!resourcesOpen);
    }
  };

  const isSubmenuOpen = (label: string) => {
    if (label === 'AI Analysis Tools') return aiAnalysisOpen;
    if (label === 'Document Information') return documentInfoOpen;
    if (label === 'Resources & Support') return resourcesOpen;
    return false;
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <button
                className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 flex items-center min-w-0">
                <Shield className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
                <span className="text-lg font-semibold text-gray-900 truncate">Darpan Intelligence</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/profile" className="relative h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-xs font-medium text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className={`h-3 w-3 rounded-full flex items-center justify-center ${
                    completionPercentage >= 80 ? 'bg-green-500' : 
                    completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <span className="text-[7px] font-bold text-white">{Math.round(completionPercentage)}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col">
              <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-lg font-semibold text-gray-900">Darpan Intelligence</span>
              </div>
              
              <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto min-h-0">
                {sidebarItems.map((item, index) => (
                  <div key={item.href || `submenu-${index}`}>
                    {item.isSubmenu ? (
                      <div>
                        <button
                          onClick={() => handleSubmenuToggle(item.label)}
                          className="w-full group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <span className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500">
                            {item.icon}
                          </span>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {isSubmenuOpen(item.label) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {isSubmenuOpen(item.label) && item.submenuItems && (
                          <div className="ml-6 mt-2 space-y-1 pl-3 border-l-2 border-gray-100">
                            {item.submenuItems.map((subItem) => (
                              <div key={subItem.href} onClick={() => setSidebarOpen(false)}>
                                <SidebarItem 
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
                        <SidebarItem 
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

              {/* Mobile Profile Section */}
              <div className="sticky bottom-4 mt-auto mx-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <Link href="/profile" className="flex items-center min-w-0 flex-1 hover:bg-gray-50 rounded-md p-1 -m-1 transition-colors">
                      <div className="relative h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <div className={`h-3 w-3 rounded-full flex items-center justify-center ${
                            completionPercentage >= 80 ? 'bg-green-500' : 
                            completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            <span className="text-[7px] font-bold text-white">{Math.round(completionPercentage)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Profile: {Math.round(completionPercentage)}%</p>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen bg-white">
        {/* Desktop Sidebar */}
        <div className="w-64 lg:w-72 bg-white border-r border-gray-100 flex flex-col">
          <div className="flex items-center h-16 px-6 border-b border-gray-100 bg-white flex-shrink-0">
            <Shield className="h-7 w-7 text-blue-600 mr-3 flex-shrink-0" />
            <span className="text-xl font-semibold text-gray-900 truncate">Darpan Intelligence</span>
          </div>
          
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto min-h-0 bg-gray-50/30">
            {sidebarItems.map((item, index) => (
              <div key={item.href || `submenu-${index}`}>
                {item.isSubmenu ? (
                  <div>
                    <button
                      onClick={() => handleSubmenuToggle(item.label)}
                      className="w-full group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <span className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500">
                        {item.icon}
                      </span>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {isSubmenuOpen(item.label) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {isSubmenuOpen(item.label) && item.submenuItems && (
                      <div className="ml-6 mt-2 space-y-1 pl-3 border-l-2 border-gray-100">
                        {item.submenuItems.map((subItem) => (
                          <SidebarItem 
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
                  <SidebarItem 
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ) : null}
              </div>
            ))}
          </nav>

          {/* Desktop Profile Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <Link href="/profile" className="flex items-center min-w-0 flex-1 hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <div className="relative h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className={`h-3 w-3 rounded-full flex items-center justify-center ${
                      completionPercentage >= 80 ? 'bg-green-500' : 
                      completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <span className="text-[7px] font-bold text-white">{Math.round(completionPercentage)}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Profile: {Math.round(completionPercentage)}%</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;
export { DashboardLayout };