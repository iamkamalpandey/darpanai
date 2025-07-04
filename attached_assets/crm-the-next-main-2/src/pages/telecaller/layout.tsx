import Sidebar from "@/components/shared/Sidebar/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  AdmissionMenus,
  CounsellorMenus,
  TelecallerMenus,
} from "@/types/sidebar-menus";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role.name !== "TELECALLER") {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Show loading while checking
  if (!user) {
    return <div>Loading...</div>;
  }

  // Only render for counsellor
  if (user.role.name === "TELECALLER") {
    return (
      <div
        className={cn(
          "flex h-screen flex-col w-full md:flex-row md:overflow-hidden font-sans"
        )}
      >
        <Sidebar menus={TelecallerMenus}>{children}</Sidebar>
      </div>
    );
  }

  return null; // Return null while redirecting
}
