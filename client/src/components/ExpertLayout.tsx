import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, 
  Menu, 
  LogOut,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Bell,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ClipboardCheck,
  Brain,
  UserCheck,
  Target,
  Clock,
  Award,
  MapPin,
  BookOpen,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpertSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const ExpertSidebarItem = ({ icon, label, href, active }: ExpertSidebarItemProps) => {
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

interface ExpertLayoutProps {
  children: ReactNode;
}

export function ExpertLayout({ children }: ExpertLayoutProps) {
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

  const expertSidebarItems = [
    { icon: <BarChart3 size={20} />, label: 'Dashboard', href: '/expert' },
    { icon: <Users size={20} />, label: 'Student Management', href: '/expert/students' },
    { icon: <Calendar size={20} />, label: 'Consultations', href: '/expert/consultations' },
    { icon: <MessageSquare size={20} />, label: 'Messages', href: '/expert/messages' },
    { icon: <FileText size={20} />, label: 'Document Review', href: '/expert/documents' },
    { icon: <Target size={20} />, label: 'Progress Tracking', href: '/expert/progress' },
    { icon: <Award size={20} />, label: 'Cultural Adaptation', href: '/expert/cultural-adaptation' },
    { icon: <BarChart3 size={20} />, label: 'Analytics & Reports', href: '/expert/analytics' },
    { 
      icon: <FolderOpen size={20} />, 
      label: 'Resources & Tools', 
      href: '#',
      isSubmenu: true,
      submenuItems: [
        { icon: <FileText size={18} />, label: 'Document Templates', href: '/expert/templates' },
        { icon: <MapPin size={18} />, label: 'Country Guides', href: '/expert/country-guides' },
        { icon: <BookOpen size={18} />, label: 'University Database', href: '/expert/universities' },
        { icon: <ClipboardCheck size={18} />, label: 'Checklists', href: '/expert/checklists' },
      ]
    },
    { icon: <Settings size={20} />, label: 'Profile & Settings', href: '/expert/settings' },
  ];

  // Redirect non-expert users
  if (user?.role !== 'expert') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need expert privileges to access this area.</p>
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
                <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-lg font-semibold text-gray-900">Darpan Expert Portal</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-white">
                    {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                  </span>
                )}
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
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">Darpan Intelligence Expert</span>
            </div>
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {expertSidebarItems.map((item, index) => (
                <li key={index}>
                  {item.isSubmenu ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                        onClick={() => setResourcesOpen(!resourcesOpen)}
                      >
                        <div className="flex items-center gap-x-3">
                          <span className="h-5 w-5 text-gray-400">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {resourcesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {resourcesOpen && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.submenuItems?.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <ExpertSidebarItem
                                icon={subItem.icon}
                                label={subItem.label}
                                href={subItem.href}
                                active={location === subItem.href}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <ExpertSidebarItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={location === item.href}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                  <UserCheck className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  Study Abroad Expert
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Mobile Main Content */}
        <main className="p-4">
          {children}
        </main>
      </div>

      {/* Desktop Layout (hidden on mobile) */}
      <div className="hidden md:flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-xl font-semibold text-gray-900">Darpan Intelligence Expert</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {expertSidebarItems.map((item, index) => (
                <li key={index}>
                  {item.isSubmenu ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                        onClick={() => setResourcesOpen(!resourcesOpen)}
                      >
                        <div className="flex items-center gap-x-3">
                          <span className="h-5 w-5 text-gray-400">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {resourcesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {resourcesOpen && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.submenuItems?.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <ExpertSidebarItem
                                icon={subItem.icon}
                                label={subItem.label}
                                href={subItem.href}
                                active={location === subItem.href}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <ExpertSidebarItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={location === item.href}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  Study Abroad Expert
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}