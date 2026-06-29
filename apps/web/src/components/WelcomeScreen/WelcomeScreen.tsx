import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { Video, VideoOff, Mic, MicOff, BookOpen, User, Sparkles, LogIn, Shield, Briefcase } from 'lucide-react';
import type { UserRole } from '../../lib/roles';
import { ROLE_META } from '../../lib/roles';
import './WelcomeScreen.css';

// Icon đại diện cho từng vai trò trong bộ chọn
const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={16} />,
  manager: <Briefcase size={16} />,
  teacher: <Sparkles size={16} />,
  student: <User size={16} />,
};

export const WelcomeScreen: React.FC = () => {
  const { joinSession } = useMeeting();
  const { user } = useAuth();
  const authRole = user?.role || 'student';
  
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  // Mặc định theo vai trò đã đăng nhập, nhưng vẫn cho phép đổi trước khi vào lớp
  const [role, setRole] = useState<UserRole>(authRole);
  
  const [localMuteAudio, setLocalMuteAudio] = useState(false);
  const [localMuteVideo, setLocalMuteVideo] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Request camera for the preview window
  useEffect(() => {
    if (localMuteVideo) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 480, height: 360 }, audio: true })
      .then(s => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.warn('Không thể truy cập camera/micro cho màn hình chờ:', err);
        setLocalMuteVideo(true);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localMuteVideo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) return;
    
    // Stop local stream tracks before entering room
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    joinSession(room.trim(), name.trim(), role);
  };

  return (
    <div className="welcome-container">
      {/* Background glow animations */}
      <div className="glow-orb glow-orb-primary"></div>
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      <header className="welcome-header">
        <div className="logo">
          <BookOpen className="logo-icon" />
          <span>EduMeet</span>
        </div>
        <div className="badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Phiên bản cao cấp</span>
        </div>
      </header>

      <main className="welcome-content">
        <div className="welcome-card-wrapper">
          {/* Card Left: Camera Preview */}
          <div className="preview-card glass-panel">
            <div className="video-preview-container">
              {localMuteVideo ? (
                <div className="video-placeholder">
                  <div className="avatar-wave">
                    <User size={64} className="avatar-icon" />
                  </div>
                  <p>Camera đã tắt</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="preview-video-feed"
                />
              )}

              {/* Float settings controls */}
              <div className="preview-controls">
                <button
                  type="button"
                  onClick={() => setLocalMuteAudio(prev => !prev)}
                  className={`control-btn ${localMuteAudio ? 'btn-danger' : 'btn-active'}`}
                  title={localMuteAudio ? 'Bật Micro' : 'Tắt Micro'}
                >
                  {localMuteAudio ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  type="button"
                  onClick={() => setLocalMuteVideo(prev => !prev)}
                  className={`control-btn ${localMuteVideo ? 'btn-danger' : 'btn-active'}`}
                  title={localMuteVideo ? 'Bật Camera' : 'Tắt Camera'}
                >
                  {localMuteVideo ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              </div>
            </div>
            
            <div className="preview-footer">
              <span className="dot pulse-green"></span>
              <p>Hệ thống WebRTC đã sẵn sàng kết nối</p>
            </div>
          </div>

          {/* Card Right: Form Join */}
          <form className="join-form glass-panel" onSubmit={handleSubmit}>
            <div className="form-head">
              <h2>Tham Gia Lớp Học</h2>
              <p>Nhập thông tin bên dưới để bắt đầu tiết học trực tuyến</p>
            </div>

            <div className="input-group">
              <label htmlFor="room-name">Mã hoặc Tên Lớp Học</label>
              <div className="input-wrapper">
                <BookOpen className="input-icon" />
                <input
                  id="room-name"
                  type="text"
                  placeholder="Ví dụ: toan-tin-k12"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="user-name">Họ và Tên của Bạn</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="user-name"
                  type="text"
                  placeholder="Nhập tên hiển thị..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Vai Trò Trong Lớp Học</label>
              <div className="role-selector">
                {(['student', 'teacher', 'manager', 'admin'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`role-btn ${role === r ? 'active' : ''}`}
                    title={ROLE_META[r].description}
                  >
                    {ROLE_ICONS[r]}
                    <span>{ROLE_META[r].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!name.trim() || !room.trim()}
            >
              <span>Vào lớp học ngay</span>
              <LogIn size={18} className="btn-icon" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
