import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  Menu, 
  LogOut,
  Users,
  FileText,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  BookOpen,
  X,
  Bell,
  Plus
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
          active 
            ? 'bg-orange-50 text-orange-600 border-l-3 border-orange-500' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
        }`}
      >
        <span className={`h-5 w-5 flex-shrink-0 ${active ? 'text-orange-600' : 'text-gray-400'}`}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
};

interface ExpertLayoutProps {
  children: ReactNode;
}

export function ExpertLayout({ children }: ExpertLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/fresh'],
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
    { icon: <Home size={20} />, label: 'Dashboard', href: '/expert' },
    { icon: <Users size={20} />, label: 'Student Management', href: '/expert/students' },
    { icon: <MessageSquare size={20} />, label: 'Consultations', href: '/expert/consultations' },
    { icon: <FileText size={20} />, label: 'Document Review', href: '/expert/documents' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/expert/analytics' },
    { icon: <BookOpen size={20} />, label: 'Resources', href: '/expert/resources' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/expert/settings' },
  ];

  // Redirect non-expert users
  if (user?.role !== 'expert') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm 
        ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-72' : 'hidden'} md:relative md:flex md:w-72`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">D</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">DarpanAI</h1>
            <p className="text-sm text-gray-500">Expert Portal</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {expertSidebarItems.map((item, index) => (
              <ExpertSidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location === item.href}
              />
            ))}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
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
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">Study Abroad Expert</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="ml-2 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-semibold text-sm">D</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">DarpanAI Expert</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Expert Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your students.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                New Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}