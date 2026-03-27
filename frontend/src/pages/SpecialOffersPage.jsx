import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Eye, Heart, Tag, Package, Flame, Sparkles, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/productSlug';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 sm:gap-6 mt-8">
      {Object.entries(timeLeft).map(([unit, value], idx) => (
        <React.Fragment key={unit}>
          <div className="flex flex-col items-center">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-lg group-hover:bg-red-500/50 transition-colors duration-500"></div>
              {/* Glass Box */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                <span className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                  {value.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mt-4">{unit}</span>
          </div>
          {idx < 3 && <span className="text-2xl sm:text-4xl font-black text-red-500/50 mb-7 animate-pulse">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const isFav = isFavorite?.(product.id) || false;

  // Estimate old price for dramatic effect
  const oldPrice = Number(product.price || 0) * 1.45;
  const discountPercent = Math.round(((oldPrice - Number(product.price)) / oldPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative bg-[#0a0a0a] rounded-lg overflow-hidden border border-white/5 hover:border-red-500/30 transition-all duration-700 hover:shadow-[0_0_80px_-20px_rgba(220,38,38,0.25)] flex flex-col h-full"
    >
      {/* Top Badges */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-2">
          <Badge className="bg-red-600 text-white border-none px-3 py-1.5 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-red-600/30 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-current" />
            -{discountPercent}%
          </Badge>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite?.(product); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 pointer-events-auto border ${isFav ? 'bg-red-600 border-red-500 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-black/50 border-white/10 text-white/70 hover:bg-white hover:text-black hover:scale-110'}`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image Section */}
      <Link to={productPath(product)} className="relative h-[320px] bg-gradient-to-b from-[#111] to-[#0a0a0a] overflow-hidden flex items-center justify-center p-8 group block">
        {/* Glow Behind Image */}
        <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"></div>

        <img
          src={product.image || product.image_url || 'https://placehold.co/600x600/111/444?text=PREMIUM+DEAL'}
          alt={product.name}
          className="w-full h-full object-contain relative z-10 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.15]"
        />

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
          <Button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(productPath(product)); }}
            className="w-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 rounded-lg h-12 font-bold transition-all duration-300 uppercase tracking-widest text-xs"
          >
            Details ansehen <Eye className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.2em] truncate mr-2">
            {product.categories?.name || 'Limited Edition'}
          </span>
          <div className="flex gap-0.5 whitespace-nowrap">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Sparkles key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            ))}
          </div>
        </div>

        {/* Title */}
        <Link to={productPath(product)} className="group-hover:text-red-500 transition-colors duration-300">
          <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 mb-6">
            {product.name}
          </h3>
        </Link>

        {/* Price & Cart (Pushed to bottom) */}
        <div className="mt-auto">
          {/* Stock indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '15%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
              />
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider whitespace-nowrap">Fast Ausverkauft</span>
          </div>

          <div className="flex items-end justify-between border-t border-white/5 pt-6">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/30 line-through mb-1">
                {oldPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
              <div className="flex items-start gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none">
                  {(Number(product.price || 0)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-lg font-bold text-red-500">€</span>
              </div>
            </div>

            <Button
              onClick={() => addToCart(product, 1)}
              className="bg-red-600 hover:bg-white hover:text-black hover:scale-105 text-white w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)] p-0 flex-shrink-0"
            >
              <ShoppingCart className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SpecialOffersPage = () => {
  const { products: allProducts, loading } = useStore();

  // Focus only on heavily discounted or premium products to fit the flash sale vibe
  const specialOffers = allProducts
    .filter(product => product.badge === 'Sale' || Number(product.price) < 150)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 12); // Limit for impact

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 border-t-4 border-red-600 rounded-full animate-spin"></div>
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Initialisiere Flash Sale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] selection:bg-red-600 selection:text-white">

      {/* Ultra Premium Cinematic Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
        {/* Dynamic Dark Background */}
        <div className="absolute inset-0 bg-black z-0">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070"
            className="w-full h-full object-cover opacity-[0.2] scale-[1.02] mix-blend-luminosity"
            alt="Dark Texture"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10" />

          {/* Glowing Orbs */}
          <div className="absolute top-1/4 -left-[10%] w-[40vw] h-[40vw] bg-red-600/20 blur-[150px] rounded-full mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-[-10%] w-[50vw] h-[30vw] bg-[#ff3333]/10 blur-[130px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_reverse]" />
        </div>

        <div className="container relative z-20 mx-auto px-4 text-center mt-12 md:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
              </span>
              <span className="text-red-500 text-xs font-black uppercase tracking-widest drop-shadow-md">Live Event</span>
            </div>

            {/* Massive Typography */}
            <h1 className="text-[12vw] sm:text-[8vw] lg:text-[120px] font-black text-white leading-[0.85] tracking-tighter mb-6 relative drop-shadow-2xl">
              BLACK<span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800">OUT</span><br />
              <span className="text-[8vw] sm:text-[5vw] lg:text-[80px] text-white/40 italic font-serif tracking-normal">DEALS</span>
            </h1>

            <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mt-2 mb-12 font-medium">
              Kompromisslose Premium-Hardware zu nie dagewesenen Konditionen. <br className="hidden md:block" />
              <span className="text-white drop-shadow-md">Strenge Limitierung. Zugang nur solange der Countdown läuft.</span>
            </p>

            <CountdownTimer />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 sm:mt-24 w-full flex justify-center"
            >
              <button
                onClick={() => document.getElementById('vault-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-4 text-white/30 hover:text-white transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                  Zugang zum Vault
                </span>
                <div className="w-10 h-16 rounded-full border border-current flex justify-center p-2 relative overflow-hidden">
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_2s_infinite] shadow-[0_0_10px_rgba(239,68,68,1)]" />
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filter / Nav Bar */}
      <div className="sticky top-[73px] sm:top-[85px] z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/10 p-2 sm:px-4 rounded-lg font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {['Alle Deals', 'Gaming', 'Komponenten', 'Zubehör'].map((tab, i) => (
              <button
                key={tab}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${i === 0 ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:bg-white/5 hover:border-white/20'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Vault (Products) */}
      <section id="vault-grid" className="py-24 sm:py-32 relative scroll-mt-24">
        {/* Background Details */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-4 drop-shadow-lg">
                The Vault <LockIcon />
              </h2>
              <p className="text-white/40 text-lg">Streng limitierte Kontingente. Wer zuerst kommt...</p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-lg backdrop-blur-md shadow-lg">
              <Tag className="w-5 h-5 text-red-500" />
              <span className="text-white font-bold">{specialOffers.length} DEALS AKTIV</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            <AnimatePresence>
              {specialOffers.length > 0 ? (
                specialOffers.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full py-32 flex flex-col items-center justify-center border border-white/5 rounded-[3rem] bg-white/[0.02]"
                >
                  <Package className="w-20 h-20 text-white/10 mb-6" />
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Vault Geschlossen</h3>
                  <p className="text-white/40">Der Flash Sale ist beendet oder alle Artikel sind vergriffen.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* VIP CTA */}
      <section className="relative py-32 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-red-600/5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-20 text-center overflow-hidden shadow-2xl relative group">
            {/* Hover FX */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

            <Badge className="bg-red-600 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.3em] rounded-full mb-8 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              VIP Zugang
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight leading-[1.1]">
              Dem Rest <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#ffb800] drop-shadow-sm">einen Schritt voraus</span>
            </h2>
            <p className="text-white/40 text-base md:text-lg mb-12 max-w-xl mx-auto">
              Zukünftige Flash Sales werden zuerst an unsere geschlossene VIP-Liste kommuniziert. Sichern Sie sich Ihren Vorteil.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto relative z-20">
              <input
                type="email"
                placeholder="Ihre E-Mail für den Early Access..."
                className="flex-1 bg-black border border-white/10 rounded-lg px-6 py-4 md:py-5 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-colors focus:ring-1 focus:ring-red-500 shadow-inner"
              />
              <Button className="bg-white text-black hover:bg-red-600 hover:text-white rounded-lg px-10 py-4 md:py-5 h-auto font-black uppercase tracking-widest transition-all duration-300">
                Beitreten
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default SpecialOffersPage;