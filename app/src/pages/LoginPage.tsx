import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { BookOpen, Sparkles, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useClass();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Detect role based on username or default to student
    const isTeacher = username.toLowerCase().includes('teacher') || username.toLowerCase().includes('nam') || username.toLowerCase().includes('giaovien');
    const dispName = isTeacher ? 'Thầy Nguyễn Hải Nam' : username;
    const finalRole = isTeacher ? 'teacher' : 'student';

    login(dispName, finalRole);
  };

  // Quick testing logs autofill & submit
  const handleQuickLogin = (roleType: 'teacher' | 'student') => {
    if (roleType === 'teacher') {
      login('Thầy Nguyễn Hải Nam', 'teacher');
    } else {
      login('Nguyễn Đăng', 'student');
    }
  };

  return (
    <div className="login-container">
      {/* Moving background orbs */}
      <div className="glow-orb glow-orb-primary animate-float"></div>
      <div className="glow-orb glow-orb-purple"></div>

      <div className="login-card-wrapper">
        <header className="login-header">
          <div className="logo">
            <BookOpen className="logo-icon" />
            <span>EduMeet</span>
          </div>
          <div className="badge">
            <Sparkles size={14} className="badge-icon" />
            <span>LMS & Classroom</span>
          </div>
        </header>

        <main className="login-main glass-panel">
          <div className="login-head">
            <h2>Đăng nhập hệ thống</h2>
            <p>Nhập thông tin tài khoản của bạn để vào cổng học tập trực tuyến</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Tên tài khoản hoặc Email</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Ví dụ: student@edumeet.com..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Mật khẩu bảo mật</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nhớ tôi</span>
              </label>
              <a href="#" className="forgot-password">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Đăng nhập</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick testing section */}
          <div className="quick-test-section">
            <div className="divider">
              <span>Hoặc thử nghiệm nhanh</span>
            </div>
            <div className="quick-buttons">
              <button onClick={() => handleQuickLogin('teacher')} className="quick-btn teacher-btn">
                <span>Vào với vai trò Giáo viên</span>
              </button>
              <button onClick={() => handleQuickLogin('student')} className="quick-btn student-btn">
                <span>Vào với vai trò Học viên</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
