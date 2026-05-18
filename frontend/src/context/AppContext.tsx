import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dataService } from '../services/dataService';
import { User, Meeting, School, Notification, Role, MeetingStatus, AttendanceStatus } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  meetings: Meeting[];
  schools: School[];
  users: User[];
  notifications: Notification[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  fetchMeetings: () => Promise<void>;
  createMeeting: (meetingData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    guestIds: string[];
  }) => Promise<void>;
  updateMeetingStatus: (id: string, status: MeetingStatus, conclusions?: string | null) => Promise<void>;
  updateAttendance: (meetingId: string, status: AttendanceStatus, proposedAgenda?: string | null) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  clearError: () => void;
  registerUser: (userData: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: Role;
    schoolId?: string | null;
  }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  auditLogs: any[];
  fetchAuditLogs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session from local storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem('ugma_token');
        const storedUser = localStorage.getItem('ugma_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Pre-fetch lists if logged in
          await Promise.all([
            loadAllData(),
          ]);
        }
      } catch (err: any) {
        console.error('Failed to restore authentication session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const logs = await dataService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const loadAllData = async () => {
    try {
      const [meetingsData, schoolsData, usersData, notificationsData, auditLogsData] = await Promise.all([
        dataService.getMeetings(),
        dataService.getSchools(),
        dataService.getUsers(),
        dataService.getNotifications(),
        dataService.getAuditLogs(),
      ]);
      setMeetings(meetingsData);
      setSchools(schoolsData);
      setUsers(usersData);
      setNotifications(notificationsData);
      setAuditLogs(auditLogsData);
    } catch (err: any) {
      console.error('Failed to load portal data:', err);
    }
  };

  const login = async (email: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataService.login(email, password);
      localStorage.setItem('ugma_token', response.token);
      localStorage.setItem('ugma_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      
      // Load their relevant lists
      const [meetingsData, schoolsData, usersData, notificationsData, auditLogsData] = await Promise.all([
        dataService.getMeetings(),
        dataService.getSchools(),
        dataService.getUsers(),
        dataService.getNotifications(),
        dataService.getAuditLogs(),
      ]);
      setMeetings(meetingsData);
      setSchools(schoolsData);
      setUsers(usersData);
      setNotifications(notificationsData);
      setAuditLogs(auditLogsData);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ugma_token');
    localStorage.removeItem('ugma_user');
    setToken(null);
    setUser(null);
    setMeetings([]);
    setNotifications([]);
    setError(null);
  };

  const fetchMeetings = async () => {
    try {
      const meetingsData = await dataService.getMeetings();
      setMeetings(meetingsData);
    } catch (err: any) {
      setError(err.message || 'Error al recargar las reuniones.');
    }
  };

  const createMeeting = async (meetingData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    guestIds: string[];
  }) => {
    setError(null);
    try {
      await dataService.createMeeting(meetingData);
      await Promise.all([fetchMeetings(), fetchNotifications()]);
    } catch (err: any) {
      setError(err.message || 'Error al crear la reunión.');
      throw err;
    }
  };

  const updateMeetingStatus = async (id: string, status: MeetingStatus, conclusions?: string | null) => {
    setError(null);
    try {
      await dataService.updateMeetingStatus(id, status, conclusions);
      
      const meeting = meetings.find(m => m.id === id);
      const meetingTitle = meeting ? meeting.title : id;
      if (status === 'EJECUTADA') {
        await dataService.addAuditLog(`FIRMA DIGITAL Y CIERRE DE MINUTA: ${meetingTitle}`, user?.email || 'usuario@ugma.edu.ve');
      } else if (status === 'CANCELADA') {
        await dataService.addAuditLog(`REUNIÓN CANCELADA: ${meetingTitle}`, user?.email || 'usuario@ugma.edu.ve');
      }

      await Promise.all([fetchMeetings(), fetchNotifications(), fetchAuditLogs()]);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado de la reunión.');
      throw err;
    }
  };

  const updateAttendance = async (meetingId: string, status: AttendanceStatus, proposedAgenda?: string | null) => {
    setError(null);
    try {
      await dataService.confirmAttendance(meetingId, status, proposedAgenda);
      await Promise.all([fetchMeetings(), fetchNotifications()]);
    } catch (err: any) {
      setError(err.message || 'Error al enviar confirmación de asistencia.');
      throw err;
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsData = await dataService.getNotifications();
      setNotifications(notificationsData);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await dataService.markNotificationsAsRead();
      await fetchNotifications();
    } catch (err: any) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const registerUser = async (userData: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: Role;
    schoolId?: string | null;
  }) => {
    setError(null);
    try {
      await dataService.register(userData);
      await dataService.addAuditLog(`REGISTRO DE NUEVO PERSONAL: ${userData.firstName} ${userData.lastName} (${userData.email})`, user?.email || 'admin@ugma.edu.ve');
      const [usersData, logsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getAuditLogs(),
      ]);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (err: any) {
      setError(err.message || 'Error al registrar al usuario.');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    setError(null);
    try {
      const targetUser = users.find(u => u.id === id);
      const targetName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : id;
      await dataService.deleteUser(id);
      await dataService.addAuditLog(`BAJA DE PERSONAL/USUARIO: ${targetName}`, user?.email || 'admin@ugma.edu.ve');
      const [usersData, meetingsData, logsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getMeetings(),
        dataService.getAuditLogs(),
      ]);
      setUsers(usersData);
      setMeetings(meetingsData);
      setAuditLogs(logsData);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar al usuario.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        meetings,
        schools,
        users,
        notifications,
        login,
        logout,
        fetchMeetings,
        createMeeting,
        updateMeetingStatus,
        updateAttendance,
        fetchNotifications,
        markNotificationsAsRead,
        clearError,
        registerUser,
        deleteUser,
        auditLogs,
        fetchAuditLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
