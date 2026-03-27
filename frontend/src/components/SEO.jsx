import React, { useEffect } from 'react';

/**
 * SEO Component for managing dynamic meta tags and JSON-LD structured data
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.image - Social sharing image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - OG type (website, product, etc.)
 * @param {Object} props.jsonLD - Structured data object
 */
const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    jsonLD
}) => {
    const siteName = 'Elifrad'; // Adjust if needed
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Helper to update or create meta tags
        const updateMetaTag = (property, content, attr = 'name') => {
            if (!content) return;
            let element = document.querySelector(`meta[${attr}="${property}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                element.setAttribute(attr, property);
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
        };

        // Standard Meta Tags
        updateMetaTag('description', description);

        // Open Graph / Facebook
        updateMetaTag('og:type', type, 'property');
        updateMetaTag('og:title', fullTitle, 'property');
        updateMetaTag('og:description', description, 'property');
        updateMetaTag('og:url', url || window.location.href, 'property');
        updateMetaTag('og:image', image, 'property');
        updateMetaTag('og:site_name', siteName, 'property');

        // Twitter
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', fullTitle);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (url) {
            if (canonical) {
                canonical.setAttribute('href', url);
            } else {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                canonical.setAttribute('href', url);
                document.head.appendChild(canonical);
            }
        }

        // JSON-LD Structured Data
        let scriptTag = document.getElementById('json-ld-data');
        if (jsonLD) {
            if (!scriptTag) {
                scriptTag = document.createElement('script');
                scriptTag.id = 'json-ld-data';
                scriptTag.type = 'application/ld+json';
                document.head.appendChild(scriptTag);
            }
            scriptTag.text = JSON.stringify(jsonLD);
        } else if (scriptTag) {
            scriptTag.remove();
        }

        return () => {
            // Cleanup script tag on unmount if needed, though usually meta tags persist until next page
        };
    }, [fullTitle, description, image, url, type, jsonLD]);

    return null; // This component doesn't render anything UI-wise
};

export default SEO;
