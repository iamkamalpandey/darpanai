import { noAuthRequired } from "@/lib/constants";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { ClipLoader, BeatLoader } from "react-spinners";
import { Toaster } from "sonner";
import { useRouter } from "next/router";
import ProtectedRoute from "@/routes/ProtectedRoutes";
import { AuthProvider } from "@/contexts/AuthContext";

import { useEffect } from "react";
import { VersionChecker } from "@/utils/version-checker";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined"
    ) {
      const checker = new VersionChecker();
      const intervalId = checker.startChecking();

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, []);
  return (
    <>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <NextNProgress color="red" />
        {noAuthRequired.includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </AuthProvider>
    </>
  );
}
