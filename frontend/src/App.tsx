import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-10 font-black">
      {/* Navbar Brutalista */}
      <header className="brutal-card-navy mb-10 flex justify-between items-center py-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center text-black text-2xl">U</div>
          <span className="text-3xl tracking-tighter italic">UGMA REUNIONES</span>
        </div>
        <button onClick={() => window.location.href='/login'} className="brutal-btn">ACCESO</button>
      </header>

      <main className="grid grid-cols-12 gap-8">
        {/* Hero Section */}
        <div className="col-span-12 lg:col-span-8 brutal-card-gold flex flex-col justify-center">
          <h1 className="text-7xl md:text-9xl leading-[0.8] mb-8">PLANIFICA.<br/>CONTROLA.<br/>DECIDE.</h1>
          <p className="text-2xl max-w-xl font-bold bg-black text-white p-2 inline-block">SISTEMA INTEGRAL ADMINISTRATIVO UGMA</p>
        </div>

        {/* Info Blocks */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="brutal-card bg-[#002855] text-white">
            <h3 className="text-4xl mb-4 italic">2026</h3>
            <p className="text-sm font-bold uppercase tracking-widest">Ciudad Guayana, Venezuela</p>
          </div>
          <div className="brutal-card bg-white">
            <h3 className="text-4xl mb-4">4 ESCUELAS</h3>
            <p className="font-bold text-slate-500">INGENIERÍA • FACES • DERECHO • PSICOLOGÍA</p>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="col-span-12 brutal-card bg-black text-white text-center py-4">
          <p className="text-xs tracking-[0.5em]">UNIVERSIDAD NORORIENTAL PRIVADA GRAN MARISCAL DE AYACUCHO</p>
        </div>
      </main>
    </div>
  );
};

const Login = () => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ firstName: 'Sebastian', lastName: 'Herrera', role: 'Administrador' }));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FFB81C] flex items-center justify-center p-6">
      <div className="brutal-card bg-white max-w-lg w-full space-y-10">
        <div className="border-b-4 border-black pb-6">
          <h2 className="text-6xl font-black italic tracking-tighter">LOGIN_</h2>
          <p className="font-bold uppercase text-sm mt-2">Introduce tus credenciales</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest">Email_</label>
            <input type="email" className="brutal-input" placeholder="admin@ugma.edu.ve" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest">Password_</label>
            <input type="password" className="brutal-input" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full brutal-btn-navy text-2xl py-6">
            ENTRAR →
          </button>
        </form>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
