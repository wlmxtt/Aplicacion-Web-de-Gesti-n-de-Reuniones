import React, { useState, useEffect } from 'react';
import CreateMeetingModal from '../components/CreateMeetingModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({ firstName: 'Usuario', lastName: 'UGMA', role: 'Administrador' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col lg:flex-row font-black">
      {/* Sidebar Brutalista */}
      <aside className="w-full lg:w-80 bg-white border-r-4 border-black p-8 flex flex-col space-y-10">
        <div className="flex items-center space-x-4 border-b-4 border-black pb-8">
          <div className="w-12 h-12 bg-[#002855] border-4 border-black text-white flex items-center justify-center text-2xl">U</div>
          <span className="text-3xl tracking-tighter italic">UGMA_HUB</span>
        </div>

        <nav className="flex-1 space-y-4">
          {['Dashboard', 'Reuniones', 'Actas', 'Personal'].map((item, i) => (
            <button key={item} className={`w-full text-left p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${i === 0 ? 'bg-[#FFB81C]' : 'bg-white'}`}>
              {item}
            </button>
          ))}
        </nav>

        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="brutal-btn-navy w-full text-sm">
          CERRAR_SESIÓN
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="brutal-card bg-white py-4 px-10">
            <h1 className="text-5xl md:text-7xl tracking-tighter italic uppercase">Panel_Principal</h1>
          </div>
          <div className="brutal-card bg-[#FFB81C] py-4 px-8">
            <p className="text-xs uppercase tracking-[0.3em]">Usuario Activo</p>
            <p className="text-2xl">{user.firstName} {user.lastName}</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { l: 'REUNIONES', v: '14', c: 'bg-white' },
            { l: 'ASISTENCIA', v: '92%', c: 'bg-white' },
            { l: 'ESCUELAS', v: '04', c: 'bg-[#FFB81C]' }
          ].map((stat) => (
            <div key={stat.l} className={`brutal-card ${stat.c}`}>
              <p className="text-xs uppercase tracking-widest mb-2">{stat.l}</p>
              <p className="text-7xl tracking-tighter">{stat.v}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-10">
          <h2 className="text-4xl italic tracking-tighter uppercase underline decoration-4 underline-offset-8">Minutas_Recientes</h2>
          <button onClick={() => setIsModalOpen(true)} className="brutal-btn bg-black text-white">
            + NUEVA_REUNIÓN
          </button>
        </div>

        {/* Meeting List */}
        <div className="space-y-6">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="brutal-card bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-[#f0f0f0] transition-colors cursor-pointer">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-black text-[#FFB81C] flex flex-col items-center justify-center border-4 border-black">
                  <span className="text-xs font-bold uppercase">May</span>
                  <span className="text-4xl">1{i}</span>
                </div>
                <div>
                  <h4 className="text-3xl tracking-tighter italic">REVISIÓN_CURRÍCULO_ING</h4>
                  <p className="font-bold text-slate-500 uppercase tracking-widest">SALA DE JUNTAS A • 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest">PENDIENTE</span>
                <div className="w-10 h-10 border-4 border-black flex items-center justify-center font-black">→</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && <CreateMeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;
