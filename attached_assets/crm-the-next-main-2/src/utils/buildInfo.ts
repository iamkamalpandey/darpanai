let cachedBuildId: string | null = null;

export const getBuildId = async (): Promise<string | null> => {
  if (cachedBuildId) return cachedBuildId;

  try {
    const response = await fetch("/_next/static/BUILD_ID");
    if (!response.ok) throw new Error("Failed to fetch BUILD_ID");

    cachedBuildId = await response.text();
    return cachedBuildId;
  } catch (error) {
    console.error("Error fetching build ID:", error);
    return null;
  }
};
