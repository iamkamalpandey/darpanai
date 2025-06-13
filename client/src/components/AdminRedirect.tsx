import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function AdminRedirect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is admin and on user pages, redirect to admin panel
    if (user?.role === 'admin') {
      setLocation('/admin');
    }
  }, [user, setLocation]);

  return null;
}