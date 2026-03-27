import React, { useState, useEffect } from "react";
import { Search, Package, Truck, CheckCircle, XCircle, Eye } from "lucide-react";
import { supabase } from "../supabase";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Siparişler yüklenemedi: " + error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Güncelleme başarısız.");
    } else {
      toast.success("Sipariş durumu güncellendi.");
      fetchOrders();
    }
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customers?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">📦 Siparişler</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Sipariş ID veya E-posta..."
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm outline-none focus:border-red-600 transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
              <th className="py-4 px-2">ID</th>
              <th className="py-4 px-2">Müşteri</th>
              <th className="py-4 px-2">Tutar</th>
              <th className="py-4 px-2">Durum</th>
              <th className="py-4 px-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 animate-pulse text-gray-400">Yükleniyor...</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                <td className="py-4 px-2 text-xs font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                <td className="py-4 px-2">
                  <div className="text-sm font-bold dark:text-white">{order.customers?.name || "Misafir"}</div>
                  <div className="text-[11px] text-gray-400 font-medium">{order.customers?.email}</div>
                </td>
                <td className="py-4 px-2 font-black dark:text-white">€{order.total_amount?.toFixed(2)}</td>
                <td className="py-4 px-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    {order.status === 'pending' && (
                       <button 
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                       >
                        <Truck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
