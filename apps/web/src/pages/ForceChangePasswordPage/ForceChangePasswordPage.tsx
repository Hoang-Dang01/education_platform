import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import './ForceChangePasswordPage.css';

export const ForceChangePasswordPage: React.FC = () => {
  const { user, updatePasswordChanged, logout } = useAuth();

  const getPronoun = (name: string): string => {
    const normalized = name.toLowerCase().trim();
    if (normalized.startsWith('cô') || normalized.includes(' cô ')) return 'cô';
    if (normalized.startsWith('thầy') || normalized.includes(' thầy ')) return 'thầy';
    return 'bạn';
  };
  const pronoun = getPronoun(user?.name || '');

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRules = useMemo(() => {
    const rules = [
      {
        label: 'Ít nhất 8 ký tự',
        valid: form.newPassword.length >= 8,
      },
      {
        label: 'Ít nhất 1 chữ in hoa (A-Z)',
        valid: /[A-Z]/.test(form.newPassword),
      },
      {
        label: 'Ít nhất 1 chữ thường (a-z)',
        valid: /[a-z]/.test(form.newPassword),
      },
      {
        label: 'Ít nhất 1 chữ số (0-9)',
        valid: /\d/.test(form.newPassword),
      },
    ];

    return rules;
  }, [form.newPassword]);

  const isValidPassword = passwordRules.every(rule => rule.valid);
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.confirmPassword === form.newPassword;

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!isValidPassword) {
      setError('Mật khẩu chưa đạt yêu cầu bảo mật.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu cũ.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.changePassword({ oldPassword, newPassword });

      setSuccess(true);

      setTimeout(() => {
        updatePasswordChanged();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="force-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="force-shell">
        <header className="topbar">
          <div className="brand">
            <KeyRound size={24} />
            <span>EduMeet</span>
          </div>
        </header>

        <main className="force-card">
          <section className="hero">
            <h1>Chào mừng, {user?.name} 👋</h1>
            <p>
              Đây là lần đầu {pronoun} đăng nhập bằng mật khẩu tạm thời.
              Vui lòng thiết lập mật khẩu mới để kích hoạt và bảo mật tài khoản.
            </p>
          </section>

          {error && (
            <div className="banner error">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="banner success">
              <Check size={16} />
              <span>Cập nhật thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form className="password-form" onSubmit={handleSubmit} spellCheck={false}>
            <Field label="Mật khẩu tạm thời">
              <input
                type="password"
                value={form.oldPassword}
                onChange={e => updateField('oldPassword', e.target.value)}
                placeholder="Nhập mật khẩu tạm thời..."
                disabled={loading || success}
                spellCheck={false}
              />
            </Field>

            <Field label="Mật khẩu mới">
              <div className="input-with-icon">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={e => updateField('newPassword', e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  disabled={loading || success}
                  spellCheck={false}
                />

                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowNewPassword(v => !v)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="policy-box">
                {passwordRules.map(rule => (
                  <div
                    key={rule.label}
                    className={`policy-item ${rule.valid ? 'valid' : 'invalid'}`}
                  >
                    {rule.valid ? <Check size={14} /> : <X size={14} />}
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </Field>

            <Field label="Xác nhận mật khẩu">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e =>
                  updateField('confirmPassword', e.target.value)
                }
                placeholder="Nhập lại mật khẩu..."
                disabled={loading || success}
                spellCheck={false}
              />
              {form.confirmPassword && (
                <small className={passwordsMatch ? 'match' : 'mismatch'}>
                  {passwordsMatch
                    ? '✓ Mật khẩu khớp'
                    : '✗ Mật khẩu chưa khớp'}
                </small>
              )}
            </Field>

            <div className="actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={logout}
                disabled={loading}
              >
                Đăng xuất
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading || success || !isValidPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  'Kích hoạt tài khoản'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);
