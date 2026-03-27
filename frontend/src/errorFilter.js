
// 🛡️ Global Error Filter: Silence harmless Supabase lock abortion errors
// This MUST be imported before any other code that might use Supabase
const SILENCE_MSG = 'Lock request was aborted';

const suppress = (data) => {
    if (!data) return false;
    try {
        if (typeof data === 'string' && data.includes(SILENCE_MSG)) return true;
        if (data instanceof Error) {
            if (data.message?.includes(SILENCE_MSG) || data.stack?.includes(SILENCE_MSG)) return true;
        }
        const msg = data.message || data.reason || '';
        const stack = data.stack || '';
        if (typeof msg === 'string' && msg.includes(SILENCE_MSG)) return true;
        if (typeof stack === 'string' && stack.includes(SILENCE_MSG)) return true;
        const str = JSON.stringify(data);
        return str && str.includes(SILENCE_MSG);
    } catch {
        return false;
    }
};

// Silence Console
const methods = ['error', 'warn', 'log', 'debug'];
methods.forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
        // Log all errors during debugging to see what's failing the data fetch
        // original.apply(console, ["DEBUG ERROR:", ...args]); 
        if (args.some(suppress)) return;
        if (original) original.apply(console, args);
    };
});

// Silence Global Events
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        if (suppress(event.error) || suppress(event.message)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
        if (suppress(event.reason)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);

    // Patch Locks API removed as it might be too aggressive and blocking the SDK
}
