/**
 * Utility functions for generating JSON-LD structured data strings
 */

/**
 * Generate JSON-LD for a single Product
 * @param {Object} product - Product object
 * @param {string} siteUrl - Base website URL
 * @param {Object} manufacturer - Manufacturer/Brand object (optional)
 */
export const generateProductJSONLD = (product, siteUrl = 'https://elifrad.com', manufacturer) => {
    if (!product) return null;

    const images = Array.isArray(product.images) ? product.images : (product.images ? JSON.parse(product.images) : [product.image]);
    const productUrl = `${siteUrl}/product/${product.id}`; // Since we use slugs or IDs, ensure this matches current routing

    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": images,
        "description": (product.description || "").replace(/<[^>]*>?/gm, ''), // Stripping HTML
        "sku": product.sku || product.id,
        "brand": {
            "@type": "Brand",
            "name": manufacturer?.name || product.manufacturer_id || "Elifrad"
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "EUR",
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceValidUntil": "2026-12-31" // Update if needed
        }
    };
};

/**
 * Generate JSON-LD for an Organization
 */
export const generateOrgJSONLD = (siteUrl = 'https://elifrad.com') => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Elifrad",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`, // Placeholder, update to actual logo path
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+49 7123 456789", // Placeholder
            "contactType": "customer service"
        }
    };
};

/**
 * Generate Breadcrumb JSON-LD
 * @param {Array} path - Array of { name, item } objects
 */
export const generateBreadcrumbJSONLD = (path) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": path.map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": p.name,
            "item": p.item
        }))
    };
};
