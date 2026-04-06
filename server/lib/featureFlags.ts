import prisma from './prisma';

// Simple in-process cache (60s TTL)
const cache = new Map<string, { value: boolean; expires: number }>();
const FLAG_CACHE_TTL = parseInt(process.env.FEATURE_FLAG_CACHE_TTL ?? '60') * 1000;

function crc32Hash(str: string): number {
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface UserContext {
  subscription?: string;
  schoolId?: number;
}

export async function isFeatureEnabled(
  flagKey: string,
  userId?: number,
  userContext: UserContext = {}
): Promise<boolean> {
  const cacheKey = `${flagKey}:${userId ?? 'anon'}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  const p = prisma as any;
  const flag = await p.featureFlag.findUnique({ where: { key: flagKey } });

  if (!flag || !flag.isEnabled) {
    cache.set(cacheKey, { value: false, expires: Date.now() + FLAG_CACHE_TTL });
    return false;
  }

  let result = true;

  if (userId) {
    const disabled: number[] = JSON.parse(flag.disabledForUserIds ?? '[]');
    if (disabled.includes(userId)) { result = false; }
    else {
      const enabled: number[] = JSON.parse(flag.enabledForUserIds ?? '[]');
      if (enabled.includes(userId)) { result = true; }
      else if (flag.rolloutBy === 'subscription' && userContext.subscription) {
        const subs: string[] = JSON.parse(flag.enabledForSubscriptions ?? '["free","premium","school"]');
        result = subs.includes(userContext.subscription);
      } else if (flag.rolloutPercentage < 100) {
        const hash = crc32Hash(String(userId)) % 100;
        result = hash < flag.rolloutPercentage;
      }
    }
  }

  cache.set(cacheKey, { value: result, expires: Date.now() + FLAG_CACHE_TTL });
  return result;
}

export function invalidateFlagCache(flagKey?: string): void {
  if (flagKey) {
    for (const key of cache.keys()) {
      if (key.startsWith(flagKey + ':')) cache.delete(key);
    }
  } else {
    cache.clear();
  }
}
