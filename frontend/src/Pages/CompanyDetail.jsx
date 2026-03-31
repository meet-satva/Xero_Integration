import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomersTab from '../Components/CustomersTab';
import ProductsTab from '../Components/ProductsTab';
import InvoicesTab from '../Components/InvoicesTab';
import { authService } from '../api/xeroClient';

const CompanyDetail = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const tabs = [
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'products', label: 'Inventory', icon: '📦' },
    { id: 'invoices', label: 'Invoices', icon: '🧾' },
  ];

  const handleDisconnect = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    if (window.confirm("Are you sure you want to disconnect this Xero organization?")) {
      setIsDisconnecting(true);
      try {
        await authService.disconnectXero(userId);
        //localStorage.removeItem("tenantId");
        navigate('/dashboard');
      } catch (error) {
        console.error("Disconnect failed:", error);
        alert("Failed to disconnect Xero.");
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">X</div>
             <span className="font-black tracking-tighter text-lg uppercase">Command Center</span>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isDisconnecting ? 'Processing...' : 'Disconnect'}
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'customers' && <CustomersTab tenantId={tenantId} />}
          {activeTab === 'products' && <ProductsTab tenantId={tenantId} />}
          {activeTab === 'invoices' && <InvoicesTab tenantId={tenantId} />}
        </div>
      </main>
    </div>
  );
};

export default CompanyDetail;