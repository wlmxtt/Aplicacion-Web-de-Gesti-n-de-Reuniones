import api from './api';
import { User, Meeting, School, Notification, Role, MeetingStatus, AttendanceStatus, MeetingGuest } from '../types';

// Control flag to easily switch between Backend API and Persistent LocalStorage Mock
const USE_API = true;

// Mock Data Seed Definitions
const MOCK_SCHOOLS: School[] = [
  { id: 'school-ing', name: 'Escuela de Ingeniería' },
  { id: 'school-faces', name: 'Escuela de FACES (Administración y Contaduría)' },
  { id: 'school-der', name: 'Escuela de Derecho' },
  { id: 'school-psi', name: 'Escuela de Psicología' },
];

const MOCK_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@ugma.edu.ve',
    firstName: 'Soporte',
    lastName: 'Técnico UGMA',
    role: 'ADMIN',
    schoolId: null,
    school: null,
  },
  {
    id: 'user-ugma',
    email: 'rector.herrera@ugma.edu.ve',
    firstName: 'Dr. Sebastian',
    lastName: 'Herrera',
    role: 'DIRECTOR_UGMA',
    schoolId: null,
    school: null,
  },
  {
    id: 'user-ing',
    email: 'director.ing@ugma.edu.ve',
    firstName: 'Ing. María',
    lastName: 'Rodríguez',
    role: 'DIRECTOR_ESCUELA',
    schoolId: 'school-ing',
    school: MOCK_SCHOOLS[0],
  },
  {
    id: 'user-faces',
    email: 'director.faces@ugma.edu.ve',
    firstName: 'Lic. Carlos',
    lastName: 'Mendoza',
    role: 'DIRECTOR_ESCUELA',
    schoolId: 'school-faces',
    school: MOCK_SCHOOLS[1],
  },
  {
    id: 'user-der',
    email: 'director.der@ugma.edu.ve',
    firstName: 'Dra. Alicia',
    lastName: 'Flores',
    role: 'DIRECTOR_ESCUELA',
    schoolId: 'school-der',
    school: MOCK_SCHOOLS[2],
  },
  {
    id: 'user-psi',
    email: 'director.psi@ugma.edu.ve',
    firstName: 'Dr. Juan',
    lastName: 'Pérez',
    role: 'DIRECTOR_ESCUELA',
    schoolId: 'school-psi',
    school: MOCK_SCHOOLS[3],
  },
  {
    id: 'user-coord-ing',
    email: 'coord.ing@ugma.edu.ve',
    firstName: 'Prof. Alejandro',
    lastName: 'Silva',
    role: 'COORDINADOR',
    schoolId: 'school-ing',
    school: MOCK_SCHOOLS[0],
  },
  {
    id: 'user-coord-faces',
    email: 'coord.faces@ugma.edu.ve',
    firstName: 'Prof. Laura',
    lastName: 'Rojas',
    role: 'COORDINADOR',
    schoolId: 'school-faces',
    school: MOCK_SCHOOLS[1],
  },
  {
    id: 'user-inv-der',
    email: 'invitado.der@ugma.edu.ve',
    firstName: 'Dr. Roberto',
    lastName: 'Gómez',
    role: 'INVITADO',
    schoolId: 'school-der',
    school: MOCK_SCHOOLS[2],
  },
  {
    id: 'user-inv-psi',
    email: 'invitado.psi@ugma.edu.ve',
    firstName: 'Dra. Elena',
    lastName: 'Rivas',
    role: 'INVITADO',
    schoolId: 'school-psi',
    school: MOCK_SCHOOLS[3],
  },
];

