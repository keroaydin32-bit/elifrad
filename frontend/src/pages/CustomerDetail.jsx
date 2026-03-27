import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Package,
    Heart,
    Star,
    Clock,
    Calendar,
    Building2,
    Search,
    ChevronRight,
    User
} from 'lucide-react';
import { supabase } from '../supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            setLoading(true);
            try {
                // Fetch basic customer info
                const { data: custData, error: custError } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (custError) throw custError;
                setCustomer(custData);

                // Fetch orders
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('customer_email', custData.email) // Assuming email link for now
                    .order('created_at', { ascending: false });
                if (orderError) throw orderError;
                setOrders(orderData || []);

                // Fetch favorites
                const { data: favData, error: favError } = await supabase
                    .from('favorites')
                    .select('*, products(*)')
                    .eq('customer_id', id);
                if (favError) throw favError;
                setFavorites(favData || []);

                // Fetch reviews
                const { data: revData, error: revError } = await supabase
                    .from('reviews')
                    .select('*, products(*)')
                    .eq('customer_id', id);
                if (revError) throw revError;
                setReviews(revData || []);

            } catch (error) {
                console.error('Error fetching customer details:', error);
                toast.error('Kunden-Details konnten nicht geladen werden.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCustomerData();
    }, [id]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    if (!customer) return (
        <div className="p-8 text-center bg-gray-50 h-screen">
            <h2 className="text-xl font-bold">Kunde nicht gefunden</h2>
            <Button onClick={() => navigate('/admin?tab=Kunden')} className="mt-4">Zurück zur Liste</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin?tab=Kunden')} className="hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-xs text-gray-500 font-mono">#{customer.customer_number}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Aktion wählen</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">Profil bearbeiten</Button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Top Grid: Profile & Contact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Profile Card */}
                    <Card className="lg:col-span-1 border-0 shadow-sm overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-red-600 to-red-800"></div>
                        <CardContent className="px-6 -mt-12">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 bg-white rounded-lg shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                                <Badge className="absolute bottom-1 left-20 bg-green-500 border-2 border-white">Online</Badge>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{customer.customer_group}</p>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{customer.phone || '---'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="text-gray-700">
                                        <p>{customer.address_street || '---'}</p>
                                        <p>{customer.address_zip} {customer.address_city}</p>
                                        <p className="text-xs uppercase font-bold text-gray-400 mt-1">{customer.address_country}</p>
                                    </div>
                                </div>
                                {customer.company && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700 font-medium">{customer.company}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Quick Stats & Notes */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="text-lg font-bold">{orders.length}</div>
                                    <div className="text-xs text-gray-500">Bestellungen</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-2">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div className="text-lg font-bold">{favorites.length}</div>
                                    <div className="text-xs text-gray-500">Favoriten</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-2">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <div className="text-lg font-bold">{reviews.length}</div>
                                    <div className="text-xs text-gray-500">Bewertungen</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-2">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div className="text-lg font-bold">12m</div>
                                    <div className="text-xs text-gray-500">Sitzungsdauer</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-50">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    Interne Notizen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800 italic">
                                    {customer.notes || 'Keine internen Notizen vorhanden.'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Tabs Section */}
                <Card className="border-0 shadow-sm">
                    <div className="border-b border-gray-100 p-1">
                        <div className="flex">
                            <button className="px-6 py-4 text-sm font-medium border-b-2 border-red-600 text-red-600">Bestellungen</button>
                            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Favoriten</button>
                            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Bewertungen</button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {/* Orders List */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Datum</th>
                                        <th className="px-6 py-4">Summe</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Bisher keine Bestellungen vorhanden.</td></tr>
                                    ) : orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('de-DE')}</td>
                                            <td className="px-6 py-4 font-bold">{Number(order.total_amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={
                                                    order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        order.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-gray-50 text-gray-600'
                                                }>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">Details</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info: Favorites & Reviews Previews (Quick View) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Favorites Preview */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                Favoriten ({favorites.length})
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500">Alle sehen</Button>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                {favorites.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">Keine Favoriten vorhanden.</p>
                                ) : favorites.slice(0, 3).map((fav) => (
                                    <div key={fav.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                                            <img src={fav.products?.image || 'https://via.placeholder.com/40'} alt={fav.products?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-bold text-gray-900 truncate">{fav.products?.name}</p>
                                            <p className="text-xs text-gray-500">{Number(fav.products?.price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews Preview */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                Bewertungen ({reviews.length})
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500">Alle sehen</Button>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">Keine Bewertungen vorhanden.</p>
                                ) : reviews.slice(0, 3).map((rev) => (
                                    <div key={rev.id} className="space-y-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">{new Date(rev.created_at).toLocaleDateString('de-DE')}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 truncate">Produkt: {rev.products?.name}</p>
                                        <p className="text-xs text-gray-600 line-clamp-2 italic">"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CustomerDetail;
