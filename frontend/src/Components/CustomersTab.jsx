import React, { useState, useEffect } from 'react';
import { authService } from '../api/xeroClient';

const CustomersTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailAddress: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const userId = localStorage.getItem('userId');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await authService.getCustomers(userId);
      setItems(data?.Contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await authService.createCustomer({ ...formData, userId });
      setShowModal(false);
      setFormData({ name: '', emailAddress: '', firstName: '', lastName: '', phone: '' });
      fetchData();
    } catch (err) {
      alert("Error creating customer");
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Customer Ledger</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Xero Directory</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
        >
          Add Customer
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Data</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c) => (
            <div key={c.ContactID} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center font-black text-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                {c.Name?.charAt(0)}
              </div>
              <h4 className="font-bold text-xl text-slate-900 mb-1">{c.Name}</h4>
              <p className="text-slate-400 text-sm mb-2">{c.EmailAddress || 'No email'}</p>
              {c.Phones?.PhoneNumber && (
                 <p className="text-slate-300 text-[11px] font-bold mb-6">{c.Phones.PhoneNumber}</p>
              )}
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ref: {c.ContactID?.slice(-6)}</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black mb-8 tracking-tighter">New Customer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Organization Name</label>
                <input 
                  placeholder="e.g. Acme Corp" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none border-none transition-all" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">First Name</label>
                  <input 
                    placeholder="John" 
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none border-none" 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Last Name</label>
                  <input 
                    placeholder="Doe" 
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none border-none" 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
                <input 
                  type="email"
                  placeholder="contact@company.com" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none border-none" 
                  onChange={e => setFormData({...formData, emailAddress: e.target.value})} 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Phone Number</label>
                <input 
                  placeholder="+1 (555) 000-0000" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none border-none" 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Create Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;