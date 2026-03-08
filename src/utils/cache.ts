const CACHE_PREFIX = 'embedded_schematic_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  duration?: number;
  prefix?: string;
}

function getFullKey(key: string, prefix?: string): string {
  const usedPrefix = prefix ?? CACHE_PREFIX;
  return `${usedPrefix}${key}`;
}

export function getCache<T>(key: string, options?: CacheOptions): T | null {
  const fullKey = getFullKey(key, options?.prefix);
  const cachedItem = localStorage.getItem(fullKey);

  if (!cachedItem) {
    return null;
  }

  try {
    const parsed: CacheItem<T> = JSON.parse(cachedItem);
    
    if (!isCacheValid(parsed)) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return parsed.data;
  } catch {
    localStorage.removeItem(fullKey);
    return null;
  }
}

export function setCache<T>(key: string, data: T, options?: CacheOptions): void {
  const fullKey = getFullKey(key, options?.prefix);
  const duration = options?.duration ?? CACHE_DURATION_MS;
  const now = Date.now();

  const cacheItem: CacheItem<T> = {
    data,
    timestamp: now,
    expiry: now + duration,
  };

  try {
    localStorage.setItem(fullKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Failed to set cache:', error);
    clearOldestCache();
    try {
      localStorage.setItem(fullKey, JSON.stringify(cacheItem));
    } catch (retryError) {
      console.error('Failed to set cache after cleanup:', retryError);
    }
  }
}

export function clearCache(key: string, prefix?: string): void {
  const fullKey = getFullKey(key, prefix);
  localStorage.removeItem(fullKey);
}

export function clearAllCache(prefix?: string): void {
  const usedPrefix = prefix ?? CACHE_PREFIX;
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(usedPrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export function isCacheValid<T>(cacheItem: CacheItem<T>): boolean {
  if (!cacheItem || typeof cacheItem.expiry !== 'number') {
    return false;
  }

  return Date.now() < cacheItem.expiry;
}

export function getCacheAge(key: string, prefix?: string): number | null {
  const fullKey = getFullKey(key, prefix);
  const cachedItem = localStorage.getItem(fullKey);

  if (!cachedItem) {
    return null;
  }

  try {
    const parsed: CacheItem<unknown> = JSON.parse(cachedItem);
    return Date.now() - parsed.timestamp;
  } catch {
    return null;
  }
}

export function getCacheRemainingTime(key: string, prefix?: string): number | null {
  const fullKey = getFullKey(key, prefix);
  const cachedItem = localStorage.getItem(fullKey);

  if (!cachedItem) {
    return null;
  }

  try {
    const parsed: CacheItem<unknown> = JSON.parse(cachedItem);
    const remaining = parsed.expiry - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

function clearOldestCache(): void {
  const cacheEntries: { key: string; timestamp: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          cacheEntries.push({ key, timestamp: parsed.timestamp ?? 0 });
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }

  cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

  const itemsToRemove = Math.ceil(cacheEntries.length * 0.2);
  for (let i = 0; i < itemsToRemove && i < cacheEntries.length; i++) {
    localStorage.removeItem(cacheEntries[i].key);
  }
}

export function getCacheStats(prefix?: string): {
  totalItems: number;
  totalSize: number;
  oldestItem: number | null;
  newestItem: number | null;
} {
  const usedPrefix = prefix ?? CACHE_PREFIX;
  let totalItems = 0;
  let totalSize = 0;
  let oldestItem: number | null = null;
  let newestItem: number | null = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(usedPrefix)) {
      const item = localStorage.getItem(key);
      if (item) {
        totalItems++;
        totalSize += item.length * 2;

        try {
          const parsed = JSON.parse(item);
          const timestamp = parsed.timestamp;
          if (typeof timestamp === 'number') {
            if (oldestItem === null || timestamp < oldestItem) {
              oldestItem = timestamp;
            }
            if (newestItem === null || timestamp > newestItem) {
              newestItem = timestamp;
            }
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  return {
    totalItems,
    totalSize,
    oldestItem,
    newestItem,
  };
}

export function cleanupExpiredCache(prefix?: string): number {
  const usedPrefix = prefix ?? CACHE_PREFIX;
  let removedCount = 0;

  const keysToCheck: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(usedPrefix)) {
      keysToCheck.push(key);
    }
  }

  keysToCheck.forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        const parsed: CacheItem<unknown> = JSON.parse(item);
        if (!isCacheValid(parsed)) {
          localStorage.removeItem(key);
          removedCount++;
        }
      } catch {
        localStorage.removeItem(key);
        removedCount++;
      }
    }
  });

  return removedCount;
}
