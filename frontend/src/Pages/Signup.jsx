import React from 'react';

const Signup = () => {
  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white order-2 lg:order-1">
        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mt-2 font-medium">Join 5,000+ companies automating their Xero flow.</p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
              <input type="text" placeholder="Last Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
            </div>
            <input type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
            <input type="password" placeholder="Create Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
            
            <button className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98]">
              Get Started
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm">
            By signing up, you agree to our <span className="text-slate-900 font-bold underline cursor-pointer">Terms</span>.
          </p>
          <p className="text-center mt-4 text-slate-600 font-medium">
            Already registered? <a href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign In</a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-50/50 items-center justify-center p-12 order-1 lg:order-2 overflow-hidden">
        <div className="relative group text-center">
          <img 
            src="http://googleusercontent.com/image_collection/image_retrieval/17586074853946270337_0" 
            className="w-full max-w-xl h-auto drop-shadow-3xl transform group-hover:-translate-y-4 transition-transform duration-1000 ease-in-out" 
            alt="Data Visualization" 
          />
          <div className="mt-12 space-y-4 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Automated Reporting</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Let our system handle the heavy lifting. Beautiful, board-ready reports generated directly from your Xero ledger in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;