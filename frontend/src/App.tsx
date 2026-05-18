import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { GraduationCap, ArrowRight, ShieldCheck, FileText, CheckSquare, Sparkles } from 'lucide-react';

const Landing = () => {
  const { token } = useApp();

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 lg:p-10 font-black flex flex-col justify-between">
      {/* Navbar Brutalista */}
      <header className="bg-[#002855] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 flex flex-col sm:flex-row justify-between items-center py-4 px-6 lg:px-8 gap-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center text-black text-2xl font-black italic">
            U
          </div>
          <div>
            <span className="text-2xl tracking-tighter italic block font-black uppercase">UGMA_REUNIONES</span>
            <span className="text-[9px] tracking-widest text-[#FFB81C] font-bold block uppercase">Plataforma Administrativa</span>
          </div>
        </div>

        <Link 
          to={token ? "/dashboard" : "/login"} 
          className="brutal-btn bg-[#FFB81C] text-black text-xs py-3 px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all block text-center"
        >
          {token ? "IR AL PANEL →" : "ACCEDER AL PORTAL →"}
        </Link>
      </header>

      <main className="grid grid-cols-12 gap-8 flex-1 items-stretch">
        {/* Hero Section */}
        <div className="col-span-12 lg:col-span-7 brutal-card-gold flex flex-col justify-between p-8 min-h-[400px]">
          <div>
            <div className="inline-flex items-center space-x-2 bg-black text-white px-3 py-1 text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4 text-[#FFB81C]" />
              <span>Innovación UGMA 2026</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl leading-[0.8] mb-8 font-black uppercase tracking-tighter italic">
              CONVOCA.<br/>DECIDE.<br/>ACTÚA.
            </h1>
          </div>

          <div>
            <p className="text-xl md:text-2xl max-w-xl font-bold bg-black text-white p-3 inline-block leading-tight border-2 border-white">
              SISTEMA CENTRALIZADO PARA LA PLANIFICACIÓN Y SEGUIMIENTO DE ACUERDOS DE LAS 4 ESCUELAS INSTITUCIONALES.
            </p>
          </div>
        </div>

        {/* Info Blocks / Features */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between gap-8">
          
          {/* Card: Escuelas */}
          <div className="brutal-card bg-white flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl italic uppercase border-b-4 border-black pb-2 mb-3">4 Escuelas_</h3>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs leading-relaxed">
                Organización de reuniones e intercambio administrativo optimizado y directo para:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center text-[10px] font-black uppercase tracking-wider">
              <div className="bg-[#002855]/10 text-[#002855] p-2 border-2 border-[#002855] font-bold">INGENIERÍA</div>
              <div className="bg-[#FFB81C]/15 text-[#b07d0d] p-2 border-2 border-[#FFB81C] font-bold">FACES</div>
              <div className="bg-[#002855]/10 text-[#002855] p-2 border-2 border-[#002855] font-bold">DERECHO</div>
              <div className="bg-[#FFB81C]/15 text-[#b07d0d] p-2 border-2 border-[#FFB81C] font-bold">PSICOLOGÍA</div>
            </div>
          </div>

          {/* Card: Core Scopes */}
          <div className="brutal-card bg-[#002855] text-white flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl italic uppercase border-b-4 border-black pb-2 mb-3 text-[#FFB81C]">Control_Total</h3>
              <ul className="space-y-2 text-xs font-bold uppercase tracking-wide">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFB81C] shrink-0" />
                  <span>Roles Directivos y Permisos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#FFB81C] shrink-0" />
                  <span>Registro de Minutas y Firmas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-[#FFB81C] shrink-0" />
                  <span>Confirmación de Asistencia y Propuestas</span>
                </li>
              </ul>
            </div>
            
            <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-4">
              Auditoría digital • Universidad Gran Mariscal de Ayacucho
            </p>
          </div>

        </div>

      </main>

      {/* Footer Banner */}
      <footer className="col-span-12 brutal-card bg-black text-white text-center py-4 mt-10 print:hidden">
        <p className="text-[10px] tracking-[0.3em] font-bold uppercase">
          © 2026 UNIVERSIDAD NORORIENTAL PRIVADA GRAN MARISCAL DE AYACUCHO • VICERRECTORADO ACADÉMICO
        </p>
      </footer>
    </div>
  );
};

// Route protector Component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center font-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFB81C] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-mono">Verificando Sesión...</p>
        </div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
