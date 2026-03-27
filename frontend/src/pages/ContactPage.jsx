import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useStore } from '../context/StoreContext';

const ContactPage = () => {
    const { shopSettings } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitted(true);
        toast.success('Nachricht erfolgreich gesendet!');
    };

    if (submitted) {
        return (
            <div className="bg-gray-50 dark:bg-[#050505] min-h-screen flex items-center justify-center p-4 transition-colors duration-500">
                <Card className="max-w-md w-full text-center p-12 border-none shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white dark:bg-[#0a0a0a]">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Vielen Dank!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium leading-relaxed">
                        Ihre Nachricht wurde erfolgreich an unser Team übermittelt. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.
                    </p>
                    <Button
                        onClick={() => setSubmitted(false)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white w-full py-7 rounded-sm font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl shadow-red-600/20"
                    >
                        Zurück zum Formular
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen pb-20 transition-colors duration-500">
            {/* Hero Header */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b dark:border-white/5 py-24 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 dark:bg-red-500/5 skew-x-[-20deg] translate-x-32 hidden lg:block" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            <MessageSquare className="w-3 h-3" />
                            Kontaktieren Sie uns
                        </div>
                        <h1 className="text-5xl lg:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter uppercase leading-[0.85]">
                            Wie können wir <span className="text-red-600 underline decoration-red-600/10 dark:decoration-red-500/10 underline-offset-8">helfen?</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
                            Haben Sie Fragen zu Ihrer Bestellung, unseren Produkten veya benötigen Sie technische Hilfe? Unser Team ist für Sie da.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-sm transition-all duration-500">
                        <CardContent className="p-8 lg:p-14">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                                <span className="w-10 h-10 bg-red-600 flex items-center justify-center rounded-lg shadow-lg shadow-red-600/20">
                                    <Send className="w-5 h-5 text-white" />
                                </span>
                                Nachricht schreiben
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Name *</label>
                                        <Input required placeholder="Ihr Name" className="h-16 rounded-sm border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 focus:bg-white dark:focus:bg-black focus:border-red-600 dark:focus:border-red-500 transition-all font-bold text-gray-900 dark:text-white" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">E-Mail Adresse *</label>
                                        <Input required type="email" placeholder="beispiel@mail.de" className="h-16 rounded-sm border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 focus:bg-white dark:focus:bg-black focus:border-red-600 dark:focus:border-red-500 transition-all font-bold text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Betreff *</label>
                                    <Input required placeholder="Worum geht es?" className="h-16 rounded-sm border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 focus:bg-white dark:focus:bg-black focus:border-red-600 dark:focus:border-red-500 transition-all font-bold text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Nachricht *</label>
                                    <Textarea required placeholder="Wie können wir Ihnen helfen?" className="min-h-[200px] rounded-sm border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40 focus:bg-white dark:focus:bg-black focus:border-red-600 dark:focus:border-red-500 transition-all py-6 font-bold text-gray-900 dark:text-white" />
                                </div>
                                <Button
                                    disabled={isSubmitting}
                                    className="w-full lg:w-fit bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white px-12 py-5 h-auto text-xs font-black uppercase tracking-[0.2em] rounded-sm transition-all active:scale-95 shadow-xl shadow-red-600/20"
                                >
                                    {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0a] rounded-sm overflow-hidden group hover:border-red-600/30 dark:hover:border-red-500/30 border border-transparent transition-all duration-300">
                            <CardContent className="p-10">
                                <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg flex items-center justify-center mb-8 group-hover:bg-red-600 dark:group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-2">E-Mail Support</h3>
                                <p className="text-xl font-black text-gray-900 dark:text-white break-all tracking-tight leading-none mb-2">{shopSettings?.supportEmail || 'elif_rad@aol.com'}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Antwort innerhalb von 24h.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0a] rounded-sm overflow-hidden group hover:border-blue-600/30 dark:hover:border-blue-500/30 border border-transparent transition-all duration-300">
                            <CardContent className="p-10">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-lg flex items-center justify-center mb-8 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-2">Telefon</h3>
                                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">0176 202 78 374</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Mo - Sa: 09:00 - 18:00 Uhr</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] bg-gray-900 dark:bg-white/5 text-white rounded-sm overflow-hidden group transition-all duration-300">
                            <CardContent className="p-10">
                                <div className="w-14 h-14 bg-gray-800 dark:bg-black/40 text-red-500 rounded-lg flex items-center justify-center mb-8 shadow-inner">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Zentrale</h3>
                                <div className="space-y-1">
                                    <p className="text-xl font-black tracking-tight leading-none mb-2">{shopSettings?.companyName || 'Elif Rad'}</p>
                                    <p className="text-sm font-medium text-gray-400">{shopSettings?.companyStreet || 'Alter Kirchplatz 5'}</p>
                                    <p className="text-sm font-medium text-gray-400">{shopSettings?.companyZip || '48653'} {shopSettings?.companyCity || 'Coesfeld'}</p>
                                    <p className="text-[10px] font-black text-red-600/80 uppercase tracking-widest mt-4">Deutschland</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
