import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Mail,
    MapPin,
    Printer,
    ChevronRight,
    User,
    CreditCard,
    Calendar,
    Euro,
    FileText,
    Hash,
    Loader2,
    Download,
    Phone,
    Building2,
    Info,
    MoreVertical
} from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { toast } from 'sonner';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusEdit, setStatusEdit] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusMap = {
        'pending': 'Wartend',
        'shipped': 'Versandt',
        'completed': 'Abgeschlossen',
        'storniert': 'Storniert',
        'bestatigung': 'Bestätigung'
    };

    const formatCurrency = (val) => Number(val).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;
                setOrder(orderData);
                setStatusEdit(orderData.status);

                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*, products(*)')
                    .eq('order_id', id);

                if (itemsError) throw itemsError;
                setItems(itemsData || []);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error('Bestellungsdetails konnten nicht geladen werden.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const updateOrderStatus = async (newStatus) => {
        setIsSubmitting(true);
        try {
            const { data: updatedRows, error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id)
                .select();

            if (error) throw error;

            toast.success('Bestellstatus aktualisiert.');
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Aktualisierung fehlgeschlagen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center bg-gray-50 min-h-screen">
                <h2 className="text-2xl font-bold text-gray-900">Bestellung nicht gefunden</h2>
                <Button onClick={() => navigate('/admin/Bestellungen')} className="mt-4">Zurück zur Liste</Button>
            </div>
        );
    }

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shipping = Math.max(0, Number(order.total_amount) - subtotal);
    const vatRate = 0.19;
    const netTotal = Number(order.total_amount) / (1 + vatRate);
    const vatAmount = Number(order.total_amount) - netTotal;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/Bestellungen')} className="hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Bestellung #{order.id.slice(0, 8).toUpperCase()}
                            <Badge className={`
                                ${order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                    order.status === 'pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' :
                                            order.status === 'bestatigung' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                'bg-gray-100 text-gray-700 hover:bg-gray-100'} border-0 uppercase text-[10px] tracking-wider font-bold`}>
                                {statusMap[order.status] || order.status}
                            </Badge>
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">
                            Erstellt am {new Date(order.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <Select value={statusEdit} onValueChange={(val) => setStatusEdit(val)}>
                            <SelectTrigger className="h-8 w-32 border-0 bg-transparent text-xs font-medium focus:ring-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Wartend</SelectItem>
                                <SelectItem value="bestatigung">Bestätigung</SelectItem>
                                <SelectItem value="shipped">Versandt</SelectItem>
                                <SelectItem value="completed">Abgeschlossen</SelectItem>
                                <SelectItem value="storniert">Storniert</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            onClick={() => updateOrderStatus(statusEdit)}
                            disabled={isSubmitting || statusEdit === order.status}
                            className="h-8 text-xs bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
                        >
                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden md:flex gap-2 h-9 text-xs font-medium">
                        <Printer className="w-4 h-4" />
                        Drucken
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 h-9 text-xs font-medium gap-2 hidden md:flex">
                        <Download className="w-4 h-4" />
                        Rechnung (PDF)
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content: Order Details & Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary Card */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    Bestellübersicht
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-gray-500 font-medium text-xs uppercase border-b border-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 w-16 text-center">#</th>
                                                <th className="px-6 py-4">Artikel</th>
                                                <th className="px-6 py-4 text-center">Menge</th>
                                                <th className="px-6 py-4 text-right">Einzelpreis</th>
                                                <th className="px-6 py-4 text-right">Gesamt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {items.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4 text-center text-gray-400 text-xs">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                                <img
                                                                    src={item.products?.image || 'https://via.placeholder.com/40'}
                                                                    alt={item.products?.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{item.products?.name}</p>
                                                                <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.products?.sku || '---'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-right tabular-nums text-gray-600">{formatCurrency(item.price)} €</td>
                                                    <td className="px-6 py-4 text-right tabular-nums font-bold text-gray-900">{formatCurrency(Number(item.price) * item.quantity)} €</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50/30 p-6 border-t border-gray-100">
                                    <div className="flex flex-col items-end gap-2 text-sm">
                                        <div className="flex justify-between w-full md:w-64 text-gray-500">
                                            <span>Zwischensumme</span>
                                            <span>{formatCurrency(subtotal)} €</span>
                                        </div>
                                        <div className="flex justify-between w-full md:w-64 text-gray-500">
                                            <span>Versandkosten</span>
                                            <span>{formatCurrency(shipping)} €</span>
                                        </div>
                                        <div className="flex justify-between w-full md:w-64 text-gray-500">
                                            <span>MwSt. (19%)</span>
                                            <span>{formatCurrency(vatAmount)} €</span>
                                        </div>
                                        <div className="w-full md:w-64 h-px bg-gray-200 my-1"></div>
                                        <div className="flex justify-between w-full md:w-64 text-base font-black text-gray-900">
                                            <span>Gesamtsumme</span>
                                            <span className="text-red-600">{formatCurrency(order.total_amount)} €</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment & Shipping Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                        Zahlungsinformationen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Methode</span>
                                            <span className="font-medium capitalize">{order.payment_method === 'paypal' ? 'PayPal' : order.payment_method || 'Vorkasse'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Status</span>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">Bezahlt</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Transaktions-ID</span>
                                            <span className="font-mono text-xs">{order.id.slice(0, 12)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-gray-400" />
                                        Versandinformationen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Dienstleister</span>
                                            <span className="font-medium uppercase">{order.shipping_carrier || 'DHL'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Sendungsnummer</span>
                                            {order.tracking_number ? (
                                                <span className="font-mono text-xs text-blue-600 hover:underline cursor-pointer">{order.tracking_number}</span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Nicht verfügbar</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Versandart</span>
                                            <span className="font-medium">Standard Versand</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar: Customer Info */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm sticky top-24">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-400" />
                                        Kunde
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        Profil anzeigen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Header with Avatar */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : 'G'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.customer_name}</p>
                                        <p className="text-xs text-gray-500">Kunde seit 2024</p>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="text-sm">
                                            <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-0.5">E-Mail</span>
                                            <a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline break-all">{order.customer_email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="text-sm">
                                            <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-0.5">Telefon</span>
                                            <span className="text-gray-900">{order.phone || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="text-sm">
                                            <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Lieferadresse</span>
                                            <div className="text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="font-bold">{order.customer_name}</p>
                                                <p>{order.street}</p>
                                                <p>{order.zip} {order.city}</p>
                                                <p>{order.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="text-sm">
                                            <span className="block text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Rechnungsadresse</span>
                                            <div className="text-gray-500 text-xs italic">
                                                Identisch mit Lieferadresse
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button variant="outline" className="w-full text-xs" onClick={() => toast.info('Nachricht an Kunden senden...')}>
                                        <Mail className="w-3 h-3 mr-2" />
                                        E-Mail senden
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default OrderDetailPage;
