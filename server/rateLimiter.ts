// Simple rate limiting for cost efficiency and standard practices
const userRequestCounts = new Map<number, { count: number; resetTime: number }>();
const AI_REQUESTS_PER_HOUR = 20; // Limit AI requests per user per hour
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if user has exceeded their hourly AI request limit
 */
export function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const userLimit = userRequestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize counter
    userRequestCounts.set(userId, {
      count: 1,
      resetTime: now + RESET_INTERVAL
    });
    return false;
  }
  
  if (userLimit.count >= AI_REQUESTS_PER_HOUR) {
    console.log(`⚠️ User ${userId} has exceeded AI request limit (${userLimit.count}/${AI_REQUESTS_PER_HOUR})`);
    return true;
  }
  
  // Increment counter
  userLimit.count++;
  return false;
}

/**
 * Get remaining requests for user
 */
export function getRemainingRequests(userId: number): number {
  const userLimit = userRequestCounts.get(userId);
  if (!userLimit || Date.now() > userLimit.resetTime) {
    return AI_REQUESTS_PER_HOUR;
  }
  return Math.max(0, AI_REQUESTS_PER_HOUR - userLimit.count);
}

/**
 * Get standard rate limit response
 */
export function getRateLimitResponse(): string {
  return `I'm here to help, but to serve all students cost-effectively, we have a limit of ${AI_REQUESTS_PER_HOUR} AI responses per hour. Please consider booking a consultation with our expert counselors for unlimited guidance, or try again in a few minutes.`;
}