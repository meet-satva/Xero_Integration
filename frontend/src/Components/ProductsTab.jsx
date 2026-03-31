import React, { useState, useEffect } from 'react';
import { authService } from '../api/xeroClient';

const ProductsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false); // Loader for creation
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', unitPrice: 0, description: '' });

  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await authService.getProducts(userId);
      // Access the "Items" property from your API response
      setItems(data && data.Items ? data.Items : []);
    } catch (err) { 
      console.error(err); 
      setItems([]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); // Start button loader
    try {
      await authService.createProduct({ ...formData, userId });
      setShowModal(false);
      setFormData({ name: '', code: '', unitPrice: 0, description: '' }); // Reset form
      await fetchData(); // Refresh list
    } catch (err) { 
      alert("Failed to create product"); 
    } finally {
      setCreating(false); // Stop button loader
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Inventory Items</h2>
          <p className="text-slate-400 text-sm font-medium">Manage your Xero product catalog</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          Create New Product
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-[10px]">Fetching Inventory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={item.ItemID || i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{item.Code}</span>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📦</div>
              <h4 className="font-bold text-slate-900 line-clamp-1">{item.Name}</h4>
              <p className="text-slate-400 text-xs mt-1 mb-4 line-clamp-2 min-h-[2rem]">{item.Description || 'No description provided'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-sm font-black text-blue-600">
                  ${item.SalesDetails?.UnitPrice ? parseFloat(item.SalesDetails.UnitPrice).toFixed(2) : "0.00"}
                </span>
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">No Products Found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <h3 className="text-3xl font-black mb-8 tracking-tight">New Product</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Item Name</label>
                <input placeholder="Digital Service A" className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none" 
                  onChange={e => setFormData({...formData, name: e.target.value})} required/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">SKU Code</label>
                <input placeholder="SKU-001" className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none" 
                  onChange={e => setFormData({...formData, code: e.target.value})} required/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Price ($)</label>
                <input type="number" step="0.01" placeholder="49.99" className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none" 
                  onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value)})} required/>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Description</label>
                <textarea rows="3" placeholder="Detailed item details..." className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none resize-none" 
                  onChange={e => setFormData({...formData, description: e.target.value})}/>
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Dismiss</button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Submit to Xero"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;