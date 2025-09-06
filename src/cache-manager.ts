/**
 * Cache management for timezone detection and metadata
 *
 * Provides in-memory caching with optional TTL support for timezone-related data
 */

import type { CacheEntry, CacheStats } from "./types.js";

/**
 * Cache manager for timezone-related data
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get a cached value
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (entry.ttl !== undefined && this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a cached value
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time-to-live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: new Date(),
      ...(ttl !== undefined && { ttl }),
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if cache has a key
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (entry.ttl !== undefined && this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear cache entries
   * @param key - Specific key to clear, or undefined to clear all
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (entry.ttl !== undefined && this.isExpired(entry)) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Clean up expired entries
   * @returns Number of entries removed
   */
  cleanup(): number {
    let removed = 0;
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl !== undefined && this.isExpired(entry)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.cache.delete(key);
      removed++;
    }

    return removed;
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if a cache entry has expired
   * @param entry - Cache entry to check
   * @returns True if expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    if (entry.ttl === undefined) {
      return false;
    }

    // Handle zero or negative TTL as immediately expired
    if (entry.ttl <= 0) {
      return true;
    }

    const now = Date.now();
    const entryTime = entry.timestamp.getTime();
    return now - entryTime > entry.ttl;
  }

  /**
   * Calculate cache hit rate (simplified)
   * @returns Hit rate as percentage
   */
  private calculateHitRate(): number {
    // This is a simplified implementation
    // In a real scenario, you'd track hits/misses
    const stats = this.getBasicStats();
    if (stats.totalEntries === 0) return 0;

    return (stats.activeEntries / stats.totalEntries) * 100;
  }

  /**
   * Get basic cache statistics
   * @returns Basic stats object
   */
  private getBasicStats(): { totalEntries: number; activeEntries: number } {
    let active = 0;

    for (const entry of this.cache.values()) {
      if (entry.ttl === undefined || !this.isExpired(entry)) {
        active++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: active,
    };
  }
}

/**
 * Global cache manager instance for timezone data
 */
export const timezoneCache = new CacheManager();
