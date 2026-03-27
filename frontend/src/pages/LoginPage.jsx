import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';

import { useStore } from '../context/StoreContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { customer, loading: storeLoading } = useStore();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    // Auto-redirect if already logged in — trust StoreContext's customer state only
    // DO NOT call supabase.auth.getSession() here; it causes IndexedDB lock conflicts
    React.useEffect(() => {
        if (!storeLoading && customer) {
            navigate('/account', { replace: true });
        }
    }, [customer, storeLoading, navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const cleanEmail = formData.email.trim();
            if (isLogin) {
                // LOGIN Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: formData.password,
                });

                if (error) throw error;
                toast.success('Willkommen zurück!');
                // Navigate immediately after successful login — don't wait for the reactive effect
                // as it can cause the page to get stuck if onAuthStateChange is delayed
                navigate('/account', { replace: true });
            } else {
                // REGISTER Logic
                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: formData.password,
                    options: {
                        data: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                        }
                    }
                });

                if (error) throw error;

                // If sign up is successful, create/update the customer record in the public table
                if (data.user) {
                    await supabase.from('customers').upsert({
                        email: formData.email,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                        auth_id: data.user.id
                    }, { onConflict: 'email' });
                }

                toast.success('Konto erstellt! Bitte prüfen Sie Ihre E-Mails.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error('Auth error full object:', error);
            // Translate common Supabase Auth errors
            let errorMsg = error.message;
            if (errorMsg.includes('Email not confirmed')) errorMsg = 'E-Mail wurde noch nicht bestätigt. Bitte prüfen Sie Ihren Posteingang (oder deaktivieren Sie E-Mail-Bestätigung in Supabase).';
            else if (errorMsg.includes('Invalid login credentials')) errorMsg = 'Ungültige Anmeldedaten. Bitte prüfen Sie E-Mail und Passwort.';

            toast.error(errorMsg || 'Authentifizierungsfehler');
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    };

    const mountedRef = React.useRef(true);
    React.useEffect(() => {
        return () => { mountedRef.current = false; };
    }, []);

    if (storeLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center p-4 transition-colors font-sans">
            <Card className="max-w-md w-full shadow-2xl border-0 dark:bg-[#0a0a0a] overflow-hidden">
                <div className="h-2 bg-red-600"></div>
                <CardHeader className="space-y-1 pt-8">
                    <CardTitle className="text-3xl font-black text-center tracking-tighter dark:text-white">
                        {isLogin ? 'ANMELDEN' : 'REGISTRIEREN'}
                    </CardTitle>
                    <CardDescription className="text-center dark:text-gray-400">
                        {isLogin ? 'Greifen Sie auf Ihr Konto zu' : 'Erstellen Sie Ihr persönliches Konto'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Vorname</Label>
                                    <div className="relative">
                                        <Input
                                            id="firstName"
                                            placeholder="Max"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="pl-10 dark:bg-[#111] dark:border-white/10"
                                            required={!isLogin}
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nachname</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Mustermann"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="dark:bg-[#111] dark:border-white/10"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="max@beispiel.de"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 dark:bg-[#111] dark:border-white/10"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Passwort</Label>
                                {isLogin && (
                                    <button type="button" className="text-xs font-bold text-red-600 hover:underline">
                                        Passwort vergessen?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 dark:bg-[#111] dark:border-white/10"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isLogin ? 'JETZT ANMELDEN' : 'KONTO ERSTELLEN'}
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pb-8 border-t border-gray-100 dark:border-white/5 pt-6 bg-gray-50/50 dark:bg-white/5">
                    <p className="text-sm text-gray-500 text-center">
                        {isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-red-600 hover:underline"
                        >
                            {isLogin ? 'Registrieren' : 'Anmelden'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
