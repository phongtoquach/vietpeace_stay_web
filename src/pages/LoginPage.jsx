import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import CustomerAuthForm from '../components/CustomerAuthForm.jsx';
import { resolveSafeReturnUrl } from '../utils/authReturnUrl.js';

export default function LoginPage() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentLoggedInUser, showToast } = useAuth();

  const queryReturnUrl = searchParams.get('returnUrl');
  const fromUrl = resolveSafeReturnUrl(state?.from ?? queryReturnUrl);
  const registerHref = fromUrl !== '/'
    ? `/register?returnUrl=${encodeURIComponent(fromUrl)}`
    : '/register';

  const initialEmail = searchParams.get('email') || '';
  const initialRequireCode = searchParams.get('verify') === '1';

  const handleLoginSuccess = (customer, responseData) => {
    setCurrentLoggedInUser(customer);
    if (responseData?.activatedOnFirstLogin) {
      showToast?.('Kích hoạt tài khoản và đăng nhập thành công!', 'success');
    }
    navigate(fromUrl, { replace: true });
  };

  return (
    <main className="auth-page-shell">
      <div className="auth-page-backdrop" aria-hidden="true">
        <img
          src="/assets/images/hero.jpg"
          alt=""
          className="auth-page-backdrop-img"
          decoding="async"
          fetchPriority="high"
        />
        <div className="auth-page-scrim" />
        <div className="auth-page-ambient-glow" />
      </div>

      <div className="auth-card auth-card-wide auth-card-login">
        <div className="auth-card-head">
          <h1 className="auth-card-title">Đăng Nhập Khách Hàng</h1>
        </div>

        <CustomerAuthForm
          key={`${initialEmail}:${initialRequireCode}`}
          initialEmail={initialEmail}
          initialRequireCode={initialRequireCode}
          registerHref={registerHref}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </main>
  );
}
