import React from 'react';
import { useClass } from '../../context/ClassContext';
import {
  Calendar, Clock, ArrowRight, TrendingUp, UserCheck, Activity,
  Users, Radio, Wifi, Lock, BookOpen, GraduationCap, Presentation, Eye,
} from 'lucide-react';
import { dashboardByRole, mockUpcomingClasses, mockLiveClasses } from '../../lib/mockData';
import type { KpiIconName } from '../../lib/mockData';
import './DashboardPage.css';

// Ánh xạ tên icon (trong mock data) sang component icon
const KPI_ICONS: Record<KpiIconName, React.ReactNode> = {
  attendance: <UserCheck size={20} />,
  calendar: <Calendar size={20} />,
  quality: <Activity size={20} />,
  users: <Users size={20} />,
  live: <Radio size={20} />,
  lock: <Lock size={20} />,
  courses: <BookOpen size={20} />,
  teachers: <Presentation size={20} />,
  students: <GraduationCap size={20} />,
  sessions: <Wifi size={20} />,
};

export const DashboardPage: React.FC = () => {
  const { role, setActivePage, joinRoom, userName } = useClass();
  const data = dashboardByRole[role];

  return (
    <div className="page-container dashboard-page animate-fade-in">
      {/* Welcome Banner — theo vai trò */}
      <section className="welcome-banner glass-panel">
        <div className="banner-left">
          <h2>{data.bannerTitle}</h2>
          <p>{data.bannerSubtitle}</p>
        </div>
        <div className="banner-badge">
          <TrendingUp size={16} />
          <span>{data.bannerBadge}</span>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="kpi-grid">
        {data.kpis.map((k, idx) => (
          <div key={idx} className={`kpi-card glass-panel accent-${k.color}`}>
            <div className="kpi-header">
              <span className="kpi-title">{k.title}</span>
              <div className="kpi-icon-wrapper">{KPI_ICONS[k.icon]}</div>
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

        {/* Left Side: Lịch học/dạy (schedule) hoặc Lớp đang diễn ra (live) */}
        <section className="dashboard-section glass-panel">
          <div className="section-header">
            <h3>{data.listTitle}</h3>
          </div>

          {data.listType === 'schedule' ? (
            <div className="class-cards-list">
              {mockUpcomingClasses.map(cls => (
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
          ) : (
            <div className="class-cards-list">
              {mockLiveClasses.map(c => (
                <div key={c.id} className="class-item-card glass-panel">
                  <div className="class-item-details">
                    <span className="class-item-time">
                      <Radio size={12} className="text-danger" />
                      <span>Trực tiếp · {c.participantCount}/{c.capacity} người</span>
                    </span>
                    <h4>{c.subject}</h4>
                    <p className="teacher-name">{c.teacher} · phòng {c.room}</p>
                  </div>
                  <div className="class-item-action">
                    <button
                      onClick={() => joinRoom(c.room, userName || 'Người giám sát', role)}
                      className="live-join-btn"
                    >
                      <Eye size={14} />
                      <span>Giám sát</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Side: Thông báo — theo vai trò */}
        <section className="dashboard-section glass-panel">
          <div className="section-header">
            <h3>{data.notifTitle}</h3>
          </div>
          <div className="notification-list">
            {data.notifications.map(n => (
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
