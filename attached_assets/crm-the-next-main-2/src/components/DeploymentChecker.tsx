import { FC, useEffect, useState } from "react";
import Router from "next/router";
import { getBuildId } from "../utils/buildInfo";

interface BuildCheckStatus {
  checked: boolean;
  loading: boolean;
  error: string | null;
}

const DeploymentChecker: FC = () => {
  const [status, setStatus] = useState<BuildCheckStatus>({
    checked: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // Skip if already checked this session
    if (status.checked || status.loading) return;

    const checkDeployment = async (): Promise<void> => {
      try {
        setStatus((prev) => ({ ...prev, loading: true }));

        // Get current build ID
        const currentBuildId = await getBuildId();
        if (!currentBuildId) {
          throw new Error("Could not fetch current build ID");
        }

        // Get stored build ID from previous session
        const storedBuildId = localStorage.getItem("nextBuildId");

        // First visit or cleared storage
        if (!storedBuildId) {
          localStorage.setItem("nextBuildId", currentBuildId);
          setStatus((prev) => ({
            ...prev,
            checked: true,
            loading: false,
          }));
          return;
        }

        // Different build ID means new deployment
        if (storedBuildId !== currentBuildId) {
          // Update stored ID first to prevent reload loop
          localStorage.setItem("nextBuildId", currentBuildId);

          // Custom reload UI
          const shouldReload = window.confirm(
            "A new version of the application is available. Would you like to reload now?"
          );

          if (shouldReload) {
            Router.reload();
          }
        }

        setStatus((prev) => ({
          ...prev,
          checked: true,
          loading: false,
        }));
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          checked: true,
          loading: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }));
      }
    };

    // Small delay to ensure other critical components load first
    const timeoutId = setTimeout(checkDeployment, 2000);
    return () => clearTimeout(timeoutId);
  }, [status.checked, status.loading]);

  // Optionally render error message
  if (status.error && process.env.NODE_ENV === "development") {
    console.error("DeploymentChecker error:", status.error);
  }

  return null;
};

export default DeploymentChecker;
