import { useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import CustomerAuthForm from './CustomerAuthForm.jsx';
import { resolveSafeReturnUrl } from '../utils/authReturnUrl.js';

export default function LoginModal({ isOpen, onClose, returnUrl = '/' }) {
  const { setCurrentLoggedInUser, showToast } = useContext(AuthContext);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeReturnUrl = resolveSafeReturnUrl(returnUrl);
  const registerHref =
    safeReturnUrl !== '/'
      ? `/register?returnUrl=${encodeURIComponent(safeReturnUrl)}`
      : '/register';

  const handleLoginSuccess = (customer, responseData) => {
    setCurrentLoggedInUser(customer);
    if (responseData?.activatedOnFirstLogin) {
      showToast?.('Kích hoạt tài khoản và đăng nhập thành công!', 'success');
    }
    onClose();
  };

  return (
    <div
      className="login-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập tài khoản khách hàng"
    >
      <div
        className="login-modal-dialog login-modal-dialog--compact"
        onClick={(event) => event.stopPropagation()}
        style={{ maxHeight: '94dvh', overflowY: 'auto' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="login-modal-close-btn"
          aria-label="Đóng cửa sổ đăng nhập"
        >
          <X style={{ width: '20px', height: '20px' }} aria-hidden="true" />
        </button>

        <div className="auth-card-head">
          <h2 className="auth-card-title">Đăng Nhập Khách Hàng</h2>
        </div>

        <CustomerAuthForm
          key={isOpen ? 'modal-open' : 'modal-closed'}
          registerHref={registerHref}
          onLoginSuccess={handleLoginSuccess}
          externalEmailRef={emailInputRef}
        />
      </div>
    </div>
  );
}
