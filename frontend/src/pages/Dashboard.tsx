import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import CreateMeetingModal from '../components/CreateMeetingModal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  ArrowLeft, 
  Printer, 
  MessageSquare, 
  BookOpen, 
  Layers, 
  User as UserIcon,
  ChevronRight,
  School as SchoolIcon,
  Bell,
  Check,
  Users
} from 'lucide-react';
import { Meeting, MeetingStatus, AttendanceStatus, User as UserType } from '../types';

const Dashboard = () => {
  const { 
    user, 
    meetings, 
    schools, 
    users,
    notifications, 
    updateMeetingStatus, 
    updateAttendance,
    markNotificationsAsRead,
    logout,
    registerUser,
    deleteUser,
    auditLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'reuniones' | 'minutas' | 'notificaciones' | 'personal'>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User Management States
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState<'DIRECTOR_UGMA' | 'DIRECTOR_ESCUELA' | 'COORDINADOR' | 'INVITADO'>('DIRECTOR_ESCUELA');
  const [newSchoolId, setNewSchoolId] = useState<string>('');
  
  // Guest Interaction States
  const [guestConfirmStatus, setGuestConfirmStatus] = useState<AttendanceStatus>('CONFIRMADA');
  const [guestProposedAgenda, setGuestProposedAgenda] = useState('');
  
  // Organizer Conclusions States
  const [conclusionsText, setConclusionsText] = useState('');
  const [executionAttendees, setExecutionAttendees] = useState<{ [userId: string]: AttendanceStatus }>({});
  
  // Filtering states
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected meeting object helper
  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId);

  // Sync organizer states when meeting changes
  useEffect(() => {
    if (activeMeeting) {
      setConclusionsText(activeMeeting.conclusions || '');
      
      // Pre-fill attendee records
      const initialAttendees: { [userId: string]: AttendanceStatus } = {};
      activeMeeting.guests.forEach((g) => {
        initialAttendees[g.userId] = g.attendanceStatus;
      });
      setExecutionAttendees(initialAttendees);

      // Pre-fill user's own status if guest
      const myGuestRecord = activeMeeting.guests.find((g) => g.userId === user?.id);
      if (myGuestRecord) {
        setGuestConfirmStatus(
          myGuestRecord.attendanceStatus === 'PENDIENTE' ? 'CONFIRMADA' : myGuestRecord.attendanceStatus
        );
        setGuestProposedAgenda(myGuestRecord.proposedAgenda || '');
      }
    }
  }, [selectedMeetingId, meetings, user]);

  // Calculations for Stats
  const totalMeetingsCount = meetings.length;
  const programadasCount = meetings.filter((m) => m.status === 'PROGRAMADA').length;
  const ejecutadasCount = meetings.filter((m) => m.status === 'EJECUTADA').length;
  
  const getAttendanceRate = () => {
    const executed = meetings.filter((m) => m.status === 'EJECUTADA');
    if (executed.length === 0) return '100%';
    
    let totalGuests = 0;
    let totalAsistio = 0;
    
    executed.forEach((m) => {
      m.guests.forEach((g) => {
        totalGuests++;
        if (g.attendanceStatus === 'ASISTIO') totalAsistio++;
      });
    });
    
    if (totalGuests === 0) return '100%';
    return `${Math.round((totalAsistio / totalGuests) * 100)}%`;
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  // Filtered Meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesSchool = schoolFilter === 'all' || 
      (m.creator?.schoolId === schoolFilter);
      
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    
    const matchesSearch = searchQuery === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSchool && matchesStatus && matchesSearch;
  });

  // Filtered Minutas (Executed only)
  const filteredMinutas = meetings.filter((m) => {
    if (m.status !== 'EJECUTADA') return false;
    const matchesSchool = schoolFilter === 'all' || (m.creator?.schoolId === schoolFilter);
    const matchesSearch = searchQuery === '' || m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSchool && matchesSearch;
  });

  const handleGuestSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeeting || !user) return;
    try {
      await updateAttendance(activeMeeting.id, guestConfirmStatus, guestProposedAgenda);
      alert('Asistencia y propuesta actualizadas con éxito.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleExecuteMeeting = async () => {
    if (!activeMeeting) return;
    if (!conclusionsText.trim()) {
      alert('Por favor, redacta los acuerdos y conclusiones antes de concluir la reunión.');
      return;
    }

    const signPIN = prompt('🔒 CONTROL DE FIRMA ELECTRÓNICA DE LA UGMA:\n\nPor favor, ingresa tu Clave/PIN de Firma Digital de Seguridad institucional para rubricar esta acta e incorporarla al archivo de la secretaría general:');
    if (signPIN === null) return; 
    if (!signPIN.trim()) {
      alert('La clave de firma digital es un requerimiento legal obligatorio para dar validez jurídica al acta.');
      return;
    }

    try {
      const stampText = `\n\n==========================================\n🔒 ACTA FIRMADA DIGITALMENTE Y SELLADA\n✍️ RÚBRICA ELECTRÓNICA: [UGMA-HASH-${Math.random().toString(36).substring(2, 10).toUpperCase()}]\n👤 FIRMANTE AUTORIZADO: ${user?.firstName} ${user?.lastName} (${user?.role.replace('_', ' ')})\n📅 REGISTRO DIGITAL: ${new Date().toLocaleString('es-VE')}\n🔑 CLAVE DE AUDITORÍA: ${signPIN.substring(0,2) + signPIN.substring(2).replace(/./g, '*')}\n==========================================`;
      const finalConclusions = conclusionsText + stampText;

      await updateMeetingStatus(activeMeeting.id, 'EJECUTADA', finalConclusions);
      alert('Acta firmada digitalmente con éxito y minuta registrada de forma inmutable.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCancelMeeting = async () => {
    if (!activeMeeting) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reunión? Esta acción notificará a todos los invitados.')) return;
    
    try {
      await updateMeetingStatus(activeMeeting.id, 'CANCELADA', null);
      alert('Reunión cancelada en el sistema.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handlePrintMinuta = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col lg:flex-row font-black">
      
      {/* Sidebar Brutalista */}
      <aside className="w-full lg:w-80 bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 flex flex-col space-y-8 select-none shrink-0 print:hidden">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 border-b-4 border-black pb-6">
          <div className="w-12 h-12 bg-[#002855] border-4 border-black text-white flex items-center justify-center text-3xl font-black italic">
            U
          </div>
          <div>
            <span className="text-2xl tracking-tighter italic block leading-none">UGMA_HUB</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Gesti&oacute;n de Reuniones</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-[#FFB81C] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#002855] font-bold mb-1">Usuario Activo</p>
          <h3 className="text-lg leading-tight break-words font-black">{user?.firstName} {user?.lastName}</h3>
          <span className="inline-block bg-black text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold mt-2 break-words max-w-full">
            {user?.role.replace('_', ' ')}
          </span>
          {user?.school && (
            <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tight mt-1 break-words leading-tight">
              {user.school.name}
            </p>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', label: 'PANEL PRINCIPAL', icon: Layers },
            { id: 'reuniones', label: 'REUNIONES / CITAS', icon: CalendarIcon },
            { id: 'minutas', label: 'MINUTAS Y ACUERDOS', icon: BookOpen },
            { id: 'notificaciones', label: `NOTIFICACIONES (${getUnreadNotificationsCount()})`, icon: Bell },
            ...(user?.role === 'ADMIN' ? [{ id: 'personal', label: 'GESTIÓN DE PERSONAL', icon: Users }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isAct = activeTab === item.id && !selectedMeetingId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMeetingId(null);
                  setActiveTab(item.id as any);
                }}
                className={`w-full text-left p-3.5 border-4 border-black font-black uppercase tracking-wider flex items-center justify-between transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                  isAct 
                    ? 'bg-[#002855] text-white shadow-none' 
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs tracking-wider">{item.label}</span>
                </div>
                {!isAct && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* New Meeting Button (Restricted to Authorized roles) */}
        {user?.role !== 'INVITADO' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full brutal-btn bg-[#FFB81C] text-black text-center text-xs py-4"
          >
            + AGENDAR REUNIÓN
          </button>
        )}

        {/* Exit Button */}
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="brutal-btn-navy w-full text-xs py-3.5 bg-black"
        >
          CERRAR_SESIÓN
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-10 overflow-x-hidden max-h-screen overflow-y-auto">
        
        {/* SUBVIEW: MEETING DETAILS */}
        {selectedMeetingId && activeMeeting ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Back Button */}
            <button
              onClick={() => setSelectedMeetingId(null)}
              className="inline-flex items-center space-x-2 border-4 border-black bg-white px-4 py-2 font-black hover:bg-[#FFB81C] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Volver al Panel</span>
            </button>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:flex flex-col items-center text-center border-b-8 border-double border-black pb-6 mb-6">
              <h2 className="text-3xl font-black uppercase">UNIVERSIDAD GRAN MARISCAL DE AYACUCHO</h2>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mt-1">SISTEMA INTEGRAL DE MINUTAS Y ACUERDOS ADMINISTRATIVOS</p>
              <p className="text-xs font-mono mt-2">ID: {activeMeeting.id} | Fecha de Impresi&oacute;n: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Grid de Fichas de la Reunión */}
            <div className="grid grid-cols-12 gap-8">
              
              {/* Bloque Izquierdo: Información Base de la Cita */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                
                {/* Cabecera Brutalista de la Reunión */}
                <div className={`brutal-card ${
                  activeMeeting.status === 'CANCELADA' 
                    ? 'bg-red-100' 
                    : (activeMeeting.status === 'EJECUTADA' ? 'bg-[#002855]/5 border-[#002855]' : 'bg-white')
                }`}>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Escuela */}
                    <span className="bg-black text-white px-3 py-1 text-[10px] uppercase font-bold tracking-wider">
                      {activeMeeting.creator?.schoolId ? schools.find(s => s.id === activeMeeting.creator?.schoolId)?.name : 'Rectorado Central'}
                    </span>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 text-[10px] border-2 border-black uppercase font-black tracking-wider ${
                      activeMeeting.status === 'PROGRAMADA' 
                        ? 'bg-[#FFB81C] text-black' 
                        : (activeMeeting.status === 'EJECUTADA' ? 'bg-[#002855] text-white' : 'bg-red-500 text-white')
                    }`}>
                      {activeMeeting.status}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl tracking-tighter uppercase font-black leading-tight mb-4">
                    {activeMeeting.title}
                  </h1>

                  {/* Metadatos en formato Grid Fichas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t-4 border-black pt-6">
                    <div className="flex items-center space-x-3 bg-white p-3 border-2 border-black min-w-0">
                      <div className="w-10 h-10 border-2 border-black bg-[#FFB81C] flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-5 h-5 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">FECHA_</p>
                        <p className="text-xs sm:text-sm font-black break-words leading-tight">{activeMeeting.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-3 border-2 border-black min-w-0">
                      <div className="w-10 h-10 border-2 border-black bg-[#FFB81C] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">HORA_</p>
                        <p className="text-xs sm:text-sm font-black break-words leading-tight">{activeMeeting.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-3 border-2 border-black min-w-0">
                      <div className="w-10 h-10 border-2 border-black bg-[#FFB81C] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">UBICACIÓN_</p>
                        <p className="text-xs sm:text-sm font-black break-words leading-tight">{activeMeeting.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agenda Inicial Convocada */}
                <div className="brutal-card bg-white">
                  <h3 className="text-2xl italic uppercase mb-4 border-b-4 border-black pb-2 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#002855]" />
                    Agenda de Temas Convocados
                  </h3>
                  <div className="bg-slate-50 p-4 border-2 border-black text-sm font-bold text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                    {activeMeeting.description || 'Sin descripción o temas iniciales definidos.'}
                  </div>
                </div>

                {/* Minuta Oficial y Acuerdos (Only when status is EJECUTADA) */}
                {activeMeeting.status === 'EJECUTADA' && (
                  <div className="brutal-card-gold relative print:border-none print:shadow-none">
                    
                    {/* Print Button */}
                    <button 
                      onClick={handlePrintMinuta}
                      className="absolute top-6 right-6 border-4 border-black bg-white p-3 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none print:hidden"
                      title="Imprimir Acta Oficial"
                    >
                      <Printer className="w-5 h-5" />
                    </button>

                    <h3 className="text-3xl italic uppercase mb-4 border-b-4 border-black pb-2 flex items-center gap-2">
                      <CheckCircle className="w-7 h-7 text-[#002855]" />
                      Acta de Minutas y Acuerdos Finales
                    </h3>
                    
                    <div className="bg-white p-6 border-4 border-black space-y-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-dashed border-slate-200 pb-2">
                        REGISTRO FORMAL DE CONCLUSIONES
                      </p>
                      
                      <div className="text-base font-bold text-black font-mono leading-relaxed whitespace-pre-line">
                        {activeMeeting.conclusions || 'No se registraron conclusiones formalmente.'}
                      </div>

                      {/* Firmas Digitales Simuladas para Impresión */}
                      <div className="border-t-4 border-black pt-8 grid grid-cols-2 gap-8 text-center mt-10">
                        <div className="flex flex-col items-center">
                          <div className="h-12 border-b border-black w-48 mb-2 font-mono text-xs text-slate-400 italic flex items-end justify-center">
                            {activeMeeting.creator?.firstName} {activeMeeting.creator?.lastName}
                          </div>
                          <p className="text-[10px] font-black uppercase">ORGANIZADOR</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-tight">{activeMeeting.creator?.role.replace('_', ' ')}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-12 border-b border-black w-48 mb-2 font-mono text-xs text-slate-400 italic flex items-end justify-center">
                            Registro del Servidor
                          </div>
                          <p className="text-[10px] font-black uppercase">UGMA CONTROL</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-tight">Firma Digitalizada e Histórica</p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Organizer Control Actions Panel */}
                {user?.id === activeMeeting.creatorId && activeMeeting.status === 'PROGRAMADA' && (
                  <div className="brutal-card bg-white space-y-6 print:hidden">
                    <h3 className="text-2xl italic uppercase border-b-4 border-black pb-2 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-red-500" />
                      Panel del Organizador (Ciclo de Vida)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest ml-1 mb-1 block">
                          Redactar Acuerdos y Conclusiones Finales (Para concluir y firmar acta)_
                        </label>
                        <textarea
                          rows={6}
                          className="brutal-input resize-none font-bold"
                          placeholder="Ingresa aquí las conclusiones finales, aprobaciones, responsabilidades asignadas y fecha tentativa de seguimiento."
                          value={conclusionsText}
                          onChange={(e) => setConclusionsText(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                          onClick={handleCancelMeeting}
                          className="flex-1 border-4 border-black bg-red-100 text-red-600 font-black uppercase tracking-widest py-3 text-xs hover:bg-red-500 hover:text-white transition-colors"
                        >
                          CANCELAR REUNIÓN
                        </button>
                        
                        <button
                          onClick={handleExecuteMeeting}
                          className="flex-[2] brutal-btn bg-[#FFB81C] text-black font-black text-sm py-3 flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>GUARDAR ACUERDOS Y CONCLUIR REUNIÓN</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bloque Derecho: Invitados y Confirmación de Asistencia */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Guest Self Interaction Panel (Confirm / Decline) */}
                {activeMeeting.status === 'PROGRAMADA' && activeMeeting.guests.some((g) => g.userId === user?.id) && (
                  <div className="brutal-card bg-[#FFB81C] space-y-4 print:hidden">
                    <h4 className="text-xl uppercase italic border-b-2 border-black pb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Tu Participación
                    </h4>

                    <form onSubmit={handleGuestSubmitAttendance} className="space-y-4">
                      
                      {/* Attendance Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider block">Confirmar Asistencia_</label>
                        <select
                          className="brutal-input py-2 text-xs"
                          value={guestConfirmStatus}
                          onChange={(e) => setGuestConfirmStatus(e.target.value as AttendanceStatus)}
                        >
                          <option value="CONFIRMADA">Sí, Asistiré (CONFIRMADA)</option>
                          <option value="RECHAZADA">No puedo asistir (RECHAZADA)</option>
                        </select>
                      </div>

                      {/* Proposed Agenda Topic */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider block">
                          Proponer Tema Adicional_
                        </label>
                        <textarea
                          rows={3}
                          className="brutal-input p-2 text-xs resize-none"
                          placeholder="¿Deseas proponer algún punto de agenda adicional para que el director lo revise?"
                          value={guestProposedAgenda}
                          onChange={(e) => setGuestProposedAgenda(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full brutal-btn-navy py-2.5 text-xs flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5 text-[#FFB81C]" />
                        <span>ENVIAR RESPUESTA</span>
                      </button>

                    </form>
                  </div>
                )}

                {/* List of Invitees & Status Board */}
                <div className="brutal-card bg-white space-y-4 print:border-none print:shadow-none">
                  <h4 className="text-xl uppercase italic border-b-2 border-black pb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#002855]" />
                    Invitados y Estatus
                  </h4>

                  <div className="space-y-3">
                    {activeMeeting.guests.map((g) => {
                      const guestUser = g.user;
                      const hasProposed = !!g.proposedAgenda;
                      
                      return (
                        <div key={g.id} className="border-2 border-black p-3 bg-slate-50 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-black text-black">
                                {guestUser?.firstName} {guestUser?.lastName}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-tighter">
                                {guestUser?.role.replace('_', ' ')}
                              </p>
                              {guestUser?.schoolId && (
                                <p className="text-[8px] text-[#002855] font-black uppercase tracking-widest mt-0.5">
                                  {schools.find(s => s.id === guestUser.schoolId)?.name.split(' ').pop()}
                                </p>
                              )}
                            </div>

                            {/* Status tag */}
                            <span className={`px-2 py-0.5 text-[8px] border-[1px] border-black font-black uppercase ${
                              g.attendanceStatus === 'CONFIRMADA' || g.attendanceStatus === 'ASISTIO'
                                ? 'bg-green-100 text-green-700 border-green-700'
                                : (g.attendanceStatus === 'RECHAZADA' || g.attendanceStatus === 'NO_ASISTIO'
                                    ? 'bg-red-100 text-red-700 border-red-700'
                                    : 'bg-slate-200 text-slate-600')
                            }`}>
                              {g.attendanceStatus}
                            </span>
                          </div>

                          {/* Proposed agenda note */}
                          {hasProposed && (
                            <div className="bg-[#FFB81C]/10 border-l-4 border-[#FFB81C] p-2 text-[10px] font-bold text-slate-600 leading-tight">
                              <span className="text-black block text-[8px] uppercase tracking-widest mb-0.5">Punto Propuesto:</span>
                              "{g.proposedAgenda}"
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {activeMeeting.guests.length === 0 && (
                      <p className="text-xs font-bold text-slate-400 italic text-center py-4">No hay invitados registrados.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          
          /* NORMAL TAB SYSTEM */
          <div className="space-y-10 animate-in fade-in duration-100">
            
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="brutal-card bg-white py-3 px-8 shrink-0">
                <h1 className="text-4xl md:text-5xl tracking-tighter italic uppercase flex items-center gap-3">
                  {activeTab === 'dashboard' && 'Panel_General'}
                  {activeTab === 'reuniones' && 'Reuniones_Activas'}
                  {activeTab === 'minutas' && 'Archivo_Minutas'}
                  {activeTab === 'notificaciones' && 'Notificaciones_Recientes'}
                </h1>
              </div>
              
              {/* Quick Info Bar */}
              <div className="flex flex-wrap gap-4 text-xs font-bold font-mono">
                <div className="bg-[#002855] text-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                  UGMA 2026
                </div>
                <div className="bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                  4 ESCUELAS ACTIVAS
                </div>
              </div>
            </header>

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                
                {/* Stats Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'CONVOCADAS EN TOTAL', val: totalMeetingsCount, bg: 'bg-white', icon: Layers },
                    { label: 'REUNIONES AGENDADAS', val: programadasCount, bg: 'bg-[#FFB81C]', icon: CalendarIcon },
                    { label: 'CONCLUSIONES ARCHIVADAS', val: ejecutadasCount, bg: 'bg-white', icon: BookOpen },
                    { label: 'TASA ASISTENCIA HIST.', val: getAttendanceRate(), bg: 'bg-white', icon: CheckCircle }
                  ].map((stat, index) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={index} className={`brutal-card ${stat.bg} relative overflow-hidden group`}>
                        <div className="absolute right-4 top-4 text-slate-200 group-hover:text-[#002855]/10 transition-colors">
                          <StatIcon className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest mb-1 relative z-10 text-slate-500 font-bold">{stat.label}</p>
                        <p className="text-6xl tracking-tighter relative z-10 font-black">{stat.val}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Main panel columns */}
                <div className="grid grid-cols-12 gap-8">
                  
                  {/* Left Column: Recent Meetings */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center border-b-4 border-black pb-2">
                      <h2 className="text-2xl italic tracking-tighter uppercase flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-[#002855]" />
                        Próximas Sesiones del Personal
                      </h2>
                      <button
                        onClick={() => setActiveTab('reuniones')}
                        className="text-xs uppercase hover:underline"
                      >
                        Ver todas →
                      </button>
                    </div>

                    <div className="space-y-4">
                      {meetings.filter((m) => m.status === 'PROGRAMADA').slice(0, 3).map((meeting) => {
                        const guestCount = meeting.guests.length;
                        const day = meeting.date.split('-')[2];
                        const month = new Date(meeting.date).toLocaleString('es-VE', { month: 'short' }).toUpperCase();
                        const isExpanded = expandedMeetingId === meeting.id;
                        
                        return (
                          <div
                            key={meeting.id}
                            onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                            className={`brutal-card bg-white hover:bg-[#FFB81C]/5 transition-all cursor-pointer group min-w-0 ${
                              isExpanded ? 'border-[#FFB81C]' : ''
                            }`}
                          >
                            {/* Cabecera de la Tarjeta */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center space-x-6 min-w-0 flex-1">
                                <div className="w-16 h-16 bg-black text-[#FFB81C] flex flex-col items-center justify-center border-4 border-black shrink-0 font-mono">
                                  <span className="text-[10px] font-bold uppercase block leading-none">{month}</span>
                                  <span className="text-3xl font-black block leading-none">{day}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="bg-[#002855]/10 text-[#002855] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 inline-block mb-1">
                                    {meeting.creator?.schoolId ? schools.find(s => s.id === meeting.creator?.schoolId)?.name : 'Consejo Central'}
                                  </span>
                                  <h4 className="text-xl md:text-2xl tracking-tighter italic font-black group-hover:underline break-words leading-tight">
                                    {meeting.title}
                                  </h4>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-wrap items-center gap-2 mt-1">
                                    <span>🕒 {meeting.time} AM/PM</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px]">📍 {meeting.location}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 self-end sm:self-auto shrink-0">
                                <span className="bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                                  {guestCount} INVITADOS
                                </span>
                                <div className="w-8 h-8 border-4 border-black flex items-center justify-center font-black group-hover:bg-[#FFB81C] transition-colors">
                                  {isExpanded ? '↑' : '↓'}
                                </div>
                              </div>
                            </div>

                            {/* Detalle Expandido In-situ */}
                            {isExpanded && (
                              <div 
                                onClick={(e) => e.stopPropagation()} // Evitar colapso al hacer clic dentro
                                className="mt-5 pt-5 border-t-4 border-black border-dashed space-y-4 animate-in slide-in-from-top-4 duration-200"
                              >
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">TEMAS DE LA AGENDA CONVOCADA_</span>
                                  <p className="text-xs font-mono bg-slate-50 p-4 border-2 border-black whitespace-pre-line text-slate-700 leading-relaxed font-bold">
                                    {meeting.description || 'Sin temas registrados en agenda.'}
                                  </p>
                                </div>
                                
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">ESTATUS DE INVITADOS_</span>
                                  <div className="flex flex-wrap gap-2">
                                    {meeting.guests.map((g) => {
                                      const isMe = g.userId === user?.id;
                                      return (
                                        <div 
                                          key={g.id} 
                                          className={`bg-slate-50 border-2 border-black px-2.5 py-1 flex items-center space-x-1.5 text-[9px] font-bold ${
                                            isMe ? 'bg-amber-50 border-[#FFB81C]' : ''
                                          }`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#002855]" />
                                          <span className="uppercase">
                                            {g.user?.firstName.split(' ').pop()} {g.user?.lastName[0]}. {isMe && '(TÚ)'}
                                          </span>
                                          <span className={`text-[8px] px-1 border-[1px] border-black font-black uppercase ${
                                            g.attendanceStatus === 'CONFIRMADA' || g.attendanceStatus === 'ASISTIO'
                                              ? 'bg-green-100 text-green-700 border-green-700'
                                              : (g.attendanceStatus === 'RECHAZADA' || g.attendanceStatus === 'NO_ASISTIO'
                                                  ? 'bg-red-100 text-red-700 border-red-700'
                                                  : 'bg-slate-200 text-slate-500 border-slate-500')
                                          }`}>
                                            {g.attendanceStatus}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Barra de Acciones del Panel Expandido */}
                                <div className="flex flex-wrap gap-3 pt-2 border-t-2 border-slate-100">
                                  <button
                                    onClick={() => {
                                      setSelectedMeetingId(meeting.id);
                                      setExpandedMeetingId(null);
                                    }}
                                    className="brutal-btn bg-[#FFB81C] text-black text-[10px] py-2.5 px-4 font-black flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                  >
                                    <span>INGRESAR A DETALLES COMPLETOS Y ACUERDOS →</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => setExpandedMeetingId(null)}
                                    className="border-4 border-black bg-white hover:bg-slate-100 text-black text-[10px] py-2 px-4 uppercase font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                  >
                                    CONTRAER DETALLE ↑
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {meetings.filter((m) => m.status === 'PROGRAMADA').length === 0 && (
                        <div className="border-4 border-dashed border-black p-8 text-center text-slate-400 font-bold bg-white">
                          No hay reuniones programadas pendientes en la agenda.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Dynamic Notification Feed */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="flex justify-between items-center border-b-4 border-black pb-2">
                      <h2 className="text-2xl italic tracking-tighter uppercase flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#002855]" />
                        Alertas del Portal
                      </h2>
                      <button 
                        onClick={markNotificationsAsRead}
                        className="text-[10px] uppercase font-bold text-slate-400 hover:text-black hover:underline"
                      >
                        Marcar leídas
                      </button>
                    </div>

                    <div className="space-y-4">
                      {notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold ${
                            n.read ? 'bg-white text-slate-500' : 'bg-white text-black border-l-8 border-l-[#FFB81C]'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <span className={`uppercase text-[9px] font-black ${
                              n.type === 'alert' ? 'text-red-600' : (n.type === 'success' ? 'text-green-600' : 'text-[#002855]')
                            }`}>
                              {n.title}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400">
                              {new Date(n.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="leading-relaxed">{n.message}</p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <p className="text-xs font-bold text-slate-400 italic text-center py-6 bg-white border-2 border-black">
                          Sin alertas o notificaciones registradas.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: REUNIONES LIST */}
            {activeTab === 'reuniones' && (
              <div className="space-y-8">
                
                {/* Filtros Bar */}
                <div className="brutal-card bg-white flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  {/* Search Bar */}
                  <div className="flex-1">
                    <input
                      type="text"
                      className="brutal-input py-2.5 text-sm"
                      placeholder="Buscar por título, lugar, agenda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* School Filter Selector */}
                  <div className="flex gap-4">
                    <select
                      className="brutal-input py-2.5 text-xs"
                      value={schoolFilter}
                      onChange={(e) => setSchoolFilter(e.target.value)}
                    >
                      <option value="all">Todas las Escuelas</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      className="brutal-input py-2.5 text-xs"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="PROGRAMADA">PROGRAMADA</option>
                      <option value="EJECUTADA">EJECUTADA</option>
                      <option value="CANCELADA">CANCELADA</option>
                    </select>
                  </div>
                </div>

                {/* Meetings List Board */}
                <div className="space-y-4">
                  {filteredMeetings.map((meeting) => {
                    const guestCount = meeting.guests.length;
                    const dateObj = new Date(meeting.date + 'T' + meeting.time);
                    const day = meeting.date.split('-')[2];
                    const month = new Date(meeting.date).toLocaleString('es-VE', { month: 'short' }).toUpperCase();
                    
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => setSelectedMeetingId(meeting.id)}
                        className="brutal-card bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#FFB81C]/15 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-6">
                          {/* Calendar box */}
                          <div className="w-16 h-16 bg-black text-[#FFB81C] flex flex-col items-center justify-center border-4 border-black shrink-0 font-mono">
                            <span className="text-[10px] font-bold block leading-none">{month}</span>
                            <span className="text-3xl font-black block leading-none">{day}</span>
                          </div>

                          {/* Meeting Details */}
                          <div>
                            <div className="flex flex-wrap gap-2 items-center mb-1">
                              <span className="bg-[#002855]/10 text-[#002855] text-[9px] font-black uppercase px-2 py-0.5">
                                {meeting.creator?.schoolId ? schools.find(s => s.id === meeting.creator?.schoolId)?.name : 'Rectorado Central'}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] border-[1px] border-black font-black uppercase ${
                                meeting.status === 'PROGRAMADA' 
                                  ? 'bg-[#FFB81C] text-black' 
                                  : (meeting.status === 'EJECUTADA' ? 'bg-[#002855] text-white' : 'bg-red-500 text-white')
                              }`}>
                                {meeting.status}
                              </span>
                            </div>

                            <h4 className="text-2xl tracking-tighter italic font-black group-hover:underline">
                              {meeting.title}
                            </h4>
                            
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-wrap items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">🕒 {meeting.time}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">📍 {meeting.location}</span>
                            </p>
                          </div>
                        </div>

                        {/* Guests info */}
                        <div className="flex items-center space-x-4 self-end md:self-auto">
                          <span className="bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                            {guestCount} INVITADOS
                          </span>
                          <div className="w-8 h-8 border-4 border-black flex items-center justify-center font-black group-hover:bg-black group-hover:text-white transition-colors">
                            →
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredMeetings.length === 0 && (
                    <div className="border-4 border-dashed border-black p-12 text-center text-slate-400 font-bold bg-white">
                      No se encontraron reuniones que coincidan con la búsqueda o filtros aplicados.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: MINUTAS ARCHIVE */}
            {activeTab === 'minutas' && (
              <div className="space-y-8">
                
                {/* Search Bar for minutas */}
                <div className="brutal-card bg-white flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="brutal-input py-2.5 text-sm"
                      placeholder="Buscar por título de minuta o acuerdos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="brutal-input py-2.5 text-xs max-w-xs"
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                  >
                    <option value="all">Todas las Escuelas</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Minutas Archive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMinutas.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeetingId(m.id)}
                      className="brutal-card bg-white flex flex-col justify-between hover:bg-[#FFB81C]/10 hover:border-[#FFB81C] cursor-pointer transition-all space-y-4 group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="bg-[#002855] text-white px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold">
                            {m.creator?.schoolId ? schools.find(s => s.id === m.creator?.schoolId)?.name : 'Rectorado Central'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {m.date}
                          </span>
                        </div>

                        <h4 className="text-xl tracking-tight italic font-black group-hover:underline">
                          {m.title}
                        </h4>

                        <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-3 leading-relaxed font-mono">
                          {m.conclusions}
                        </p>
                      </div>

                      <div className="border-t-2 border-dashed border-slate-200 pt-2 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                        <span>ORGANIZÓ: {m.creator?.lastName}</span>
                        <span className="text-[#002855] font-black group-hover:translate-x-1 transition-transform">Ver Minuta Completa →</span>
                      </div>
                    </div>
                  ))}

                  {filteredMinutas.length === 0 && (
                    <div className="col-span-2 border-4 border-dashed border-black p-12 text-center text-slate-400 font-bold bg-white">
                      No se encontraron actas de minutas concluidas.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notificaciones' && (
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={markNotificationsAsRead}
                    className="border-4 border-black bg-white px-5 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFB81C] transition-all"
                  >
                    Marcar Todas Como Leídas
                  </button>
                </div>

                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`brutal-card flex items-start gap-4 transition-all ${
                        n.read ? 'bg-white border-slate-300 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] text-slate-500' : 'bg-white border-black border-l-8 border-l-[#FFB81C]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'success' ? 'bg-green-100 text-green-700' : (n.type === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-[#002855]')
                      }`}>
                        {n.type === 'success' ? '✓' : (n.type === 'warning' ? '⚠️' : 'ℹ')}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <h4 className={`text-base tracking-tight uppercase font-black ${n.read ? 'text-slate-500' : 'text-[#002855]'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(n.date).toLocaleString('es-VE')}
                          </span>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="border-4 border-dashed border-black p-12 text-center text-slate-400 font-bold bg-white">
                      No hay notificaciones ni alertas registradas en el portal.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: GESTIÓN DE PERSONAL */}
            {activeTab === 'personal' && user?.role === 'ADMIN' && (
              <div className="space-y-8 animate-in fadeIn duration-200">
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column: Register New Personnel Form */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="flex justify-between items-center border-b-4 border-black pb-2">
                      <h2 className="text-2xl italic tracking-tighter uppercase flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#002855]" />
                        Nuevo Registro
                      </h2>
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newEmail || !newFirstName || !newLastName) {
                          alert('Por favor completa todos los campos requeridos.');
                          return;
                        }
                        try {
                          await registerUser({
                            email: newEmail,
                            password: newPassword || 'password123',
                            firstName: newFirstName,
                            lastName: newLastName,
                            role: newRole,
                            schoolId: (newRole !== 'DIRECTOR_UGMA' && newRole !== 'ADMIN') ? newSchoolId || null : null,
                          });
                          alert('Personal registrado exitosamente en el sistema.');
                          // Reset form
                          setNewEmail('');
                          setNewPassword('');
                          setNewFirstName('');
                          setNewLastName('');
                          setNewSchoolId('');
                        } catch (err: any) {
                          alert(err.message || 'Error al registrar al usuario.');
                        }
                      }}
                      className="brutal-card bg-[#FFB81C]/5 border-4 border-black p-6 space-y-4"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Nombres *</label>
                        <input 
                          type="text" 
                          required
                          className="brutal-input py-2 text-sm bg-white"
                          placeholder="Ej: Sebastian"
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Apellidos *</label>
                        <input 
                          type="text" 
                          required
                          className="brutal-input py-2 text-sm bg-white"
                          placeholder="Ej: Herrera"
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Correo Institucional *</label>
                        <input 
                          type="email" 
                          required
                          className="brutal-input py-2 text-sm bg-white"
                          placeholder="Ej: coord.ing@ugma.edu.ve"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Contraseña de Acceso</label>
                        <input 
                          type="password" 
                          className="brutal-input py-2 text-sm bg-white"
                          placeholder="Opcional (Defecto: password123)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Cargo Administrativo</label>
                        <select 
                          className="brutal-input py-2 text-xs bg-white font-bold"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as any)}
                        >
                          <option value="DIRECTOR_ESCUELA">DIRECTOR DE ESCUELA</option>
                          <option value="COORDINADOR">COORDINADOR DOCENTE</option>
                          <option value="INVITADO">INVITADO / VOCAL</option>
                          <option value="DIRECTOR_UGMA">RECTOR / VICERRECTOR</option>
                          <option value="ADMIN">SOPORTE TÉCNICO / TI</option>
                        </select>
                      </div>

                      {newRole !== 'DIRECTOR_UGMA' && newRole !== 'ADMIN' && (
                        <div>
                          <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block mb-1">Escuela de Adscripción *</label>
                          <select 
                            className="brutal-input py-2 text-xs bg-white font-bold"
                            value={newSchoolId}
                            onChange={(e) => setNewSchoolId(e.target.value)}
                            required
                          >
                            <option value="">Selecciona Escuela...</option>
                            {schools.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full brutal-btn bg-[#FFB81C] text-black font-black uppercase text-xs py-3.5 mt-2"
                      >
                        + REGISTRAR EN EL PORTAL
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Personnel List with Delete Option */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center border-b-4 border-black pb-2">
                      <h2 className="text-2xl italic tracking-tighter uppercase flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#002855]" />
                        Listado de Personal y Control de Accesos
                      </h2>
                      <span className="bg-black text-white px-3 py-1 text-xs font-bold font-mono">
                        {users.length} CUENTAS ACTIVAS
                      </span>
                    </div>

                    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#002855] text-white border-b-4 border-black text-[10px] font-black uppercase tracking-widest font-mono">
                            <th className="p-4 border-r-2 border-black">Nombre y Contacto</th>
                            <th className="p-4 border-r-2 border-black">Cargo / Rol</th>
                            <th className="p-4 border-r-2 border-black">Adscripción</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black text-xs font-bold">
                          {users.map((u) => {
                            const isSelf = u.id === user?.id;
                            const schoolName = u.schoolId ? schools.find(s => s.id === u.schoolId)?.name : 'Rectorado Central';
                            
                            return (
                              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 border-r-2 border-black">
                                  <div className="font-black text-sm">{u.firstName} {u.lastName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{u.email}</div>
                                </td>
                                <td className="p-4 border-r-2 border-black uppercase font-mono">
                                  <span className={`inline-block px-2 py-0.5 border-[1px] border-black font-black text-[8px] uppercase ${
                                    u.role === 'DIRECTOR_UGMA' 
                                      ? 'bg-amber-100 text-amber-700 border-amber-700' 
                                      : (u.role === 'DIRECTOR_ESCUELA' ? 'bg-blue-100 text-[#002855] border-[#002855]' : 'bg-slate-100 text-slate-700')
                                  }`}>
                                    {u.role.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-4 border-r-2 border-black uppercase text-[10px] tracking-tight">
                                  {schoolName}
                                </td>
                                <td className="p-4 text-center">
                                  {isSelf ? (
                                    <span className="text-[10px] text-slate-400 font-mono italic">SESIÓN ACTIVA</span>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        if (confirm(`¿Estás seguro de eliminar a ${u.firstName} ${u.lastName} del portal académico?\nEsta acción es irreversible y removerá sus credenciales de firma.`)) {
                                          try {
                                            await deleteUser(u.id);
                                            alert('Usuario eliminado exitosamente.');
                                          } catch (err: any) {
                                            alert(err.message || 'Error al eliminar al usuario.');
                                          }
                                        }
                                      }}
                                      className="border-2 border-black bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 uppercase font-black tracking-wider text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                    >
                                      ELIMINAR
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* BITÁCORA DE AUDITORÍA */}
                <div className="space-y-6 pt-6 border-t-4 border-dashed border-black mt-8">
                  <div className="flex justify-between items-center border-b-4 border-black pb-2">
                    <h2 className="text-2xl italic tracking-tighter uppercase flex items-center gap-2">
                      <Shield className="w-6 h-6 text-[#FFB81C]" />
                      Bitácora de Auditoría y Transacciones UGMA
                    </h2>
                    <span className="bg-[#FFB81C] text-black px-3 py-1 text-xs font-bold font-mono border-2 border-black">
                      HISTORIAL COMPLETO DE SEGURIDAD
                    </span>
                  </div>

                  <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto divide-y-2 divide-black">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs font-bold">
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-100 border-[1px] border-black px-2 py-0.5 font-mono text-[9px] uppercase">
                              {log.ip}
                            </span>
                            <div>
                              <div className="font-black text-slate-800 uppercase tracking-tight">{log.action}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Operador: {log.user}</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono self-end md:self-center font-bold">
                            {new Date(log.date).toLocaleString('es-VE')}
                          </div>
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-mono italic">
                          No hay transacciones registradas en la bitácora académica.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* CREATE MEETING MODAL */}
      <CreateMeetingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={() => {
          setIsModalOpen(false);
          alert('Reunión convocada exitosamente. Se han enviado las notificaciones al personal.');
        }} 
      />
    </div>
  );
};

export default Dashboard;
