import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const RightSidebar = () => {
  const { shopSettings } = useStore();
  const navigate = useNavigate();

  const banners = shopSettings?.sideBanners || [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=600&fit=crop",
      title: "MAGURA",
      subtitle: "Bremsen",
      color: "#ef4444",
      link: ""
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=600&h=600&fit=crop",
      title: "BOSCH",
      subtitle: "E-Bike Systeme",
      color: "#60a5fa",
      link: ""
    }
  ];

  const handleBannerClick = (link) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <aside className="w-72 flex flex-col gap-4 h-[550px]">
      {banners.map((banner) => (
        <div
          key={banner.id}
          onClick={() => handleBannerClick(banner.link)}
          className={`h-[calc(50%-8px)] relative text-center rounded-sm shadow-lg flex flex-col items-center justify-end pb-6 overflow-hidden group ${banner.link ? 'cursor-pointer' : ''}`}
        >
          {/* Background Image */}
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

          {/* Content */}
          <div className="relative z-10 transition-transform duration-500 group-hover:translate-y-[-5px]">
            <h3 className="text-white text-2xl font-display font-extrabold mb-1 tracking-tight drop-shadow-lg uppercase">
              {banner.title}
            </h3>
            <p
              className="text-[10px] font-black tracking-[0.3em] uppercase"
              style={{ color: banner.color || '#ef4444' }}
            >
              {banner.subtitle}
            </p>

          </div>
        </div>
      ))}
    </aside>
  );
};

export default RightSidebar;
