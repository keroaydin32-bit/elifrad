import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { products } from '../data/mockData';

const CartPage = () => {
  const navigate = useNavigate();
  
  // Mock cart items
  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 2, selectedSize: 'M', selectedColor: 'White' },
    { ...products[2], quantity: 1, selectedSize: 'L', selectedColor: 'Black' },
    { ...products[5], quantity: 3, selectedColor: 'Blue' }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 49 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Shop
            </Button>
            <h1 className="text-2xl font-bold">Warenkorb</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ihr Warenkorb ist leer</h2>
            <p className="text-gray-600 mb-8">Fügen Sie Artikel hinzu, um mit dem Einkaufen zu beginnen</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
            >
              Weiter einkaufen
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Artikel im Warenkorb ({cartItems.length})</h2>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-6 border-b border-gray-200 last:border-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                    
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-red-600"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        {item.selectedSize && (
                          <span className="text-sm text-gray-600">Größe: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-sm text-gray-600">Farbe: {item.selectedColor}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Bestellübersicht</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versand:</span>
                    <span>{shipping === 0 ? 'Kostenlos' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Steuern:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamt:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3">
                  Zur Kasse gehen
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={() => navigate('/')}
                >
                  Weiter einkaufen
                </Button>
                
                {shipping > 0 && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Kostenloser Versand ab ${(49 - subtotal).toFixed(2)} mehr!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;