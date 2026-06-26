import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { ControlBar } from '../ControlBar/ControlBar';
import { SidePanel } from '../SidePanel/SidePanel';
import { Clock, BookOpen, AlertTriangle, WifiOff, X, Server, Activity } from 'lucide-react';
import { GridLayout } from './layouts/GridLayout';
import { FocusLayout } from './layouts/FocusLayout';
import { ScreenShareLayout } from './layouts/ScreenShareLayout';
import './ClassroomScreen.css';
import './DiagnosticAlerts.css';

export const ClassroomScreen: React.FC = () => {
  const { 
    roomName,
    className,
    lessonTitle,
    layoutMode,
    diagnosticAlerts,
    dismissAlert,
    simulationMode,
    triggerSimulation,
    connectionState,
    leaveSession
  } = useMeeting();
  const [duration, setDuration] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);

  // Classroom duration timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <div className="classroom-container">
      {/* Reconnecting Passive Banner */}
      {connectionState === 'reconnecting' && (
        <div className="reconnecting-passive-banner">
          <div className="reconnecting-banner-content">
            <span className="reconnecting-spinner"></span>
            <WifiOff size={16} className="reconnecting-icon-anim" />
            <span className="reconnecting-text">Đường truyền không ổn định. Đang tự động kết nối lại...</span>
          </div>
          <button onClick={leaveSession} className="reconnecting-leave-btn">
            Thoát lớp học
          </button>
        </div>
      )}
      {/* Background glowing orbs */}
      <div className="glow-orb glow-orb-primary"></div>
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      {/* Diagnostic Alerts Overlay */}
      {diagnosticAlerts.length > 0 && (
        <div className="diagnostic-alerts-container">
          {diagnosticAlerts.map(alert => (
            <div key={alert.id} className={`diagnostic-alert-card alert-level-${alert.level}`}>
              <div className="alert-icon-wrapper">
                {alert.type === 'local' ? (
                  <WifiOff size={18} />
                ) : alert.type === 'infrastructure' ? (
                  <Server size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </div>
              <div className="alert-content-details">
                <h4>{alert.title}</h4>
                <p className="alert-msg-text">{alert.message}</p>
                {alert.solution && <p className="alert-sol-text">{alert.solution}</p>}
              </div>
              <button onClick={() => dismissAlert(alert.id)} className="alert-close-action-btn" title="Đóng cảnh báo">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Classroom Header Bar */}
      <header className="classroom-header-bar glass-panel">
        <div className="class-info">
          <BookOpen className="class-icon" />
          <div className="class-titles">
            <h2>{className || 'Lớp Học Trực Tuyến'}</h2>
            <p>Bài học: {lessonTitle || roomName}</p>
          </div>
        </div>

        <div className="class-status-indicators">
          <div className="status-item">
            <span className="dot pulse-green"></span>
            <span>Trực tiếp</span>
          </div>
          <div className="status-item timer-badge">
            <Clock size={14} />
            <span>Thời lượng: {formatDuration(duration)}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="classroom-workspace">
        
        <div className="workspace-main">
          {layoutMode === 'screenshare' ? (
            <ScreenShareLayout />
          ) : layoutMode === 'focus' ? (
            <FocusLayout />
          ) : (
            <GridLayout />
          )}
        </div>

        {/* Right Collapsible Panel */}
        <SidePanel />

      </main>

      {/* Control Tools */}
      <ControlBar />

      {/* Simulation Toggle & Console Panel */}
      <button 
        onClick={() => setShowSimulation(prev => !prev)}
        className={`simulation-panel-toggle-btn ${showSimulation ? 'panel-active' : ''}`}
        title="Mô phỏng sự cố mạng để chẩn đoán"
      >
        <Activity size={14} />
        <span>Giả lập mạng {simulationMode !== 'none' && `(Đang chạy)`}</span>
      </button>

      {showSimulation && (
        <div className="simulation-control-card glass-panel">
          <div className="simulation-card-header">
            <h3>
              <Activity size={14} />
              <span>Bảng Giả Lập Mạng</span>
            </h3>
            <button onClick={() => setShowSimulation(false)} className="close-debug-card-btn">
              <X size={14} />
            </button>
          </div>
          <p className="simulation-description">
            Lựa chọn một chế độ để chẩn đoán sự cố mạng hoạt động trên lớp học trực tuyến.
          </p>
          <div className="simulation-buttons-grid">
            <button 
              type="button"
              onClick={() => triggerSimulation('none')} 
              className={`sim-mode-btn ${simulationMode === 'none' ? 'active' : ''}`}
            >
              <span>Bình thường (Mặc định)</span>
            </button>
            <button 
              type="button"
              onClick={() => triggerSimulation('local')} 
              className={`sim-mode-btn ${simulationMode === 'local' ? 'active' : ''}`}
            >
              <span>Sự cố mạng của bạn (Local)</span>
            </button>
            <button 
              type="button"
              onClick={() => triggerSimulation('teacher')} 
              className={`sim-mode-btn ${simulationMode === 'teacher' ? 'active' : ''}`}
            >
              <span>Sự cố mạng Giáo viên (Host)</span>
            </button>
            <button 
              type="button"
              onClick={() => triggerSimulation('infrastructure')} 
              className={`sim-mode-btn ${simulationMode === 'infrastructure' ? 'active' : ''}`}
            >
              <span>Sự cố hệ thống (Server Infra)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
