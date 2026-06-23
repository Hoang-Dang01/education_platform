import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider } from './context/ClassContext';
import { MeetingProvider, useMeeting } from './context/MeetingContext';
import { LmsShell } from './components/LmsShell/LmsShell';
import { ClassroomScreen } from './components/ClassroomScreen/ClassroomScreen';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage/ForceChangePasswordPage';
import { Loader2 } from 'lucide-react';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { screen } = useMeeting();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary, #0b0c10)', color: 'var(--text-primary, #ffffff)', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent-primary, #4f46e5)' }} />
        <p style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '0.95rem' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (user?.mustChangePassword) {
    return <ForceChangePasswordPage />;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {screen === 'lms' ? <LmsShell /> : <ClassroomScreen />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MeetingProvider>
        <ClassProvider>
          <AppContent />
        </ClassProvider>
      </MeetingProvider>
    </AuthProvider>
  );
}

export default App;
