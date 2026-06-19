import React from 'react';
import { useClass } from '../context/ClassContext';
import { WelcomeScreen } from './WelcomeScreen';
import { DashboardPage } from '../pages/DashboardPage';
import { CoursesPage } from '../pages/CoursesPage';
import { ReportsPage } from '../pages/ReportsPage';
import { LayoutDashboard, BookOpen, BarChart3, Video, User, Bell, Shield, LogOut, Sun, Moon } from 'lucide-react';
import './LmsShell.css';

export const LmsShell: React.FC = () => {
  const { activePage, setActivePage, userName, role, logout, theme, toggleTheme } = useClass();

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'courses':
        return <CoursesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'lobby':
        return <WelcomeScreen />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="lms-shell">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary"></div>
      <div className="glow-orb glow-orb-purple"></div>

      {/* Sidebar Navigation */}
      <aside className="lms-sidebar glass-panel">
        <div className="sidebar-logo">
          <BookOpen className="logo-icon" />
          <span>EduMeet</span>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Bảng điều khiển</span>
          </button>

          <button
            onClick={() => setActivePage('courses')}
            className={`nav-item ${activePage === 'courses' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Khóa học của tôi</span>
          </button>

          <button
            onClick={() => setActivePage('reports')}
            className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Báo cáo chuyên cần</span>
          </button>

          <button
            onClick={() => setActivePage('lobby')}
            className={`nav-item ${activePage === 'lobby' ? 'active' : ''}`}
          >
            <Video size={18} />
            <span>Phòng học trực tuyến</span>
          </button>
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="sidebar-user-card glass-panel">
          <div className="user-info-section">
            <div className="user-avatar-circle">
              <User size={16} />
            </div>
            <div className="user-info">
              <h4>{userName || 'Khách'}</h4>
              <span className="user-role-tag">
                {role === 'teacher' ? (
                  <>
                    <Shield size={10} />
                    <span>Giáo viên</span>
                  </>
                ) : (
                  <span>Học sinh</span>
                )}
              </span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Đăng xuất">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Panel */}
      <main className="lms-main-content">
        <header className="lms-content-header glass-panel">
          <div className="header-breadcrumbs">
            <span>EduMeet LMS</span>
            <span className="separator">/</span>
            <span className="active-breadcrumb">
              {activePage === 'dashboard' && 'Bảng điều khiển'}
              {activePage === 'courses' && 'Khóa học của tôi'}
              {activePage === 'reports' && 'Báo cáo chuyên cần'}
              {activePage === 'lobby' && 'Phòng học trực tuyến'}
            </span>
          </div>

          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={toggleTheme} className="icon-action-btn" title={theme === 'dark' ? "Chế độ sáng" : "Chế độ tối"}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-action-btn" title="Thông báo">
              <Bell size={18} />
              <span className="bell-badge"></span>
            </button>
          </div>
        </header>

        <div className="lms-page-viewport">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
