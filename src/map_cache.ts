import { cachedDataVersionTag } from "v8";
import { Cache } from "./cache"

/**
 * An implementation of cache
 * using a map.
 */
export class MapCache<T> implements Cache<T> {
    private cacheMap: Map<any, T>;

    constructor() {
        this.cacheMap = new Map();
    }

    getCachedValue(cacheKey: any): T | undefined {
        return this.cacheMap.get(cacheKey);
    }

    insertValue(cacheKey: any, value: T): void {
        this.cacheMap.set(cacheKey, value);
    }

    replaceValue(cacheKey: any, value: T): void {
        this.cacheMap.set(cacheKey, value);
    }

    clearCache(): void {
        this.cacheMap.clear();
    }
}