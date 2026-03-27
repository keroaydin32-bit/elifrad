/**
 * Safe Storage Utility
 * Wraps localStorage with try-catch to prevent QuotaExceededError and other storage failures.
 */

export const safeGet = (key) => {
    try {
        const value = localStorage.getItem(key);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    } catch (error) {
        console.warn(`[STORAGE] Error reading key "${key}":`, error);
        return null;
    }
};

export const safeSet = (key, value) => {
    try {
        const valToStore = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, valToStore);
        return true;
    } catch (error) {
        console.warn(`[STORAGE] Error saving key "${key}". Storage full or inaccessible.`, error);

        // QuotaExceededError handling
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            // Priority: keep auth and cart, delete large caches
            if (key === 'cached_products') {
                localStorage.removeItem('cached_products');
            } else {
                // If it's something else, try to clear least important stuff
                localStorage.removeItem('cached_products');
                localStorage.removeItem('cached_last_profile');

                // Try again once after clearing
                try {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('[STORAGE] Major failure: Storage still full after cleanup.');
                }
            }
        }
        return false;
    }
};

export const safeRemove = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`[STORAGE] Error removing key "${key}":`, error);
    }
};

/**
 * Custom storage object for Supabase
 */
export const supabaseStorage = {
    getItem: (key) => {
        const val = localStorage.getItem(key);
        return val; // Supabase expects raw string or null
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('[SUPABASE-STORAGE] Error saving auth token:', error);
            // If auth token fails, we might want to clear something and try once
            localStorage.removeItem('cached_products');
            try { localStorage.setItem(key, value); } catch (e) { }
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) { }
    }
};
