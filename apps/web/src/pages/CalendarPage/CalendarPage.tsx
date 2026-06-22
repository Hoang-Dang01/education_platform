import React, { useState, useEffect } from 'react';
import { useClass } from '../../context/ClassContext';
import {
  ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock,
  ArrowRight, CalendarDays, X
} from 'lucide-react';
import { getScheduledClasses, saveScheduledClass, deleteScheduledClass } from '../../lib/localDb';
import type { ScheduledClass } from '../../lib/localDb';
import './CalendarPage.css';

export const CalendarPage: React.FC = () => {
  const { role, userName, joinRoom } = useClass();
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<ScheduledClass | null>(null);
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState<'live' | 'scheduled'>('scheduled');

  useEffect(() => {
    setClasses(getScheduledClasses());
  }, []);

  const loadClasses = () => {
    setClasses(getScheduledClasses());
  };

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const formatDateToYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Lấy danh sách lớp của ngày đang chọn
  const selectedDateStr = formatDateToYMD(selectedDate);
  const selectedDayClasses = classes.filter(cls => cls.date === selectedDateStr);

  // Điều hướng tháng
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Tính toán ô lịch
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Ngày đầu tiên của tháng
  const firstDayOfMonth = new Date(year, month, 1);
  // Thứ của ngày đầu tiên (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
  const dayOfWeek = firstDayOfMonth.getDay();
  // Quy đổi để Thứ 2 là index 0, Chủ nhật là index 6
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Số ngày trong tháng hiện tại
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Số ngày trong tháng trước
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Array<{
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    dateString: string;
    isToday: boolean;
    isSelected: boolean;
    events: ScheduledClass[];
  }> = [];

  // 1. Ô của tháng trước (trailing days)
  for (let i = startOffset - 1; i >= 0; i--) {
    const dVal = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dVal);
    const dateStr = formatDateToYMD(prevMonthDate);
    cells.push({
      day: dVal,
      date: prevMonthDate,
      isCurrentMonth: false,
      dateString: dateStr,
      isToday: dateStr === getTodayDateStr(),
      isSelected: dateStr === selectedDateStr,
      events: classes.filter(cls => cls.date === dateStr),
    });
  }

  // 2. Ô của tháng hiện tại
  for (let i = 1; i <= daysInMonth; i++) {
    const curMonthDate = new Date(year, month, i);
    const dateStr = formatDateToYMD(curMonthDate);
    cells.push({
      day: i,
      date: curMonthDate,
      isCurrentMonth: true,
      dateString: dateStr,
      isToday: dateStr === getTodayDateStr(),
      isSelected: dateStr === selectedDateStr,
      events: classes.filter(cls => cls.date === dateStr),
    });
  }

  // 3. Ô của tháng sau (leading days) để đủ 42 ô (6 tuần)
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = formatDateToYMD(nextMonthDate);
    cells.push({
      day: i,
      date: nextMonthDate,
      isCurrentMonth: false,
      dateString: dateStr,
      isToday: dateStr === getTodayDateStr(),
      isSelected: dateStr === selectedDateStr,
      events: classes.filter(cls => cls.date === dateStr),
    });
  }

  // Mở modal thêm/sửa lịch
  const handleOpenModal = (cls: ScheduledClass | null = null, defaultDateStr?: string) => {
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
      setDate(defaultDateStr || selectedDateStr);
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

  // Lưu lịch học
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
    loadClasses();
    
    // Cập nhật lại selectedDate theo date vừa chọn
    const [y, m, d] = date.split('-').map(Number);
    setSelectedDate(new Date(y, m - 1, d));
    
    handleCloseModal();
  };

  // Xóa lịch học
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch giảng dạy này không?')) {
      deleteScheduledClass(id);
      loadClasses();
    }
  };

  const isEditable = role === 'teacher' || role === 'manager' || role === 'admin';
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="calendar-page-container">
      {/* Cột Trái: Lưới Lịch biểu */}
      <div className="calendar-grid-wrapper">
        <div className="calendar-header-bar">
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={prevMonth} title="Tháng trước">
              <ChevronLeft size={16} />
            </button>
            <span className="calendar-month-title">
              {monthNames[month]} {year}
            </span>
            <button className="calendar-nav-btn" onClick={nextMonth} title="Tháng sau">
              <ChevronRight size={16} />
            </button>
          </div>
          {isEditable && (
            <button className="add-class-btn" onClick={() => handleOpenModal(null)}>
              <Plus size={14} />
              <span>Lên lịch học</span>
            </button>
          )}
        </div>

        <div className="calendar-grid-panel glass-panel">
          <div className="calendar-weekdays-grid">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div>Chủ Nhật</div>
          </div>

          <div className="calendar-cells-grid">
            {cells.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => cell.isCurrentMonth && setSelectedDate(cell.date)}
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''} ${cell.isSelected ? 'selected' : ''}`}
              >
                <span className="cell-day-number">{cell.day}</span>
                
                {/* Event previews inside cell (hiển thị tối đa 2 sự kiện trên grid để tránh tràn) */}
                <div className="cell-event-preview-list">
                  {cell.events.slice(0, 2).map(ev => (
                    <div 
                      key={ev.id} 
                      className={`cell-event-preview-badge ${ev.status === 'live' ? 'live' : ''}`}
                      title={`${ev.time}: ${ev.subject}`}
                    >
                      {ev.subject}
                    </div>
                  ))}
                  {cell.events.length > 2 && (
                    <div className="cell-event-preview-badge" style={{ borderLeft: 'none', background: 'rgba(255,255,255,0.05)', textAlign: 'center', fontWeight: 'bold' }}>
                      +{cell.events.length - 2} lớp
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột Phải: Chi tiết ngày đã chọn */}
      <div className="calendar-sidebar-details glass-panel">
        <div className="sidebar-details-header">
          <h3>Chi Tiết Ngày</h3>
          <p>
            {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="sidebar-class-cards-list">
          {selectedDayClasses.map(cls => (
            <div key={cls.id} className="sidebar-class-card">
              <div className="sidebar-class-card-time">
                <span className="sidebar-time-badge">
                  <Clock size={12} />
                  <span>{cls.time}</span>
                </span>
                <span className={`sidebar-status-badge ${cls.status}`}>
                  {cls.status === 'live' ? 'Đang trực tiếp' : 'Đang lên lịch'}
                </span>
              </div>
              <h4>{cls.subject}</h4>
              <p className="sidebar-class-card-meta">
                GV: <strong>{cls.teacher}</strong> <br />
                Phòng học: <code>{cls.room}</code>
              </p>
              
              <div className="sidebar-class-card-actions">
                {cls.status === 'live' ? (
                  <button
                    onClick={() => joinRoom(cls.room, userName || 'Học viên', role)}
                    className="sidebar-join-btn animate-pulse-light"
                  >
                    <span>Vào lớp học</span>
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <span className="wait-badge" style={{ fontSize: '0.7rem' }}>Chờ đến giờ học</span>
                )}

                {isEditable && (
                  <div className="sidebar-admin-btns">
                    <button className="sidebar-icon-btn edit" onClick={() => handleOpenModal(cls)} title="Sửa lịch học">
                      <Edit size={13} />
                    </button>
                    <button className="sidebar-icon-btn delete" onClick={() => handleDelete(cls.id)} title="Xóa lịch học">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {selectedDayClasses.length === 0 && (
            <div className="sidebar-no-classes">
              <CalendarDays className="sidebar-no-classes-icon" size={36} />
              <p>Không có lịch học nào được sắp xếp cho ngày này.</p>
              {isEditable && (
                <button className="quick-add-btn" onClick={() => handleOpenModal(null, selectedDateStr)}>
                  <Plus size={14} />
                  <span>Thêm lớp nhanh</span>
                </button>
              )}
            </div>
          )}
        </div>
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
                <label>Trạng Thế</label>
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