const MOCK_MEETINGS_SEED: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Acreditación de Carreras de Ingeniería',
    description: 'Puntos a tratar:\n1. Revisión de carpetas de profesores.\n2. Estatus de laboratorios de computación y red.\n3. Preparación del cronograma de visitas de pares evaluadores.',
    date: '2026-05-24',
    time: '09:00',
    location: 'Auditorio de Ingeniería - Módulo A',
    status: 'PROGRAMADA',
    creatorId: 'user-ing',
    conclusions: null,
    guests: [
      { id: 'g-1-1', meetingId: 'meet-1', userId: 'user-ugma', attendanceStatus: 'PENDIENTE', proposedAgenda: null },
      { id: 'g-1-2', meetingId: 'meet-1', userId: 'user-coord-ing', attendanceStatus: 'CONFIRMADA', proposedAgenda: 'Propuesta de incluir actualización de servidores del datacenter en el punto 2.' },
    ],
  },
  {
    id: 'meet-2',
    title: 'Planificación de Carga Académica FACES',
    description: 'Agenda:\n1. Distribución de secciones para el próximo semestre académico.\n2. Contratación y asignación de profesores adjuntos.\n3. Oferta de electivas profesionales.',
    date: '2026-05-15',
    time: '14:30',
    location: 'Sala de Juntas FACES - Rectorado Piso 2',
    status: 'EJECUTADA',
    creatorId: 'user-faces',
    conclusions: 'Se aprobó el 100% de la distribución horaria y secciones de Administración de Empresas. Queda pendiente por validar dos secciones de Contaduría Pública debido a disponibilidad de aulas en el módulo B. Se autorizó la renovación de 4 profesores adjuntos.',
    guests: [
      { id: 'g-2-1', meetingId: 'meet-2', userId: 'user-faces', attendanceStatus: 'ASISTIO', proposedAgenda: null },
      { id: 'g-2-2', meetingId: 'meet-2', userId: 'user-coord-faces', attendanceStatus: 'ASISTIO', proposedAgenda: null },
      { id: 'g-2-3', meetingId: 'meet-2', userId: 'user-ugma', attendanceStatus: 'NO_ASISTIO', proposedAgenda: null },
    ],
  },
  {
    id: 'meet-3',
    title: 'Reforma Curricular de Derecho',
    description: 'Agenda:\n1. Modificaciones al plan de estudios de Derecho Constitucional.\n2. Inserción de clínicas jurídicas digitales en el pensum.\n3. Convenio con tribunales locales.',
    date: '2026-05-28',
    time: '11:00',
    location: 'Sala de Conferencias B - Escuela de Derecho',
    status: 'PROGRAMADA',
    creatorId: 'user-der',
    conclusions: null,
    guests: [
      { id: 'g-3-1', meetingId: 'meet-3', userId: 'user-inv-der', attendanceStatus: 'CONFIRMADA', proposedAgenda: null },
      { id: 'g-3-2', meetingId: 'meet-3', userId: 'user-ugma', attendanceStatus: 'PENDIENTE', proposedAgenda: 'Revisar la viabilidad legal del convenio de clínicas jurídicas digitales.' },
    ],
  },
  {
    id: 'meet-4',
    title: 'Consejo Extraordinario de Directores UGMA',
    description: 'Agenda:\n1. Análisis presupuestario del ejercicio fiscal 2026.\n2. Reportes de matrícula estudiantil en las 4 escuelas.\n3. Campaña institucional de becas académicas.',
    date: '2026-05-10',
    time: '08:30',
    location: 'Rectorado - Sala de Consejo Central',
    status: 'EJECUTADA',
    creatorId: 'user-ugma',
    conclusions: 'Se autorizó formalmente el fondo especial de mantenimiento para los laboratorios de Ingeniería y el gabinete psicológico. Se acordó intensificar la promoción en redes sociales. El Rector solicita a cada escuela consignar reportes consolidados el 30 de cada mes.',
    guests: [
      { id: 'g-4-1', meetingId: 'meet-4', userId: 'user-ing', attendanceStatus: 'ASISTIO', proposedAgenda: null },
      { id: 'g-4-2', meetingId: 'meet-4', userId: 'user-faces', attendanceStatus: 'ASISTIO', proposedAgenda: null },
      { id: 'g-4-3', meetingId: 'meet-4', userId: 'user-der', attendanceStatus: 'ASISTIO', proposedAgenda: null },
      { id: 'g-4-4', meetingId: 'meet-4', userId: 'user-psi', attendanceStatus: 'ASISTIO', proposedAgenda: null },
    ],
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Nueva Reunión Convocada',
    message: 'Ing. María Rodríguez ha convocado a la reunión "Acreditación de Carreras de Ingeniería" para el 24 de mayo.',
    date: '2026-05-16T10:00:00.000Z',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Asistencia Confirmada',
    message: 'Prof. Alejandro Silva confirmó su asistencia para "Acreditación de Carreras de Ingeniería".',
    date: '2026-05-16T11:30:00.000Z',
    type: 'success',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'Minutas de Reunión Publicadas',
    message: 'Lic. Carlos Mendoza publicó los acuerdos de la reunión "Planificación de Carga Académica FACES".',
    date: '2026-05-15T17:00:00.000Z',
    type: 'success',
    read: false,
  },
];

