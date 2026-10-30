import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, returnUrl = '/' }) {
  const { loginAsync, login } = useAuth();

  const [email, setEmail] = useState('nguyenvana@gmail.com');
  const [password, setPassword] = useState('VinaStay2026@');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [errorsDetail, setErrorsDetail] = useState({});

  const emailInputRef = useRef(null);

  // Focus email input when modal opens & reset errors
  useEffect(() => {
    if (isOpen) {
      setBannerError('');
      setErrorsDetail({});
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard navigation: Escape to close modal
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setBannerError('');
    setErrorsDetail({});

    const fieldErrors = {};
    if (!email.trim()) {
      fieldErrors.email = 'Vui lòng nhập địa chỉ email';
    }
    if (!password) {
      fieldErrors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrorsDetail(fieldErrors);
      setBannerError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (typeof loginAsync === 'function') {
        result = await loginAsync(email.trim(), password);
      } else {
        const ok = login(email.trim(), password);
        result = ok ? { success: true } : { success: false, errorMsg: 'Email hoặc mật khẩu không chính xác' };
      }

      if (result.success) {
        onClose();
      } else {
        setBannerError(result.errorMsg || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        if (result.errorsDetail) {
          setErrorsDetail(result.errorsDetail);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setBannerError('Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('nguyenvana@gmail.com');
    setPassword('VinaStay2026@');
    setBannerError('');
    setErrorsDetail({});
  };

  return (
    <div
      className="login-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập tài khoản"
    >
      <div
        className="login-modal-dialog"
        onClick={(e) => e.stopPropagation()} // Prevent close on modal body click
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="login-modal-close-btn"
          aria-label="Đóng cửa sổ đăng nhập"
        >
          <X style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="brand-text" style={{ display: 'inline-block', marginBottom: '8px', fontSize: '1.25rem' }}>
            VinaStay <span>Group</span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy)' }}>
            Đăng Nhập Khách Hàng
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-slate)', marginTop: '4px' }}>
            Đăng nhập để tiếp tục đặt phòng và hưởng ưu đãi dành riêng cho quý khách.
          </p>
        </div>

        {/* Banner Error if any */}
        {bannerError && (
          <div className="auth-banner-error" role="alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{bannerError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>
              Địa chỉ Email
            </label>
            <div className="auth-input-wrapper">
              <Mail style={{ width: '16px', height: '16px', color: 'var(--color-slate)', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorsDetail.email) {
                    setErrorsDetail(prev => ({ ...prev, email: null }));
                  }
                }}
                className={`auth-input ${errorsDetail.email ? 'auth-input--error' : ''}`}
                style={{ paddingLeft: '36px' }}
                placeholder="example@gmail.com"
                required
                disabled={isLoading}
              />
            </div>
            {errorsDetail.email && (
              <span className="auth-field-error">{errorsDetail.email}</span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)' }}>
                Mật khẩu
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ fontSize: '11px', color: 'var(--color-sunshine)', fontWeight: 600, textDecoration: 'underline' }}>
                Quên mật khẩu?
              </a>
            </div>
            <div className="auth-input-wrapper">
              <Lock style={{ width: '16px', height: '16px', color: 'var(--color-slate)', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorsDetail.password) {
                    setErrorsDetail(prev => ({ ...prev, password: null }));
                  }
                }}
                className={`auth-input ${errorsDetail.password ? 'auth-input--error' : ''}`}
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                placeholder="Nhập mật khẩu của bạn"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--color-slate)', cursor: 'pointer', padding: '4px' }}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            {errorsDetail.password && (
              <span className="auth-field-error">{errorsDetail.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary btn-primary--full"
            style={{ padding: '12px', borderRadius: 'var(--radius-lg)', marginTop: '4px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng Nhập</span>
            )}
          </button>

          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={handleDemoFill}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#F1F5F9',
              color: 'var(--color-navy)',
              fontWeight: 700,
              fontSize: '12px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: 'none',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            ⚡ Điền nhanh tài khoản mẫu thử nghiệm
          </button>
        </form>

        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', marginTop: '1.25rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)' }}>
          Chưa có tài khoản?{' '}
          <Link
            to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
            onClick={onClose}
            style={{ color: 'var(--color-navy)', fontWeight: 700, textDecoration: 'underline' }}
          >
            Đăng ký thành viên
          </Link>
        </div>
      </div>
    </div>
  );
}
