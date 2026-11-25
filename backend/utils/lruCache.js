/**
 * High-Performance In-Memory LRU Cache with TTL (Data Structures & Algorithms)
 * Implemented using ES6 Map (Hash Table + Doubly Linked List) for O(1) operations.
 */
export class LRUCache {
    constructor(maxSize = 250, defaultTtlMs = 60000) {
        this.maxSize = maxSize;
        this.defaultTtlMs = defaultTtlMs;
        this.cache = new Map();
    }

    /**
     * Get item from cache in O(1) time complexity.
     * Refreshes recency on access (LRU policy).
     */
    get(key) {
        if (!this.cache.has(key)) return null;

        const entry = this.cache.get(key);

        // Check TTL expiration
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Refresh recency: re-insert at end of Map (MRU)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    /**
     * Set item in cache in O(1) time complexity.
     * Evicts Least Recently Used item if capacity is reached.
     */
    set(key, value, ttlMs = this.defaultTtlMs) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Evict oldest item (first key in Map) in O(1)
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    /**
     * Invalidate specific key
     */
    delete(key) {
        return this.cache.delete(key);
    }

    /**
     * Invalidate all keys matching a prefix or pattern
     */
    invalidatePrefix(prefix) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
    }

    get size() {
        return this.cache.size;
    }
}

// Global shared caches for high-traffic read operations
export const productCache = new LRUCache(200, 120000); // 2 minutes TTL
export const suggestionCache = new LRUCache(300, 60000); // 1 minute TTL
export const categoryCache = new LRUCache(50, 300000); // 5 minutes TTL

export default LRUCache;
