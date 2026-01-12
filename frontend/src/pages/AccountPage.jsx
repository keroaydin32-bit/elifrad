import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, MapPin, Settings, LogOut, Eye, EyeOff, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { products } from '../data/mockData';

const AccountPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const [userInfo, setUserInfo] = useState({
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@email.de',
    phone: '+49 123 456 7890',
    birthDate: '1990-05-15'
  });
  
  // Mock order history
  const orderHistory = [
    {
      id: '#12345',
      date: '2024-01-15',
      status: 'Geliefert',
      total: 89.90,
      items: [products[0], products[2]]
    },
    {
      id: '#12344',
      date: '2024-01-10',
      status: 'Unterwegs',
      total: 45.90,
      items: [products[1]]
    },
    {
      id: '#12343',
      date: '2023-12-28',
      status: 'Geliefert',
      total: 125.50,
      items: [products[3], products[4], products[5]]
    }
  ];

  // Mock addresses
  const addresses = [
    {
      id: 1,
      type: 'Rechnungsadresse',
      name: 'Max Mustermann',
      street: 'Musterstraße 123',
      city: '12345 Berlin',
      country: 'Deutschland',
      isDefault: true
    },
    {
      id: 2,
      type: 'Lieferadresse',
      name: 'Max Mustermann',
      street: 'Arbeitsplatz 456',
      city: '10115 Berlin',
      country: 'Deutschland',
      isDefault: false
    }
  ];

  const LoginForm = () => (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Anmelden</h2>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            placeholder="ihre@email.de"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsLoggedIn(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2"
        >
          Anmelden
        </Button>
        
        <div className="text-center">
          <button className="text-sm text-red-600 hover:underline">
            Passwort vergessen?
          </button>
        </div>
      </form>
      
      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-gray-600 mb-4">Noch kein Konto?</p>
        <Button variant="outline" className="w-full">
          Neues Konto erstellen
        </Button>
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Persönliche Informationen</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Abbrechen' : 'Bearbeiten'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
          <input 
            type="text" 
            value={userInfo.firstName}
            onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:border-red-600' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
          <input 
            type="text" 
            value={userInfo.lastName}
            onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:border-red-600' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input 
            type="email" 
            value={userInfo.email}
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:border-red-600' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input 
            type="tel" 
            value={userInfo.phone}
            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:border-red-600' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
          <input 
            type="date" 
            value={userInfo.birthDate}
            onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:border-red-600' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
      </div>
      
      {isEditing && (
        <div className="mt-6 flex gap-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Änderungen speichern
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Abbrechen
          </Button>
        </div>
      )}
    </div>
  );

  const OrdersTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Bestellhistorie</h2>
      
      {orderHistory.map((order) => (
        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Bestellung {order.id}</h3>
              <p className="text-gray-600">Bestellt am {order.date}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'Geliefert' ? 'bg-green-100 text-green-800' :
                order.status === 'Unterwegs' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
              <p className="font-bold text-lg mt-2">${order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded mb-2"
                />
                <p className="text-xs text-center">{item.name}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              Details anzeigen
            </Button>
            <Button variant="outline" size="sm">
              Erneut bestellen
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const AddressesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Meine Adressen</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          Neue Adresse hinzufügen
        </Button>
      </div>
      
      {addresses.map((address) => (
        <div key={address.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{address.type}</h3>
              {address.isDefault && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                  Standard
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Bearbeiten</Button>
              <Button variant="outline" size="sm">Löschen</Button>
            </div>
          </div>
          
          <div className="text-gray-700">
            <p>{address.name}</p>
            <p>{address.street}</p>
            <p>{address.city}</p>
            <p>{address.country}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Shop
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Shop
            </Button>
            
            <h1 className="text-2xl font-bold">Mein Konto</h1>
            
            <Button 
              variant="outline"
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold">Willkommen zurück!</h3>
                  <p className="text-gray-600">{userInfo.firstName} {userInfo.lastName}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profil
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Bestellungen
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'addresses' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Adressen
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Einstellungen
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6">Kontoeinstellungen</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Passwort ändern</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelles Passwort</label>
                        <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
                        <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                      Passwort aktualisieren
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">E-Mail-Einstellungen</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Newsletter erhalten</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Bestellbestätigungen</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm">Werbemails</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;