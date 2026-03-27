import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { StoreProvider } from "./context/StoreContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeProvider";

// 🛡️ Global Error Filter: Silence harmless Supabase lock abortion errors
// This is a known issue with Supabase logic in rapid re-rendering/strict-mode environments
const SILENCE_MSGS = ['Lock request was aborted', 'signal is aborted', 'AbortError', 'Lock was stolen', 'lock:electrive-auth-token', 'was not released', "Lock broken by another request with the 'steal' option.", 'Script error.'];
const shouldSuppress = (data) => {
    if (!data) return false;

    // Check if error is an object with message or reason
    const msg = typeof data === 'string' ? data : (data.message || data.reason?.message || Object.prototype.toString.call(data));
    return typeof msg === 'string' && SILENCE_MSGS.some(s => msg.includes(s));
};

// Silence Console Methods
['error', 'warn'].forEach(method => {
    const original = console[method];
    console[method] = (...args) => {
        if (args.some(arg => shouldSuppress(arg))) return;
        original.apply(console, args);
    };
});

// Silence Global Window Events
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        if (shouldSuppress(event.error) || shouldSuppress(event.message)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);
    window.addEventListener('unhandledrejection', (event) => {
        if (shouldSuppress(event.reason)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>
    <ThemeProvider>
        <StoreProvider>
            <App />
            <Toaster position="top-right" richColors />
        </StoreProvider>
    </ThemeProvider>
    // </React.StrictMode>
);
