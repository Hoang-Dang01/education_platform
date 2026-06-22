import React, { useState, useEffect } from 'react';
import { useClass } from '../../context/ClassContext';
import {
  Calendar, Clock, ArrowRight, TrendingUp, UserCheck, Activity,
  Users, Radio, Wifi, Lock, BookOpen, GraduationCap, Presentation, Eye,
  Plus, Edit, Trash2, X,
} from 'lucide-react';
import { dashboardByRole, mockLiveClasses } from '../../lib/mockData';
import type { KpiIconName } from '../../lib/mockData';
import { getScheduledClasses, saveScheduledClass, deleteScheduledClass } from '../../lib/localDb';
import type { ScheduledClass } from '../../lib/localDb';
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
  const { role, joinRoom, userName } = useClass();
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('today');
  
  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ScheduledClass | null>(null);
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState<'live' | 'scheduled'>('scheduled');

  const data = dashboardByRole[role];

  useEffect(() => {
    setClasses(getScheduledClasses());
  }, []);

  const handleOpenModal = (cls: ScheduledClass | null = null) => {
    if (cls) {
      setEditClass(cls);
      setSubject(cls.subject);
      setTime(cls.time);
      setDate(cls.date);
      setTeacher(cls.teacher);
      setRoom(cls.room);
      setStatus(cls.status);
    } else {
      setEditClass(null);
      setSubject('');
      setTime('08:00 - 09:30');
      setDate(new Date().toISOString().split('T')[0]);
      setTeacher(role === 'teacher' ? (userName || 'Thầy Nguyễn Hải Nam') : 'Cô Lê Thu Thảo');
      setRoom('phong-' + Math.floor(Math.random() * 900 + 100));
      setStatus('scheduled');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditClass(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !time.trim() || !date.trim() || !teacher.trim() || !room.trim()) {
      alert('Vui lòng điền đầy đủ thông tin lịch học');
      return;
    }
    const newCls: ScheduledClass = {
      id: editClass?.id || 'class-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      subject,
      time,
      date,
      teacher,
      room,
      status
    };
    saveScheduledClass(newCls);
    setClasses(getScheduledClasses());
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch giảng dạy này không?')) {
      deleteScheduledClass(id);
      setClasses(getScheduledClasses());
    }
  };

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowDateStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const filteredClasses = classes.filter(cls => {
    if (dateFilter === 'today') return cls.date === getTodayDateStr();
    if (dateFilter === 'tomorrow') return cls.date === getTomorrowDateStr();
    return true;
  });

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const today = getTodayDateStr();
    const tomorrow = getTomorrowDateStr();
    if (dateStr === today) return 'Hôm nay';
    if (dateStr === tomorrow) return 'Ngày mai';
    
    // DD/MM format
    const [, m, d] = dateStr.split('-');
    return d && m ? `${d}/${m}` : dateStr;
  };

  const isEditable = role === 'teacher' || role === 'manager' || role === 'admin';

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
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3>{data.listTitle}</h3>
            {data.listType === 'schedule' && isEditable && (
              <button className="add-class-btn" onClick={() => handleOpenModal(null)}>
                <Plus size={14} />
                <span>Thêm lịch học</span>
              </button>
            )}
          </div>

          {/* Date Filter Tabs for Schedules */}
          {data.listType === 'schedule' && (
            <div className="date-tabs-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <button 
                onClick={() => setDateFilter('today')}
                className={`date-tab-btn ${dateFilter === 'today' ? 'active' : ''}`}
              >
                Hôm nay
              </button>
              <button 
                onClick={() => setDateFilter('tomorrow')}
                className={`date-tab-btn ${dateFilter === 'tomorrow' ? 'active' : ''}`}
              >
                Ngày mai
              </button>
              <button 
                onClick={() => setDateFilter('all')}
                className={`date-tab-btn ${dateFilter === 'all' ? 'active' : ''}`}
              >
                Tất cả lịch
              </button>
            </div>
          )}

          {data.listType === 'schedule' ? (
            <div className="class-cards-list">
              {filteredClasses.map(cls => (
                <div key={cls.id} className="class-item-card glass-panel">
                  <div className="class-item-details">
                    <span className="class-item-time" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        <span>{cls.time}</span>
                      </span>
                      <span className="date-tag-badge" style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {formatDateLabel(cls.date)}
                      </span>
                    </span>
                    <h4>{cls.subject}</h4>
                    <p className="teacher-name">{cls.teacher} · phòng {cls.room}</p>
                  </div>
                  <div className="class-item-action-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEditable && (
                      <div className="schedule-admin-controls" style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="action-icon-btn edit" onClick={() => handleOpenModal(cls)} title="Sửa lịch học">
                          <Edit size={14} />
                        </button>
                        <button className="action-icon-btn delete" onClick={() => handleDelete(cls.id)} title="Xóa lịch học">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    
                    {cls.status === 'live' ? (
                      <button
                        onClick={() => joinRoom(cls.room, userName || 'Học viên', role)}
                        className="live-join-btn animate-pulse-light"
                      >
                        <span>Vào lớp</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span className="wait-badge">Chờ giờ</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredClasses.length === 0 && (
                <div className="no-materials" style={{ textAlign: 'center', padding: '2rem' }}>
                  Chưa xếp lịch giảng dạy nào trong ngày này.
                </div>
              )}
            </div>
          ) : (
            <div className="class-cards-list">
              {mockLiveClasses.map(c => (
                <div key={c.id} className="class-item-card glass-panel">
                  <div className="class-item-details">
                    <span className="class-item-time">
                      <Radio size={12} className="text-danger animate-pulse" />
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

      {/* Glassmorphism Schedule Modal Form */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content glass-panel animate-scale-up">
            <div className="modal-header">
              <h3>{editClass ? 'Cập Nhật Lịch Giảng Dạy' : 'Thêm Lịch Giảng Dạy Mới'}</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Tên Môn Học / Lớp Học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Toán Học Giải Tích 12"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Ngày Học</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Giờ Học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 10:00 - 11:30"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giáo Viên Phụ Trách</label>
                <input
                  type="text"
                  placeholder="Tên giáo viên"
                  value={teacher}
                  onChange={e => setTeacher(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mã Phòng Học (Jitsi Room Name)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: toan-tin-k12"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Trạng Thái</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'live' | 'scheduled')}
                >
                  <option value="scheduled">Đang lên lịch (Chờ giờ)</option>
                  <option value="live">Đang diễn ra (Vào lớp ngay)</option>
                </select>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="cancel-btn-modal" onClick={handleCloseModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="save-btn-modal">
                  {editClass ? 'Cập nhật' : 'Tạo lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

