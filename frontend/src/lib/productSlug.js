/**
 * Generates a URL-friendly slug from a product name + id suffix
 * e.g. "Apple iPhone 15 Pro Max" → "apple-iphone-15-pro-max-5988f2dd"
 */
export function toProductSlug(product) {
    if (!product?.name) return product?.id || '';
    const namePart = product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // remove accents (ü→u, ö→o, ä→a)
        .replace(/[^a-z0-9\s-]/g, '')      // remove non-alphanumeric
        .trim()
        .replace(/\s+/g, '-')              // spaces → dashes
        .replace(/-+/g, '-');              // collapse multiple dashes

    // Append first 8 chars of ID to ensure uniqueness
    const idSuffix = (product.id || '').toString().split('-')[0];
    return `${namePart}-${idSuffix}`;
}

/**
 * Given a slug (e.g. "apple-iphone-15-pro-max-5988f2dd"),
 * find the matching product from a list.
 * Matches by the ID prefix at the end of the slug, or falls back to name match.
 */
export function findProductBySlug(slug, products) {
    if (!slug || !products) return null;

    // Primary: match by the last segment (ID prefix)
    const parts = slug.split('-');
    // UUID first segment is 8 chars
    const idPrefix = parts[parts.length - 1];

    if (idPrefix) {
        const byId = products.find(p => p.id?.toString().startsWith(idPrefix));
        if (byId) return byId;
    }

    // Fallback: full slug match on generated slug
    return products.find(p => toProductSlug(p) === slug) || null;
}

/**
 * Returns the URL path for a product page.
 */
export function productPath(product) {
    return `/product/${toProductSlug(product)}`;
}
