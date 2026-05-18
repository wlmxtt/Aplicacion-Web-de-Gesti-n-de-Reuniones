import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Key, GraduationCap, Lock } from 'lucide-react';

const Login = () => {
  const { login, error, clearError } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Error de autenticación. Verifique sus credenciales institucionales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 font-black flex flex-col justify-center items-center relative select-none">
      
      {/* Header Fijo */}
      <header className="mb-8 text-center space-y-2 max-w-md w-full">
        <div className="inline-flex items-center space-x-3 bg-[#002855] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-1.5">
          <GraduationCap className="w-6 h-6 text-[#FFB81C]" />
          <span className="text-xl tracking-tighter italic font-black uppercase">UGMA_REUNIONES</span>
        </div>
        <h1 className="text-2xl md:text-3xl tracking-tighter uppercase font-black">Control de Gestión Administrativa</h1>
      </header>

      {/* Formulario de Login Centrado Profesional */}
      <div className="max-w-md w-full brutal-card-gold p-2 animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-4 border-black p-6 md:p-8 space-y-6">
          
          <div className="border-b-4 border-black pb-4 text-center">
            <h3 className="text-3xl italic tracking-tighter uppercase font-black flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-[#002855]" /> IDENTIFICACIÓN_
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Ingresa tus credenciales institucionales
            </p>
          </div>

          {(localError || error) && (
            <div className="bg-red-500 border-4 border-black text-white p-3 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Error: {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1">Correo Electrónico_</label>
              <div className="relative">
                <input
                  type="email"
                  className="brutal-input pr-10 text-sm"
                  placeholder="ejemplo@ugma.edu.ve"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <UserCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1">Contraseña_</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="brutal-input pr-10 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black font-black font-mono text-xs"
                >
                  {showPassword ? 'OCULTAR' : 'VER'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full brutal-btn-navy py-3.5 text-lg flex items-center justify-center space-x-2 mt-4"
            >
              <span>{loading ? 'ACCEDIENDO...' : 'INGRESAR AL SISTEMA →'}</span>
            </button>
          </form>

          {/* Advertencia de Auditoría de Producción en el Pie de la Ficha */}
          <div className="bg-slate-50 border-2 border-black p-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-center leading-relaxed">
            🔒 SISTEMA MONITOREADO: Todas las operaciones están sujetas a los registros de auditoría de la Universidad Gran Mariscal de Ayacucho.
          </div>

        </div>
      </div>

      <footer className="mt-8 text-slate-400 text-xs tracking-widest uppercase">
        © 2026 UGMA - Universidad Gran Mariscal de Ayacucho • Portal de Gestión de Reuniones
      </footer>
    </div>
  );
};

export default Login;
