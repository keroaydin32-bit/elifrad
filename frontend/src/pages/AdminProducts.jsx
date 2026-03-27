import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, Edit3, Package, Layers, Tag, Eye } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

const AdminProducts = () => {
  const { products, loading, refreshData } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  async function toggleProductStatus(id, isActive) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !isActive })
      .eq("id", id);
    if (!error) {
      toast.success("Ürün durumu güncellendi");
      refreshData(true);
    }
  }

  async function deleteProduct(id) {
    const ok = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");
    if (ok) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        toast.success("Ürün silindi");
        refreshData(true);
      }
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="p-6 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">🛍️ Ürün Kataloğu</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Ürün adı veya SKU..."
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm outline-none focus:border-red-600 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-9">
            <Plus className="w-4 h-4 mr-2" />
            YENİ ÜRÜN
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
              <th className="py-4 px-2">Görsel</th>
              <th className="py-4 px-2">Ürün Adı</th>
              <th className="py-4 px-2">Fiyat</th>
              <th className="py-4 px-2">Stok</th>
              <th className="py-4 px-2 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 animate-pulse">Yükleniyor...</td></tr>
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                <td className="py-4 px-2">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 p-1 border border-gray-100 dark:bg-white/5 dark:border-white/5 overflow-hidden">
                    <img src={p.image || p.image_url} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="text-sm font-bold dark:text-white line-clamp-1">{p.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{p.sku || "KOD_YOK"}</div>
                </td>
                <td className="py-4 px-2 font-black dark:text-white">€{p.price?.toFixed(2)}</td>
                <td className="py-4 px-2">
                  <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`}>
                    {p.stock || 0} Adet
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => toggleProductStatus(p.id, p.is_active)} className={`p-2 rounded-lg transition-all ${p.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {p.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200"><Edit3 className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
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

export default AdminProducts;
