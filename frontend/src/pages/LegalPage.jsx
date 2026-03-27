import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, FileText, Scale, ShieldCheck, AlertCircle } from 'lucide-react';

const LegalPage = () => {
    const { docId } = useParams();
    const { shopSettings } = useStore();
    const [currentDoc, setCurrentDoc] = useState(null);

    useEffect(() => {
        if (shopSettings && shopSettings.legalDocs) {
            const doc = shopSettings.legalDocs.find(d =>
                d.id === docId ||
                d.label.toLowerCase().replace(/\s+/g, '-') === docId
            );
            setCurrentDoc(doc);
        }
    }, [docId, shopSettings]);

    if (!currentDoc) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-4 transition-colors duration-500">
                <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-800 mb-6" />
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter">Seite nicht gefunden</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">Das angeforderte Dokument existiert nicht.</p>
                <Link to="/" className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-sm transition-all shadow-xl shadow-red-600/20 active:scale-95">
                    Zurück zur Startseite
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen pb-24 transition-colors duration-500">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b dark:border-white/5 sticky top-0 z-50 transition-colors">
                <div className="container mx-auto px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link to="/" className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all text-gray-500 dark:text-gray-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">{currentDoc.label}</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-2xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-500">
                    <div className="bg-red-600 h-2 w-full"></div>
                    <div className="p-8 md:p-16 lg:p-20">
                        <div className="flex items-center gap-5 mb-12 border-b dark:border-white/5 pb-10">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 flex items-center justify-center rounded-2xl">
                                <FileText className="w-8 h-8 text-red-600 dark:text-red-500" />
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{currentDoc.label}</h2>
                        </div>

                        <div
                            className="max-w-none text-black dark:text-white leading-relaxed legal-content"
                            dangerouslySetInnerHTML={{ __html: currentDoc.content || '<p className="text-gray-500 italic">Kein Inhalt hinterlegt.</p>' }}
                        />
                    </div>
                </div>

                {/* Additional Info Box for Legal Pages */}
                <div className="mt-12 bg-gray-100/50 dark:bg-white/[0.02] rounded-2xl p-8 border border-gray-200 dark:border-white/5 transition-all">
                    <div className="flex gap-5 items-start">
                        <div className="p-3 bg-white dark:bg-black/20 rounded-xl shadow-sm">
                            <Scale className="w-6 h-6 text-gray-400 dark:text-gray-600 shrink-0" />
                        </div>
                        <p className="text-sm text-black dark:text-white leading-relaxed font-black uppercase tracking-wider">
                            Diese Informationen stellen keine Rechtsberatung dar. Wir übernehmen keine Gewähr für die Richtigkeit,
                            Vollständigkeit und Aktualität der bereitgestellten Inhalte. Die Nutzung der abrufbaren Inhalte
                            erfolgt auf eigene Gefahr des Nutzers.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .legal-content h1 { font-size: 2.5rem; font-weight: 950; margin-top: 4rem; margin-bottom: 2rem; color: #000; letter-spacing: -0.04em; text-transform: uppercase; border-left: 8px solid #dc2626; padding-left: 1.5rem; line-height: 1; }
                .dark .legal-content h1 { color: #fff; border-left-color: #ef4444; }
                
                .legal-content h2 { font-size: 2rem; font-weight: 900; margin-top: 3.5rem; margin-bottom: 1.5rem; color: #000; letter-spacing: -0.02em; text-transform: uppercase; }
                .dark .legal-content h2 { color: #fff; }

                .legal-content h3 { font-size: 1.5rem; font-weight: 900; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #000; text-transform: uppercase; }
                .dark .legal-content h3 { color: #fff; }
                
                .legal-content p { margin-bottom: 2rem; font-size: 1.35rem; color: inherit; line-height: 1.6; }
                .legal-content ul { list-style-type: disc; padding-left: 3rem; margin-bottom: 2.5rem; }
                .legal-content ol { list-style-type: decimal; padding-left: 3rem; margin-bottom: 2.5rem; }
                .legal-content li { margin-bottom: 1.25rem; font-size: 1.35rem; color: inherit; }
                
                .legal-content strong { font-weight: 950; color: #000; }
                .dark .legal-content strong { color: #fff; }
                
                .legal-content a { color: #dc2626; text-decoration: underline; font-weight: 950; }
                .dark .legal-content a { color: #ff1a1a; }

                .legal-content { font-size: 1.35rem; color: #000; }
                .dark .legal-content { color: #fff; }

                /* Quill Size Support */
                .legal-content .ql-size-small { font-size: 0.8rem; }
                .legal-content .ql-size-large { font-size: 1.75rem; }
                .legal-content .ql-size-huge { font-size: 2.5rem; }
                
                /* Reset heading constraints to allow boldness and size changes */
                .legal-content h1, .legal-content h2, .legal-content h3 { font-family: inherit; }
                .legal-content strong, .legal-content b { font-weight: 900 !important; }
            `}</style>
        </div>
    );
};

export default LegalPage;
