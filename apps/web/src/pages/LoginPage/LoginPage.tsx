import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Sparkles, User, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { UserRole } from '../../lib/roles';
import { roleLabel } from '../../lib/roles';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, error: authError, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  // Seeded credentials for Quick Login
  const QUICK_CREDENTIALS: Record<UserRole, { username: string; pass: string }> = {
    admin: { username: 'admin', pass: 'admin123' },
    manager: { username: 'manager', pass: 'manager123' },
    teacher: { username: 'namnh', pass: 'teacher123' },
    student: { username: 'dangn4821', pass: 'student123' },
  };

  const handleQuickLogin = async (roleType: UserRole) => {
    setLocalError(null);
    const creds = QUICK_CREDENTIALS[roleType];
    try {
      await loginWithCredentials(creds.username, creds.pass);
    } catch (err: any) {
      setLocalError(err.message || `Lỗi đăng nhập nhanh với vai trò ${roleLabel(roleType)}.`);
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

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="error-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', fontFamily: 'var(--font-primary, sans-serif)' }}>
              {localError || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Tên đăng nhập (Username)</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Ví dụ: dangn4821..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="password-toggle-btn"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" disabled={loading} />
                <span>Ghi nhớ tôi</span>
              </label>
              <a href="#" className="forgot-password">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span>Đang đăng nhập...</span>
                  <Loader2 className="animate-spin" size={16} />
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
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
