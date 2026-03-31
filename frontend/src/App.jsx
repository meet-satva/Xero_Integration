import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Dashboard from "./Components/Dashboard";
import CompanyDetail from "./Pages/CompanyDetail";

const App = () => {
  return (
    <Router>
      <div className="antialiased font-sans bg-slate-950 min-h-screen">
        <Routes>
        
          <Route path="/" element={<Navigate to="/login" replace />} />

        
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entity/:tenantId" element={<CompanyDetail />} />
        
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center h-screen text-white">
                <h1 className="text-2xl font-light tracking-widest uppercase">404 | Page Not Found</h1>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;