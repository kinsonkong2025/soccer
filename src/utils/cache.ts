// 实现带过期时间的本地缓存
class DataCache {
    private cache: Map<string, { data: any; expiry: number }> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5分钟

    set(key: string, data: any, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiry });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    // 用于大型数据集的分块缓存
    async getChunkedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
        const cached = this.get(key);
        if (cached) return cached;

        const data = await fetchFn();
        this.set(key, data);
        return data;
    }
}

export const dataCache = new DataCache();