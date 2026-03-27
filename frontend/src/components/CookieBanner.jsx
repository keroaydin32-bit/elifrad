import React, { useState, useEffect } from 'react';
import { Cookie, Shield, BarChart2, Megaphone, ChevronDown, ChevronUp, X, Check, Settings } from 'lucide-react';
import { initAnalytics } from '../lib/analytics';

const COOKIE_KEY = 'cookie_consent_v1';

const defaultConsent = {
    essential: true,      // Her zaman açık, değiştirilemez
    analytics: false,     // Ziyaretçi istatistikleri
    marketing: false,     // Pazarlama/reklam çerezleri
    timestamp: null,
    version: 1,
};

// Dışarıdan erişilebilir yardımcı
export function getCookieConsent() {
    try {
        const saved = localStorage.getItem(COOKIE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

export function hasAcceptedCookies() {
    const consent = getCookieConsent();
    return consent !== null && consent.timestamp !== null;
}

const CookieBanner = () => {
    const [consent, setConsent] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [localConsent, setLocalConsent] = useState({ ...defaultConsent });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const saved = getCookieConsent();
        if (saved) {
            setConsent(saved);
            setShowBanner(false);
            initAnalytics(saved);
        } else {
            // Küçük bir gecikme ile göster (sayfa yüklendikten sonra)
            const timer = setTimeout(() => {
                setShowBanner(true);
                setTimeout(() => setIsVisible(true), 50);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (consentData) => {
        const finalConsent = {
            ...consentData,
            essential: true,
            timestamp: new Date().toISOString(),
            version: 1,
        };
        localStorage.setItem(COOKIE_KEY, JSON.stringify(finalConsent));
        setConsent(finalConsent);
        initAnalytics(finalConsent);
        // Animasyonlu kapanma
        setIsVisible(false);
        setTimeout(() => setShowBanner(false), 400);
    };

    const handleAcceptAll = () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
    };

    const handleRejectAll = () => {
        saveConsent({ essential: true, analytics: false, marketing: false });
    };

    const handleSaveSettings = () => {
        saveConsent(localConsent);
    };

    const openSettings = () => {
        setShowSettings(true);
        setShowDetails(false);
    };

    // Banner gösterilmiyorsa veya zaten kabul edildiyse hiçbir şey render etme
    if (!showBanner) {
        return showBanner === false && consent ? (
            // Küçük "Çerez Tercihleri" butonu sol altta
            <button
                onClick={() => {
                    setLocalConsent(consent || { ...defaultConsent });
                    setShowBanner(true);
                    setShowSettings(true);
                    setTimeout(() => setIsVisible(true), 50);
                }}
                className="fixed bottom-4 left-4 z-40 bg-gray-900/90 hover:bg-gray-800 text-white text-xs px-3 py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10 backdrop-blur-sm transition-all hover:scale-105"
                title="Cookie-Einstellungen"
            >
                <Cookie className="w-3 h-3" />
                <span className="hidden sm:inline">Cookie-Einstellungen</span>
            </button>
        ) : null;
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Banner */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
            >
                <div className="bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
                    <div className="container mx-auto px-4 sm:px-6 py-5 max-w-7xl">

                        {/* --- Ana Banner (Ayarlar açık değilken) --- */}
                        {!showSettings && (
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
                                {/* Icon + Başlık */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                        <Cookie className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                                            Cookie-Einstellungen
                                        </h2>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">DSGVO-konform</p>
                                    </div>
                                </div>

                                {/* Açıklama */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.
                                        Einige sind notwendig, andere helfen uns, die Website zu verbessern.{' '}
                                        <button
                                            onClick={() => setShowDetails(d => !d)}
                                            className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 inline-flex items-center gap-0.5"
                                        >
                                            {showDetails ? 'Weniger' : 'Mehr erfahren'}
                                            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                    </p>

                                    {/* Genişletilmiş Açıklama */}
                                    {showDetails && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <CookieCategory
                                                icon={<Shield className="w-4 h-4 text-green-600" />}
                                                title="Notwendig"
                                                desc="Für die Grundfunktionen der Website unerlässlich. Immer aktiv."
                                                color="green"
                                                alwaysOn
                                            />
                                            <CookieCategory
                                                icon={<BarChart2 className="w-4 h-4 text-blue-600" />}
                                                title="Analyse"
                                                desc="Helfen uns zu verstehen, wie Besucher die Website nutzen."
                                                color="blue"
                                            />
                                            <CookieCategory
                                                icon={<Megaphone className="w-4 h-4 text-purple-600" />}
                                                title="Marketing"
                                                desc="Werden verwendet, um relevante Werbung anzuzeigen."
                                                color="purple"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Butonlar */}
                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto lg:w-auto">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Alle akzeptieren
                                    </button>
                                    <button
                                        onClick={openSettings}
                                        className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-800 dark:text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Einstellungen
                                    </button>
                                    <button
                                        onClick={handleRejectAll}
                                        className="px-6 py-2.5 border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Ablehnen
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- Detaylı Ayarlar Paneli --- */}
                        {showSettings && (
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                            <Settings className="w-4.5 h-4.5 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-gray-900 dark:text-white">Datenschutz-Einstellungen</h2>
                                            <p className="text-[11px] text-gray-500">Wählen Sie Ihre Cookie-Präferenzen</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                    {/* Notwendig */}
                                    <ToggleCookieCard
                                        icon={<Shield className="w-5 h-5 text-green-600" />}
                                        title="Notwendige Cookies"
                                        desc="Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich und können nicht deaktiviert werden. Sie speichern z.B. Ihren Warenkorb oder Ihre Anmeldedaten."
                                        color="green"
                                        enabled={true}
                                        locked={true}
                                    />
                                    {/* Analyse */}
                                    <ToggleCookieCard
                                        icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
                                        title="Analyse-Cookies"
                                        desc="Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren. Alle Daten werden anonymisiert gesammelt."
                                        color="blue"
                                        enabled={localConsent.analytics}
                                        onToggle={(v) => setLocalConsent(p => ({ ...p, analytics: v }))}
                                    />
                                    {/* Marketing */}
                                    <ToggleCookieCard
                                        icon={<Megaphone className="w-5 h-5 text-purple-600" />}
                                        title="Marketing-Cookies"
                                        desc="Diese Cookies werden verwendet, um Werbung für Sie relevanter zu gestalten und Ihnen personalisierte Angebote zu zeigen."
                                        color="purple"
                                        enabled={localConsent.marketing}
                                        onToggle={(v) => setLocalConsent(p => ({ ...p, marketing: v }))}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        onClick={handleRejectAll}
                                        className="px-5 py-2.5 border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-semibold rounded-lg transition-all"
                                    >
                                        Nur Notwendige
                                    </button>
                                    <button
                                        onClick={handleSaveSettings}
                                        className="px-5 py-2.5 bg-gray-800 dark:bg-white/10 hover:bg-gray-900 dark:hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Auswahl speichern
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/25 flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Alle akzeptieren
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Alt bilgi */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-x-4 gap-y-1">
                            <p className="text-[11px] text-gray-400">
                                Weitere Informationen finden Sie in unserer{' '}
                                <a href="/legal/datenschutz" className="text-red-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                                    Datenschutzerklärung
                                </a>
                                {' '}und unserem{' '}
                                <a href="/legal/agb" className="text-red-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                                    AGB
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Yardımcı Bileşenler ---

const CookieCategory = ({ icon, title, desc, color, alwaysOn }) => (
    <div className={`flex gap-2.5 p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/20`}>
        <div className={`w-7 h-7 rounded-md bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center shrink-0 mt-0.5`}>
            {icon}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-800 dark:text-gray-200">{title}</span>
                {alwaysOn && (
                    <span className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Immer aktiv
                    </span>
                )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{desc}</p>
        </div>
    </div>
);

const ToggleCookieCard = ({ icon, title, desc, color, enabled, onToggle, locked }) => (
    <div className={`p-4 rounded-xl border transition-all ${enabled
        ? `border-${color}-200 dark:border-${color}-900/40 bg-${color}-50/50 dark:bg-${color}-900/10`
        : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5'
        }`}>
        <div className="flex items-start justify-between gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? `bg-${color}-100 dark:bg-${color}-900/30` : 'bg-gray-200 dark:bg-white/10'
                }`}>
                {icon}
            </div>
            {locked ? (
                <span className="mt-1 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                    Immer aktiv
                </span>
            ) : (
                <button
                    onClick={() => onToggle(!enabled)}
                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-1 ${enabled ? `bg-${color}-500` : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    aria-label={`${title} ${enabled ? 'deaktivieren' : 'aktivieren'}`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-6' : 'left-1'
                        }`} />
                </button>
            )}
        </div>
        <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

export default CookieBanner;
