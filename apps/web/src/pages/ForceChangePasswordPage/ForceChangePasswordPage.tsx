import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { KeyRound, Eye, EyeOff, Loader2, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import './ForceChangePasswordPage.css';

export const ForceChangePasswordPage: React.FC = () => {
  const { user, updatePasswordChanged, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password requirements validation state
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin.');
      return;
    }

    if (!isValidPassword) {
      setError('Mật khẩu mới không đáp ứng đủ yêu cầu chính sách bảo mật.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.changePassword({ oldPassword, newPassword });
      setSuccess(true);
      setTimeout(() => {
        // Unlock dashboard inside context
        updatePasswordChanged();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật mật khẩu mới.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="force-change-container">
      {/* Moving background orbs */}
      <div className="glow-orb glow-orb-primary animate-float"></div>
      <div className="glow-orb glow-orb-purple"></div>

      <div className="force-card-wrapper">
        <header className="force-header">
          <div className="logo">
            <KeyRound className="logo-icon" />
            <span>EduMeet</span>
          </div>
          <div className="badge">
            <Sparkles size={14} className="badge-icon" />
            <span>Bảo mật tài khoản</span>
          </div>
        </header>

        <main className="force-main glass-panel">
          <div className="force-head">
            <h2>Kích hoạt tài khoản mới</h2>
            <p>Chào mừng <strong>{user?.name}</strong>. Vì đây là lần đầu tiên bạn đăng nhập bằng mật khẩu tạm, bạn cần đổi mật khẩu mới để tiếp tục.</p>
          </div>

          {error && (
            <div className="error-banner">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-banner">
              <Check size={16} />
              <span>Cập nhật mật khẩu thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="force-form">
            <div className="input-group">
              <label htmlFor="oldPassword">Mật khẩu tạm thời (Hiện tại)</label>
              <div className="input-wrapper">
                <input
                  id="oldPassword"
                  type="password"
                  placeholder="Nhập mật khẩu tạm thời..."
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="newPassword">Mật khẩu bảo mật mới</label>
              <div className="input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={loading || success}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="password-toggle-btn"
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password checklist rules */}
            <div className="password-policy-list">
              <div className={`policy-item ${hasMinLength ? 'valid' : 'invalid'}`}>
                {hasMinLength ? <Check size={12} /> : <X size={12} />}
                <span>Ít nhất 8 ký tự</span>
              </div>
              <div className={`policy-item ${hasUppercase ? 'valid' : 'invalid'}`}>
                {hasUppercase ? <Check size={12} /> : <X size={12} />}
                <span>Ít nhất 1 chữ in hoa (A-Z)</span>
              </div>
              <div className={`policy-item ${hasLowercase ? 'valid' : 'invalid'}`}>
                {hasLowercase ? <Check size={12} /> : <X size={12} />}
                <span>Ít nhất 1 chữ thường (a-z)</span>
              </div>
              <div className={`policy-item ${hasNumber ? 'valid' : 'invalid'}`}>
                {hasNumber ? <Check size={12} /> : <X size={12} />}
                <span>Ít nhất 1 chữ số (0-9)</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="logout-btn"
                onClick={logout}
                disabled={loading || success}
              >
                Hủy & Đăng xuất
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || success || !isValidPassword}
              >
                {loading ? (
                  <>
                    <span>Đang cập nhật...</span>
                    <Loader2 className="animate-spin" size={16} />
                  </>
                ) : (
                  <span>Kích hoạt tài khoản</span>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
