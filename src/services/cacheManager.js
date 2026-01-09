// In-memory cache with TTL for dashboard data
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 30000; // 30 seconds
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttl);
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheManager = new CacheManager();

// Cached query wrapper
export async function cachedQuery(key, queryFn, ttl = 30000) {
  // Check cache first
  const cached = cacheManager.get(key);
  if (cached) return cached;

  // Execute query and cache result
  try {
    const result = await queryFn();
    cacheManager.set(key, result, ttl);
    return result;
  } catch (error) {
    console.warn(`Cached query failed for key: ${key}`, error);
    throw error;
  }
}
