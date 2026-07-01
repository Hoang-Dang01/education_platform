import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User, Lock, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, ShieldAlert, Sparkles, Video, Mic, Hand, Users } from 'lucide-react';
import bgImg from '../../assets/BG.png';
import './LoginPage.css';

// Reusable Field component
type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);

// Helper to generate a dynamic, friendly, education-themed greeting message
const getDynamicGreeting = (): string => {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday...
  
  // 1. Time-based pools
  const morning = [
    "Chúc bạn một ngày học tập hiệu quả 🌤️",
    "Bắt đầu ngày mới với thật nhiều năng lượng nhé ☀️",
    "Một ngày mới, một cơ hội mới để tiến bộ ✨",
    "Chào buổi sáng, sẵn sàng cho buổi học hôm nay chưa? 📚"
  ];
  
  const noon = [
    "Đừng quên nghỉ ngơi giữa những giờ học nhé 🍵",
    "Buổi trưa vui vẻ, giữ năng lượng cho buổi chiều nhé 🌿"
  ];
  
  const afternoon = [
    "Chúc bạn có một buổi học chiều thật hiệu quả 🚀",
    "Tiếp tục cố gắng, bạn đang làm rất tốt 👏",
    "Mỗi buổi học là một bước tiến nhỏ. ✨"
  ];
  
  const evening = [
    "Sẵn sàng cho buổi học tối nay? 🌙",
    "Một buổi tối lý tưởng để học điều gì đó mới ✨",
    "Học thêm một chút hôm nay, tiến xa hơn ngày mai 🌌"
  ];
  
  const night = [
    "Học khuya à? Nhớ giữ gìn sức khỏe nhé ☕",
    "Đừng thức quá khuya nhé, nghỉ ngơi cũng quan trọng 😄"
  ];

  // 2. Playful/general pool (random fallback to mix things up)
  const general = [
    "Điểm danh nào… bạn đã sẵn sàng chưa? 😄",
    "WiFi ổn, tinh thần ổn, bắt đầu thôi 🚀",
    "Mong hôm nay không ai quên bật mic 😆",
    "Camera không bắt buộc… nhưng tập trung thì có 😉"
  ];

  // Pick category based on hour
  let pool = general;
  if (hour >= 5 && hour < 11) {
    pool = morning;
  } else if (hour >= 11 && hour < 14) {
    pool = noon;
  } else if (hour >= 14 && hour < 18) {
    pool = afternoon;
  } else if (hour >= 18 && hour < 23) {
    pool = evening;
  } else {
    pool = night;
  }

  // With 30% chance, show a day-specific or playful general message to keep it interesting
  if (Math.random() < 0.3) {
    if (day === 1) {
      return "Thứ Hai khởi động tuần mới thật mạnh mẽ nhé 💪";
    } else if (day === 5) {
      return "Cuối tuần sắp đến rồi, cố thêm chút nữa thôi 🎉";
    }
    const randomGeneral = general[Math.floor(Math.random() * general.length)];
    return randomGeneral;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

// Option 1: Floating Live Classroom Nodes (Abstract Learning Network)
const ClassroomPreview: React.FC = () => {
  return (
    <div className="classroom-preview-container">
      {/* Decorative ambient glowing orbs behind the preview */}
      <div className="preview-orb preview-orb-1" />
      <div className="preview-orb preview-orb-2" />

      {/* Main Interactive Floating Network Frame */}
      <div className="network-frame">
        <svg className="network-svg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Connection Lines from Center Node (200, 150) */}
          <line className="conn-line l-1" x1="200" y1="150" x2="80" y2="80" />
          <line className="conn-line l-2" x1="200" y1="150" x2="320" y2="90" />
          <line className="conn-line l-3" x1="200" y1="150" x2="90" y2="220" />
          <line className="conn-line l-4" x1="200" y1="150" x2="310" y2="210" />
          <line className="conn-line l-5" x1="200" y1="150" x2="200" y2="50" />
        </svg>

        {/* Center Node (Core Platform Hub) */}
        <div className="net-node center-node" style={{ left: '200px', top: '150px' }}>
          <div className="node-pulse" />
          <div className="node-content">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Outer Node 1 (Top Left) */}
        <div className="net-node outer-node node-cyan" style={{ left: '80px', top: '80px' }}>
          <div className="node-content">
            <Users size={16} />
          </div>
        </div>

        {/* Outer Node 2 (Top Right) */}
        <div className="net-node outer-node node-purple" style={{ left: '320px', top: '90px' }}>
          <div className="node-content">
            <Video size={16} />
          </div>
        </div>

        {/* Outer Node 3 (Bottom Left) */}
        <div className="net-node outer-node node-indigo" style={{ left: '90px', top: '220px' }}>
          <div className="node-content">
            <Mic size={16} />
          </div>
        </div>

        {/* Outer Node 4 (Bottom Right) */}
        <div className="net-node outer-node node-pink" style={{ left: '310px', top: '210px' }}>
          <div className="node-content">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Outer Node 5 (Top Center) */}
        <div className="net-node outer-node node-green" style={{ left: '200px', top: '50px' }}>
          <div className="node-content">
            <Hand size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// BrandPanel component (Left Side)
const BrandPanel: React.FC = () => {
  return (
    <aside className="left-panel">
      <div className="left-panel-content">
        <header className="brand-header">
          <div className="brand-logo">
            <div className="logo-icon-box">
              <BookOpen size={24} />
            </div>
            <div className="brand-titles">
              <span>EduMeet</span>
              <p className="brand-subtitle">Virtual Classroom & LMS Portal</p>
            </div>
          </div>
        </header>

        <section className="tagline-section">
          <h1>
            Dạy linh hoạt.<br />
            Học <span className="highlight-gradient">trực quan</span>.
          </h1>
          <p className="tagline-description">
            Không gian cộng tác học tập trực tuyến thế hệ mới — Kết nối người dạy và người học thông qua mạng lưới tương tác thời gian thực chất lượng cao.
          </p>
        </section>

        {/* Option 1 Floating classroom nodes */}
        <ClassroomPreview />
      </div>
    </aside>
  );
};

// Main LoginPage component exporting the full AuthLayout
export const LoginPage: React.FC = () => {
  const { loginWithCredentials, error: authError, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Generate the dynamic greeting message memoized once per component mount
  const greetingMessage = useMemo(() => getDynamicGreeting(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLocalError(null);
    try {
      await loginWithCredentials(username.trim(), password);
    } catch (err: any) {
      setLocalError(err.message || 'Đăng nhập không thành công.');
    }
  };

  const error = localError || authError;

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImg}), linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%)` }}>
      {/* Background ambient light blobs */}
      <div className="bg-blob blob-purple" />
      <div className="bg-blob blob-indigo" />
      <div className="bg-blob blob-pink" />

      {/* Brand panel on the left */}
      <BrandPanel />

      {/* Login panel on the right */}
      <main className="right-panel">
        <div className="login-card-shell">
          <div className="login-card">
            <header className="login-head">
              <h2>
                Xin chào <Sparkles size={28} className="hello-sparkles" />
              </h2>
              <p>{greetingMessage}</p>
            </header>

            {error && (
              <div className="banner error">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form className="password-form" onSubmit={handleSubmit} spellCheck={false}>
              <Field label="Tên đăng nhập / Email">
                <div className="input-with-icon">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    disabled={loading}
                    required
                    spellCheck={false}
                  />
                  <User className="input-icon" size={18} />
                </div>
              </Field>

              <Field label="Mật khẩu">
                <div className="input-with-icon">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    disabled={loading}
                    required
                    spellCheck={false}
                  />
                  <Lock className="input-icon" size={18} />
                  
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" disabled={loading} />
                  <span className="custom-checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="forgot-password">
                  Quên mật khẩu?
                </a>
              </div>

              <div className="actions">
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom security notice */}
              <div className="security-notice">
                <ShieldCheck size={20} className="security-icon" />
                <p>
                  Hệ thống được bảo mật bằng công nghệ tiên tiến và tuân thủ các tiêu chuẩn bảo mật quốc tế.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Full-width footer aligned bottom */}
      <footer className="login-footer">
        <span>© 2026 EduMeet. All rights reserved.</span>
      </footer>
    </div>
  );
};
