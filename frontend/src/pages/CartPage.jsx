import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';
import { Trash2, Plus, Minus, ArrowLeft, Package, CheckCircle, Lock, Check, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, shopSettings, customer, shippingRates } = useStore();
  const primaryColor = shopSettings?.primaryColor || '#dc2626';

  // view: 'cart' | 'address' | 'shipping_payment' | 'summary' | 'success'
  const [view, setView] = useState('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    firstName: customer?.first_name || '',
    lastName: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address_street || '',
    zip: customer?.address_zip || '',
    city: customer?.address_city || '',
    country: customer?.address_country || 'Deutschland',
    shippingMethodId: '',
    paymentMethod: 'paypal',
    createAccount: false
  });

  // Sync checkout data when customer loads
  useEffect(() => {
    if (customer) {
      setCheckoutData(prev => ({
        ...prev,
        firstName: customer.first_name || prev.firstName,
        lastName: customer.last_name || prev.lastName,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
        address: customer.address_street || prev.address,
        zip: customer.address_zip || prev.zip,
        city: customer.address_city || prev.city,
        country: customer.address_country || prev.country,
      }));
    }
  }, [customer]);

  // 1. Basic Calculations (Move these UP so they can be safely used in hooks)
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.selectedVariant?.price) || Number(item.price) || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Shipping Cost Calculation based on selected method and country
  const getShippingCost = () => {
    const countryRate = (shippingRates || []).find(r => r.country_name === (checkoutData?.country || 'Deutschland') && r.is_active);
    let basePrice = 0;
    let threshold = null;

    if (countryRate) {
      basePrice = parseFloat(countryRate.price) || 0;
      threshold = countryRate.free_shipping_threshold ? parseFloat(countryRate.free_shipping_threshold) : null;
    }

    // If free shipping threshold is met, it's 0 regardless of method
    if (threshold !== null && subtotal >= threshold) return 0;

    // If a specific shipping company/method is selected, use its price as primary
    if (checkoutData?.shippingMethodId && shopSettings?.shippingMethods) {
      const selectedMethod = shopSettings.shippingMethods.find(m => String(m.id) === checkoutData.shippingMethodId);
      if (selectedMethod) {
        // We use the selected method's price. 
        // We only use country basePrice if the method price is 0 or not set.
        basePrice = parseFloat(selectedMethod.price) || basePrice;
      }
    }

    // Check for any product-specific shipping cost overrides
    const maxItemOverride = cart.reduce((max, item) => {
      return Math.max(max, parseFloat(item.shipping_cost) || 0);
    }, 0);

    return Math.max(basePrice, maxItemOverride);
  };

  const shipping = getShippingCost();
  const total = subtotal + shipping;

  // 2. Get Available Shipping Methods based on cart items
  const getAvailableShippingMethods = () => {
    if (!shopSettings?.shippingMethods) return [];

    // All distinct forced group names in the cart
    const activeForcedGroups = [...new Set(cart
      .filter(item => item.shipping_method_id)
      .map(item => String(item.shipping_method_id))
    )];

    // Priority Check: If Spedition is in cart, only Spedition methods
    if (activeForcedGroups.includes('Spedition')) {
      return shopSettings.shippingMethods.filter(m => String(m.group) === 'Spedition');
    }

    // Next Priority: If Gross Paket is in cart, only Gross Paket methods
    if (activeForcedGroups.includes('Gross Paket')) {
      return shopSettings.shippingMethods.filter(m => String(m.group) === 'Gross Paket');
    }

    // Default Fallback: Only show "Klein Paket" group methods
    const kleinPaketMethods = shopSettings.shippingMethods.filter(m =>
      (m.group || 'Klein Paket') === 'Klein Paket'
    );

    return kleinPaketMethods.length > 0 ? kleinPaketMethods : shopSettings.shippingMethods;
  };

  const availableMethods = getAvailableShippingMethods();

  // Initialize selected shipping method
  useEffect(() => {
    if (availableMethods.length > 0) {
      // If current selected method is not in available methods, reset to first available
      const currentIsValid = availableMethods.some(m => String(m.id) === checkoutData.shippingMethodId);
      if (!currentIsValid) {
        setCheckoutData(prev => ({ ...prev, shippingMethodId: String(availableMethods[0].id) }));
      }
    }

    // Track beginning of checkout
    if (view === 'address') {
      trackEvent('begin_checkout', {
        value: total,
        currency: 'EUR',
        items: cart.map(item => ({
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          price: Number(item.selectedVariant?.price) || Number(item.price)
        }))
      });
    }
  }, [availableMethods, checkoutData.shippingMethodId, view]);

  // Handle Cart Quantity
  const handleUpdateQuantity = (id, newQuantity, selectedVariant = null) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity, selectedVariant);
  };

  // Stepper UI configuration
  const steps = [
    { id: 'address', label: 'Rechnungs- und Lieferadresse' },
    { id: 'shipping_payment', label: 'Versand- und Zahlungsart' },
    { id: 'summary', label: 'Zusammenfassung' },
    { id: 'success', label: 'Fertig' }
  ];

  const currentStepIndex = view === 'cart' ? -1 : steps.findIndex(s => s.id === view);

  const tax = subtotal * 0.19;

  const handlePlaceOrder = async (paypalDetails = null) => {
    // If first argument is an event (e.g. from onClick), it's NOT paypalDetails
    const isPaypal = !!(paypalDetails && typeof paypalDetails === 'object' && !(paypalDetails instanceof Event) && paypalDetails.id);
    const actualPaypalDetails = isPaypal ? paypalDetails : null;

    if (cart.length === 0) {
      toast.error('Ihr Warenkorb ist leer.');
      return;
    }

    setIsSubmitting(true);
    console.log('🚀 [CHECKOUT] Starting Order Process...', { isPaypal, paymentMethod: checkoutData.paymentMethod });

    try {
      // 1. Create Order
      const shippingMethodName = (shopSettings?.shippingMethods || []).find(m => String(m.id) === checkoutData.shippingMethodId)?.name || 'Standard';

      const orderPayload = {
        customer_name: `${checkoutData.firstName} ${checkoutData.lastName}`.trim(),
        customer_email: checkoutData.email,
        total_amount: Number(total) || 0,
        status: actualPaypalDetails ? 'paid' : 'pending',
        payment_method: checkoutData.paymentMethod,
        country: checkoutData.country,
        street: checkoutData.address,
        zip: checkoutData.zip,
        city: checkoutData.city,
        phone: checkoutData.phone,
        shipping_method: shippingMethodName,
        payment_id: actualPaypalDetails?.id || null
      };

      console.log('📦 [CHECKOUT] Creating Order in Database...', orderPayload);
      toast.info('Bestellung wird verarbeitet...', { id: 'checkout-loading' });

      // Bypass supabase client and use direct fetch for maximum reliability
      const baseUrl = process.env.REACT_APP_SUPABASE_URL;
      const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${baseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody.message || `HTTP ${response.status}`);
      }

      const results = await response.json();
      const order = results[0];

      if (!order) {
        throw new Error('Sipariş kaydı oluşturulamadı.');
      }

      console.log('✅ [CHECKOUT] Order Created:', order.id);

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: Number(item.selectedVariant?.price) || Number(item.price) || 0,
        variant_name: item.selectedVariant?.name || null
      }));

      console.log('🛒 [CHECKOUT] Saving Order Items...', orderItems.length);
      toast.dismiss('checkout-loading');

      const itemsResponse = await fetch(`${baseUrl}/rest/v1/order_items`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderItems)
      });

      if (!itemsResponse.ok) {
        console.error('❌ [CHECKOUT] Order Items Insert Error');
        toast.warning('Die Bestellung wurde erstellt, aber es gab ein Problem beim Speichern der Artikel.');
      } else {
        console.log('✅ [CHECKOUT] Order Items Saved.');
      }

      setLastOrderId(order.id);
      
      // 3. Notify Admin & Customer (Non-blocking) - Real-time email summary via Resend
      // Hardcoded local backend for maximum reliability during testing
      const notifyUrl = "http://127.0.0.1:8000/api/notify-order";
      
      const payload = {
        order_id: String(order.id),
        customer_name: `${checkoutData.firstName || ""} ${checkoutData.lastName || ""}`.trim() || "Gast",
        customer_email: String(checkoutData.email || ""),
        customer_phone: String(checkoutData.phone || ""),
        address: String(checkoutData.address || ""),
        city: String(checkoutData.city || ""),
        zip: String(checkoutData.zip || ""),
        country: String(checkoutData.country || "DE"),
        payment_method: String(checkoutData.paymentMethod || "Vorkasse"),
        total_amount: Number(total) || 0,
        items: cart.map(item => ({
          name: String(item.name || "Produkt"),
          quantity: Number(item.quantity) || 1,
          price: Number(item.selectedVariant?.price || item.price) || 0,
          variant_name: item.selectedVariant?.name || null
        }))
      };

      console.log('📧 [NOTIFY] Triggering email report...', notifyUrl);
      
      fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        console.log('📧 [NOTIFY] Response:', data);
        if (data.status === 'success') {
          toast.success("E-Mail-Benachrichtigung gesendet!", { icon: "📧", duration: 2000 });
        } else {
          console.warn("Mail rejected by backend:", data.message);
        }
      })
      .catch(err => {
        console.error("📧 [NOTIFY] Network error:", err);
      });

      // 4. Track Purchase (Non-blocking)
      try {
        trackEvent('purchase', {
          transaction_id: order.id,
          value: total,
          currency: 'EUR',
          shipping: shipping,
          items: cart.map(item => ({
            item_id: item.id,
            item_name: item.name,
            quantity: item.quantity,
            price: Number(item.selectedVariant?.price) || Number(item.price) || 0
          }))
        });
      } catch (trackErr) {
        console.warn('Analytics tracking failed:', trackErr);
      }

      // 4. Success Navigation
      if (checkoutData.paymentMethod === 'easycredit') {
        toast.info('Verbindung zu easyCredit...', { duration: 3000 });
        setTimeout(() => {
          clearCart();
          setView('success');
          toast.success('Finanzierungsanfrage gestartet.');
        }, 2000);
      } else {
        clearCart();
        setView('success');
        toast.success('Vielen Dank für Ihre Bestellung!');
      }

    } catch (error) {
      console.error('❌ [CHECKOUT] Fatal Error:', error);
      let errorMsg = 'Die Bestellung konnte nicht abgeschlossen werden.';
      if (error.message === 'TIMEOUT_DATABASE') {
        errorMsg = 'Die Datenbank antwortet nicht. Bitte prüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error('Fehler: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // PayPal Integration Robust loading & rendering
  useEffect(() => {
    let active = true;
    let buttonsInstance = null;
    let debounceTimer = null;
    const scriptId = 'paypal-sdk-main';

    const renderButtons = () => {
      if (!active || !window.paypal || view !== 'summary' || checkoutData.paymentMethod !== 'paypal' || !agbAccepted) {
        // Clear container if logic requires
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
        return;
      }
      const container = document.getElementById('paypal-button-container');
      if (container && container.innerHTML === '') {
        try {
          buttonsInstance = window.paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: total.toFixed(2),
                    currency_code: 'EUR',
                    breakdown: {
                      item_total: { currency_code: 'EUR', value: subtotal.toFixed(2) },
                      shipping: { currency_code: 'EUR', value: shipping.toFixed(2) }
                    }
                  },
                  items: cart.map(item => ({
                    name: item.name,
                    unit_amount: { currency_code: 'EUR', value: (item.selectedVariant?.price || item.price).toFixed(2) },
                    quantity: item.quantity.toString()
                  })),
                  shipping: {
                    name: { full_name: `${checkoutData.firstName} ${checkoutData.lastName}` },
                    address: {
                      address_line_1: checkoutData.address,
                      admin_area_2: checkoutData.city,
                      postal_code: checkoutData.zip,
                      country_code: checkoutData.country === 'Deutschland' ? 'DE' : 'DE' // Fallback to DE or dynamic
                    }
                  }
                }]
              });
            },
            onApprove: async (data, actions) => {
              const details = await actions.order.capture();
              if (active) handlePlaceOrder(details);
            },
            onError: (err) => {
              console.error('PayPal Checkout error:', err);
            }
          });

          if (buttonsInstance.isEligible()) {
            buttonsInstance.render('#paypal-button-container').catch(e => {
              if (active) console.warn('PayPal Button render failed:', e);
            });
          }
        } catch (e) {
          console.error('PayPal init error:', e);
        }
      }
    };

    const initPayPal = () => {
      if (window.paypal) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderButtons, 300);
      } else {
        const existingScript = document.getElementById(scriptId);
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${shopSettings.paypalClientId}&currency=EUR&intent=capture&components=buttons,messages`;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.onload = () => {
            if (active) {
              if (debounceTimer) clearTimeout(debounceTimer);
              debounceTimer = setTimeout(renderButtons, 300);
            }
          };
          script.onerror = () => { if (active) console.error('PayPal SDK failed to load'); };
          document.head.appendChild(script);
        } else {
          // Script exists, wait for window.paypal
          const check = setInterval(() => {
            if (window.paypal) {
              clearInterval(check);
              if (active) {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(renderButtons, 300);
              }
            }
          }, 100);
          setTimeout(() => clearInterval(check), 5000);
        }
      }
    };

    if (view === 'summary' && checkoutData.paymentMethod === 'paypal' && shopSettings?.paypalClientId && agbAccepted) {
      initPayPal();
    }

    return () => {
      active = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (buttonsInstance && buttonsInstance.close) {
        buttonsInstance.close().catch(() => { });
      }
    };
  }, [view, checkoutData.paymentMethod, shopSettings?.paypalClientId, total, agbAccepted]);


  const stepPolygons = {
    normal: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%)",
    first: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)",
    last: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 15px 50%)",
  };

  const getStepStyle = (index) => {
    let bg, text;
    if (index === currentStepIndex) {
      bg = primaryColor;        // aktif adım — site rengi
      text = '#ffffff';
    } else if (index < currentStepIndex) {
      bg = primaryColor + '33'; // tamamlanan adım — site rengi %20 opaklık
      text = primaryColor;
    } else {
      bg = '#f3f4f6';           // gelecek adım — gri
      text = '#6b7280';
    }

    let cp = stepPolygons.normal;
    if (index === 0) cp = stepPolygons.first;
    if (index === steps.length - 1) cp = stepPolygons.last;

    return { background: bg, color: text, clipPath: cp, margin: '0 -5px', padding: '12px 25px' };
  };

  return (
    <div className="bg-[#fcfcfc] dark:bg-[#050505] min-h-screen pb-20">

      {/* Checkout Navbar */}
      <div className="bg-white dark:bg-[#111] shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold text-xl md:text-2xl flex items-center gap-2 cursor-pointer dark:text-white" onClick={() => navigate('/')}>
            <span className="text-red-600">CHECKOUT</span>
            <Lock className="w-5 h-5 text-gray-400" />
          </h1>
          <Button variant="ghost" onClick={() => {
            if (view === 'cart') navigate('/');
            else if (view === 'address') setView('cart');
            else if (view === 'shipping_payment') setView('address');
            else if (view === 'summary') setView('shipping_payment');
          }} className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">

        {/* Progress Bar (Stepper) - Render only if not in Cart View */}
        {view !== 'cart' && (
          <div className="flex w-full mb-10 overflow-hidden font-medium text-[11px] sm:text-xs md:text-sm">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center justify-center relative z-10 transition-colors duration-300" style={getStepStyle(index)}>
                <span className="hidden sm:inline z-20 relative pointer-events-none">{step.label}</span>
                <span className="sm:hidden z-20 relative pointer-events-none">{index + 1}</span>
              </div>
            ))}
          </div>
        )}

        {/* ----------------- CART VIEW ----------------- */}
        {view === 'cart' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Warenkorb</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#111] rounded-none border border-gray-200 dark:border-white/10">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">Dein Warenkorb ist leer.</p>
                <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 rounded-sm uppercase tracking-wider font-bold h-12 px-8">Weiter einkaufen</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10">
                    {/* Headers - Hidden on small mobile */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-white/5 text-xs text-gray-500 font-bold uppercase bg-gray-50 dark:bg-white/5">
                      <div className="col-span-6">Artikel</div>
                      <div className="col-span-3 text-center">Menge</div>
                      <div className="col-span-3 text-right">Preis</div>
                    </div>
                    {/* Items */}
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedVariant?.name || 'default'}-${idx}`} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-gray-50 dark:border-white/5 items-center">
                        <div className="w-full sm:col-span-6 flex gap-4 items-center">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-white border dark:border-white/10 p-1" />
                          <div className="flex-1">
                            <p className="font-bold text-sm dark:text-gray-200 line-clamp-1">{item.name}</p>
                            {item.selectedVariant && (
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1 bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded w-fit">
                                {item.selectedVariant.name}
                              </p>
                            )}
                            <p className="text-xs text-green-600 mt-1">✔ auf Lager</p>
                          </div>
                        </div>
                        <div className="w-full flex justify-between sm:justify-center items-center sm:col-span-3 mt-2 sm:mt-0">
                          <span className="sm:hidden text-xs text-gray-500 font-bold uppercase">Menge:</span>
                          <div className="flex border border-gray-300 dark:border-white/20 h-8 items-center bg-white dark:bg-[#111]">
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.selectedVariant)} className="px-3 text-gray-500 hover:text-black dark:text-gray-400">-</button>
                            <span className="px-3 text-sm font-bold dark:text-white min-w-[30px] text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.selectedVariant)} className="px-3 text-gray-500 hover:text-black dark:text-gray-400">+</button>
                          </div>
                        </div>
                        <div className="w-full sm:col-span-3 text-right mt-2 sm:mt-0 border-t sm:border-t-0 border-gray-50 dark:border-white/5 pt-2 sm:pt-0">
                          <div className="flex sm:block justify-between items-end">
                            <span className="sm:hidden text-xs text-gray-500 font-bold uppercase">Preis:</span>
                            <p className="font-bold text-sm dark:text-white">
                              {((Number(item.selectedVariant?.price) || item.price) * item.quantity).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </p>
                          </div>
                          <button onClick={() => removeFromCart(item.id, item.selectedVariant)} className="text-[10px] text-red-500 mt-2 uppercase underline flex items-center justify-end w-full"><Trash2 className="w-3 h-3 mr-1" /> Entfernen</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6">
                    <h3 className="font-bold text-lg mb-6 border-b pb-2 dark:text-white">Summe</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm dark:text-gray-300">
                        <span>Zwischensumme</span>
                        <span>{subtotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>inkl. 19% MwSt.</span>
                        <span>{tax.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                      </div>
                    </div>
                    <div className="border-t pt-4 mb-8 flex justify-between font-bold text-xl dark:text-white">
                      <span>Gesamt:</span>
                      <span>{subtotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                    </div>
                    <Button
                      onClick={() => setView('address')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none h-14 font-black uppercase tracking-wider text-base"
                    >
                      Zur Kasse
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STEP 1: ADDRESS ----------------- */}
        {view === 'address' && (
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

            {/* Login / Customer Active Info Section */}
            <div className="lg:w-1/3">
              {customer ? (
                <div className="bg-green-50 dark:bg-green-900/10 p-8 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">Angemeldet</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Sie sind angemeldet als <span className="font-bold text-gray-900 dark:text-white">{customer.email}</span>. Ihre Daten wurden automatisch übernommen.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/account')}
                    className="w-full border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20"
                  >
                    Profil ansehen
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-white/5 p-8">
                  <h3 className="text-xl font-bold mb-6 dark:text-white">Ich bin bereits Kunde</h3>
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Melden Sie sich an, um den Bestellvorgang zu beschleunigen und Ihre Daten zu laden.
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-none h-12 font-bold uppercase tracking-widest"
                    >
                      ZUM LOGIN
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Guest / New Customer Section */}
            <div className="lg:w-2/3">
              <h3 className="text-2xl font-bold mb-6 dark:text-white">{customer ? 'Ihre Daten prüfen' : 'Als Neukunde fortfahren'}</h3>
              <div className="bg-white dark:bg-[#111] border-t-2 border-red-600 p-6 lg:p-10 shadow-sm border border-x-gray-200 border-b-gray-200 dark:border-white/10">
                {!customer && (
                  <label className="flex items-center gap-3 font-bold text-sm mb-10 dark:text-white cursor-pointer">
                    <input type="checkbox" checked={checkoutData.createAccount} onChange={e => setCheckoutData({ ...checkoutData, createAccount: e.target.checked })} className="w-4 h-4 text-red-600 rounded focus:ring-0" />
                    neues Kundenkonto erstellen (für Bestellung als Gast Haken entfernen)
                  </label>
                )}

                <form onSubmit={(e) => { e.preventDefault(); setView('shipping_payment'); }} className="space-y-8">

                  {/* Name Block */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 border-b border-gray-100 pb-8">
                    <span className="font-bold text-sm text-gray-600 dark:text-gray-300 pt-3">Name</span>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Vorname</label>
                          <input required value={checkoutData.firstName} onChange={e => setCheckoutData({ ...checkoutData, firstName: e.target.value })} type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Nachname</label>
                          <input required value={checkoutData.lastName} onChange={e => setCheckoutData({ ...checkoutData, lastName: e.target.value })} type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Block */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 border-b border-gray-100 pb-8">
                    <span className="font-bold text-sm text-gray-600 dark:text-gray-300 pt-3">Rechnungsadresse</span>
                    <div className="space-y-4">
                      <div className="grid grid-cols-[1fr_80px] gap-4">
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Straße</label>
                          <input required value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Nr.</label>
                          <input type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Land</label>
                        <select value={checkoutData.country} onChange={e => setCheckoutData({ ...checkoutData, country: e.target.value })} className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm bg-white dark:bg-[#111]">
                          {(shippingRates && shippingRates.length > 0) ? (
                            shippingRates.filter(r => r.is_active).map(r => (
                              <option key={r.id} value={r.country_name}>{r.country_name}</option>
                            ))
                          ) : (
                            <>
                              <option value="Deutschland">Deutschland</option>
                              <option value="Österreich">Österreich</option>
                              <option value="Schweiz">Schweiz</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-[1fr_2fr] gap-4">
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">PLZ</label>
                          <input required value={checkoutData.zip} onChange={e => setCheckoutData({ ...checkoutData, zip: e.target.value })} type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                        <div className="relative">
                          <label className="absolute -top-2 left-2 bg-white dark:bg-[#111] px-1 text-[10px] text-gray-500">Ort</label>
                          <input required value={checkoutData.city} onChange={e => setCheckoutData({ ...checkoutData, city: e.target.value })} type="text" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Block */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 border-b border-gray-100 pb-8">
                    <span className="font-bold text-sm text-gray-600 dark:text-gray-300 pt-3">Kontaktdaten</span>
                    <div className="space-y-4">
                      <div className="relative">
                        <input required placeholder="E-Mail" value={checkoutData.email} onChange={e => setCheckoutData({ ...checkoutData, email: e.target.value })} type="email" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm placeholder:text-gray-400" />
                      </div>
                      <div className="relative">
                        <input placeholder="Telefon - optionale Angabe" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} type="tel" className="w-full p-3 border border-gray-300 dark:border-white/20 dark:bg-transparent dark:text-white focus:border-red-600 outline-none text-sm placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 rounded-sm py-6 px-12 uppercase font-bold tracking-wider">Kundendaten abschicken</Button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: SHIPPING & PAYMENT ----------------- */}
        {view === 'shipping_payment' && (
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Shipping Options */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold dark:text-white">Versandart</h3>
              <div className="bg-gray-50 dark:bg-[#111] p-4 flex justify-between items-center text-sm border-y border-gray-200 dark:border-white/10">
                <span className="text-gray-600 dark:text-gray-400">Versand nach: {checkoutData.address}, {checkoutData.zip} {checkoutData.city}, {checkoutData.country}</span>
                <button onClick={() => setView('address')} className="font-bold text-gray-800 dark:text-gray-200">Ändern</button>
              </div>

              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
                {availableMethods.map(method => {
                  const isActive = checkoutData.shippingMethodId === String(method.id);

                  return (
                    <label key={method.id} onClick={() => setCheckoutData({ ...checkoutData, shippingMethodId: String(method.id) })} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isActive ? 'bg-orange-50/20 dark:bg-orange-900/10' : ''}`}>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-red-600' : 'border-gray-300'}`}>
                          {isActive && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                        </div>

                        <div className="shrink-0 w-12 sm:w-16 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded">
                          {method.name.toLowerCase().includes('dhl') ? <span className="font-black text-xs sm:text-sm text-red-600 italic">DHL</span>
                            : method.name.toLowerCase().includes('ups') ? <span className="font-black text-xs sm:text-sm text-yellow-600">UPS</span>
                              : <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-xs sm:text-sm dark:text-white leading-snug">{method.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">1-3 Werktage</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 mt-2 sm:mt-0 pl-9 sm:pl-0">
                        <span className="font-bold text-xs sm:text-sm dark:text-white">
                          {Number(method.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </span>
                        {isActive && <Check className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hidden sm:block" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold dark:text-white">Zahlungsart</h3>
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">

                {[
                  { id: 'paypal', name: 'PayPal', desc: 'Du zahlst schnell, bequem und sicher mit Deinem PayPal Konto.' },
                  { id: 'visa', name: 'Kreditkarte', desc: 'Du kannst Deine Bestellung mit Deiner Kreditkarte von MasterCard und VISA bezahlen.' },
                  { id: 'easycredit', name: 'easyCredit Ratenkauf', desc: 'Bequem in Raten zahlen - entspannt einkaufen.' },
                  { id: 'klarna', name: 'Klarna', desc: 'Rechnungskauf, Sofort-Zahlung oder Ratenkauf.' },
                  { id: 'vorkasse', name: 'Vorkasse / Überweisung', desc: 'Zahle den Betrag per Banküberweisung.' },
                  { id: 'barzahlung', name: 'Nachnahme / Barzahlung', desc: 'Zahle Deine Bestellung direkt bei Übergabe an der Haustür oder bei Abholung.' }
                ].map(method => (
                  <label key={method.id} onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method.id })} className={`flex items-start p-4 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${checkoutData.paymentMethod === method.id ? 'bg-orange-50/20 dark:bg-orange-900/10' : ''}`}>
                    <div className="pt-1 mr-4 sm:mr-6">
                      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkoutData.paymentMethod === method.id ? 'border-red-600' : 'border-gray-300'}`}>
                        {checkoutData.paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <div className="w-16 sm:w-20 h-8 sm:h-10 bg-white border dark:border-white/20 flex items-center justify-center rounded">
                          {/* Logos mock */}
                          {method.id === 'paypal' && <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3 sm:h-4" alt="paypal" />}
                          {method.id === 'visa' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 sm:h-4" alt="visa" />}
                          {method.id === 'klarna' && <img src="https://cdn.worldvectorlogo.com/logos/klarna.svg" className="h-3 sm:h-4" alt="klarna" />}
                          {method.id === 'easycredit' && <img src="https://www.easycredit-ratenkauf.de/wp-content/uploads/2019/06/easycredit_ratenkauf_logo.png" className="h-3 sm:h-4" alt="easycredit" />}
                          {method.id === 'vorkasse' && <span className="font-bold text-[10px] sm:text-xs text-gray-800">BANK</span>}
                          {method.id === 'barzahlung' && <span className="font-bold text-[10px] sm:text-xs text-gray-800">BAR</span>}
                        </div>
                        <span className="font-bold text-xs sm:text-sm dark:text-white text-gray-800">{method.name}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 pl-0 sm:pl-24 leading-relaxed">{method.desc}</p>
                    </div>
                  </label>
                ))}

              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
              <Button variant="outline" onClick={() => setView('address')} className="w-full sm:w-auto rounded-none px-8 py-6 uppercase font-bold text-gray-600">Zurück</Button>
              <Button onClick={() => setView('summary')} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 rounded-sm py-6 px-12 uppercase font-bold tracking-wider">Mit Bestellung fortfahren</Button>
            </div>

          </div>
        )}

        {/* ----------------- STEP 3: SUMMARY ----------------- */}
        {view === 'summary' && (
          <div className="max-w-6xl mx-auto space-y-8">

            {/* 4 Box Grid Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 dark:border-white/10 flex flex-col h-full">
                <div className="bg-gray-100 dark:bg-white/5 p-3 text-sm font-bold border-b border-gray-200 dark:border-white/10 dark:text-gray-300">Rechnungs- und Lieferadresse</div>
                <div className="p-6 grid grid-cols-2 gap-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-bold mb-2">Rechnungsadresse</p>
                    <p>{checkoutData.firstName} {checkoutData.lastName}</p>
                    <p>{checkoutData.address}</p>
                    <p>{checkoutData.zip} {checkoutData.city}</p>
                    <p>{checkoutData.country}</p>
                    <p className="mt-2">{checkoutData.email}</p>
                    <button onClick={() => setView('address')} className="mt-4 bg-gray-200 dark:bg-white/10 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors">Rechnungsadresse ändern</button>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Lieferadresse</p>
                    <p>{checkoutData.firstName} {checkoutData.lastName}</p>
                    <p>{checkoutData.address}</p>
                    <p>{checkoutData.zip} {checkoutData.city}</p>
                    <p>{checkoutData.country}</p>
                    <button onClick={() => setView('address')} className="mt-9 bg-gray-200 dark:bg-white/10 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors">Lieferadresse ändern</button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-white/10 flex flex-col h-full">
                <div className="bg-gray-100 dark:bg-white/5 p-3 text-sm font-bold border-b border-gray-200 dark:border-white/10 dark:text-gray-300">Versand- und Zahlungsart</div>
                <div className="p-6 flex flex-col justify-between flex-1 gap-6 text-sm">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">Versandart</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{(shopSettings?.shippingMethods || []).find(m => String(m.id) === checkoutData.shippingMethodId)?.name || 'Standard'}</p>
                    <button onClick={() => setView('shipping_payment')} className="bg-gray-200 dark:bg-white/10 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors">Versandart ändern</button>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">Zahlungsart</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 uppercase text-sm">{checkoutData.paymentMethod}</p>
                    <button onClick={() => setView('shipping_payment')} className="bg-gray-200 dark:bg-white/10 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors">Zahlungsart ändern</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Review Table */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 mt-12 text-sm">
              <div className="grid grid-cols-12 p-4 border-b border-gray-100 bg-gray-50 dark:bg-white/5 font-bold uppercase text-[11px] text-gray-500">
                <div className="col-span-8">Artikel</div>
                <div className="col-span-2 text-center">Menge</div>
                <div className="col-span-2 text-right">Preis</div>
              </div>

              {cart.map((item, idx) => (
                <div key={`summary-${item.id}-${item.selectedVariant?.name || 'default'}-${idx}`} className="flex flex-col sm:grid sm:grid-cols-12 p-3 sm:p-4 border-b border-gray-50 items-start sm:items-center">
                  <div className="w-full sm:col-span-8 flex gap-3 sm:gap-4">
                    <img src={item.image} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" alt="" />
                    <div className="flex-1">
                      <p className="font-bold text-xs sm:text-sm dark:text-white line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Artikelnr: {item.id}</p>
                      <p className="text-[10px] text-green-600 mt-0.5 flex items-center"><span className="w-1.5 h-1.5 bg-green-500 inline-block mr-1"></span> ab Lager</p>
                    </div>
                  </div>
                  <div className="w-full sm:col-span-2 text-left sm:text-center mt-2 sm:mt-0 flex justify-between sm:block">
                    <span className="sm:hidden text-xs text-gray-500 font-bold uppercase">Menge:</span>
                    <span className="text-xs sm:text-sm dark:text-gray-300 font-bold sm:font-normal">{item.quantity}</span>
                  </div>
                  <div className="w-full sm:col-span-2 text-right mt-1 sm:mt-0 flex justify-between sm:block">
                    <span className="sm:hidden text-xs text-gray-500 font-bold uppercase">Preis:</span>
                    <span className="text-xs sm:text-sm font-bold dark:text-white">
                      {((Number(item.selectedVariant?.price) || item.price) * item.quantity).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:grid sm:grid-cols-12 p-3 sm:p-4 border-b border-gray-50 items-start sm:items-center text-gray-600 dark:text-gray-400 bg-gray-50/30 dark:bg-white/5">
                <div className="w-full sm:col-span-8 flex items-center gap-3 sm:pl-20">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm">{(shopSettings?.shippingMethods || []).find(m => String(m.id) === checkoutData.shippingMethodId)?.name || 'Versand'}</span>
                </div>
                <div className="hidden sm:block sm:col-span-2 text-center text-xs">1</div>
                <div className="w-full sm:col-span-2 text-right mt-1 sm:mt-0 flex justify-between sm:block">
                  <span className="sm:hidden text-xs text-gray-400 font-bold uppercase">Versandkosten:</span>
                  <span className="text-xs sm:text-sm font-bold sm:font-normal">{shipping.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>

              <div className="p-4 text-right flex flex-col items-end gap-1">
                <p className="text-gray-500 text-[10px] sm:text-xs">inkl. 19% MwSt.: <span className="inline-block w-20 sm:w-24 font-medium">{tax.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span></p>
              </div>

              <div className="bg-gray-100 dark:bg-white/10 p-4 font-bold text-base sm:text-lg text-right flex justify-between sm:justify-end gap-8 dark:text-white">
                <span className="uppercase tracking-wider">Gesamtsumme:</span>
                <span className="inline-block w-20 sm:w-24 text-red-600 dark:text-red-500">{total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            <div className="pt-8 space-y-6">

              {/* AGB Checkout Checkbox */}
              <div className="bg-gray-50 dark:bg-white/5 p-6 border border-gray-200 dark:border-white/10 rounded-sm">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={agbAccepted}
                    onChange={(e) => setAgbAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-red-600 rounded focus:ring-red-500 border-gray-300 dark:border-white/20 transition-all cursor-pointer" 
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    Ich habe die <a href="/legal/agb" target="_blank" className="text-red-600 hover:underline font-bold">AGB</a>, die <a href="/legal/widerrufsrecht" target="_blank" className="text-red-600 hover:underline font-bold">Widerrufsbelehrung</a> ile <a href="/legal/datenschutz" target="_blank" className="text-red-600 hover:underline font-bold">Datenschutzerklärung</a> gelesen und erkläre mich mit deren Geltung einverstanden.
                  </span>
                </label>
                {!agbAccepted && (
                  <p className="text-[10px] text-red-500 mt-2 font-bold italic animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Bitte bestätigen Sie die rechtlichen Bedingungen, um fortzufahren.
                  </p>
                )}
              </div>

              {/* Ödeme Butonu - Tam Genişlik */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
                <button
                  onClick={() => setView('cart')}
                  className="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-700 border-b border-dotted pb-1 transition-colors"
                >
                  ← Warenkorb ändern
                </button>

                <div className="w-full sm:w-auto sm:min-w-[320px]">
                  {checkoutData.paymentMethod === 'paypal' ? (
                    <div id="paypal-button-container" className="w-full"></div>
                  ) : checkoutData.paymentMethod === 'easycredit' ? (
                    <div className="w-full">
                      <easycredit-checkout webshop-id={shopSettings?.easyCreditWebshopId || ''} amount={total}></easycredit-checkout>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        if (!agbAccepted) {
                          toast.error("Bitte akzeptieren Sie die AGB und Rechtshinweise.");
                          return;
                        }
                        handlePlaceOrder();
                      }}
                      disabled={isSubmitting || !agbAccepted}
                      className={`w-full py-6 uppercase tracking-wide font-black rounded-sm text-sm transition-all shadow-lg ${
                        agbAccepted 
                          ? 'bg-red-600 hover:bg-red-700 text-white scan-pulse' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed grayscale'
                      }`}
                    >
                      {isSubmitting ? 'Verarbeite...' : 'Jetzt Kaufen'}
                    </Button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- STEP 4: SUCCESS ----------------- */}
        {view === 'success' && (
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">

            <div className="text-left border border-gray-200 dark:border-white/10 p-8 bg-white dark:bg-[#111]">
              <h2 className="text-3xl font-normal mb-2 dark:text-white">Vielen Dank für Deine Bestellung</h2>
              <p className="text-sm text-gray-500 mb-8">Bestellnummer: <span className="text-black dark:text-white font-bold">DE-{lastOrderId?.substring(0, 8).toUpperCase() || '123456'}</span></p>
              
              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deine Bestellung ist bei uns eingegangen.<br />
                  Du erhältst in wenigen Minuten eine Bestätigung per E-Mail.
                </p>

                {checkoutData.paymentMethod === 'vorkasse' && (
                  <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 p-6 space-y-4">
                    <h3 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase tracking-wider">Überweisungsinformationen</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Bitte überweise den Gesamtbetrag von <strong>{total.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong> auf das folgende Konto. 
                      Verwende als Verwendungszweck unbedingt Deine Bestellnummer: <strong>DE-{lastOrderId?.substring(0, 8).toUpperCase()}</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400 mb-1 uppercase text-[10px]">Kontoinhaber</p>
                        <p className="font-bold dark:text-white uppercase">{shopSettings?.owner || 'Electrive GmbH'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1 uppercase text-[10px]">Bankname</p>
                        <p className="font-bold dark:text-white">{shopSettings?.bankName || 'Sparkasse'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-gray-400 mb-1 uppercase text-[10px]">IBAN</p>
                        <p className="font-bold dark:text-white font-mono tracking-wider">{shopSettings?.iban || 'DE00 0000 0000 0000 0000 00'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-bold space-y-1 dark:text-gray-500 uppercase tracking-widest pt-4 opacity-50">
                  <p>Status: {checkoutData.paymentMethod === 'vorkasse' ? 'Warten auf Zahlung' : 'In Bearbeitung'}</p>
                  <p>Zahlungsart: {checkoutData.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 rounded-sm uppercase tracking-wider font-bold px-8 py-6">Weiter einkaufen</Button>
            </div>

            {/* Thank you landscape image like r2bike - Using a nice placeholder landscape */}
            <div className="w-full relative rounded overflow-hidden shadow-2xl mt-12 aspect-video bg-gray-900">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop" alt="Thanks Landscape" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-5xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">THANKS</h2>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;