import React from 'react';
import { ClassProvider, useClass } from './context/ClassContext';
import { LmsShell } from './components/LmsShell/LmsShell';
import { ClassroomScreen } from './components/ClassroomScreen/ClassroomScreen';
import { LoginPage } from './pages/LoginPage/LoginPage';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { screen, isAuthenticated } = useClass();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {screen === 'lms' ? <LmsShell /> : <ClassroomScreen />}
    </div>
  );
};

function App() {
  return (
    <ClassProvider>
      <AppContent />
    </ClassProvider>
  );
}

export default App;
