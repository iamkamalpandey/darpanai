import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ExpertProtectedRouteProps {
  path: string;
  component: () => JSX.Element;
}

export function ExpertProtectedRoute({ component: Component }: ExpertProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'expert')) {
      toast({
        title: "Access Denied",
        description: "You need expert access to view this page. Redirecting to login...",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  }, [user, isLoading, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and has expert role
  if (!user || user.role !== 'expert') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need expert privileges to access this page.</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // User is authenticated and has expert role, render the component
  return <Component />;
}

export default ExpertProtectedRoute;