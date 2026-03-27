/**
 * Analytics Utility
 * Handles Google Analytics 4 (GA4) and Meta Pixel events based on user consent.
 */

// Helper to get keys from env
const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;

/**
 * Initialize Analytics Scripts
 * Injected when consent is given.
 */
export const initAnalytics = (consent) => {
    if (!consent) return;

    // 1. Google Analytics
    if (consent.analytics && GA_ID && !window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID, {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
        });
        console.log('📊 GA4 Initialized');
    }

    // 2. Meta Pixel
    if (consent.marketing && PIXEL_ID && !window.fbq) {
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');
        console.log('💎 Meta Pixel Initialized');
    }
};

/**
 * Track Custom Events
 */
export const trackEvent = (eventName, params = {}) => {
    // Check consent from localStorage
    let consent;
    try {
        const consentStr = localStorage.getItem('cookie_consent_v1');
        if (!consentStr) return;
        consent = JSON.parse(consentStr);
    } catch (e) {
        console.warn('Analytics: Failed to parse consent', e);
        return;
    }

    // GA Event
    try {
        if (consent.analytics && window.gtag) {
            window.gtag('event', eventName, params);
        }
    } catch (e) {
        console.warn('GA tracking failed:', e);
    }

    // Meta Pixel Event
    try {
        if (consent.marketing && window.fbq) {
            // Map GA names to common Pixel names if needed
            const pixelMap = {
                'view_item': 'ViewContent',
                'add_to_cart': 'AddToCart',
                'begin_checkout': 'InitiateCheckout',
                'purchase': 'Purchase'
            };
            const pixelName = pixelMap[eventName] || eventName;
            window.fbq('track', pixelName, params);
        }
    } catch (e) {
        console.warn('Pixel tracking failed:', e);
    }
};
