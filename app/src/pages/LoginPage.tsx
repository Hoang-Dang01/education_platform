import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { BookOpen, Sparkles, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../lib/roles';
import { roleLabel } from '../lib/roles';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useClass();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Nhận diện vai trò từ tên tài khoản (tạm thời — sẽ thay bằng API xác thực thật)
  const detectRole = (input: string): UserRole => {
    const u = input.toLowerCase();
    if (u.includes('admin') || u.includes('quantri')) return 'admin';
    if (u.includes('manager') || u.includes('quanly')) return 'manager';
    if (u.includes('teacher') || u.includes('nam') || u.includes('giaovien')) return 'teacher';
    return 'student';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const finalRole = detectRole(username);
    const dispName = finalRole === 'teacher' ? 'Thầy Nguyễn Hải Nam' : username;

    login(dispName, finalRole);
  };

  // Tên hiển thị mẫu cho từng vai trò khi đăng nhập nhanh (thử nghiệm)
  const QUICK_LOGIN_NAMES: Record<UserRole, string> = {
    admin: 'Quản trị viên Hệ thống',
    manager: 'Cô Trần Điều Phối',
    teacher: 'Thầy Nguyễn Hải Nam',
    student: 'Nguyễn Đăng',
  };

  // Quick testing logs autofill & submit
  const handleQuickLogin = (roleType: UserRole) => {
    login(QUICK_LOGIN_NAMES[roleType], roleType);
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
              {(['admin', 'manager', 'teacher', 'student'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleQuickLogin(r)}
                  className={`quick-btn ${r}-btn`}
                >
                  <span>Vào với vai trò {roleLabel(r)}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
