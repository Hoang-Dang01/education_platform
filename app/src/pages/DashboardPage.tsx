import React from 'react';
import { useClass } from '../context/ClassContext';
import { Calendar, Clock, ArrowRight, TrendingUp, UserCheck, Activity } from 'lucide-react';
import { mockDashboardKpis, mockUpcomingClasses, mockNotifications } from '../lib/mockData';
import './Pages.css';

export const DashboardPage: React.FC = () => {
  const { setActivePage } = useClass();

  // Ánh xạ icon tương ứng với màu sắc KPI
  const kpiIcons: Record<string, React.ReactNode> = {
    green: <UserCheck size={20} />,
    indigo: <Calendar size={20} />,
    cyan: <Activity size={20} />,
  };

  const kpis = mockDashboardKpis.map(k => ({
    ...k,
    icon: kpiIcons[k.color] || <Activity size={20} />,
  }));

  const upcomingClasses = mockUpcomingClasses;
  const recentNotifications = mockNotifications;

  return (
    <div className="page-container dashboard-page animate-fade-in">
      {/* Welcome Banner */}
      <section className="welcome-banner glass-panel">
        <div className="banner-left">
          <h2>Chào mừng trở lại! 👋</h2>
          <p>Hôm nay bạn có {upcomingClasses.filter(c => c.status === 'live').length} tiết học đang diễn ra trực tuyến.</p>
        </div>
        <div className="banner-badge">
          <TrendingUp size={16} />
          <span>Học tập đạt hiệu quả cao</span>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="kpi-grid">
        {kpis.map((k, idx) => (
          <div key={idx} className={`kpi-card glass-panel accent-${k.color}`}>
            <div className="kpi-header">
              <span className="kpi-title">{k.title}</span>
              <div className="kpi-icon-wrapper">{k.icon}</div>
            </div>
            <div className="kpi-body">
              <h3>{k.value}</h3>
              <p>{k.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Split Grid */}
      <div className="split-grid-dashboard">
        
        {/* Left Side: Upcoming Classes */}
        <section className="dashboard-section glass-panel">
          <div className="section-header">
            <h3>Lịch học hôm nay</h3>
          </div>
          <div className="class-cards-list">
            {upcomingClasses.map(cls => (
              <div key={cls.id} className="class-item-card glass-panel">
                <div className="class-item-details">
                  <span className="class-item-time">
                    <Clock size={12} />
                    <span>{cls.time}</span>
                  </span>
                  <h4>{cls.subject}</h4>
                  <p className="teacher-name">{cls.teacher}</p>
                </div>
                <div className="class-item-action">
                  {cls.status === 'live' ? (
                    <button
                      onClick={() => setActivePage('lobby')}
                      className="live-join-btn animate-pulse-light"
                    >
                      <span>Vào lớp ngay</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <span className="wait-badge">Chờ đến giờ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Side: Updates Notification Panel */}
        <section className="dashboard-section glass-panel">
          <div className="section-header">
            <h3>Cập nhật & Thông báo</h3>
          </div>
          <div className="notification-list">
            {recentNotifications.map(n => (
              <div key={n.id} className="notif-item">
                <div className="notif-meta">
                  <span className="notif-tag">{n.tag}</span>
                  <span className="notif-time">{n.time}</span>
                </div>
                <h4>{n.title}</h4>
                <p>{n.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
