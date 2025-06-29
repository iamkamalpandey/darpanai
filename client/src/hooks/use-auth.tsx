import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, InsertUser, LoginUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginUser>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<User, "password"> | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 10 * 60 * 1000, // 10 minutes for auth data
    gcTime: 15 * 60 * 1000, // 15 minutes cache retention
    refetchOnWindowFocus: false, // Prevent unnecessary auth checks
    retry: 1, // Reduce retry attempts for faster failure handling
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Pre-warm common data based on user role for faster navigation
      if (user.role === 'admin') {
        queryClient.prefetchQuery({ queryKey: ["/api/admin/users"] });
        queryClient.prefetchQuery({ queryKey: ["/api/admin/system-stats"] });
      } else {
        queryClient.prefetchQuery({ queryKey: ["/api/analyses"] });
      }
      
      toast({
        title: "Authentication Successful",
        description: `Welcome back, ${user.firstName ? `${user.firstName} ${user.lastName}` : user.username}!`,
      });
      
      // Smooth navigation based on user role
      if (user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication Failed",
        description: "Please check your username and password and try again. If you continue to experience issues, contact support.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userInfo: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userInfo);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Pre-warm data for new users for faster dashboard access
      if (user.role === 'admin') {
        queryClient.prefetchQuery({ queryKey: ["/api/admin/users"] });
        queryClient.prefetchQuery({ queryKey: ["/api/admin/system-stats"] });
      } else {
        queryClient.prefetchQuery({ queryKey: ["/api/analyses"] });
      }
      
      toast({
        title: "Account Created Successfully",
        description: `Welcome to Visa Analyzer, ${user.firstName ? `${user.firstName} ${user.lastName}` : user.username}!`,
      });
      
      // Smooth navigation based on user role (new users are typically regular users)
      if (user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Account Creation Failed",
        description: "Unable to create your account. Please verify all information is correct and try again. Contact support if the issue persists.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}