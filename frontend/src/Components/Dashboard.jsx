import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import { authService } from '../api/xeroClient';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId') || localStorage.getItem("userId");
      const tenantId = params.get('tenantId');

  
    if (userId) {
      localStorage.setItem("userId", userId);
      
    }
    if (tenantId) {
      localStorage.setItem("tenantId", tenantId);
    }
      const storedName = localStorage.getItem('userName');
      
      setUserName(storedName || 'User');
      
      try {
        const { data } = await authService.getCompanies(userId);
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans text-slate-900 selection:bg-blue-100">
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            XeroSync
          </span>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
          <div className="hidden sm:block px-2 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account</p>
            <p className="text-sm font-bold text-slate-700 leading-tight">{userName}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-blue-600 text-sm">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              System Live
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900">Organizations</h1>
            <p className="text-slate-500 font-medium text-lg max-w-md">Your real-time consolidated view of all connected Xero legal entities.</p>
          </div>
          
          <button 
            onClick={() => authService.connectXero()}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add New Entity
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Fetching Ledger Data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <div key={company.xeroTenantId} className="relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 group overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-6">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-sm"></span>
                  </span>
                </div>
                
                <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl mb-8 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all duration-500">
                  <span className="font-black text-2xl">
                    {company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {company.companyName}
                </h3>
                
                <div className="flex items-center gap-2 mb-10">
                  <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Active
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    Xero Cloud
                  </div>
                </div>
                
                <button onClick={() => navigate(`/entity/${company.xeroTenantId}`)} className="w-full py-4 bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white rounded-[1.25rem] text-xs font-black tracking-widest uppercase transition-all duration-300">
                  Open Dashboard
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => authService.connectXero()}
              className="group relative border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner text-center">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"  onClick={() => authService.connectXero()}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest group-hover:text-blue-600">Sync New Tenant</span>
              <p className="text-[10px] font-medium mt-2 opacity-60">Authorize another Xero legal entity</p>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;