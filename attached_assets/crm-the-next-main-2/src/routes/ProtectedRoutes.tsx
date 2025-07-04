import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  //@ts-ignore
  const { user, loader } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loader) {
      console.log("User:", user);
      if (!user) {
        router.push("/auth/login");
      }
    }
  }, [router, user]);
  return <>{user ? children : null}</>;
};

export default ProtectedRoute;
