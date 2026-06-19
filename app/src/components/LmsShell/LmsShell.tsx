import React from 'react';
import { useClass } from '../../context/ClassContext';
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import { DashboardPage } from '../../pages/DashboardPage/DashboardPage';
import { CoursesPage } from '../../pages/CoursesPage/CoursesPage';
import { ReportsPage } from '../../pages/ReportsPage/ReportsPage';
import { UserManagementPage } from '../../pages/UserManagementPage/UserManagementPage';
import { MonitoringPage } from '../../pages/MonitoringPage/MonitoringPage';
import { LayoutDashboard, BookOpen, BarChart3, Video, User, Bell, Shield, LogOut, Sun, Moon, Users, MonitorPlay } from 'lucide-react';
import { can, roleLabel } from '../../lib/roles';
import './LmsShell.css';

export const LmsShell: React.FC = () => {
  const { activePage, setActivePage, userName, role, logout, theme, toggleTheme } = useClass();

  // Quyền hiển thị các mục điều hướng theo BRD 2.5
  const canViewReports = can(role, 'view_reports');
  const canManageUsers = can(role, 'manage_users');
  const canMonitor = can(role, 'monitor_classes');

  // Nhãn mục "khóa học" thay đổi theo vai trò
  const coursesLabel =
    role === 'student' ? 'Khóa học của tôi'
    : role === 'teacher' ? 'Lớp phụ trách'
    : 'Quản lý khóa học';

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'courses':
        return <CoursesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UserManagementPage />;
      case 'monitoring':
        return <MonitoringPage />;
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
            <span>{coursesLabel}</span>
          </button>

          {canViewReports && (
            <button
              onClick={() => setActivePage('reports')}
              className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Báo cáo chuyên cần</span>
            </button>
          )}

          {canMonitor && (
            <button
              onClick={() => setActivePage('monitoring')}
              className={`nav-item ${activePage === 'monitoring' ? 'active' : ''}`}
            >
              <MonitorPlay size={18} />
              <span>Giám sát lớp học</span>
            </button>
          )}

          {canManageUsers && (
            <button
              onClick={() => setActivePage('users')}
              className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Quản lý người dùng</span>
            </button>
          )}

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
                {can(role, 'host_session') && <Shield size={10} />}
                <span>{roleLabel(role)}</span>
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
              {activePage === 'courses' && coursesLabel}
              {activePage === 'reports' && 'Báo cáo chuyên cần'}
              {activePage === 'monitoring' && 'Giám sát lớp học'}
              {activePage === 'users' && 'Quản lý người dùng'}
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
