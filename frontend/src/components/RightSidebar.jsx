import React from 'react';

const RightSidebar = () => {
  return (
    <aside className="w-72 space-y-4">
      {/* New Collection Banner */}
      <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-6 text-center rounded shadow">
        <h3 className="text-white text-xl font-bold mb-1">NEW COLLECTION</h3>
        <p className="text-red-500 text-xs font-semibold mb-3">SHOP NOW</p>
        <div className="flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=250&h=250&fit=crop" 
            alt="Smart Speaker"
            className="w-36 h-36 object-contain"
          />
        </div>
      </div>

      {/* Smart Watch Banner */}
      <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-6 text-center rounded shadow">
        <h3 className="text-white text-xl font-bold mb-1">SMART WATCH</h3>
        <p className="text-red-500 text-xs font-semibold mb-3">SHOP NOW</p>
        <div className="flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=250&h=250&fit=crop" 
            alt="Smart Watch"
            className="w-36 h-36 object-contain"
          />
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
