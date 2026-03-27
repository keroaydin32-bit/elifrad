import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Truck, CheckCircle, Package, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

const CartPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('cart'); // 'cart', 'checkout', 'review', 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  const handleContinueToReview = (e) => {
    e.preventDefault();
    // No longer using separate review view, just keep everything on checkout
  };

  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart, shopSettings, customer } = useStore();
  const cartItems = cart;

  const [checkoutData, setCheckoutData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: 'Deutschland',
    paymentMethod: 'paypal'
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Auto-fill checkout data from customer profile
  React.useEffect(() => {
    if (customer) {
      setCheckoutData(prev => ({
        ...prev,
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address_street || '',
        zip: customer.address_zip || '',
        city: customer.address_city || '',
        country: customer.address_country || 'Deutschland'
      }));
    }
  }, [customer]);

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getShippingCost = (country, subtotal) => {
    // En yüksek özel kargo ücretini bul (Sperrgut vs.)
    const maxItemShippingCost = cartItems.reduce((max, item) => {
      let itemShipping = 0;
      if (item.shipping_method_id && shopSettings?.shippingMethods) {
        const method = shopSettings.shippingMethods.find(m => String(m.id) === String(item.shipping_method_id));
        if (method) {
          itemShipping = parseFloat(method.price) || 0;
        } else {
          itemShipping = parseFloat(item.shipping_cost) || 0;
        }
      } else {
        itemShipping = parseFloat(item.shipping_cost) || 0;
      }
      return itemShipping > max ? itemShipping : max;
    }, 0);

    if (maxItemShippingCost > 0) {
      return maxItemShippingCost; // Özel kargo ücreti atanmışsa onu kullan ve ücretsiz kargo limitini iptal et
    }

    const rates = {
      'Deutschland': { price: 5.99, freeAbove: 49 },
      'Österreich': { price: 9.90, freeAbove: 99 },
      'Schweiz': { price: 14.90, freeAbove: 150 },
      'other': { price: 12.90, freeAbove: 200 }
    };

    const rate = rates[country] || rates['other'];
    return subtotal >= rate.freeAbove ? 0 : rate.price;
  };

  const shipping = getShippingCost(checkoutData.country, subtotal);
  const tax = subtotal * 0.19; // 19% MwSt in Germany
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e, paypalDetails = null) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: `${checkoutData.firstName} ${checkoutData.lastName}`,
          customer_email: checkoutData.email,
          total_amount: total,
          status: paypalDetails ? 'paid' : 'pending',
          payment_method: checkoutData.paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear Cart & Success
      setLastOrderId(order.id);

      if (checkoutData.paymentMethod === 'easycredit') {
        toast.info('Verbindung zu easyCredit wird hergestellt...', { duration: 3000 });
        setTimeout(() => {
          clearCart();
          setView('success');
          toast.success('Vielen Dank! Ihre Finanzierungsanfrage wurde gestartet.');
        }, 2000);
      } else {
        clearCart();
        setView('success');
        toast.success('Vielen Dank für Ihre Bestellung!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Hata: Sipariş tamamlanamadı. ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to trigger easyCredit checkout
  const triggerEasyCredit = async (orderId) => {
    const checkoutElement = document.querySelector('easycredit-checkout');
    if (checkoutElement) {
      // We can't easily "click" a web component's internal button without shadowRoot access or it providing a method
      // However, the official easycredit-checkout component handles everything.
      // We just need to ensure the order is created first if the user wants an order record.
      // Usually, easyCredit redirect happens on button click.
      // If the user wants an order BEFORE redirect:
      toast.success('Bestellung gespeichert. Weiterleitung zu easyCredit...');
      setTimeout(() => {
        // The redirection happens inside the easycredit-checkout component 
        // but if it's not working, we might need to handle the event.
      }, 500);
    }
  };

  // Load PayPal Script
  React.useEffect(() => {
    if (view === 'checkout' && checkoutData.paymentMethod === 'paypal' && shopSettings?.paypalClientId) {
      if (window.paypal) {
        setScriptLoaded(true);
        return;
      }

      // Check for existing script tag
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) {
        const checkPaypal = setInterval(() => {
          if (window.paypal) {
            setScriptLoaded(true);
            clearInterval(checkPaypal);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      // Use standard SDK with disable-funding to ensure it loads easily
      script.src = `https://www.paypal.com/sdk/js?client-id=${shopSettings.paypalClientId}&currency=EUR&intent=capture`;
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('PayPal SDK Load Error');
        // Don't show intrusive toast, just keep spinner or fallback
      };
      document.head.appendChild(script);
    }
  }, [view, checkoutData.paymentMethod, shopSettings?.paypalClientId]);

  // Initialize PayPal Buttons
  React.useEffect(() => {
    let retryCount = 0;
    const maxRetries = 20; // 10 seconds total (20 * 500ms)
    let renderInterval;

    if (scriptLoaded && checkoutData.paymentMethod === 'paypal' && window.paypal && total > 0) {
      const tryRender = () => {
        const containers = ['paypal-button-container-summary'];
        let allRendered = true;

        containers.forEach(id => {
          const container = document.getElementById(id);
          if (container) {
            // Only render if it's empty to prevent multiple buttons
            if (container.innerHTML === '' || container.querySelector('.paypal-buttons') === null) {
              container.innerHTML = ''; // Clear any loading spinners
              try {
                window.paypal.Buttons({
                  style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                  },
                  createOrder: (data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: total.toFixed(2),
                          currency_code: 'EUR'
                        },
                        description: `Bestellung bei ${shopSettings?.shopName || 'Electrive'}`
                      }]
                    });
                  },
                  onApprove: async (data, actions) => {
                    const details = await actions.order.capture();
                    console.log('PayPal Captured:', details);
                    handlePlaceOrder(null, details);
                  },
                  onError: (err) => {
                    console.error('PayPal Button Error:', err);
                  }
                }).render(`#${id}`);
              } catch (e) {
                console.error(`Error rendering PayPal in ${id}:`, e);
                allRendered = false;
              }
            }
          } else {
            allRendered = false;
          }
        });

        if (allRendered || retryCount >= maxRetries) {
          clearInterval(renderInterval);
        }
        retryCount++;
      };

      renderInterval = setInterval(tryRender, 500);
      tryRender(); // Initial try
    }

    return () => {
      if (renderInterval) clearInterval(renderInterval);
    };
  }, [scriptLoaded, checkoutData.paymentMethod, view, total, shopSettings?.paypalClientId]);

  if (view === 'success') {
    return (
      <div className="bg-gray-50 dark:bg-[#050505] min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-transparent dark:border-white/5 p-8 md:p-12 max-w-lg w-full text-center">
          <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Vielen Dank!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
            Siparişiniz başarıyla alındı. Sipariş numaranız: <br />
            <span className="font-bold text-gray-900 dark:text-white mt-2 block">#{lastOrderId?.substring(0, 8).toUpperCase()}</span>
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white py-6 text-lg rounded-lg"
            >
              Weiter einkaufen
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Eine Bestätigungs-E-Mail wurde an {checkoutData.email} gesendet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 sticky top-0 z-30 transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (view === 'review') setView('checkout');
                else if (view === 'checkout') setView('cart');
                else navigate('/');
              }}
              className="flex items-center gap-2 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              {view === 'review' ? 'Zurück zum Checkout' : (view === 'checkout' ? 'Zurück zum Warenkorb' : 'Zurück zum Shop')}
            </Button>
            <h1 className="text-2xl font-bold dark:text-white">
              {view === 'checkout' ? 'Versand & Zahlung' : 'Warenkorb'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 transition-colors">
            <div className="bg-gray-50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ihr Warenkorb ist leer</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Fügen Sie Artikel hinzu, um mit dem Einkaufen zu beginnen</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white px-8 py-6 h-auto text-lg rounded-lg"
            >
              Weiter einkaufen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {view === 'cart' ? (
                /* CART VIEW */
                <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
                  <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold dark:text-white">Artikel im Warenkorb ({cartItems.length})</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Birim Fiyat</span>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-contain dark:bg-[#111] rounded-lg shadow-sm cursor-pointer p-2"
                          onClick={() => navigate(`/product/${item.id}`)}
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                className="font-bold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                onClick={() => navigate(`/product/${item.id}`)}
                              >
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                            </div>
                            <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">{(item.price * item.quantity).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-200 dark:border-white/10">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-600 dark:text-gray-300"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-600 dark:text-gray-300"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 p-2 transition-colors flex items-center gap-1 text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Entfernen
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* CHECKOUT VIEW (now includes review elements) */
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-8 transition-colors">
                    <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-3">
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"><Truck className="w-6 h-6 text-red-600 dark:text-red-500" /></div>
                      Versandinformationen
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Vorname *</label>
                        <input
                          required
                          type="text"
                          className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                          value={checkoutData.firstName}
                          onChange={(e) => setCheckoutData({ ...checkoutData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nachname *</label>
                        <input
                          required
                          type="text"
                          className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                          value={checkoutData.lastName}
                          onChange={(e) => setCheckoutData({ ...checkoutData, lastName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">E-Mail Adresse *</label>
                        <input
                          required
                          type="email"
                          className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                          value={checkoutData.email}
                          onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Telefonnummer *</label>
                        <div className="relative">
                          <input
                            required
                            type="tel"
                            className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            placeholder="+49 123 4567890"
                            value={checkoutData.phone}
                            onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                          />
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Straße & Hausnummer *</label>
                        <input
                          required
                          type="text"
                          className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                          value={checkoutData.address}
                          onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">PLZ *</label>
                          <input
                            required
                            type="text"
                            className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                            value={checkoutData.zip}
                            onChange={(e) => setCheckoutData({ ...checkoutData, zip: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Stadt *</label>
                          <input
                            required
                            type="text"
                            className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/20 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 outline-none transition-all dark:bg-[#111] dark:text-white"
                            value={checkoutData.city}
                            onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Land *</label>
                        <Select
                          value={checkoutData.country}
                          onValueChange={(val) => setCheckoutData({ ...checkoutData, country: val })}
                        >
                          <SelectTrigger className="w-full h-12 rounded-lg border-gray-200 dark:border-white/20 dark:bg-[#111] dark:text-white">
                            <SelectValue placeholder="Land wählen" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-[#111] dark:border-white/10 dark:text-white">
                            <SelectItem value="Deutschland" className="dark:focus:bg-white/10">Deutschland</SelectItem>
                            <SelectItem value="Österreich">Österreich</SelectItem>
                            <SelectItem value="Schweiz">Schweiz</SelectItem>
                            <SelectItem value="Belgien">Belgien</SelectItem>
                            <SelectItem value="Niederlande">Niederlande</SelectItem>
                            <SelectItem value="Frankreich">Frankreich</SelectItem>
                            <SelectItem value="Italien">Italien</SelectItem>
                            <SelectItem value="Spanien">Spanien</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-8 transition-colors">
                    <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-3">
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"><CreditCard className="w-6 h-6 text-red-600 dark:text-red-500" /></div>
                      Zahlungsmethode
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'paypal', name: 'PayPal', desc: 'Sicher bezahlen mit PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
                        { id: 'visa', name: 'Kreditkarte', desc: 'Visa, Mastercard, AMEX', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
                        { id: 'klarna', name: 'Klarna', desc: 'Sofort, Rechnung veya Ratenkauf', logo: 'https://cdn.worldvectorlogo.com/logos/klarna.svg' },
                        { id: 'easycredit', name: 'easyCredit', desc: 'Ratenkauf - einfach & flexibel', logo: 'https://www.easycredit-ratenkauf.de/wp-content/uploads/2019/06/easycredit_ratenkauf_logo.png' },
                        { id: 'überweisung', name: 'Vorkasse', desc: 'Banküberweisung', logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method.id })}
                          className={`relative group flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all ${checkoutData.paymentMethod === method.id
                            ? 'border-red-600 dark:border-red-500 bg-red-50/30 dark:bg-red-900/10'
                            : 'border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-transparent hover:shadow-md dark:hover:bg-white/5'
                            }`}
                        >
                          <div className={`w-14 h-10 rounded-lg flex items-center justify-center mb-0 mr-4 transition-all ${checkoutData.paymentMethod === method.id ? 'bg-white dark:bg-[#111] shadow-sm scale-110' : 'bg-gray-50 dark:bg-white/5'
                            }`}>
                            <img src={method.logo} alt={method.name} className="w-10 h-6 object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 dark:text-white">{method.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{method.desc}</div>
                            {method.id === 'easycredit' && (
                              <div className="mt-2 scale-90 origin-left">
                                <easycredit-checkout-label
                                  key={`${shopSettings?.easyCreditWebshopId}-${shopSettings?.easyCreditToken}`}
                                  webshop-id={shopSettings?.easyCreditWebshopId || '1.DE.11728.1'}
                                  access-token={shopSettings?.easyCreditToken || ''}
                                ></easycredit-checkout-label>
                              </div>
                            )}
                          </div>

                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checkoutData.paymentMethod === method.id
                            ? 'border-red-600 dark:border-red-500 bg-red-600 dark:bg-red-500 shadow-sm'
                            : 'border-gray-200 dark:border-white/20'
                            }`}>
                            {checkoutData.paymentMethod === method.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>


                  {/* Review elements integrated into checkout */}
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                      <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        Übersicht Artikel
                      </h3>
                      <button type="button" onClick={() => setView('cart')} className="text-xs font-bold text-red-600 dark:text-red-500 hover:underline">Warenkorb ändern</button>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-5 flex gap-5 items-center hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                          <img src={item.image} className="w-16 h-16 object-contain dark:bg-[#111] rounded-lg shadow-sm p-1" alt="" />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.quantity} x {item.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                          </div>
                          <p className="font-bold text-lg dark:text-white whitespace-nowrap">{(item.price * item.quantity).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 p-8 sticky top-28 transition-colors text-gray-900 dark:text-white">
                <h2 className="text-xl font-bold mb-6">Bestellübersicht</h2>

                <div className="mb-6 space-y-2">
                  <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Versandland</Label>
                  <Select
                    value={checkoutData.country}
                    onValueChange={(val) => setCheckoutData({ ...checkoutData, country: val })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#111] text-sm font-medium">
                      <SelectValue placeholder="Land wählen" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#111] dark:border-white/10 dark:text-white">
                      <SelectItem value="Deutschland" className="dark:focus:bg-white/10">Deutschland</SelectItem>
                      <SelectItem value="Österreich" className="dark:focus:bg-white/10">Österreich</SelectItem>
                      <SelectItem value="Schweiz" className="dark:focus:bg-white/10">Schweiz</SelectItem>
                      <SelectItem value="Andere" className="dark:focus:bg-white/10">Anderes EU-Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                    <span>Zwischensumme:</span>
                    <span className="text-gray-900 dark:text-white whitespace-nowrap">{subtotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                    <span>Versand:</span>
                    <span className={`whitespace-nowrap ${shipping === 0 ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'}`}>
                      {shipping === 0 ? 'Kostenlos' : `${shipping.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 dark:text-gray-500 text-sm">
                    <span>Inkl. 19% MwSt.</span>
                    <span className="whitespace-nowrap">{tax.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="border-t border-dashed border-gray-100 dark:border-white/10 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold">Gesamtbetrag:</span>
                      <span className="text-3xl font-black text-red-600 dark:text-red-500 whitespace-nowrap">{total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                    </div>
                  </div>
                </div>

                {view === 'cart' ? (
                  <div className="space-y-4">
                    <Button
                      onClick={() => setView('checkout')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 h-auto text-sm font-black rounded-sm uppercase tracking-widest shadow-lg shadow-red-100 dark:shadow-none active:scale-95 transition-all"
                    >
                      Zur Kasse gehen
                    </Button>

                    {/* PayPal Express on Cart View */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[1px] bg-gray-100 dark:bg-white/10 flex-1"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schnellkauf</span>
                        <div className="h-[1px] bg-gray-100 dark:bg-white/10 flex-1"></div>
                      </div>
                      <div
                        onClick={() => setView('checkout')}
                        className="w-full h-11 bg-[#ffc439] hover:bg-[#f2ba34] rounded-md flex items-center justify-center cursor-pointer transition-all active:scale-95 group"
                      >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 group-hover:scale-110 transition-transform" />
                        <span className="ml-2 text-xs font-bold text-[#003087]">Direkt zu PayPal</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* PayPal Container in Summary */}
                    {checkoutData.paymentMethod === 'paypal' && (
                      <div className="space-y-4">
                        <div id="paypal-button-container-summary" className="min-h-[100px]"></div>
                        {!scriptLoaded && (
                          <div className="flex items-center justify-center p-4 bg-gray-50/50 dark:bg-white/5 rounded-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 text-center">
                          Sie werden zur sicheren Bezahlung zu PayPal weitergeleitet.
                        </p>
                      </div>
                    )}

                    {/* easyCredit Integration - Only if selected */}
                    {checkoutData.paymentMethod === 'easycredit' && (
                      <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-6 bg-white dark:bg-[#111] border-2 border-blue-100 dark:border-blue-900/30 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <img src="https://www.easycredit-ratenkauf.de/wp-content/uploads/2019/06/easycredit_ratenkauf_logo.png" className="h-6 w-auto" alt="easyCredit" />
                              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Ratenkauf</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">ID: {shopSettings?.easyCreditWebshopId?.substring(0, 8)}...</div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                              <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">Finanzierung wird vorbereitet:</span>
                              Bitte klicken Sie auf den blauen Button unten, um Ihre Raten zu berechnen und den sicheren Zahlungsvorgang zu starten.
                            </p>

                            <div className="min-h-[80px] flex items-center justify-center border border-dashed border-blue-200 dark:border-blue-900/50 rounded-lg bg-gray-50/50 dark:bg-black/20 p-4">
                              {!shopSettings?.easyCreditWebshopId ? (
                                <div className="text-xs text-gray-400 italic">Einstellungen werden geladen...</div>
                              ) : (
                                <div className="w-full">
                                  <easycredit-checkout
                                    key={`${shopSettings?.easyCreditWebshopId}-${shopSettings?.easyCreditToken}-${total}`}
                                    webshop-id={shopSettings?.easyCreditWebshopId || '1.DE.11728.1'}
                                    access-token={shopSettings?.easyCreditToken || ''}
                                    amount={total}
                                  ></easycredit-checkout>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500 text-center italic mt-2">
                              * Falls der Button nicht erscheint, stellen Sie bitte sicher, dass der Gesamtbetrag zwischen 200€ und 10.000€ liegt.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard Order Button - Hide for PayPal and easyCredit */}
                    {checkoutData.paymentMethod !== 'paypal' && checkoutData.paymentMethod !== 'easycredit' && (
                      <Button
                        onClick={(e) => handlePlaceOrder(e)}
                        disabled={isSubmitting}
                        className="w-full py-4 h-auto text-lg font-bold rounded-lg shadow-lg active:scale-95 transition-all bg-red-600 hover:bg-red-700 shadow-red-100 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Wird verarbeitet...' : 'Jetzt zahlungspflichtig bestellen'}
                      </Button>
                    )}
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <div className="bg-gray-100 dark:bg-white/5 p-2 rounded-lg"><CreditCard className="w-4 h-4" /></div>
                    Verschlüsselte Bezahlung
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <div className="bg-gray-100 dark:bg-white/5 p-2 rounded-lg"><Truck className="w-4 h-4" /></div>
                    Schneller Versand
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;