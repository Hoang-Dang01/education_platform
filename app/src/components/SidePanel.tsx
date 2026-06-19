import React, { useState, useEffect, useRef } from 'react';
import { useClass } from '../context/ClassContext';
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
  } = useClass();

  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      return [
        p.name,
        p.role === 'teacher' ? 'Giáo viên' : 'Học sinh',
        p.joinedAt.toLocaleTimeString('vi-VN'),
        p.activeTimeSeconds,
        attendanceStatus,
      ];
    });

    const csvContent = 
      'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `diem_danh_lop_hoc_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="participant-list">
              {participants.map(p => {
                const minutes = Math.floor(p.activeTimeSeconds / 60);
                const seconds = p.activeTimeSeconds % 60;
                
                // Attendance threshold (simulate)
                const isTeacher = p.role === 'teacher';
                const meetsAttendance = isTeacher || p.activeTimeSeconds > 120; // 2 minutes for demo threshold
                
                return (
                  <div key={p.id} className="student-row glass-panel">
                    <div className="student-info">
                      <span className="student-name">{p.name}</span>
                      <span className="student-role">
                        {p.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                      </span>
                    </div>

                    <div className="student-meta">
                      {/* Realtime Attendance status indicator */}
                      {!isTeacher && (
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
                        {p.connectionQuality === 'excellent' && <span className="sig excel" title="Ping cực thấp" />}
                        {p.connectionQuality === 'good' && <span className="sig good" title="Ping ổn định" />}
                        {p.connectionQuality === 'poor' && <span className="sig poor" title="Độ trễ cao" />}
                        {p.connectionQuality === 'critical' && <span className="sig crit" title="Mất kết nối mạng" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
