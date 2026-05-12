import React, { useState } from 'react';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, onCreated }: CreateMeetingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCreated();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="brutal-card bg-white max-w-2xl w-full relative z-10 space-y-8 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b-4 border-black pb-6">
          <div>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase">Nueva_Reunión</h2>
            <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Formulario Administrativo</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 border-4 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
            <span className="text-3xl font-black">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1">Título de la Minuta_</label>
            <input type="text" className="brutal-input" placeholder="Ej. Planificación Semestral" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1">Fecha_</label>
              <input type="date" className="brutal-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1">Hora_</label>
              <input type="time" className="brutal-input" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1">Ubicación_</label>
            <input type="text" className="brutal-input" placeholder="Sala A / Google Meet" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1">Agenda Inicial_</label>
            <textarea rows={3} className="brutal-input resize-none" placeholder="Puntos clave..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="pt-6 flex space-x-6">
            <button type="button" onClick={onClose} className="flex-1 font-black uppercase tracking-widest hover:underline">
              CANCELAR
            </button>
            <button type="submit" disabled={loading} className="flex-[2] brutal-btn-navy text-xl">
              {loading ? 'REGISTRANDO...' : 'CONFIRMAR REUNIÓN →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
