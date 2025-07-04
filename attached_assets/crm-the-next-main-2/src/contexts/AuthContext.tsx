import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

import api from "../services/api";
import { noAuthRequired } from "@/lib/constants";
import LoadingOverlay from "react-loading-overlay-ts";

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUserFromStorage() {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken) {
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        try {
          const response = await api.get("user/profile");
          setUser(response.data);
        } catch (error: any) {
          if (error.response?.status === 401 && refreshToken) {
            const refreshed = await refreshTokenFunction(refreshToken);
            if (!refreshed && !noAuthRequired.includes(pathname)) {
              router.push("/auth/login");
            }
          } else if (!noAuthRequired.includes(pathname)) {
            router.push("/auth/login");
          }
        }
      } else if (!noAuthRequired.includes(pathname)) {
        router.push("/auth/login");
      }
      setLoading(false);
    }
    loadUserFromStorage();
  }, []);

  const refreshTokenFunction = async (refreshToken: string) => {
    try {
      const response = await api.post("/auth/refreshToken", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setLoader(true);
    try {
      const response = await api.post("auth/login", { email, password });
      const { accessToken, refreshToken, profile } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      setUser(profile);
      router.push(`/${profile.role.name.toLowerCase()}/dashboard`);
    } catch (error) {
      toast.error("Error Signing In!");
    } finally {
      setLoader(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    delete api.defaults.headers.Authorization;
    router.push("/auth/login");
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const isRefreshed = await refreshTokenFunction(refreshToken);
          if (isRefreshed) {
            return api(originalRequest);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loading,
        setLoading,
        loader,
        setLoader,
        logout,
      }}
    >
      <LoadingOverlay
        active={loader}
        spinner
        text=""
        className="w-screen h-screen"
      >
        {children}
      </LoadingOverlay>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
