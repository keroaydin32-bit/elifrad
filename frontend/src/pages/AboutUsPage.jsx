import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, Info, Scale, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';

const AboutUsPage = () => {
    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen pb-24 transition-colors duration-500">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b dark:border-white/5 sticky top-0 z-10 transition-colors">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Impressum / Über Uns</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 gap-8 sm:gap-12">

                    {/* Main Company Card */}
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden transition-all">
                        <div className="bg-red-600 h-2 w-full"></div>
                        <div className="p-8 md:p-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-12 border-b dark:border-white/10 pb-8">
                                Impressum
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                                {/* Registered Info */}
                                <div className="space-y-12">
                                    <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                                        <h3 className="flex items-center gap-2 text-red-600 dark:text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                            <Building2 className="w-4 h-4" />
                                            Anbieter
                                        </h3>
                                        <div className="text-gray-800 dark:text-gray-200 space-y-2">
                                            <p className="text-3xl font-black tracking-tight dark:text-white leading-none mb-1">Elif Rad</p>
                                            <p className="font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-widest">Groß- und Einzelhandel</p>
                                            <div className="h-px bg-gray-100 dark:bg-white/5 w-12 my-4"></div>
                                            <p className="font-medium text-gray-600 dark:text-gray-400">Inh. Kerem Aydin</p>
                                        </div>
                                    </section>

                                    <section className="animate-in fade-in slide-in-from-left-4 duration-700">
                                        <h3 className="flex items-center gap-2 text-red-600 dark:text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                            <MapPin className="w-4 h-4" />
                                            Anschrift
                                        </h3>
                                        <div className="text-gray-800 dark:text-gray-300 space-y-1 text-sm font-medium leading-relaxed">
                                            <p>Alter Kirchplatz 5</p>
                                            <p>48653 Coesfeld</p>
                                            <p className="text-gray-400 dark:text-gray-500 italic">Deutschland</p>
                                        </div>
                                    </section>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-12">
                                    <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <h3 className="flex items-center gap-2 text-red-600 dark:text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                            <Phone className="w-4 h-4" />
                                            Kontakt
                                        </h3>
                                        <div className="text-gray-800 dark:text-gray-200 space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Telefon</span>
                                                <a href="tel:+4917620278374" className="text-lg font-bold hover:text-red-600 dark:hover:text-red-500 transition-colors">0176 202 78 374</a>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">E-Mail</span>
                                                <a href="mailto:elif_rad@aol.com" className="text-lg font-bold hover:text-red-600 dark:hover:text-red-500 transition-colors break-all">elif_rad@aol.com</a>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="animate-in fade-in slide-in-from-right-4 duration-700">
                                        <h3 className="flex items-center gap-2 text-red-600 dark:text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                                            <ShieldCheck className="w-4 h-4" />
                                            Steuernummer
                                        </h3>
                                        <div className="text-gray-800 dark:text-gray-200">
                                            <p className="font-medium text-[11px] text-gray-500 dark:text-gray-500 mb-2 leading-tight max-w-[280px]">Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
                                            <p className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white inline-block border-b-4 border-red-600/20 dark:border-red-500/20 pb-1">DE 281728939</p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legal Information Section */}
                    <div className="bg-gray-100/50 dark:bg-white/5 rounded-lg p-8 md:p-12 border border-gray-200 dark:border-white/5 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <Scale className="w-12 h-12 text-gray-300 dark:text-gray-700 shrink-0" />
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Informationen zur Online-Streitbeilegung</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    Die EU-Kommission stellt eine Internetplattform zur Online-Beilegung von Streitigkeiten (sog. „OS-Plattform“) bereit. Die OS-Plattform soll als Anlaufstelle zur außergerichtlichen Beilegung von Streitigkeiten betreffend vertragliche Verpflichtungen, die aus Online-Kaufverträgen erwachsen, dienen.
                                </p>
                                <div className="pt-2">
                                    <a
                                        href="http://ec.europa.eu/consumers/odr/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2 text-red-600 dark:text-red-500 font-black text-xs uppercase tracking-widest hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                    >
                                        <span>ZUR OS-PLATTFORM</span>
                                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
