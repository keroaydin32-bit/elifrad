import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Send, Loader2, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const Footer = () => {
  const { shopSettings } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const primaryColor = shopSettings?.primaryColor || '#dc2626';

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          toast.info('Sie sind bereits angemeldet!');
        } else {
          throw error;
        }
      } else {
        toast.success('Erfolgreich zum Newsletter angemeldet!');
        setEmail('');
      }
    } catch (err) {
      console.error('Newsletter Error:', err);
      toast.error('Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Helper to find return policy link
  const returnPolicyDoc = shopSettings?.legalDocs?.find(doc =>
    doc.label.toLowerCase().includes('widerruf') ||
    doc.label.toLowerCase().includes('rücksendung') ||
    doc.label.toLowerCase().includes('retoure')
  );

  return (
    <footer className="bg-gray-900 dark:bg-[#050505] text-gray-300 transition-colors border-t border-gray-100 dark:border-white/10">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-display font-bold mb-6 tracking-wide">
              {shopSettings?.shopName?.toUpperCase() || 'ELECTRIVE'}
            </h3>
            <p className="text-sm mb-6 text-gray-400 leading-relaxed font-bold">
              {shopSettings?.footerDescription || shopSettings?.shopTagline || 'Ihr Spezialist für Elektronik & Lifestyle'}
            </p>

            <ul className="space-y-3 text-sm mb-8 text-gray-400">
              {(shopSettings?.companyStreet || shopSettings?.companyZip || shopSettings?.companyCity) && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                  <span>
                    {shopSettings?.companyStreet && <span>{shopSettings.companyStreet}<br /></span>}
                    {shopSettings?.companyZip} {shopSettings?.companyCity}
                  </span>
                </li>
              )}
              {shopSettings?.supportPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                  <a href={`tel:${shopSettings.supportPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    {shopSettings.supportPhone}
                  </a>
                </li>
              )}
              {shopSettings?.supportEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                  <a href={`mailto:${shopSettings.supportEmail}`} className="hover:text-white transition-colors">
                    {shopSettings.supportEmail}
                  </a>
                </li>
              )}
            </ul>

            <div className="flex gap-3">
              {shopSettings?.facebookUrl && (
                <a href={shopSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {shopSettings?.twitterUrl && (
                <a href={shopSettings.twitterUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-700 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {shopSettings?.instagramUrl && (
                <a href={shopSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {shopSettings?.youtubeUrl && (
                <a href={shopSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-display font-bold mb-6">Wichtige Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/alle-kategorien" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Alle Kategorien</Link></li>
              <li><Link to="/marken" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Hersteller</Link></li>
              <li><Link to="/uber-uns" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Über Uns</Link></li>
              <li><Link to="/kontakt" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Kontakt</Link></li>
              <li><Link to="/versandinformationen" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Versandinformationen</Link></li>

              {shopSettings?.legalDocs?.map((doc) => (
                <li key={doc.id}>
                  <Link to={`/legal/${doc.id}`} className="hover:text-white transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-display font-bold mb-6">Kundenservice</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Mein Konto</Link></li>
              <li><Link to="/account?tab=Bestellungen" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Bestellhistorie</Link></li>
              <li><Link to="/account?tab=Favoriten" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Wunschliste</Link></li>
              <li>
                <button
                  onClick={() => document.getElementById('footer-newsletter')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors text-left flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Newsletter
                </button>
              </li>
              <li>
                {returnPolicyDoc ? (
                  <Link to={`/legal/${returnPolicyDoc.id}`} className="hover:text-white transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Rücksendungen
                  </Link>
                ) : (
                  <Link to="/versandinformationen" className="hover:text-white transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} /> Rücksendungen
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div id="footer-newsletter">
            <h3 className="text-white text-lg font-display font-bold mb-6">
              {shopSettings?.newsletterTitle || 'Newsletter'}
            </h3>
            <p className="text-sm mb-6 text-gray-400">
              {shopSettings?.newsletterDescription || 'Abonnieren Sie unseren Newsletter für Sonderangebote, Geschenke und Updates.'}
            </p>
            <form onSubmit={handleSubscribe} className="flex bg-gray-800 rounded-full p-1 border border-gray-700 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600/50 transition-all">
              <input
                type="email"
                placeholder="Ihre E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2 bg-transparent text-white focus:outline-none text-sm placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 text-white font-semibold rounded-full transition-all text-sm shadow-lg hover:shadow-red-600/30 flex items-center gap-2"
              >
                {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Anmelden'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 dark:border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>
              {shopSettings?.footerCopyright ||
                `© ${new Date().getFullYear()} ${shopSettings?.shopName?.toUpperCase() || 'ELECTRIVE'}. Alle Rechte vorbehalten.`}
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-4 md:mt-0 items-center">
              {shopSettings?.paymentIcons && shopSettings.paymentIcons.length > 0 ? (
                shopSettings.paymentIcons.map((icon) => (
                  <div
                    key={icon.id}
                    title={icon.name}
                    className="bg-white px-2 py-1 rounded flex items-center justify-center h-8 min-w-[3rem] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-gray-100 dark:border-transparent"
                  >
                    <img src={icon.url} alt={icon.name} className="h-full object-contain max-w-full" />
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white px-1.5 py-0.5 rounded flex items-center justify-center h-8 w-12 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-full object-contain" />
                  </div>
                  <div className="bg-white px-1.5 py-0.5 rounded flex items-center justify-center h-8 w-12 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-full object-contain" />
                  </div>
                  <div className="bg-white px-1.5 py-0.5 rounded flex items-center justify-center h-8 w-12 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="PayPal" className="h-full object-contain" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
