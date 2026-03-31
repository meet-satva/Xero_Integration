import React, { useState, useEffect } from 'react';
import { authService } from '../api/xeroClient';

const InvoicesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ contactName: '', description: '', amount: 0 });

  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await authService.getInvoices(userId);
      setItems(data?.Invoices || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await authService.createInvoice({ ...formData, userId });
      setShowModal(false);
      setFormData({ contactName: '', description: '', amount: 0 });
      await fetchData();
    } catch (err) {
      alert("Invoice creation failed");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Billing Center</h2>
          <p className="text-slate-400 text-sm font-medium">Issue and track accounts receivable</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
        >
          Raise New Invoice
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fetching Ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((inv) => (
                  <tr key={inv.InvoiceID} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{inv.Contact?.Name || 'Unknown Contact'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {inv.InvoiceID?.slice(-8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {inv.InvoiceNumber}
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-900">
                        {inv.CurrencyCode} {parseFloat(inv.Total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        inv.Status === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {inv.Status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <p className="text-slate-300 font-bold text-sm uppercase tracking-widest">No invoices found in Xero</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black tracking-tight">Invoice</h3>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">🧾</div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Contact Name</label>
                <input 
                  placeholder="Client / Company Name" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none border-none" 
                  onChange={e => setFormData({...formData, contactName: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Total Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none border-none" 
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Memo / Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Consultation services..." 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none border-none resize-none" 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-5 text-xs font-black uppercase text-slate-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Send Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;