/**
 * Utility function to transform Supabase storage URLs for performance.
 * Supports automatic WebP conversion, resizing, and quality optimization.
 * 
 * @param {string} url - The original image URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {number} options.quality - Quality (1-100)
 * @param {string} options.format - Force format (e.g., 'webp', 'origin')
 * @returns {string} - The optimized URL
 */
export const getOptimizedImage = (url, options = {}) => {
    if (!url || typeof url !== 'string') return url;

    // IMPORTANT: Supabase Image Transformation is a Pro-only feature.
    // If your project is on the Free tier, using the '/render/image/' endpoint will return 404 or errors.
    // For maximum compatibility, we will return the original URL.
    return url;

    /* 
    // Only transform Supabase Storage URLs
    if (!url.includes('supabase.co/storage/v1/object/public/')) {
        return url;
    }

    try {
        const urlObj = new URL(url);

        // Supabase built-in image transformation is a Pro feature and uses the /render/image endpoint.
        // If images are disappearing, it's likely the transformation service isn't active for this project
        // or the path replacement is incorrect.

        // Let's use a safer approach: Only transform if explicitly requested and keep the original path
        // for better compatibility with free-tier accounts.

        // IF we want to use local optimization/CDN without Pro, we usually use a service like Cloudinary or Imgix.
        // For now, I'll return the original URL if no specific transformation is truly needed, 
        // OR add the params to the standard URL if supported by the specific middleware/setup.

        // SAFER FALLBACK: If transformations are failing, we return the original public URL.
        // I will add a check if we should actually transform.
        const shouldTransform = options.width || options.height || options.quality;

        if (!shouldTransform) return url;

        // Try the transformation syntax but be ready to fail
        const params = new URLSearchParams(urlObj.search);
        if (options.width) params.set('width', options.width);
        if (options.height) params.set('height', options.height);
        params.set('quality', options.quality || 80);
        params.set('format', options.format || 'webp');
        if (options.resize) params.set('resize', options.resize);

        // Create the potential render URL
        const renderUrl = new URL(url);
        renderUrl.pathname = renderUrl.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
        renderUrl.search = params.toString();

        return renderUrl.toString();
    } catch (e) {
        return url;
    }
    */
};

/**
 * Common size presets for the application
 */
export const IMAGE_SIZES = {
    THUMBNAIL: { width: 100, height: 100 },
    CARD: { width: 400 },
    PREVIEW: { width: 600 },
    FULL: { width: 1200 },
    HERO: { width: 1920 }
};
