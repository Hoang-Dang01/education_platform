import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { Video, VideoOff, Mic, MicOff, BookOpen, User, Sparkles, LogIn, Shield, Briefcase, Loader2, Lock } from 'lucide-react';
import type { UserRole } from '../../lib/roles';
import { ROLE_META } from '../../lib/roles';
import './WelcomeScreen.css';

// Icon đại diện cho từng vai trò trong bộ chọn
const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={20} />,
  manager: <Briefcase size={20} />,
  teacher: <Sparkles size={20} />,
  student: <User size={20} />,
};

export const WelcomeScreen: React.FC = () => {
  const { joinSession, error, connectionState } = useMeeting();
  const { user } = useAuth();
  const authRole = user?.role || 'student';
  
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  // Mặc định theo vai trò đã đăng nhập, nhưng vẫn cho phép đổi trước khi vào lớp
  const [role, setRole] = useState<UserRole>(authRole);
  
  const [localMuteAudio, setLocalMuteAudio] = useState(false);
  const [localMuteVideo, setLocalMuteVideo] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-fill user credentials if authenticated
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role || 'student');
    }
  }, [user]);

  // Sanitize and autofill Room Code from search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || '';
    if (roomParam) {
      setRoom(roomParam.replace(/[^\w-]/g, ''));
    }
  }, []);

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

  // Voice level analysis using AnalyserNode
  useEffect(() => {
    if (!stream || localMuteAudio) {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setIsSpeaking(false);
      return;
    }

    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrameId: number;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          // Threshold of average volume range (0 - 255)
          setIsSpeaking(average > 15);
          animationFrameId = requestAnimationFrame(checkAudio);
        };
        
        checkAudio();
      }
    } catch (e) {
      console.warn('Không thể khởi tạo bộ phân tích âm thanh:', e);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (source) {
        source.disconnect();
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [stream, localMuteAudio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) return;
    
    // Stop local stream tracks before entering room
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    joinSession(room.trim(), name.trim(), role);
  };

  // Join CTA State Machine helper
  const getSubmitButtonState = () => {
    if (connectionState === 'connecting') {
      return {
        disabled: true,
        text: 'Đang kết nối...',
        showSpinner: true
      };
    }
    if (!room.trim()) {
      return {
        disabled: true,
        text: 'Nhập mã lớp học',
        showSpinner: false
      };
    }
    if (!name.trim()) {
      return {
        disabled: true,
        text: 'Nhập họ và tên',
        showSpinner: false
      };
    }
    return {
      disabled: false,
      text: 'Vào lớp học ngay',
      showSpinner: false
    };
  };

  const btnState = getSubmitButtonState();
  const cameraActive = !!stream && !localMuteVideo;
  const micActive = !localMuteAudio;

  return (
    <div className="welcome-container">
      {/* Dynamic Grid Background - Option B with subtle tech orbits & node networks */}
      <div className="lobby-background-mesh">
        <svg width="100%" height="100%" className="mesh-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(99, 102, 241, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          
          {/* Subtle tech orbits */}
          <circle cx="50%" cy="50%" r="350" fill="none" stroke="rgba(99, 102, 241, 0.015)" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="520" fill="none" stroke="rgba(139, 92, 246, 0.01)" strokeWidth="1.5" strokeDasharray="10 10" />
          
          {/* Glow spots */}
          <circle cx="20%" cy="20%" r="220" fill="rgba(99, 102, 241, 0.02)" filter="blur(80px)" />
          <circle cx="80%" cy="80%" r="280" fill="rgba(139, 92, 246, 0.02)" filter="blur(100px)" />

          {/* Connected network node dots (8 dots) */}
          <circle cx="25%" cy="25%" r="3" fill="rgba(99, 102, 241, 0.12)" />
          <circle cx="75%" cy="30%" r="3.5" fill="rgba(139, 92, 246, 0.12)" />
          <circle cx="15%" cy="65%" r="3" fill="rgba(99, 102, 241, 0.1)" />
          <circle cx="85%" cy="60%" r="4" fill="rgba(139, 92, 246, 0.12)" />
          <circle cx="45%" cy="15%" r="2.5" fill="rgba(99, 102, 241, 0.08)" />
          <circle cx="55%" cy="85%" r="3" fill="rgba(139, 92, 246, 0.1)" />
          <circle cx="35%" cy="80%" r="2" fill="rgba(99, 102, 241, 0.06)" />
          <circle cx="65%" cy="15%" r="3" fill="rgba(139, 92, 246, 0.1)" />

          {/* Line paths connecting nodes */}
          <line x1="25%" y1="25%" x2="45%" y2="15%" stroke="rgba(99, 102, 241, 0.02)" strokeWidth="1" />
          <line x1="75%" y1="30%" x2="65%" y2="15%" stroke="rgba(139, 92, 246, 0.02)" strokeWidth="1" />
          <line x1="15%" y1="65%" x2="35%" y2="80%" stroke="rgba(99, 102, 241, 0.02)" strokeWidth="1" />
          <line x1="85%" y1="60%" x2="55%" y2="85%" stroke="rgba(139, 92, 246, 0.02)" strokeWidth="1" />
        </svg>
      </div>

      <header className="welcome-header">
        <div className="welcome-page-indicator">
          <BookOpen className="indicator-icon" />
          <span>Sảnh chờ phòng học trực tuyến</span>
          
          {room.trim() && (
            <div className="badge room-info-badge animate-fade-in">
              <span>Phòng: {room.trim()}</span>
            </div>
          )}

          <div className="badge realtime-ready-badge">
            <span className="live-dot pulse-green"></span>
            <span>Kết nối: Sẵn sàng</span>
          </div>
        </div>
      </header>

      <main className="welcome-content">
        {/* Single unified workspace card */}
        <div className="welcome-main-card glass-panel">
          
          {/* Column Left: Media Diagnostics & Preview */}
          <div className="preview-column">
            <div className={`video-preview-container ${isSpeaking && cameraActive ? 'video-speaking-border' : ''}`}>
              {localMuteVideo ? (
                <div className="video-placeholder">
                  <div className={`avatar-wave ${micActive ? 'is-listening' : ''} ${isSpeaking ? 'is-speaking' : ''}`}>
                    <div className="pulse-ring ring-1"></div>
                    <div className="pulse-ring ring-2"></div>
                    <div className="pulse-ring ring-3"></div>
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

              {/* Settings buttons float on bottom video frame */}
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
            
            {/* Dynamic Diagnostics Grid */}
            <div className="tech-diagnostics-grid">
              <div className="tech-diagnostic-pill">
                <span className={`pill-status-dot ${cameraActive ? 'active' : 'warning'}`}></span>
                <span className="pill-text">Camera: {cameraActive ? 'Ready' : 'Off'}</span>
              </div>
              <div className="tech-diagnostic-pill">
                <span className={`pill-status-dot ${micActive ? 'active' : 'warning'}`}></span>
                <span className="pill-text">Microphone: {micActive ? 'Ready' : 'Muted'}</span>
              </div>
              <div className="tech-diagnostic-pill">
                <span className={`pill-status-dot ${cameraActive ? 'active' : 'warning'}`}></span>
                <span className="pill-text">Resolution: {cameraActive ? 'HD Stream' : 'Offline'}</span>
              </div>
              <div className="tech-diagnostic-pill">
                <span className="pill-status-dot active"></span>
                <span className="pill-text">Connection: WebRTC Low Latency</span>
              </div>
            </div>
          </div>

          {/* Central Column Divider */}
          <div className="welcome-divider"></div>

          {/* Column Right: Action Form & Authentication details */}
          <form className="join-form" onSubmit={handleSubmit}>
            <div className="form-head">
              <h2>Tham Gia Lớp Học</h2>
              <p>Điền mã lớp học và kiểm tra thông tin để bắt đầu</p>
            </div>

            {error && (
              <div className="error-banner animate-fade-in">
                {error}
              </div>
            )}

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
                  disabled={connectionState === 'connecting'}
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
                  disabled={connectionState === 'connecting'}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Vai Trò Trong Lớp Học</label>
              
              {user ? (
                // Authenticated user gets a non-interactive verified badge
                <div className="verified-role-container">
                  <div className="verified-role-badge">
                    <div className="badge-shield-icon">
                      <Lock size={16} />
                    </div>
                    <div className="verified-role-info">
                      <span className="verified-role-label">Tài khoản xác thực</span>
                      <span className="verified-role-value">{ROLE_META[role]?.label || role}</span>
                    </div>
                  </div>
                  <p className="verified-role-desc">Hệ thống EduMeet tự động ghi nhận vai trò được cấp phép của bạn.</p>
                </div>
              ) : (
                // Guest users select their roles using vertical cards
                <div className="role-selector-vertical-grid">
                  {(['student', 'teacher', 'manager', 'admin'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      disabled={connectionState === 'connecting'}
                      className={`role-card-btn ${role === r ? 'active' : ''}`}
                      title={ROLE_META[r].description}
                    >
                      <div className="role-card-icon-wrapper">
                        {ROLE_ICONS[r]}
                      </div>
                      <span className="role-card-label">{ROLE_META[r].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={btnState.disabled}
            >
              {btnState.showSpinner ? (
                <>
                  <Loader2 size={18} className="btn-icon spinner-icon" />
                  <span>{btnState.text}</span>
                </>
              ) : (
                <>
                  <span>{btnState.text}</span>
                  <LogIn size={18} className="btn-icon" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
};
