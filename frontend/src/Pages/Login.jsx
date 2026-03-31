import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/xeroClient';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: ''});

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await authService.login(formData);
      
      if (data.userId && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans selection:bg-blue-100 overflow-hidden text-slate-900">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-slate-50/50 h-full border-r border-slate-100">
        <div className="relative w-full max-w-lg transform hover:scale-[1.01] transition-transform duration-700">
          <img 
            src="http://googleusercontent.com/image_collection/image_retrieval/3423173174759853334_0" 
            className="w-full h-auto drop-shadow-2xl rounded-2xl" 
            alt="Dashboard Illustration" 
          />
          <div className="mt-8 text-center px-4">
            <h2 className="text-2xl font-bold tracking-tight">Financial Intelligence</h2>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">
              Seamlessly sync your Xero data and unlock deep insights instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white h-full">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <div className="w-3 h-3 border-2 border-white rounded-sm rotate-45"></div>
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">XeroSync</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your details to access portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="alex@company.com"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-3 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button 
            type="button"
            onClick={() => authService.connectXero()}
            className="w-full py-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <img src="https://upload.wikimedia.org/wikipedia/en/9/9f/Xero_software_logo.svg" className="w-5 h-5" alt="Xero" />
            Connect via Xero
          </button>

          <p className="text-center mt-8 text-slate-500 text-xs font-medium">
            New here? <button type="button" onClick={() => navigate('/signup')} className="text-blue-600 font-bold hover:underline underline-offset-4 ml-1">Create Identity</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;