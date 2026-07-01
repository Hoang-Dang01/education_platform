import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import {
  Calendar, Clock, ArrowRight, TrendingUp, UserCheck, Activity,
  Users, Radio, Wifi, Lock, BookOpen, GraduationCap, Presentation, Eye,
  Plus, Edit, Trash2, X, Loader2, AlertCircle, Bell,
} from 'lucide-react';
import { dashboardByRole, mockLiveClasses } from '../../lib/mockData';
import type { KpiIconName } from '../../lib/mockData';
import { getScheduledClasses, saveScheduledClass, deleteScheduledClass } from '../../lib/localDb';
import type { ScheduledClass } from '../../lib/localDb';
import { api } from '../../lib/api';
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

// Determine pronoun (thầy / cô) if userName contains it
const getPronoun = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  if (normalized.startsWith('cô') || normalized.includes(' cô ')) return 'cô';
  if (normalized.startsWith('thầy') || normalized.includes(' thầy ')) return 'thầy';
  return 'thầy/cô';
};

// Helper to generate a dynamic, friendly, role-based and time-based greeting message
const getDynamicGreeting = (role: string, userName: string): string => {
  const hour = new Date().getHours();
  
  // Time-based prefix
  let timeGreeting = "Chào bạn";
  if (hour >= 5 && hour < 11) timeGreeting = "Chào buổi sáng";
  else if (hour >= 11 && hour < 14) timeGreeting = "Chào buổi trưa";
  else if (hour >= 14 && hour < 18) timeGreeting = "Chào buổi chiều";
  else if (hour >= 18 && hour < 22) timeGreeting = "Chào buổi tối";
  else timeGreeting = "Chào bạn";

  const pronoun = getPronoun(userName);

  // Role-specific motivational greeting pools
  const studentGreetings = [
    "Chúc bạn có một buổi học thật thú vị và tiếp thu nhiều kiến thức mới! 📚",
    "Hôm nay là một ngày tuyệt vời để bứt phá giới hạn và tiếp thu tri thức mới. Bắt đầu thôi! 🚀",
    "Học tập là một hành trình lâu dài, hãy luôn kiên trì và tin tưởng vào nỗ lực của bản thân! ✨",
    "WiFi cực mạnh, lớp học đã sẵn sàng. Chúc bạn có một giờ học đầy hứng khởi và hiệu quả nhé! 💻",
    "Mỗi kiến thức học được hôm nay sẽ mở rộng cánh cửa tương lai cho bạn. Chúc học tập tốt! 🌟",
    "Chào bạn! Chúc bạn gặt hái được nhiều điểm 10 đỏ chói và những phát biểu ấn tượng hôm nay! 🎯"
  ];

  const teacherGreetings = [
    `Chúc ${pronoun} có một buổi dạy thật suôn sẻ và tràn đầy niềm cảm hứng! 🍀`,
    `Sự tận tâm của ${pronoun} là ngọn hải đăng cho học viên. Chúc ${pronoun} buổi dạy thật trọn vẹn! 👨‍🏫`,
    `Mong hôm nay mọi tiết giảng đều tràn ngập năng lượng tích cực và sự hào hứng từ học sinh! 🌟`,
    `Chúc ${pronoun} một ngày lên lớp thành công rực rỡ và luôn tràn đầy nhiệt huyết! ☀️`,
    `Gửi tới ${pronoun} những lời chúc tốt đẹp nhất cho buổi lên lớp hôm nay. Hãy cùng tạo nên những giờ học đầy bổ ích! ✨`,
    `Chúc ${pronoun} có những trải nghiệm giảng dạy tuyệt vời và tương tác sôi nổi cùng học viên hôm nay! 🚀`
  ];

  const managerGreetings = [
    "Chúc bạn một ngày làm việc và điều phối đào tạo thật suôn sẻ! 📋",
    "Chúc bạn một ngày quản trị hiệu quả, tối ưu hóa chất lượng giảng dạy! 💼",
    "Hệ thống LMS luôn sẵn sàng hỗ trợ các lớp học trực tuyến vận hành mượt mà nhất! 🛠️",
    "Chúc bạn hoàn thành xuất sắc các mục tiêu quản lý và kiểm tra giáo án hôm nay! 🎯"
  ];

  const adminGreetings = [
    "Chúc bạn một ngày làm việc và quản trị hệ thống hiệu quả! ⚙️",
    "Mọi thông số kết nối và dịch vụ mạng WebRTC đang trong trạng thái tốt! 📡",
    "Chúc bạn giữ vững hệ thống vận hành trơn tru, bảo mật và an toàn dữ liệu! 🔐",
    "Hệ thống giám sát EduMeet hoạt động ổn định. Chúc một ngày trực máy suôn sẻ! 💻"
  ];

  // Select message pool based on role
  let pool = studentGreetings;
  if (role === 'teacher') pool = teacherGreetings;
  else if (role === 'manager') pool = managerGreetings;
  else if (role === 'admin') pool = adminGreetings;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return `${timeGreeting}, ${userName || 'Thành viên'}! ${pool[randomIndex]}`;
};

