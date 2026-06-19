import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';
import { SidePanel } from './SidePanel';
import { Clock, BookOpen, Presentation, MonitorUp } from 'lucide-react';
import './ClassroomScreen.css';

export const ClassroomScreen: React.FC = () => {
  const { roomName, isScreenSharing, userName } = useClass();
  const [duration, setDuration] = useState(0);

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
      {/* Background glowing orbs */}
      <div className="glow-orb glow-orb-primary"></div>
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      {/* Classroom Header Bar */}
      <header className="classroom-header-bar glass-panel">
        <div className="class-info">
          <BookOpen className="class-icon" />
          <div className="class-titles">
            <h2>Lớp Học: {roomName}</h2>
            <p>Bài học: Tích phân & Ứng dụng Giải tích</p>
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
        
        {/* Central screen share or Grid view */}
        <div className="workspace-main">
          {isScreenSharing ? (
            <div className="screen-share-split-layout">
              {/* Large shared viewport */}
              <div className="shared-viewport-container glass-panel">
                <div className="shared-screen-mock">
                  <div className="presentation-slide animate-float">
                    <Presentation className="presentation-icon" />
                    <h3>CHỦ ĐỀ LỚP HỌC</h3>
                    <h1>TÍCH PHÂN & ỨNG DỤNG</h1>
                    <div className="formula-box">
                      <code>{"∫ f(x)dx = F(x) + C"}</code>
                    </div>
                    <p className="sharer-tag">Màn hình trình chiếu của {userName}</p>
                  </div>
                  <div className="screen-pulse-border"></div>
                </div>
                <div className="viewport-overlay-indicator">
                  <MonitorUp size={16} />
                  <span>Đang chia sẻ màn hình chính</span>
                </div>
              </div>

              {/* Smaller vertical video strip at the side */}
              <div className="video-strip-container">
                <VideoGrid />
              </div>
            </div>
          ) : (
            /* Normal grid viewport */
            <div className="full-grid-viewport">
              <VideoGrid />
            </div>
          )}
        </div>

        {/* Right Collapsible Panel */}
        <SidePanel />

      </main>

      {/* Control Tools */}
      <ControlBar />
    </div>
  );
};
