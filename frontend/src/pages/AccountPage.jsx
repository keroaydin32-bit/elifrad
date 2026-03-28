import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/productSlug';
import { supabase } from '../supabase';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Star,
  Clock,
  Building2,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Edit2,
  Save,
  X,
  Info,
  Printer,
  Scroll,
  Truck,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from 'sonner';

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites: globalFavorites, toggleFavorite, customer, setCustomer, logout, loading: storeLoading, shopSettings } = useStore();

  // Local state with cache-first initialization
  const [orders, setOrders] = useState(() => {
    if (!customer?.email) return [];
    try {
      const saved = localStorage.getItem(`cached_orders_${customer.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [reviews, setReviews] = useState(() => {
    if (!customer?.email) return [];
    try {
      const saved = localStorage.getItem(`cached_reviews_${customer.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // 'loading' is only for background sync if we have no data.
  // If we have cached data, we don't show the full page loader.
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Bestellungen');

  const statusMap = {
    'pending': 'Wartend',
    'shipped': 'Versandt',
    'completed': 'Abgeschlossen',
    'storniert': 'Storniert'
  };

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Invoice States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  // Helper for invoice
  const formatCurrency = (val) => Number(val).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fetchUserData = useCallback(async () => {
    if (!customer?.email) return;

    // Only show full loader if we have NO cached data at all
    const hasCache = orders.length > 0 || reviews.length > 0;
    if (!hasCache) setLoading(true);

    try {
      setEditFormData(customer);

      const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';

      const fetchDirect = async (path) => {
        const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
        return response.json();
      };

      // Fetch Orders and Reviews in parallel
      const [orderData, reviewData] = await Promise.all([
        fetchDirect(`orders?customer_email=eq.${encodeURIComponent(customer.email)}&order=created_at.desc`),
        (async () => {
          const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
          const targetId = isUUID(customer.auth_id) ? customer.auth_id : (isUUID(customer.id) ? customer.id : null);
          if (!targetId) return [];
          return fetchDirect(`reviews?customer_id=eq.${targetId}&select=*,products(*)&order=created_at.desc`);
        })()
      ]);

      if (orderData) {
        setOrders(orderData);
        localStorage.setItem(`cached_orders_${customer.email}`, JSON.stringify(orderData));
      }

      if (reviewData) {
        setReviews(reviewData);
        localStorage.setItem(`cached_reviews_${customer.email}`, JSON.stringify(reviewData));
      }

    } catch (error) {
      console.error('Account data sync error:', error);
      toast.error('Kontodaten konnten nicht synchronisiert werden.');
    } finally {
      setLoading(false);
    }
  }, [customer, orders.length, reviews.length]);

  useEffect(() => {
    // DO NOT call supabase.auth.getSession() here — it conflicts with StoreContext's
    // onAuthStateChange listener and causes 'Lock broken by steal' IndexedDB errors.
    // Instead, rely entirely on StoreContext to manage auth state.
    if (storeLoading) return; // Wait until context finishes loading

    if (!customer) {
      // Context loaded but no customer — not logged in
      navigate('/login', { replace: true });
      return;
    }

    // Customer exists — fetch their data
    fetchUserData();
  }, [customer, storeLoading, navigate, fetchUserData]);

  // Handle Tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const isLoggingOut = React.useRef(false);

  const handleLogout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    // Navigate first to avoid conflict with the useEffect redirect that fires when customer becomes null
    navigate('/', { replace: true });
    await supabase.auth.signOut();
    toast.info('Erfolgreich abgemeldet');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update the unified 'name' field as well for backward compatibility
      const fullName = `${editFormData.first_name || ''} ${editFormData.last_name || ''}`.trim();

      // Use email as conflict target as it's more likely to be uniquely indexed
      const { error: upsertError } = await supabase
        .from('customers')
        .upsert({
          auth_id: customer.auth_id,
          email: editFormData.email,
          name: fullName,
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          gender: editFormData.gender,
          phone: editFormData.phone,
          company: editFormData.company,
          vat_id: editFormData.vat_id,
          address_street: editFormData.address_street,
          address_city: editFormData.address_city,
          address_zip: editFormData.address_zip,
          address_country: editFormData.address_country,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' }); // Email is the most reliable unique field

      if (upsertError) throw upsertError;

      setCustomer({ ...customer, ...editFormData, name: fullName });
      setIsEditModalOpen(false);
      toast.success('Profil erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Aktualisierung fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewInvoice = async (order) => {
    setSelectedOrder(order);
    setIsItemsLoading(true);
    try {
      const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';

      const response = await fetch(`${baseUrl}/rest/v1/order_items?order_id=eq.${order.id}&select=*,products(*)`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Items fetch failed');
      const data = await response.json();
      setOrderItems(data || []);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Rechnung konnte nicht geladen werden.');
    } finally {
      setIsItemsLoading(false);
    }
  };
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Möchten Sie diese Bewertung wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Bewertung wurde gelöscht.');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Löschen fehlgeschlagen.');
    }
  };

  const handlePrintInvoice = () => {
    const printContent = document.querySelector('.invoice-content');
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      printWindow.document.write('<html><head><title>Rechnung Drucken</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // Use Tailwind for print styles
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderInvoiceDialog = () => {
    if (!selectedOrder) return null;

    const invoiceNumber = selectedOrder.invoice_number ? `RE-${selectedOrder.invoice_number}` : `RE-${selectedOrder.id.slice(0, 8).toUpperCase()}`;
    const totalAmount = Number(selectedOrder.total_amount);
    const subtotalWithVat = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shipping = Math.max(0, totalAmount - subtotalWithVat);

    // MwSt Berechnung (19% inkludiert)
    const vatRate = 0.19;
    const netTotal = totalAmount / (1 + vatRate);
    const vatAmount = totalAmount - netTotal;

    // Check if invoice is effectively cancelled
    const isCancelled = selectedOrder.status === 'storniert' || selectedOrder.status === 'cancelled';

    return (
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-lg border-none shadow-2xl dark:bg-[#0a0a0a]">
          <DialogHeader className="p-6 bg-gray-50/50 dark:bg-white/5 border-b dark:border-white/10 flex-row items-center justify-between space-y-0 text-left">
            <div>
              <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-red-600" />
                Rechnungsdetails
              </DialogTitle>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{invoiceNumber} • {new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handlePrintInvoice} className="h-8 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider gap-2">
                <Printer className="w-3.5 h-3.5" />
                Drucken (PDF)
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-zinc-100/50 p-8 invoice-content">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 max-w-[600px] mx-auto min-h-[850px] relative overflow-hidden">
              {isCancelled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="border-[8px] border-red-500/30 text-red-500/30 text-[80px] font-black transform -rotate-[35deg] px-8 py-4 rounded-lg uppercase tracking-[10px]">
                    Storniert
                  </div>
                </div>
              )}

              <div className="flex justify-between mb-12">
                <div>
                  {shopSettings?.logoUrl ? (
                    <img src={shopSettings.logoUrl} alt="Logo" className="max-h-12 object-contain" />
                  ) : (
                    <div className="text-2xl font-black text-red-600 tracking-tighter">{shopSettings?.shopName || 'ELECTRIVE'}</div>
                  )}
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-gray-900 leading-none mb-2">RECHNUNG</h2>
                  <p className="text-sm font-bold text-gray-500">{invoiceNumber}</p>
                  <p className="text-sm text-gray-400">{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Empfänger</span>
                  <p className="font-bold text-gray-900 text-base">{customer.first_name ? `${customer.first_name} ${customer.last_name}` : customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.address_street || '---'}</p>
                  <p className="text-sm text-gray-600 font-medium">{customer.address_zip} {customer.address_city}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{customer.address_country || 'Deutschland'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Zahlungsinfo</span>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.payment_method === 'paypal' ? 'PayPal' : (selectedOrder.payment_method || 'Überweisung / Vorkasse').toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Bestell-ID: #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>

                  {selectedOrder.tracking_number && (
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Versandinfo</span>
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.shipping_carrier?.toUpperCase() || 'DHL'}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Tracking: {selectedOrder.tracking_number}</p>
                    </div>
                  )}
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-900/5">
                    <th className="text-left py-3 text-[10px] font-black uppercase text-gray-400">Position</th>
                    <th className="text-center py-3 text-[10px] font-black uppercase text-gray-400">Menge</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase text-gray-400">Einzel</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase text-gray-400">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-4 text-sm font-bold text-gray-900 text-left">
                        <span className="text-xs text-gray-400 mr-2">{idx + 1}</span>
                        {item.products?.name}
                      </td>
                      <td className="text-center py-4 text-sm text-gray-500 font-medium">{item.quantity}</td>
                      <td className="text-right py-4 text-sm text-gray-500 font-mono">{formatCurrency(item.price)} €</td>
                      <td className="text-right py-4 text-sm font-black text-gray-900 font-mono">{formatCurrency(Number(item.price) * item.quantity)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Zwischensumme (Netto):</span>
                    <span className="font-mono">{formatCurrency(netTotal - (shipping / (1 + vatRate)))} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Versand (Netto):</span>
                    <span className="font-mono">{formatCurrency(shipping / (1 + vatRate))} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>zzgl. 19% MwSt.:</span>
                    <span className="font-mono">{formatCurrency(vatAmount)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 pt-4 border-t-2 border-gray-900/5">
                    <span>Gesamt (Brutto):</span>
                    <span className="font-mono text-red-600">{formatCurrency(totalAmount)} €</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed text-left">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Anmerkungen</span>
                <p className="text-xs text-gray-600 leading-relaxed italic pr-12">Vielen Dank für Ihren Einkauf bei ELECTRIVE.</p>
              </div>

              <div className="absolute bottom-8 left-10 right-10 grid grid-cols-2 border-t pt-4 opacity-40 text-[8px] font-bold text-gray-400">
                <div className="text-left space-y-0.5">
                  <p className="text-gray-900 font-black">{shopSettings?.companyName || shopSettings?.shopName || 'ELECTRIVE GmbH'}</p>
                  <p>{shopSettings?.companyStreet || 'Musterweg 12'}, {shopSettings?.companyZip || '72574'} {shopSettings?.companyCity || 'Bad Urach'}</p>
                  <p>Inhaber: {shopSettings?.owner || 'K. Aydin'}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p>USt-IdNr.: {shopSettings?.vatId || 'DE 123 456 789'}</p>
                  <p>Bank: {shopSettings?.bankName || 'Sparkasse'}</p>
                  <p>IBAN: {shopSettings?.iban || '---'}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ONLY block the whole page if we have NO customer data at all while store is loading
  if (storeLoading && !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Lade Kontodaten...</p>
        </div>
      </div>
    );
  }

  // If we're not logged in, wait for StoreContext to officially say so
  if (!storeLoading && !customer) {
    return null; // The useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 px-4 flex items-center gap-4 transition-colors">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-gray-100 dark:hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white lowercase first-letter:uppercase">Mein Konto</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium lowercase first-letter:uppercase">Willkommen zurück, {customer.first_name || customer.name}</p>
        </div>
        <div className="flex gap-2 text-slate-900 dark:text-white">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2" onClick={() => setActiveTab('Settings')}>
            <Settings className="w-4 h-4" />
            Einstellungen
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-gray-500 hover:text-red-600 flex gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Abmelden</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-screen-2xl mx-auto w-full space-y-8">
        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Profile Card */}
          <Card className="lg:col-span-1 border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-red-600 to-red-800"></div>
            <CardContent className="px-6 -mt-12">
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-white dark:bg-[#111] rounded-lg shadow-lg border-4 border-white dark:border-[#0a0a0a] overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <User className="w-12 h-12" />
                  </div>
                </div>
                <Badge className="absolute bottom-1 left-20 bg-green-500 border-2 border-white dark:border-[#0a0a0a]">Aktiv</Badge>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {customer.gender && <span className="text-gray-400 text-sm font-normal mr-1">{customer.gender === 'Herr' ? 'Hr.' : 'Fr.'}</span>}
                {customer.first_name ? `${customer.first_name} ${customer.last_name}` : customer.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{customer.customer_group || 'Privatkunde'}</p>

              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{customer.phone || '---'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="text-gray-700 dark:text-gray-300">
                    <p>{customer.address_street || '---'}</p>
                    <p>{customer.address_zip} {customer.address_city}</p>
                    <p className="text-xs uppercase font-bold text-gray-400 mt-1">{customer.address_country || 'Deutschland'}</p>
                  </div>
                </div>
                {customer.vat_id && (
                  <div className="flex items-center gap-3 text-sm">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Vergi No: {customer.vat_id}</span>
                  </div>
                )}
              </div>

              <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 dark:bg-white/10 dark:text-white dark:hover:bg-red-500 rounded-lg flex gap-2" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="w-4 h-4" />
                Profil bearbeiten
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-lg flex items-center justify-center mb-2">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold dark:text-white">{orders.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bestellungen</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-lg flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold dark:text-white">{globalFavorites.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Favoriten</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg flex items-center justify-center mb-2">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold dark:text-white">{reviews.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bewertungen</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-lg flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold dark:text-white">12m</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aktiv</div>
                </CardContent>
              </Card>
            </div>

            {/* Order History */}
            <Card className="border-0 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] dark:bg-[#0a0a0a] rounded-lg overflow-hidden">
              <div className="border-b border-gray-100 dark:border-white/10 p-1 flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('Bestellungen')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'Bestellungen' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Meine Bestellungen
                </button>
                <button
                  onClick={() => setActiveTab('Favoriten')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'Favoriten' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Wunschliste
                </button>
                <button
                  onClick={() => setActiveTab('Bewertungen')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'Bewertungen' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Meine Bewertungen
                </button>
              </div>
              <CardContent className="p-0">
                {activeTab === 'Bestellungen' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Datum</th>
                          <th className="px-6 py-4">Summe</th>
                          <th className="px-6 py-4">Versand</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                              {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Bestellungen werden geladen...</span>
                                </div>
                              ) : 'Sie haben noch keine Bestellungen getätigt.'}
                            </td>
                          </tr>
                        ) : orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white">
                            <td className="px-6 py-4 font-mono font-medium">{order.invoice_number ? `RE-${order.invoice_number}` : `#${order.id.slice(0, 8)}`}</td>
                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('de-DE')}</td>
                            <td className="px-6 py-4 font-bold whitespace-nowrap">{formatCurrency(order.total_amount)} €</td>
                            <td className="px-6 py-4">
                              {order.tracking_number ? (
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold uppercase text-gray-400">{order.shipping_carrier || 'DHL'}</span>
                                  <div className="flex items-center gap-1 text-xs font-mono text-blue-600 dark:text-blue-400">
                                    <Truck className="w-3 h-3" />
                                    {order.tracking_number}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Noch nicht versandt</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={
                                order.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 border-green-100 dark:border-green-500/20' :
                                  order.status === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 border-blue-100 dark:border-blue-500/20' :
                                    'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 dark:border-white/10'
                              }>
                                {statusMap[order.status] || order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 flex items-center gap-1"
                                onClick={() => handleViewInvoice(order)}
                              >
                                {isItemsLoading && selectedOrder?.id === order.id ? (
                                  <div className="w-3 h-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></div>
                                ) : (
                                  <Scroll className="w-3 h-3" />
                                )}
                                Rechnung
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'Favoriten' && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {globalFavorites.length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-gray-400">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Favoriten werden geladen...</span>
                          </div>
                        ) : 'Keine Produkte auf Ihrer Wunschliste.'}
                      </div>
                    ) : globalFavorites.map((fav) => (
                      <div key={fav.id} className="flex items-center gap-4 p-4 bg-white dark:bg-[#111] rounded-lg border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] p-1 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(productPath(fav))}>
                          <img src={fav.image} alt={fav.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" onClick={() => navigate(productPath(fav))}>{fav.name}</h4>
                          <p className="text-red-600 dark:text-red-500 font-bold">{formatCurrency(fav.price)} €</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => toggleFavorite(fav)}
                        >
                          <Heart className="w-5 h-5 fill-red-600 dark:fill-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Bewertungen' && (
                  <div className="p-6 space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Bewertungen werden geladen...</span>
                          </div>
                        ) : 'Sie haben noch keine Bewertungen abgegeben.'}
                      </div>
                    ) : reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 dark:text-gray-700'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(rev.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1 dark:text-white">Produkt: {rev.products?.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{rev.comment}"</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 h-8 w-8 ml-4 flex-shrink-0"
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Bewertung löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto dark:bg-[#0a0a0a] dark:text-white dark:border-white/10 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Edit2 className="w-5 h-5 text-red-600 dark:text-red-500" />
              Profil-Details bearbeiten
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSave} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Anrede (Optional)</Label>
                <Select
                  defaultValue={editFormData.gender}
                  onValueChange={(val) => setEditFormData({ ...editFormData, gender: val })}
                >
                  <SelectTrigger id="edit-gender" className="dark:bg-[#111] dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#111] dark:border-white/10 dark:text-white">
                    <SelectItem value="Herr" className="dark:focus:bg-white/10">Herr</SelectItem>
                    <SelectItem value="Frau" className="dark:focus:bg-white/10">Frau</SelectItem>
                    <SelectItem value="Divers" className="dark:focus:bg-white/10">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-firstname">Vorname</Label>
                <Input
                  id="edit-firstname"
                  value={editFormData.first_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastname">Nachname</Label>
                <Input
                  id="edit-lastname"
                  value={editFormData.last_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-white/10">
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-Mail Adresse</Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefonnummer</Label>
                <Input
                  id="edit-phone"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Firma (Optional)</Label>
                <Input
                  id="edit-company"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  value={editFormData.company || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vat">Vergi No (VAT-ID)</Label>
                <Input
                  id="edit-vat"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  placeholder="z.B. DE123456789"
                  value={editFormData.vat_id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, vat_id: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Adressdaten (Lieferung / Rechnung)</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-street">Straße & Hausnummer</Label>
                <Input
                  id="edit-street"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  value={editFormData.address_street || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address_street: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-zip">Postleitzahl</Label>
                  <Input
                    id="edit-zip"
                    className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                    value={editFormData.address_zip || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address_zip: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Stadt</Label>
                  <Input
                    id="edit-city"
                    className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                    value={editFormData.address_city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address_city: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Land</Label>
                <Input
                  id="edit-country"
                  className="dark:bg-[#111] dark:border-white/10 dark:text-white"
                  value={editFormData.address_country || 'Deutschland'}
                  onChange={(e) => setEditFormData({ ...editFormData, address_country: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-100 dark:border-white/10 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Abbrechen
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Speichern
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {renderInvoiceDialog()}
    </div>
  );
};

export default AccountPage;