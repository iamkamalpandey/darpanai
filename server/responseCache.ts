import { createHash } from 'crypto';

// Simple in-memory cache for frequently asked questions
const responseCache = new Map<string, { response: string; timestamp: number; specialist: string }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 100; // Limit cache size

/**
 * Generate cache key based on message content and user profile
 */
function generateCacheKey(message: string, userProfile: any): string {
  const normalizedMessage = message.toLowerCase().trim();
  const profileKey = `${userProfile.fieldOfStudy || 'general'}_${(userProfile.preferredCountries && userProfile.preferredCountries[0]) || 'global'}`;
  return createHash('md5').update(`${normalizedMessage}_${profileKey}`).digest('hex');
}

/**
 * Check if response exists in cache
 */
export function getCachedResponse(message: string, userProfile: any): { response: string; specialist: string } | null {
  const key = generateCacheKey(message, userProfile);
  const cached = responseCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('💾 Cache hit for message:', message.substring(0, 50));
    return { response: cached.response, specialist: cached.specialist };
  }
  
  return null;
}

/**
 * Cache response for future use
 */
export function cacheResponse(message: string, userProfile: any, response: string, specialist: string): void {
  const key = generateCacheKey(message, userProfile);
  
  // Clear old entries if cache is too large
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }
  
  responseCache.set(key, {
    response,
    specialist,
    timestamp: Date.now()
  });
  
  console.log('💾 Cached response for future use');
}

/**
 * Check if message is a common greeting or simple question
 */
export function isSimpleQuery(message: string): boolean {
  const simple = message.toLowerCase().trim();
  const simpleQueries = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'what can you do', 'help', 'thanks', 'thank you', 'bye'
  ];
  
  return simpleQueries.includes(simple) || simple.length < 10;
}

/**
 * Get predefined response for simple queries to save AI tokens
 */
export function getSimpleResponse(message: string, userProfile: any): string | null {
  const simple = message.toLowerCase().trim();
  const name = (userProfile.firstName && userProfile.firstName.trim()) || 'Student';
  
  const responses: Record<string, string> = {
    'hi': `Hello ${name}! I'm Darpan Intelligence, your international education advisor. How can I help with your study abroad journey today?`,
    'hello': `Hello ${name}! Ready to explore your international education options? What specific aspect interests you?`,
    'hey': `Hey ${name}! I'm here to guide your study abroad journey. What would you like to discuss?`,
    'help': `I can help you with university selection, scholarships, visa guidance, and application strategies. What specific area interests you?`,
    'thanks': `You're welcome! Feel free to ask more questions about your international education journey.`,
    'thank you': `My pleasure! I'm here whenever you need guidance on studying abroad.`,
    'bye': `Goodbye ${name}! Best of luck with your international education journey. Come back anytime for guidance!`
  };
  
  return responses[simple] || null;
}