import React, { useState, useEffect, useRef } from 'react';
import { useClass } from '../../context/ClassContext';
import { MessageSquare, Users, Send, Download, X, CheckCircle, Clock } from 'lucide-react';
import './SidePanel.css';

export const SidePanel: React.FC = () => {
  const {
    panelOpen,
    activeTab,
    chatMessages,
    participants,
    raiseHandQueue,
    sendMessage,
    setActiveTab,
    togglePanel,
    role,
    isBreakoutActive,
    breakoutTimeLeft,
    breakoutRoomsCount,
    startBreakout,
    stopBreakout,
  } = useClass();

  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // local breakout inputs
  const [numRoomsInput, setNumRoomsInput] = useState(2);
  const [breakoutTimeInput, setBreakoutTimeInput] = useState(10);

  // Auto scroll to chat bottom
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, panelOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    const headers = ['Họ và Tên', 'Vai Trò', 'Thời gian tham gia', 'Thời gian có mặt (giây)', 'Trạng thái điểm danh'];
    const rows = participants.map(p => {
      const attendanceStatus = p.role === 'teacher' 
        ? 'Giáo viên' 
        : p.activeTimeSeconds > 120 
          ? 'Đủ điều kiện' 
          : 'Chưa đủ điều kiện';

      const joinedStr = p.joinedAt instanceof Date 
        ? p.joinedAt.toLocaleTimeString('vi-VN') 
        : new Date(p.joinedAt).toLocaleTimeString('vi-VN');

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}"`,
        `"${joinedStr}"`,
        p.activeTimeSeconds,
        `"${attendanceStatus}"`,
      ];
    });

    let csvContent = '\uFEFF'; // Excel UTF-8 BOM
    csvContent += headers.join(',') + '\n';
    csvContent += rows.map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diem_danh_lop_hoc_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isTeacherOrAdmin = role === 'teacher' || role === 'manager' || role === 'admin';

  const renderParticipantRow = (p: typeof participants[0]) => {
    const minutes = Math.floor(p.activeTimeSeconds / 60);
    const seconds = p.activeTimeSeconds % 60;
    const isTeacherRole = p.role === 'teacher';
    const meetsAttendance = isTeacherRole || p.activeTimeSeconds > 120; // 2 minutes threshold

    return (
      <div key={p.id} className="student-row glass-panel" style={{ marginBottom: '0.4rem' }}>
        <div className="student-info">
          <span className="student-name">
            {p.name} {p.isLocal && '(Bạn)'}
          </span>
          <div className="student-role-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <span className="student-role">
              {p.role === 'teacher' ? 'Giáo viên' : p.role === 'student' ? 'Học sinh' : p.role === 'manager' ? 'Quản lý' : 'Admin'}
            </span>
            {(p.connectionQuality === 'poor' || p.connectionQuality === 'critical') && p.latency !== undefined && (
              <span className="student-network-alert-tag" style={{ fontSize: '0.7rem', color: '#ff4d4d', fontWeight: 'bold', background: 'rgba(255,77,77,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                Ping: {p.latency}ms | Loss: {p.packetLoss}%
              </span>
            )}
          </div>
        </div>

        <div className="student-meta">
          {!isTeacherRole && (
            <div className="attendance-status">
              {meetsAttendance ? (
                <div className="status-badge success" title="Thời gian có mặt hợp lệ">
                  <CheckCircle size={12} />
                  <span>{minutes}m {seconds}s</span>
                </div>
              ) : (
                <div className="status-badge warning" title="Thời gian có mặt chưa đạt chuẩn">
                  <Clock size={12} />
                  <span>{minutes}m {seconds}s</span>
                </div>
              )}
            </div>
          )}

          {/* Connection quality signal bar */}
          <div className="quality-indicator">
            {p.connectionQuality === 'excellent' && (
              <span 
                className="sig excel" 
                title={`Ping cực thấp\nPing: ${p.latency ?? 25}ms | Jitter: ${p.jitter ?? 2}ms | Mất gói: ${p.packetLoss ?? 0}%`} 
              />
            )}
            {p.connectionQuality === 'good' && (
              <span 
                className="sig good" 
                title={`Ping ổn định\nPing: ${p.latency ?? 75}ms | Jitter: ${p.jitter ?? 8}ms | Mất gói: ${p.packetLoss ?? 0.5}%`} 
              />
            )}
            {p.connectionQuality === 'poor' && (
              <span 
                className="sig poor" 
                title={`Độ trễ cao\nPing: ${p.latency ?? 220}ms | Jitter: ${p.jitter ?? 32}ms | Mất gói: ${p.packetLoss ?? 4}%`} 
              />
            )}
            {p.connectionQuality === 'critical' && (
              <span 
                className="sig crit" 
                title={`Mất kết nối mạng\nPing: ${p.latency ?? 350}ms | Jitter: ${p.jitter ?? 55}ms | Mất gói: ${p.packetLoss ?? 8}%`} 
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderParticipantsList = () => {
    if (!isBreakoutActive) {
      return (
        <div className="participant-list">
          {participants.map(p => renderParticipantRow(p))}
        </div>
      );
    }

    const teacher = participants.find(p => p.role === 'teacher');
    const students = participants.filter(p => p.role === 'student');

    const groups: typeof participants[] = Array.from({ length: breakoutRoomsCount }, () => []);
    students.forEach((s, idx) => {
      groups[idx % breakoutRoomsCount].push(s);
    });

    return (
      <div className="breakout-groups-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {teacher && (
          <div className="breakout-group-box glass-panel" style={{ borderLeft: '3px solid var(--color-cyan)', padding: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 800 }}>PHÒNG CHÍNH (GIÁO VIÊN)</h4>
            {renderParticipantRow(teacher)}
          </div>
        )}

        {groups.map((grp, grpIdx) => (
          <div key={grpIdx} className="breakout-group-box glass-panel" style={{ borderLeft: '3px solid var(--color-primary)', padding: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', marginBottom: '0.5rem', fontWeight: 800 }}>
              PHÒNG THẢO LUẬN NHÓM {grpIdx + 1} ({grp.length} học viên)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {grp.map(s => renderParticipantRow(s))}
              {grp.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>Chưa xếp học sinh</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const formattedTimeLeft = () => {
    const mins = Math.floor(breakoutTimeLeft / 60);
    const secs = breakoutTimeLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!panelOpen) return null;

  return (
    <aside className="side-panel glass-panel">
      {/* Header Tabs */}
      <div className="panel-header">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>Thảo luận</span>
            {chatMessages.length > 0 && activeTab !== 'chat' && (
              <span className="unread-dot"></span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('attendance')}
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          >
            <Users size={16} />
            <span>Lớp học</span>
            {raiseHandQueue.length > 0 && (
              <span className="hand-queue-badge">{raiseHandQueue.length}</span>
            )}
          </button>
        </div>

        <button onClick={togglePanel} className="close-btn" title="Đóng bảng">
          <X size={16} />
        </button>
      </div>

      {/* Tab Contents */}
      <div className="panel-content">
        {activeTab === 'chat' ? (
          /* Chat Section */
          <div className="chat-container">
            <div className="messages-list">
              {chatMessages.map(msg => {
                const isMe = msg.senderId === 'local-user';
                return (
                  <div key={msg.id} className={`message-item ${isMe ? 'message-me' : 'message-other'}`}>
                     <div className="message-header">
                      <span className="msg-sender">{msg.senderName}</span>
                      {msg.senderRole === 'teacher' && <span className="msg-teacher-tag">GV</span>}
                      <span className="msg-time">
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="message-bubble">{msg.text}</div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-bar">
              <input
                type="text"
                placeholder="Nhập nội dung tin nhắn..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
              <button type="submit" disabled={!inputVal.trim()} className="send-btn">
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          /* Attendance Section */
          <div className="attendance-container">
            <div className="attendance-header-actions">
              <h3>Điểm Danh & Trạng Thái</h3>
              {role === 'teacher' && (
                <button onClick={handleExportCSV} className="export-btn" title="Xuất file CSV">
                  <Download size={14} />
                  <span>Xuất báo cáo</span>
                </button>
              )}
            </div>

            {/* Breakout Rooms Controller Widget (Giáo viên / Quản lý) */}
            {isTeacherOrAdmin && (
              <div className="breakout-panel-widget glass-panel" style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.12)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  👥 Chia Nhóm Breakout Rooms
                </h4>
                {!isBreakoutActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số nhóm</label>
                        <select 
                          value={numRoomsInput} 
                          onChange={e => setNumRoomsInput(parseInt(e.target.value))}
                          style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.75rem', outline: 'none' }}
                        >
                          <option value={2}>2 Nhóm</option>
                          <option value={3}>3 Nhóm</option>
                          <option value={4}>4 Nhóm</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Thời gian (phút)</label>
                        <input 
                          type="number" 
                          value={breakoutTimeInput} 
                          min={1} 
                          max={60} 
                          onChange={e => setBreakoutTimeInput(parseInt(e.target.value) || 1)}
                          style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => startBreakout(numRoomsInput, breakoutTimeInput)}
                      style={{ padding: '0.45rem', border: 'none', borderRadius: '6px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px var(--color-primary-glow)' }}
                    >
                      Bắt đầu thảo luận nhóm
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="animate-pulse" style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span>
                        Đang thảo luận...
                      </span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-warning-light)' }}>
                        Còn lại: {formattedTimeLeft()}
                      </span>
                    </div>
                    <button 
                      onClick={stopBreakout}
                      style={{ padding: '0.45rem', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-light)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Kết thúc thảo luận (Thu quân)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Breakout Rooms Alert for Student */}
            {!isTeacherOrAdmin && isBreakoutActive && (
              <div className="breakout-panel-widget glass-panel" style={{ padding: '0.85rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-warning-light)', marginBottom: '0.25rem' }}>
                  💬 Đang trong phiên Thảo Luận Nhóm
                </h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Hãy thảo luận bài học cùng các bạn học trong nhóm của mình.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <span>Hội quân sau:</span>
                  <span className="text-warning">{formattedTimeLeft()}</span>
                </div>
              </div>
            )}

            {/* Attendance Queue summary */}
            {raiseHandQueue.length > 0 && (
              <div className="hand-raise-queue-alert">
                <h4>Hàng đợi phát biểu ({raiseHandQueue.length})</h4>
                <ol className="queue-list">
                  {raiseHandQueue.map((id, index) => {
                    const participant = participants.find(p => p.id === id);
                    return (
                      <li key={id} className="queue-item">
                        <span className="queue-index">#{index + 1}</span>
                        <span className="queue-name">{participant?.name}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* List of participants with live telemetry and attendance indicators */}
            {renderParticipantsList()}
          </div>
        )}
      </div>
    </aside>
  );
};
