import { BuildInfo } from "@/types/build-info";

export class VersionChecker {
  private currentBuildId: string | null;
  private checkInterval: number;
  private isFirstCheck: boolean;

  constructor(checkInterval: number = 30000) {
    this.currentBuildId = null;
    this.checkInterval = checkInterval;
    this.isFirstCheck = true;
  }

  private async getCurrentBuildId(): Promise<string | null> {
    try {
      const response = await fetch("/api/build-info");
      const data: BuildInfo = await response.json();
      return data.buildId;
    } catch (error) {
      console.error("Failed to fetch build info:", error);
      return null;
    }
  }

  private async checkForUpdates(): Promise<void> {
    const newBuildId = await this.getCurrentBuildId();

    if (!newBuildId) return;

    if (this.isFirstCheck) {
      this.currentBuildId = newBuildId;
      this.isFirstCheck = false;
      return;
    }

    if (this.currentBuildId && newBuildId !== this.currentBuildId) {
      window.location.reload();
    }

    this.currentBuildId = newBuildId;
  }

  public startChecking(): ReturnType<typeof setInterval> {
    this.checkForUpdates();
    return setInterval(() => this.checkForUpdates(), this.checkInterval);
  }
}