const MOCK_AUDIT_LOGS_SEED = [
  { id: 'log-1', action: 'INICIO DE SESIÓN EXITOSO (ADMIN)', user: 'admin@ugma.edu.ve', date: '2026-05-17T21:40:00.000Z', ip: '192.168.1.104' },
  { id: 'log-2', action: 'REGISTRO DE NUEVO PERSONAL: Dra. Valentina Gómez', user: 'admin@ugma.edu.ve', date: '2026-05-17T22:10:00.000Z', ip: '192.168.1.104' },
  { id: 'log-3', action: 'CONVOCATORIA DE REUNIÓN: Acreditación de Carreras', user: 'director.ing@ugma.edu.ve', date: '2026-05-16T10:00:00.000Z', ip: '192.168.1.115' },
  { id: 'log-4', action: 'FIRMA DIGITAL DE ACTA [UGMA-HASH-9E2B4]', user: 'rector.herrera@ugma.edu.ve', date: '2026-05-15T17:00:00.000Z', ip: '192.168.1.120' },
];

// Helper to initialize local storage mock DB
const initializeMockDB = () => {
  const existingUsers = localStorage.getItem('ugma_mock_users');
  if (!existingUsers || !existingUsers.includes('rector.herrera')) {
    localStorage.setItem('ugma_mock_users', JSON.stringify(MOCK_USERS));
    localStorage.removeItem('ugma_user');
    localStorage.removeItem('ugma_token');
  }
  if (!localStorage.getItem('ugma_mock_schools')) {
    localStorage.setItem('ugma_mock_schools', JSON.stringify(MOCK_SCHOOLS));
  }
  if (!localStorage.getItem('ugma_mock_meetings')) {
    localStorage.setItem('ugma_mock_meetings', JSON.stringify(MOCK_MEETINGS_SEED));
  }
  if (!localStorage.getItem('ugma_mock_notifications')) {
    localStorage.setItem('ugma_mock_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
  }
  if (!localStorage.getItem('ugma_mock_audit_logs')) {
    localStorage.setItem('ugma_mock_audit_logs', JSON.stringify(MOCK_AUDIT_LOGS_SEED));
  }
};

// Immediately invoke initializer
initializeMockDB();

// Mock Data Getters & Setters
const getMockUsers = (): User[] => JSON.parse(localStorage.getItem('ugma_mock_users') || '[]');
const getMockMeetings = (): Meeting[] => JSON.parse(localStorage.getItem('ugma_mock_meetings') || '[]');
const getMockNotifications = (): Notification[] => JSON.parse(localStorage.getItem('ugma_mock_notifications') || '[]');
const getMockSchools = (): School[] => JSON.parse(localStorage.getItem('ugma_mock_schools') || '[]');

const saveMockMeetings = (meetings: Meeting[]) => localStorage.setItem('ugma_mock_meetings', JSON.stringify(meetings));
const saveMockNotifications = (notifs: Notification[]) => localStorage.setItem('ugma_mock_notifications', JSON.stringify(notifs));

export const dataService = {
  // 1. AUTH SERVICE
  login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
    if (USE_API) {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } else {
      // Mock Login
      const users = getMockUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('El correo electrónico no está registrado.');
      }
      // Simple mock authentication (password matches standard or admin)
      return {
        token: `mock-jwt-token-for-${user.id}`,
        user,
      };
    }
  },

  register: async (userData: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: Role;
    schoolId?: string | null;
  }): Promise<User> => {
    if (USE_API) {
      const response = await api.post('/auth/register', {
        ...userData,
        password: userData.password || 'password123',
      });
      return response.data.user;
    } else {
      const users = getMockUsers();
      const schools = getMockSchools();
      
      if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('El correo electrónico ya está registrado.');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        schoolId: userData.schoolId || null,
        school: userData.schoolId ? schools.find((s) => s.id === userData.schoolId) || null : null,
      };

      users.push(newUser);
      localStorage.setItem('ugma_mock_users', JSON.stringify(users));
      return newUser;
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    if (USE_API) {
      await api.delete(`/users/${id}`);
    } else {
      const users = getMockUsers();
      const updated = users.filter((u) => u.id !== id);
      localStorage.setItem('ugma_mock_users', JSON.stringify(updated));
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('ugma_user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // 2. SCHOOLS SERVICE
  getSchools: async (): Promise<School[]> => {
    if (USE_API) {
      const response = await api.get('/schools');
      return response.data;
    } else {
      return getMockSchools();
    }
  },

  // 3. USERS SERVICE (For inviting guests)
  getUsers: async (): Promise<User[]> => {
    if (USE_API) {
      const response = await api.get('/users');
      return response.data;
    } else {
      return getMockUsers();
    }
  },

  // 4. MEETINGS SERVICE
  getMeetings: async (): Promise<Meeting[]> => {
    if (USE_API) {
      const response = await api.get('/meetings/my');
      return response.data;
    } else {
      // Return meetings. Populate creator & guests inside Mock
      const meetings = getMockMeetings();
      const users = getMockUsers();
      const schools = getMockSchools();
      
      return meetings.map((meeting) => {
        const creator = users.find((u) => u.id === meeting.creatorId);
        const resolvedGuests = meeting.guests.map((g) => {
          const guestUser = users.find((u) => u.id === g.userId);
          const guestSchool = guestUser?.schoolId ? schools.find((s) => s.id === guestUser.schoolId) : null;
          return {
            ...g,
            user: guestUser ? { ...guestUser, school: guestSchool } : undefined,
          };
        });

        const meetingSchool = creator?.schoolId ? schools.find((s) => s.id === creator.schoolId) : null;
        return {
          ...meeting,
          creator: creator ? { ...creator, school: meetingSchool } : undefined,
          guests: resolvedGuests,
        };
      });
    }
  },

  getMeetingById: async (id: string): Promise<Meeting | null> => {
    if (USE_API) {
      const response = await api.get(`/meetings/${id}`);
      return response.data;
    } else {
      const meetings = await dataService.getMeetings();
      return meetings.find((m) => m.id === id) || null;
    }
  },

  createMeeting: async (meetingData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    guestIds: string[];
  }): Promise<Meeting> => {
    if (USE_API) {
      const response = await api.post('/meetings', meetingData);
      return response.data;
    } else {
      const activeUser = dataService.getCurrentUser();
      if (!activeUser) throw new Error('Usuario no autenticado.');

      const meetings = getMockMeetings();
      const newMeetingId = `meet-${Date.now()}`;

      // Assemble guest structures
      const guests: MeetingGuest[] = meetingData.guestIds.map((userId, index) => ({
        id: `guest-${newMeetingId}-${index}`,
        meetingId: newMeetingId,
        userId,
        attendanceStatus: 'PENDIENTE',
        proposedAgenda: null,
      }));

      const newMeeting: Meeting = {
        id: newMeetingId,
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        time: meetingData.time,
        location: meetingData.location,
        status: 'PROGRAMADA',
        creatorId: activeUser.id,
        conclusions: null,
        guests,
      };

      meetings.unshift(newMeeting);
      saveMockMeetings(meetings);

      // Create Notification
      const notifications = getMockNotifications();
      const users = getMockUsers();
      const creatorName = `${activeUser.firstName} ${activeUser.lastName}`;
      
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Nueva Reunión Convocada',
        message: `${creatorName} ha convocado a la reunión "${meetingData.title}" para el ${meetingData.date}.`,
        date: new Date().toISOString(),
        type: 'info',
        read: false,
      });
      saveMockNotifications(notifications);

      return newMeeting;
    }
  },

  updateMeetingStatus: async (
    id: string,
    status: MeetingStatus,
    conclusions?: string | null
  ): Promise<Meeting> => {
    if (USE_API) {
      const response = await api.patch(`/meetings/${id}/status`, { status, conclusions });
      return response.data;
    } else {
      const meetings = getMockMeetings();
      const index = meetings.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Reunión no encontrada.');

      const activeUser = dataService.getCurrentUser();
      const updaterName = activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : 'El organizador';

      meetings[index].status = status;
      if (conclusions !== undefined) {
        meetings[index].conclusions = conclusions;
        
        // If status is executed, convert guest "PENDIENTE" or "CONFIRMADA" status to "ASISTIO" as default, if not marked.
        if (status === 'EJECUTADA') {
          meetings[index].guests = meetings[index].guests.map((g) => ({
            ...g,
            attendanceStatus: g.attendanceStatus === 'CONFIRMADA' ? 'ASISTIO' : (g.attendanceStatus === 'PENDIENTE' ? 'NO_ASISTIO' : g.attendanceStatus),
          }));
        }
      }

      saveMockMeetings(meetings);

      // Notification
      const notifications = getMockNotifications();
      let notifTitle = 'Reunión Actualizada';
      let notifMsg = `La reunión "${meetings[index].title}" ha sido actualizada a: ${status}.`;

      if (status === 'CANCELADA') {
        notifTitle = 'Reunión Cancelada';
        notifMsg = `${updaterName} ha cancelado la reunión "${meetings[index].title}".`;
      } else if (status === 'EJECUTADA') {
        notifTitle = 'Minutas y Acuerdos Registrados';
        notifMsg = `${updaterName} ha cerrado la reunión "${meetings[index].title}" y registrado los acuerdos finales.`;
      }

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: notifTitle,
        message: notifMsg,
        date: new Date().toISOString(),
        type: status === 'CANCELADA' ? 'warning' : 'success',
        read: false,
      });
      saveMockNotifications(notifications);

      const updatedFull = await dataService.getMeetingById(id);
      if (!updatedFull) throw new Error('Reunión no recuperada.');
      return updatedFull;
    }
  },

  confirmAttendance: async (
    meetingId: string,
    status: AttendanceStatus,
    proposedAgenda?: string | null
  ): Promise<Meeting> => {
    if (USE_API) {
      // Backend expects meetingId, and body includes attendanceStatus and proposedAgenda
      const response = await api.post(`/meetings/${meetingId}/confirm`, { attendanceStatus: status, proposedAgenda });
      return response.data;
    } else {
      const activeUser = dataService.getCurrentUser();
      if (!activeUser) throw new Error('Usuario no autenticado.');

      const meetings = getMockMeetings();
      const mIndex = meetings.findIndex((m) => m.id === meetingId);
      if (mIndex === -1) throw new Error('Reunión no encontrada.');

      const gIndex = meetings[mIndex].guests.findIndex((g) => g.userId === activeUser.id);
      
      if (gIndex === -1) {
        // Add user as a guest if they weren't listed (e.g., self-invite or back-office sync)
        meetings[mIndex].guests.push({
          id: `guest-${meetingId}-${activeUser.id}`,
          meetingId,
          userId: activeUser.id,
          attendanceStatus: status,
          proposedAgenda: proposedAgenda || null,
        });
      } else {
        meetings[mIndex].guests[gIndex].attendanceStatus = status;
        if (proposedAgenda !== undefined) {
          meetings[mIndex].guests[gIndex].proposedAgenda = proposedAgenda;
        }
      }

      saveMockMeetings(meetings);

      // Notification
      const notifications = getMockNotifications();
      const userName = `${activeUser.firstName} ${activeUser.lastName}`;
      const statusLabel = status === 'CONFIRMADA' ? 'confirmó su asistencia' : (status === 'RECHAZADA' ? 'declinó su asistencia' : 'actualizó su estatus');
      
      let notifMsg = `${userName} ${statusLabel} para la reunión "${meetings[mIndex].title}".`;
      if (proposedAgenda) {
        notifMsg += ` Además, propuso un tema en agenda: "${proposedAgenda.substring(0, 40)}..."`;
      }

      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: proposedAgenda ? 'Asistencia y Propuesta de Tema' : 'Confirmación de Asistencia',
        message: notifMsg,
        date: new Date().toISOString(),
        type: status === 'CONFIRMADA' ? 'success' : 'alert',
        read: false,
      });
      saveMockNotifications(notifications);

      const updatedFull = await dataService.getMeetingById(meetingId);
      if (!updatedFull) throw new Error('Reunión no recuperada.');
      return updatedFull;
    }
  },

  // 5. NOTIFICATIONS SERVICE
  getNotifications: async (): Promise<Notification[]> => {
    if (USE_API) {
      const response = await api.get('/notifications');
      return response.data;
    } else {
      return getMockNotifications();
    }
  },

  markNotificationsAsRead: async (): Promise<void> => {
    if (USE_API) {
      await api.post('/notifications/read-all');
    } else {
      const notifications = getMockNotifications().map((n) => ({ ...n, read: true }));
      saveMockNotifications(notifications);
    }
  },

  getAuditLogs: async (): Promise<any[]> => {
    if (USE_API) {
      try {
        const response = await api.get('/audit-logs');
        return response.data;
      } catch {
        return JSON.parse(localStorage.getItem('ugma_mock_audit_logs') || '[]');
      }
    } else {
      return JSON.parse(localStorage.getItem('ugma_mock_audit_logs') || '[]');
    }
  },

  addAuditLog: async (action: string, userEmail: string): Promise<void> => {
    const logs = JSON.parse(localStorage.getItem('ugma_mock_audit_logs') || '[]');
    const newLog = {
      id: `log-${Date.now()}`,
      action: action.toUpperCase(),
      user: userEmail,
      date: new Date().toISOString(),
      ip: `192.168.1.${Math.floor(Math.random() * 150) + 100}`
    };
    logs.unshift(newLog);
    localStorage.setItem('ugma_mock_audit_logs', JSON.stringify(logs));
    
    if (USE_API) {
      try {
        await api.post('/audit-logs', { action, user: userEmail });
      } catch (e) {
        console.warn('Backend audit logger failed, using localStorage fallback:', e);
      }
    }
  },
};
