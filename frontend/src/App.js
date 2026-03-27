import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import SpecialOffersPage from "./pages/SpecialOffersPage";
import AccountPage from "./pages/AccountPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDetail from "./pages/CustomerDetail";
import OrderDetailPage from "./pages/OrderDetailPage";
import BoschCalculator from "./pages/BoschCalculator";
import ManufacturerDetail from "./pages/ManufacturerDetail";
import SearchPage from "./pages/SearchPage";
import ShippingPage from "./pages/ShippingPage";
import ContactPage from "./pages/ContactPage";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import CookieBanner from "./components/CookieBanner";
import AllManufacturersPage from "./pages/AllManufacturersPage";
import AboutUsPage from "./pages/AboutUsPage";
import LoginPage from "./pages/LoginPage";
import LegalPage from "./pages/LegalPage";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import { supabase } from "./supabase";
import { useStore } from "./context/StoreContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

// ─── Admin Whitelist ───────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['kerem_aydin@aol.com'];

const AdminGuard = ({ children }) => {
  const { customer, loading } = useStore();

  // Smart Auth: If we have a cached profile and it's an admin, don't block the UI
  const cachedProfile = (() => {
    try {
      const saved = localStorage.getItem('cached_last_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (err) { return null; }
  })();

  const isCachedAdmin = cachedProfile && ADMIN_EMAILS.includes(cachedProfile.email?.toLowerCase());

  // Only block the UI if we are loading AND we have no cached admin profile
  if (loading && !isCachedAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  // Once loading is finished, perform strict check
  if (!loading) {
    if (!customer) {
      return <Navigate to="/login" replace />;
    }
    if (!ADMIN_EMAILS.includes(customer.email?.toLowerCase())) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
          <div className="text-8xl">🚫</div>
          <h1 className="text-3xl font-black">Zugriff verweigert</h1>
          <p className="text-gray-400">Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.</p>
          <a href="/" className="mt-4 px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition">
            Zur Startseite
          </a>
        </div>
      );
    }
  }

  // ✅ Authorized (or optimistic load for cached admin)
  return children;
};
// ──────────────────────────────────────────────────────────────────────────────

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Visitor Tracking — only if analytics cookies are accepted (DSGVO)
    const trackVisit = async () => {
      if (!supabase) return;
      if (isAdminRoute) return;

      // Check cookie consent
      try {
        const consent = JSON.parse(localStorage.getItem('cookie_consent_v1') || 'null');
        if (!consent || !consent.analytics) return; 
      } catch (err) { return; }

      const lastVisitDate = localStorage.getItem('last_visit_date');
      const today = new Date().toISOString().split('T')[0];

      if (lastVisitDate !== today) {
        try {
          const { data: visitData } = await supabase
            .from('daily_visits')
            .select('count')
            .eq('date', today)
            .maybeSingle();

          if (visitData) {
            await supabase
              .from('daily_visits')
              .update({ count: (visitData.count || 0) + 1 })
              .eq('date', today);
          } else {
            await supabase
              .from('daily_visits')
              .upsert({ date: today, count: 1 }, { onConflict: 'date' });
          }
          localStorage.setItem('last_visit_date', today);
        } catch (err) {
          console.warn('Visitor tracking failed:', err);
        }
      }
    };
    trackVisit();
  }, [isAdminRoute]);

  useEffect(() => {
    // Force reset scroll to top-left on initial load to prevent "pushed" start
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
  }, []);

  return (
    <div className="App min-h-screen flex flex-col font-sans overflow-x-hidden w-full max-w-full relative">
      {!isAdminRoute && <Header />}
      <main className="flex-1 w-full overflow-x-hidden relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/*" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/special-offers" element={<SpecialOffersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bosch" element={<BoschCalculator />} />
          <Route path="/hersteller/:id" element={<ManufacturerDetail />} />
          <Route path="/marken" element={<AllManufacturersPage />} />
          <Route path="/alle-kategorien" element={<AllCategoriesPage />} />
          <Route path="/versandinformationen" element={<ShippingPage />} />
          <Route path="/uber-uns" element={<AboutUsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/legal/:docId" element={<LegalPage />} />

          {/* 🔒 Protected Admin Routes */}
          <Route path="/admin/*" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/customer/:id" element={<AdminGuard><CustomerDetail /></AdminGuard>} />
          <Route path="/admin/order/:id" element={<AdminGuard><OrderDetailPage /></AdminGuard>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CookieBanner />}
      <ScrollToTopButton />
    </div>
  );
};


function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
