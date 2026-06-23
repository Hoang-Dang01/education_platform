import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Participant {
  id: string;
  name: string;
  role: string;
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  handRaiseTime?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  joinedAt: Date;
  activeTimeSeconds: number;
  videoTrack?: any;
  audioTrack?: any;
  latency?: number;
  packetLoss?: number;
  jitter?: number;
  bitrate?: number;
  framerate?: number;
  device?: DeviceType;
  network?: NetworkType;
  networkLabel?: string;
}

export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type NetworkType = 'wifi' | 'ethernet' | 'mobile' | 'vpn';

export type LmsPage = 'dashboard' | 'courses' | 'reports' | 'lobby' | 'users' | 'monitoring' | 'calendar';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: Date;
}

export interface DiagnosticAlert {
  id: string;
  type: 'local' | 'remote' | 'infrastructure';
  level: 'warning' | 'critical';
  title: string;
  message: string;
  solution: string;
  timestamp: Date;
}

interface ClassContextType {
  activePage: LmsPage;
  setActivePage: (page: LmsPage) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  courses: any[];
  classes: any[];
  upcomingSessions: any[];
  loading: boolean;
  error: string | null;
  refreshLmsData: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePageState] = useState<LmsPage>(() => {
    const hash = window.location.hash.replace('#', '') as LmsPage;
    const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring', 'calendar'];
    return validPages.includes(hash) ? hash : 'dashboard';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // LMS real database entities
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setActivePage = (page: LmsPage) => {
    setActivePageState(page);
    window.location.hash = page;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as LmsPage;
      const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring', 'calendar'];
      if (validPages.includes(hash)) {
        setActivePageState(hash);
      }
    };

    const currentHash = window.location.hash.replace('#', '') as LmsPage;
    const validPages: LmsPage[] = ['dashboard', 'courses', 'reports', 'lobby', 'users', 'monitoring', 'calendar'];
    if (!validPages.includes(currentHash)) {
      window.location.hash = activePage;
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, activePage]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshLmsData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [coursesData, classesData, upcomingData] = await Promise.all([
        api.getCourses(),
        api.getClasses(),
        api.getUpcomingSessions(),
      ]);
      setCourses(coursesData);
      setClasses(classesData);
      setUpcomingSessions(upcomingData);
    } catch (err: any) {
      console.error('Failed to fetch LMS data:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshLmsData();
    } else {
      setCourses([]);
      setClasses([]);
      setUpcomingSessions([]);
    }
  }, [isAuthenticated]);

  return (
    <ClassContext.Provider
      value={{
        activePage,
        setActivePage,
        theme,
        toggleTheme,
        courses,
        classes,
        upcomingSessions,
        loading,
        error,
        refreshLmsData,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
