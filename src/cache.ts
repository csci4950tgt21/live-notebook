/**
 * The Cache interface contains
 * methods for a cache implementation.
 */
export interface Cache<T>{
    /**
     * Return a cached value.
     * @param cacheKey The unique caching key
     */
    getCachedValue(cacheKey: any) : T | undefined;

    /**
     * Insert a value.
     * @param cacheKey The unique caching key
     * @param value The value to be inserted
     */
    insertValue(cacheKey: any, value: T) : void;

    /**
     * Replace an existing value.
     * @param cacheKey The unique caching key
     * @param value The new value
     */
    replaceValue(cacheKey: any, value: T) : void;

    /**
     * Clear the cache.
     */
    clearCache() : void;
}