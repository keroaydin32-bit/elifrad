import React from 'react';
import { Truck, ShieldCheck, Clock, Globe, Package, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useStore } from '../context/StoreContext';

const ShippingPage = () => {
    const { shippingRates } = useStore();
    const activeRates = (shippingRates || []).filter(r => r.is_active);

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen pb-24 transition-colors duration-500">
            {/* Hero Header */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b dark:border-white/5 py-24 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 dark:bg-red-500/5 skew-x-[-20deg] translate-x-32 hidden lg:block" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-2xl mb-8 shadow-xl shadow-red-600/5 scale-110">
                        <Truck className="w-10 h-10 text-red-600 dark:text-red-500" />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter uppercase leading-none">
                        Versand<span className="text-red-600">informationen</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg lg:text-xl font-medium leading-relaxed">
                        Hier finden Sie alle Informationen zu unseren Versandkosten, Lieferzeiten und Logistikpartnern für einen transparenten Einkauf.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                    {/* Shipping Rates */}
                    <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-sm transition-all duration-500">
                        <div className="bg-red-600 p-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                <Globe className="w-6 h-6 opacity-30" />
                                Versandkosten & Gebiete
                            </h2>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-black/40 border-b border-gray-100 dark:border-white/5">
                                            <th className="p-6 font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">Land / Region</th>
                                            <th className="p-6 font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">Kosten</th>
                                            <th className="p-6 font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">Gratis ab</th>
                                            <th className="p-6 font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">Lieferzeit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-sm">
                                        {activeRates.length > 0 ? (
                                            activeRates.map((rate, index) => (
                                                <tr key={rate.id || index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors whitespace-nowrap">
                                                    <td className="p-6 font-black text-gray-900 dark:text-white uppercase tracking-tight">{rate.country_name}</td>
                                                    <td className="p-6 font-bold text-gray-600 dark:text-gray-400">{Number(rate.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                                                    <td className="p-6">
                                                        {rate.free_shipping_threshold ? (
                                                            <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                                Ab {Number(rate.free_shipping_threshold).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-700 font-bold">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-6 text-gray-500 dark:text-gray-500 font-bold uppercase text-[11px] tracking-wider">{rate.delivery_time || 'Auf Anfrage'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest text-xs">
                                                    Keine Versandinformationen verfügbar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0a] rounded-sm transition-all duration-500">
                            <CardContent className="p-10">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                    <ShieldCheck className="w-5 h-5 text-red-600" />
                                    Sicherer Versand
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                                    Alle Bestellungen werden versichert und mit Sendungsverfolgung verschickt. Sie erhalten Ihre Tracking-Nummer per E-Mail.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                                        DHL & UPS Logistikpartner
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                                        Klimaneutraler Versand
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                                        Sorgfältige Verpackung
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-gray-900 dark:bg-white/5 text-white rounded-sm overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                            <CardContent className="p-10 text-center">
                                <div className="w-16 h-16 bg-gray-800 dark:bg-black/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Package className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Retouren</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-6">
                                    14-tägiges Rückgaberecht.
                                </p>
                                <button className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors">
                                    <span>Rücksendung einleiten</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mt-24">
                    <div className="space-y-4 group">
                        <div className="w-14 h-14 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500">
                            <Clock className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg underline decoration-red-600/20 underline-offset-4">Schnelle Abwicklung</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-medium leading-relaxed">Bestellungen bis 14:00 Uhr verlassen meist noch am selben Tag unser Lager.</p>
                    </div>
                    <div className="space-y-4 group">
                        <div className="w-14 h-14 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500">
                            <Check className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg underline decoration-red-600/20 underline-offset-4">Zustellung</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-medium leading-relaxed">Zustellung erfolgt von Montag bis Samstag (außer an Feiertagen).</p>
                    </div>
                    <div className="space-y-4 group">
                        <div className="w-14 h-14 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500">
                            <Globe className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg underline decoration-red-600/20 underline-offset-4">Länderliste</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-medium leading-relaxed">Wir liefern aktuell nach Deutschland, Österreich, Schweiz ve in die gesamte EU.</p>
                    </div>
                    <div className="space-y-4 group">
                        <div className="w-14 h-14 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500">
                            <Package className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg underline decoration-red-600/20 underline-offset-4">Packstationen</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-medium leading-relaxed">Gerne liefern wir Ihre Bestellung auch an eine DHL Packstation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
