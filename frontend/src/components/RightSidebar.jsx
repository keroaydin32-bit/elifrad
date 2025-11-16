import React from 'react';

const RightSidebar = () => {
  return (
    <aside className="w-80 space-y-6">
      {/* New Collection Banner */}
      <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-8 text-center">
        <h3 className="text-white text-2xl font-bold mb-2">NEW COLLECTION</h3>
        <p className="text-red-500 text-sm font-semibold mb-4">SHOP NOW</p>
        <div className="flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop" 
            alt="Smart Speaker"
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>

      {/* Smart Watch Banner */}
      <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-8 text-center">
        <h3 className="text-white text-2xl font-bold mb-2">SMART WATCH</h3>
        <p className="text-red-500 text-sm font-semibold mb-4">SHOP NOW</p>
        <div className="flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&fit=crop" 
            alt="Smart Watch"
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
