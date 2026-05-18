import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, Clock, MapPin, AlignLeft, CheckSquare } from 'lucide-react';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { createMeeting, users, user, schools } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter out the logged-in user from the potential guest list
  const availableGuests = users.filter((u) => u.id !== user?.id);

  // Group guests by school for beautiful UI separation
  const getSchoolName = (schoolId: string | null | undefined) => {
    if (!schoolId) return 'Administración Central (UGMA)';
    const sch = schools.find((s) => s.id === schoolId);
    return sch ? sch.name : 'Administración';
  };

  const handleToggleGuest = (guestId: string) => {
    if (selectedGuestIds.includes(guestId)) {
      setSelectedGuestIds(selectedGuestIds.filter((id) => id !== guestId));
    } else {
      setSelectedGuestIds([...selectedGuestIds, guestId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    if (selectedGuestIds.length === 0) {
      setLocalError('Debes seleccionar al menos un invitado para la reunión.');
      setLoading(false);
      return;
    }

    try {
      await createMeeting({
        title,
        description,
        date,
        time,
        location,
        guestIds: selectedGuestIds,
      });
      onCreated();
    } catch (err: any) {
      setLocalError(err.message || 'Error al agendar reunión en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Background overlay click-to-close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="brutal-card bg-white max-w-3xl w-full relative z-10 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b-4 border-black pb-4">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Planificar_Reunión</h2>
            <p className="font-bold text-xs uppercase tracking-widest text-[#002855]">
              Organizador: {user?.firstName} {user?.lastName} ( {user?.role.replace('_', ' ')} )
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 border-4 border-black bg-[#FFB81C] text-black flex items-center justify-center font-black text-2xl transition-all hover:bg-black hover:text-white"
          >
            ×
          </button>
        </div>

        {localError && (
          <div className="bg-red-500 border-4 border-black text-white p-3 text-xs uppercase font-bold tracking-wider">
            Alerta: {localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
              Título o Propósito de la Sesión_
            </label>
            <input
              type="text"
              className="brutal-input text-lg"
              placeholder="Ej. Análisis de Índices Académicos Semestrales"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Date, Time, Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#002855]" /> Fecha_
              </label>
              <input
                type="date"
                className="brutal-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#002855]" /> Hora_
              </label>
              <input
                type="time"
                className="brutal-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#002855]" /> Ubicación_
              </label>
              <input
                type="text"
                className="brutal-input"
                placeholder="Sala Juntas A / Aula Magna"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Grid for Agenda & Guest Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Agenda Details */}
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-[#002855]" /> Puntos a Tratar / Agenda Inicial_
              </label>
              <textarea
                rows={10}
                className="brutal-input flex-1 resize-none font-bold"
                placeholder="Ingresa la agenda enumerada. Ejemplo:&#10;1. Lectura del acta previa.&#10;2. Análisis presupuestario.&#10;3. Propuestas académicas."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Right: Guest Selector Checkboxes */}
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#002855]" /> Seleccionar Directivos e Invitados_
              </label>
              
              <div className="border-4 border-black p-4 bg-slate-50 overflow-y-auto max-h-[250px] space-y-4 flex-1">
                {/* Group users by school */}
                {schools.concat([{ id: 'central', name: 'Rectorado y Personal Central' }]).map((school) => {
                  const sId = school.id === 'central' ? null : school.id;
                  const schoolGuests = availableGuests.filter((g) => g.schoolId === sId);
                  
                  if (schoolGuests.length === 0) return null;

                  return (
                    <div key={school.id} className="space-y-2 border-b-2 border-dashed border-slate-300 pb-2 last:border-0 last:pb-0">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {school.name}
                      </h4>
                      <div className="space-y-1">
                        {schoolGuests.map((g) => (
                          <label
                            key={g.id}
                            className={`flex items-start space-x-2 p-1.5 border-2 border-transparent hover:border-black cursor-pointer bg-white transition-all text-xs font-bold ${
                              selectedGuestIds.includes(g.id) ? 'bg-[#FFB81C]/20 border-black' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 accent-black border-2 border-black"
                              checked={selectedGuestIds.includes(g.id)}
                              onChange={() => handleToggleGuest(g.id)}
                            />
                            <div className="flex-1">
                              <p className="font-black text-black">{g.firstName} {g.lastName}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                                {g.role.replace('_', ' ')} • {g.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t-4 border-black flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-4 border-black py-3 text-sm font-black uppercase tracking-wider transition-all hover:bg-black hover:text-white"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] brutal-btn-navy py-3 text-lg flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-5 h-5 text-[#FFB81C]" />
              <span>{loading ? 'PUBLICANDO EN SISTEMA...' : 'CONVOCAR REUNIÓN →'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
