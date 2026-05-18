export type Role = 'ADMIN' | 'DIRECTOR_UGMA' | 'DIRECTOR_ESCUELA' | 'COORDINADOR' | 'INVITADO';

export type MeetingStatus = 'PROGRAMADA' | 'CANCELADA' | 'EJECUTADA';

export type AttendanceStatus = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA' | 'ASISTIO' | 'NO_ASISTIO';

export interface School {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  schoolId?: string | null;
  school?: School | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingGuest {
  id: string;
  meetingId: string;
  userId: string;
  user?: User;
  attendanceStatus: AttendanceStatus;
  proposedAgenda?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null; // Agenda
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  status: MeetingStatus;
  creatorId: string;
  creator?: User;
  guests: MeetingGuest[];
  conclusions?: string | null; // Minutas / Acuerdos
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
}
