import type { NextApiRequest, NextApiResponse } from "next";
import { BuildInfo } from "@/types/build-info";

declare global {
  var BUILD_ID: string | undefined;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BuildInfo>
): void {
  const buildId: string =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.BUILD_ID ||
    process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ||
    global.BUILD_ID!;

  if (!global.BUILD_ID && !buildId) {
    global.BUILD_ID = `build_${Date.now()}`;
  }

  res.status(200).json({ buildId: buildId || global.BUILD_ID! });
}