const renderKpiFooter = (k: any) => {
  const valueStr = k.value || '';
  
  if (k.icon === 'attendance' || k.icon === 'calendar') {
    let pctValue = 0;
    if (valueStr.includes('%')) {
      pctValue = parseInt(valueStr) || 0;
    } else if (valueStr.includes('/')) {
      const parts = valueStr.split('/');
      const num = parseInt(parts[0]) || 0;
      const den = parseInt(parts[1]) || 1;
      pctValue = Math.round((num / den) * 100);
    } else {
      pctValue = parseInt(valueStr) || 0;
    }
    
    return (
      <div className="kpi-indicator-progress">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pctValue || 0}%` }}></div>
        </div>
        <span className="progress-label">{pctValue || 0}% Đạt</span>
      </div>
    );
  }

  if (k.icon === 'quality') {
    const numericPing = parseInt(valueStr) || 0;
    const isNoData = valueStr === '--' || numericPing === 0;
    const rating = isNoData ? 'Không có dữ liệu' : numericPing < 100 ? 'Tốt' : numericPing <= 200 ? 'Khá' : 'Chậm';
    
    return (
      <div className="kpi-indicator-signal">
        <div className="signal-bars">
          <span className={`bar ${!isNoData ? 'active' : ''}`}></span>
          <span className={`bar ${!isNoData && numericPing < 250 ? 'active' : ''}`}></span>
          <span className={`bar ${!isNoData && numericPing < 180 ? 'active' : ''}`}></span>
          <span className={`bar ${!isNoData && numericPing < 100 ? 'active' : ''}`}></span>
          <span className="bar"></span>
        </div>
        <span className="signal-label">{valueStr} ({rating})</span>
      </div>
    );
  }

  if (k.icon === 'live') {
    const count = parseInt(valueStr) || 0;
    const isLive = count > 0;
    return (
      <div className="kpi-indicator-status">
        <span className={`status-dot ${isLive ? 'live' : 'offline'}`}></span>
        <span className="status-label">{isLive ? 'Đang diễn ra trực tuyến' : 'Ngoại tuyến'}</span>
      </div>
    );
  }

  // Mặc định hoặc cho các loại đếm số lượng (sessions, users, courses, teachers, students, lock)
  const isZero = valueStr === '0' || !valueStr;
  return (
    <div className="kpi-indicator-trend positive">
      <TrendingUp size={12} />
      <span>{isZero ? 'Đang cập nhật' : 'Xu hướng ổn định'}</span>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { upcomingSessions, loading: lmsLoading, error: lmsError, refreshLmsData } = useClass();
  const { joinSession, loading: meetingLoading } = useMeeting();
  
  const role = user?.role || 'student';
  const userName = user?.name || '';
  const data = dashboardByRole[role as keyof typeof dashboardByRole] || dashboardByRole.student;
  const pronoun = getPronoun(userName);

  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [notifLoading, setNotifLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>(data.kpis);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    setStatsError(null);
    api.getDashboardStats()
      .then(res => {
        if (res && res.kpis) {
          const merged = data.kpis.map((localKpi, idx) => {
            const serverKpi = res.kpis[idx] || {};
            return {
              ...localKpi,
              value: serverKpi.value !== undefined ? serverKpi.value : localKpi.value,
              desc: serverKpi.desc !== undefined ? serverKpi.desc : localKpi.desc,
            };
          });
          setKpis(merged);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải số liệu thống kê:", err);
        setStatsError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setStatsLoading(false);
      });
  }, [data]);

  useEffect(() => {
    setKpis(data.kpis);
    fetchStats();
  }, [role, data, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => setNotifLoading(false), 900); // 900ms mock skeleton loading
    return () => clearTimeout(timer);
  }, []);

  const dynamicBannerTitle = useMemo(() => {
    if (role === 'teacher') {
      const titlePronoun = pronoun === 'cô' ? 'Cô' : pronoun === 'thầy' ? 'Thầy' : 'Thầy/Cô';
      return `Chào mừng ${titlePronoun} trở lại! 👋`;
    }
    return data.bannerTitle;
  }, [role, pronoun, data.bannerTitle]);

  const greetingMessage = useMemo(() => getDynamicGreeting(role, userName), [role, userName]);
  
  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ScheduledClass | null>(null);
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState<'live' | 'scheduled'>('scheduled');

  useEffect(() => {
    // Merge real database sessions with local storage schedules for mock fallback
    const localSchedules = getScheduledClasses();
    const mappedSessions: ScheduledClass[] = upcomingSessions.map(sess => {
      const start = sess.startTime ? new Date(sess.startTime) : new Date(sess.createdAt);
      const dateStr = start.toISOString().split('T')[0];
      
      const startStr = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const end = new Date(start.getTime() + 90 * 60000);
      const endStr = end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      return {
        id: sess.id, // Real session UUID from DB
        subject: `${sess.class?.course?.name || ''} - ${sess.class?.name || ''}`,
        time: `${startStr} - ${endStr}`,
        date: dateStr,
        teacher: sess.class?.teacher?.name || 'Giáo viên',
        room: sess.roomName,
        status: sess.status as 'live' | 'scheduled',
      };
    });

    // Remove duplicates from local if they share roomName with real DB ones
    const filteredLocal = localSchedules.filter(l => !mappedSessions.some(m => m.room === l.room));
    setClasses([...mappedSessions, ...filteredLocal]);
  }, [upcomingSessions]);

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
      
      const targetDate = new Date().toISOString().split('T')[0];
      const nextHour = new Date().getHours() + 1;
      const startHour = nextHour < 24 ? nextHour : 8;
      const endHour = startHour + 1;
      const pad = (n: number) => String(n).padStart(2, '0');
      setTime(`${pad(startHour)}:00 - ${pad(endHour % 24)}:30`);
      
      setDate(targetDate);
      setTeacher(role === 'teacher' ? (userName || '') : '');
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

    // Kiểm tra lịch học không được trong quá khứ
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (date < todayStr) {
      alert('Không thể tạo hoặc cập nhật lịch học trong quá khứ.');
      return;
    }
    
    if (date === todayStr) {
      const timeMatch = time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/);
      if (timeMatch) {
        const startTimeStr = timeMatch[0];
        const [hours, minutes] = startTimeStr.split(':').map(Number);
        
        const scheduleDateTime = new Date();
        scheduleDateTime.setHours(hours, minutes, 0, 0);
        
        if (scheduleDateTime <= now) {
          alert('Giờ bắt đầu của lịch học phải lớn hơn thời điểm hiện tại.');
          return;
        }
      }
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

  if (lmsLoading || meetingLoading) {
    return (
      <div className="page-container dashboard-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin text-primary" size={48} style={{ margin: '0 auto 1rem' }} />
          <p>{meetingLoading ? 'Đang kết nối phòng học WebRTC...' : 'Đang tải dữ liệu LMS...'}</p>
        </div>
      </div>
    );
  }

  if (lmsError) {
    return (
      <div className="page-container dashboard-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle className="text-danger" size={48} style={{ margin: '0 auto 1rem' }} />
          <h3>Đã xảy ra lỗi</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{lmsError}</p>
          <button onClick={refreshLmsData} className="save-btn-modal" style={{ width: 'auto', padding: '8px 20px' }}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page animate-fade-in">
      {/* Welcome Banner — theo vai trò */}
      <section className="welcome-banner glass-panel">
        <div className="banner-left">
          <h2>{dynamicBannerTitle}</h2>
          <p>{greetingMessage}</p>
        </div>
        <div className="banner-badge">
          <TrendingUp size={16} />
          <span>{data.bannerBadge}</span>
        </div>

        {/* Decorative SVG Mesh Vector (Opacity < 0.15) */}
        <div className="banner-decoration-svg">
          <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 Q40,40 100,90 T200,50" stroke="url(#banner-grad)" strokeWidth="3" fill="none" />
            <path d="M0,60 Q50,90 120,40 T200,80" stroke="url(#banner-grad)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <circle cx="60" cy="50" r="12" stroke="url(#banner-grad)" strokeWidth="1" fill="none" />
            <circle cx="150" cy="80" r="6" stroke="url(#banner-grad)" strokeWidth="1" fill="none" />
            <defs>
              <linearGradient id="banner-grad" x1="0" y1="0" x2="200" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* KPI Stats Grid with consistent structures */}
      {statsError ? (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-danger-light)' }}>
            <AlertCircle size={20} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Không thể tải số liệu thống kê</strong>
              <small style={{ color: 'var(--text-muted)' }}>{statsError}</small>
            </div>
          </div>
          <button onClick={fetchStats} className="save-btn-modal" style={{ width: 'auto', padding: '6px 16px', fontSize: '0.8rem' }}>Thử lại</button>
        </div>
      ) : (
        <section className="kpi-grid">
          {kpis.map((k, idx) => {
            const displayValue = k.value === '--' ? 'N/A' : k.value;

            return (
              <div key={idx} className={`kpi-card glass-panel accent-${k.color}`}>
                <div className="kpi-header">
                  <span className="kpi-title">{k.title}</span>
                  <div className="kpi-icon-wrapper">{KPI_ICONS[k.icon as KpiIconName] || null}</div>
                </div>
                <div className="kpi-body">
                  {statsLoading ? (
                    <>
                      <div className="skeleton-title" style={{ width: '50%', height: '24px', margin: '0.25rem 0' }}></div>
                      <div className="skeleton-desc" style={{ width: '85%', height: '14px', margin: '0.25rem 0' }}></div>
                      <div className="kpi-custom-footer" style={{ marginTop: '0.75rem' }}>
                        <div className="skeleton-desc" style={{ width: '95%', height: '12px' }}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3>{displayValue}</h3>
                      <p className="kpi-default-desc">{k.desc}</p>
                      <div className="kpi-custom-footer">
                        {renderKpiFooter(k)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

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
                        onClick={() => joinSession(cls.id, userName || 'Học viên', role)}
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
                      onClick={() => joinSession(c.id, userName || 'Người giám sát', role)}
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
            {notifLoading ? (
              <div className="skeleton-notif-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-notif-item animate-pulse-light">
                    <div className="skeleton-meta">
                      <div className="skeleton-tag" />
                      <div className="skeleton-time" />
                    </div>
                    <div className="skeleton-title" />
                    <div className="skeleton-desc" />
                  </div>
                ))}
              </div>
            ) : data.notifications && data.notifications.length > 0 ? (
              data.notifications.map(n => (
                <div key={n.id} className="notif-item">
                  <div className="notif-meta">
                    <span className="notif-tag">{n.tag}</span>
                    <span className="notif-time">{n.time}</span>
                  </div>
                  <h4>{n.title}</h4>
                  <p>{n.desc}</p>
                </div>
              ))
            ) : (
              <div className="empty-notification-state animate-fade-in">
                <div className="empty-bell-icon">
                  <Bell size={40} />
                </div>
                <h4>Chưa có thông báo mới</h4>
                <p>Mọi cập nhật và tin tức mới nhất từ hệ thống sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Glassmorphism Schedule Modal Form */}
      {isModalOpen && createPortal(
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
                    min={new Date().toISOString().split('T')[0]}
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
        </div>,
        document.body
      )}
    </div>
  );
};

