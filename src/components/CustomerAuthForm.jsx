import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import SlidePuzzleCaptcha from './SlidePuzzleCaptcha.jsx';
import {
  loginCustomerAccount,
  requestCustomerNewPassword,
  resendCustomerVerification,
} from '../utils/authApi.js';
import '../assets/styles/auth.css';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const REMEMBERED_AUTH_STORAGE_KEY = 'vietpeace_customer_remember_auth';

function readRememberedAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(REMEMBERED_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const savedEmail = typeof parsed.email === 'string' ? parsed.email.trim() : '';
    if (!savedEmail || !parsed.rememberMe) return null;
    return { email: savedEmail, rememberMe: true };
  } catch {
    return null;
  }
}

function saveRememberedAuth(email) {
  if (typeof window === 'undefined') return;
  try {
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (!trimmedEmail) return;
    window.localStorage.setItem(
      REMEMBERED_AUTH_STORAGE_KEY,
      JSON.stringify({ email: trimmedEmail, rememberMe: true }),
    );
  } catch {
    // Bỏ qua nếu localStorage bị hạn chế
  }
}

function clearRememberedAuth() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(REMEMBERED_AUTH_STORAGE_KEY);
  } catch {
    // Bỏ qua nếu localStorage bị hạn chế
  }
}

export default function CustomerAuthForm({
  initialEmail = '',
  initialRequireCode = false,
  registerHref = '/register',
  onLoginSuccess,
  externalEmailRef,
}) {
  const emailId = useId();
  const passwordId = useId();
  const rememberMeId = useId();
  const pwWarningId = useId();
  const codeId = useId();
  const codeHintId = useId();
  const forgotEmailId = useId();
  const forgotHeadingId = useId();

  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [rememberMe, setRememberMe] = useState(() => Boolean(readRememberedAuth()?.rememberMe));
  const [email, setEmail] = useState(() => initialEmail || readRememberedAuth()?.email || '');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationCode, setShowVerificationCode] = useState(Boolean(initialRequireCode));
  const [showPassword, setShowPassword] = useState(false);

  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const [dirty, setDirty] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState(
    initialRequireCode
      ? {
          type: 'info',
          text: 'Nhập email (tên đăng nhập), mật khẩu và mã xác nhận 6 chữ số trong email để kích hoạt tài khoản cho lần đăng nhập đầu tiên.',
        }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Quên mật khẩu
  const [forgotEmail, setForgotEmail] = useState(
    () => initialEmail || readRememberedAuth()?.email || '',
  );
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [forgotBanner, setForgotBanner] = useState(null);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const internalEmailRef = useRef(null);
  const passwordRef = useRef(null);
  const codeRef = useRef(null);
  const captchaThumbRef = useRef(null);
  const forgotEmailRef = useRef(null);
  const forgotHeadingRef = useRef(null);
  const hasUserEditedCredentialsRef = useRef(false);

  const setEmailInputRef = (node) => {
    internalEmailRef.current = node;
    if (externalEmailRef) {
      externalEmailRef.current = node;
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (forgotCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  useEffect(() => {
    const saved = readRememberedAuth();
    if (!saved?.rememberMe || initialEmail) return undefined;
    if (typeof window === 'undefined' || !navigator?.credentials?.get) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const cred = await navigator.credentials.get({
          password: true,
          mediation: 'silent',
        });
        if (cancelled || hasUserEditedCredentialsRef.current || !cred || cred.type !== 'password') {
          return;
        }
        if (typeof cred.id === 'string' && cred.id.trim()) {
          setEmail((prev) => prev || cred.id.trim());
        }
        if (typeof cred.password === 'string' && cred.password) {
          setPassword((prev) => prev || cred.password);
        }
      } catch {
        // Trình duyệt không hỗ trợ hoặc người dùng đã tắt tự động điền im lặng
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialEmail]);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      clearRememberedAuth();
      if (typeof navigator !== 'undefined' && navigator?.credentials?.preventSilentAccess) {
        navigator.credentials.preventSilentAccess().catch(() => {});
      }
    }
  };

  const validateLoginField = (name, values) => {
    const val = values[name] ?? '';
    if (name === 'email') {
      const trimmed = val.trim();
      if (!trimmed) return 'Vui lòng nhập email đăng nhập.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Email không đúng định dạng.';
      return '';
    }
    if (name === 'password') {
      if (!val) return 'Vui lòng nhập mật khẩu.';
      if (val.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
      if (new TextEncoder().encode(val).length > 72) return 'Mật khẩu không được vượt quá 72 byte UTF-8.';
      return '';
    }
    if (name === 'verificationCode' && showVerificationCode) {
      const cleaned = val.trim();
      if (!cleaned) return 'Vui lòng nhập mã xác nhận 6 chữ số trong email.';
      if (!/^\d{6}$/.test(cleaned)) return 'Mã xác nhận phải gồm đúng 6 chữ số.';
      return '';
    }
    return '';
  };

  const handleFieldBlur = (name) => {
    if (!dirty[name]) return;
    const msg = validateLoginField(name, { email, password, verificationCode });
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setBanner(null);
    setCaptchaError('');

    const currentValues = { email, password, verificationCode };
    const nextErrors = {
      email: validateLoginField('email', currentValues),
      password: validateLoginField('password', currentValues),
      verificationCode: validateLoginField('verificationCode', currentValues),
    };
    setFieldErrors(nextErrors);

    if (nextErrors.email) {
      setBanner({ type: 'error', text: nextErrors.email });
      internalEmailRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      setBanner({ type: 'error', text: nextErrors.password });
      passwordRef.current?.focus();
      return;
    }
    if (nextErrors.verificationCode) {
      setBanner({ type: 'error', text: nextErrors.verificationCode });
      codeRef.current?.focus();
      return;
    }

    if (!captchaToken) {
      const msg = 'Vui lòng kéo mảnh ghép vào đúng vị trí để xác nhận bảo mật.';
      setCaptchaError(msg);
      setBanner({ type: 'error', text: msg });
      captchaThumbRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const { ok, data } = await loginCustomerAccount({
        email: trimmedEmail,
        password,
        verificationCode: showVerificationCode ? verificationCode.trim() : undefined,
        captchaToken,
        rememberMe,
      });

      if (!ok || !data?.success) {
        // Mỗi lượt gửi login tiêu thụ captchaToken đơn lần -> làm mới captcha ngay
        if (data?.data?.captchaConsumed !== false) {
          setCaptchaToken('');
          setCaptchaNonce((prev) => prev + 1);
        }

        const serverErrors = data?.errors || {};
        const needsCode =
          data?.errorCode === 'EMAIL_VERIFICATION_CODE_REQUIRED' ||
          Boolean(data?.data?.requiresVerificationCode);

        if (needsCode) {
          setShowVerificationCode(true);
          setFieldErrors({
            verificationCode: showVerificationCode ? serverErrors.verificationCode || '' : '',
          });
          setBanner({
            type: showVerificationCode && verificationCode.trim() ? 'error' : 'info',
            text:
              data?.message ||
              'Đây là lần đăng nhập đầu tiên. Vui lòng nhập mã xác nhận đã gửi qua email và kéo lại mảnh ghép để kích hoạt tài khoản.',
          });
          setTimeout(() => codeRef.current?.focus(), 60);
          return;
        }

        setFieldErrors({
          email: serverErrors.email || '',
          password: serverErrors.password || '',
          verificationCode: serverErrors.verificationCode || '',
        });
        setBanner({
          type: 'error',
          text: data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.',
        });

        if (serverErrors.email) internalEmailRef.current?.focus();
        else if (serverErrors.password) passwordRef.current?.focus();
        else if (serverErrors.verificationCode) codeRef.current?.focus();
        return;
      }

      const customer = data?.data?.loginCustomerInfo;
      if (!customer) {
        throw new Error('Response đăng nhập thiếu loginCustomerInfo.');
      }

      if (rememberMe) {
        saveRememberedAuth(trimmedEmail);
        if (
          typeof window !== 'undefined' &&
          typeof window.PasswordCredential === 'function' &&
          typeof navigator?.credentials?.store === 'function'
        ) {
          try {
            const credential = new window.PasswordCredential({
              id: trimmedEmail,
              password,
              name: customer.fullName || customer.displayName || trimmedEmail,
            });
            await navigator.credentials.store(credential);
          } catch {
            // Bỏ qua nếu trình duyệt từ chối hoặc không hỗ trợ Credential Management API
          }
        }
      } else {
        clearRememberedAuth();
      }

      onLoginSuccess?.(customer, data?.data);
    } catch (error) {
      console.error('[CustomerAuthForm] Login failed:', error);
      setCaptchaToken('');
      setCaptchaNonce((prev) => prev + 1);
      setBanner({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau ít phút.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: 'Vui lòng nhập email hợp lệ trước khi gửi lại mã xác nhận.',
      }));
      internalEmailRef.current?.focus();
      return;
    }

    if (isResending || resendCooldown > 0) return;
    setIsResending(true);

    try {
      const { ok, data } = await resendCustomerVerification(trimmedEmail);
      if (!ok || !data?.success) {
        if (data?.data?.retryAfterSeconds) {
          setResendCooldown(data.data.retryAfterSeconds);
        }
        setBanner({
          type: 'error',
          text: data?.message || 'Không thể gửi lại mã xác nhận lúc này.',
        });
        return;
      }

      setResendCooldown(data?.data?.cooldownSeconds || 60);
      setVerificationCode('');
      setFieldErrors((previous) => ({ ...previous, verificationCode: '' }));
      setBanner({
        type: 'success',
        text: data?.message || `Đã gửi mã xác nhận mới tới ${trimmedEmail}.`,
      });
      codeRef.current?.focus();
    } catch {
      setBanner({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ để gửi lại mã.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const openForgotPasswordView = () => {
    setForgotEmail(email.trim());
    setForgotEmailError('');
    setForgotBanner(null);
    setView('forgot');
    setTimeout(() => {
      if (forgotEmailRef.current) forgotEmailRef.current.focus();
      else forgotHeadingRef.current?.focus();
    }, 30);
  };

  const backToLoginView = () => {
    if (forgotEmail.trim()) {
      setEmail(forgotEmail.trim());
    }
    setView('login');
    setBanner(
      forgotBanner?.type === 'success'
        ? {
            type: 'success',
            text: forgotBanner.text,
          }
        : null,
    );
    if (forgotBanner?.type === 'success') {
      setPassword('');
      setShowVerificationCode(Boolean(forgotBanner.requiresVerificationCode));
      setVerificationCode('');
      setFieldErrors({});
    }
    setCaptchaToken('');
    setCaptchaNonce((prev) => prev + 1);
    setTimeout(() => passwordRef.current?.focus(), 30);
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    if (isSendingForgot || forgotCooldown > 0) return;

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotEmailError('Vui lòng nhập email đã đăng ký tài khoản.');
      forgotEmailRef.current?.focus();
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setForgotEmailError('Email không đúng định dạng.');
      forgotEmailRef.current?.focus();
      return;
    }

    setForgotEmailError('');
    setForgotBanner(null);
    setIsSendingForgot(true);

    try {
      const { ok, data } = await requestCustomerNewPassword(trimmed);
      if (!ok || !data?.success) {
        if (data?.data?.retryAfterSeconds) {
          setForgotCooldown(data.data.retryAfterSeconds);
        }
        setForgotBanner({
          type: 'error',
          text: data?.message || 'Không thể gửi mật khẩu mới lúc này. Vui lòng thử lại.',
        });
        return;
      }

      setForgotCooldown(data?.data?.cooldownSeconds || 60);
      setForgotBanner({
        type: 'success',
        requiresVerificationCode: Boolean(data?.data?.requiresVerificationCode),
        text:
          data?.message ||
          `Mật khẩu mới đã được gửi về email ${trimmed}. Vui lòng kiểm tra hộp thư để đăng nhập.`,
      });
    } catch {
      setForgotBanner({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    } finally {
      setIsSendingForgot(false);
    }
  };

  if (view === 'forgot') {
    return (
      <section aria-labelledby={forgotHeadingId}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="auth-secondary-btn"
            onClick={backToLoginView}
            style={{ minHeight: '38px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Quay lại đăng nhập</span>
          </button>
        </div>

        <h2
          id={forgotHeadingId}
          ref={forgotHeadingRef}
          tabIndex={-1}
          style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}
        >
          Quên mật khẩu
        </h2>
        <p className="auth-hint" style={{ marginTop: 0, marginBottom: '1rem' }}>
          Nhập địa chỉ email bạn đã đăng ký. Hệ thống sẽ tạo mật khẩu mới và gửi trực tiếp vào hộp thư của bạn.
        </p>

        {forgotBanner && (
          <div
            className={`auth-status-banner auth-status-banner--${forgotBanner.type}`}
            role={forgotBanner.type === 'error' ? 'alert' : 'status'}
          >
            {forgotBanner.type === 'success' ? (
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            )}
            <span>{forgotBanner.text}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleForgotSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor={forgotEmailId}>
              Email tài khoản <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-wrapper">
              <Mail size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                ref={forgotEmailRef}
                id={forgotEmailId}
                name="email"
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  if (forgotEmailError) setForgotEmailError('');
                }}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                placeholder="ban@email.com"
                required
                disabled={isSendingForgot}
                className={`auth-input-control auth-input-control--with-icon ${
                  forgotEmailError ? 'auth-input-control--invalid' : ''
                }`}
                aria-invalid={forgotEmailError ? 'true' : 'false'}
              />
            </div>
            {forgotEmailError && (
              <p className="auth-field-error-msg" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{forgotEmailError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSendingForgot || forgotCooldown > 0}
          >
            {isSendingForgot ? (
              <>
                <Loader2 size={17} className="register-spin" aria-hidden="true" />
                <span>Đang tạo và gửi mật khẩu mới...</span>
              </>
            ) : forgotCooldown > 0 ? (
              <span>Gửi lại sau ({forgotCooldown}s)</span>
            ) : (
              <span>Gửi mật khẩu mới về email</span>
            )}
          </button>
        </form>
      </section>
    );
  }

  return (
    <div>
      {banner && (
        <div
          className={`auth-status-banner auth-status-banner--${banner.type}`}
          role={banner.type === 'error' ? 'alert' : 'status'}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          ) : banner.type === 'info' ? (
            <KeyRound size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          )}
          <span>{banner.text}</span>
        </div>
      )}

      <form className="auth-form" method="POST" onSubmit={handleLoginSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor={emailId}>
            Email (Tên đăng nhập) <span className="auth-label-required" aria-hidden="true">*</span>
          </label>
          <div className="auth-input-wrapper">
            <Mail size={17} className="auth-input-icon" aria-hidden="true" />
            <input
              ref={setEmailInputRef}
              id={emailId}
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                hasUserEditedCredentialsRef.current = true;
                setEmail(e.target.value);
                setDirty((prev) => ({ ...prev, email: true }));
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              onBlur={() => handleFieldBlur('email')}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="ban@email.com"
              required
              disabled={isSubmitting}
              className={`auth-input-control auth-input-control--with-icon ${
                fieldErrors.email ? 'auth-input-control--invalid' : ''
              }`}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
            />
          </div>
          {fieldErrors.email && (
            <p className="auth-field-error-msg">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor={passwordId}>
            Mật khẩu <span className="auth-label-required" aria-hidden="true">*</span>
          </label>

          <div className="auth-input-wrapper">
            <Lock size={16} className="auth-input-icon" aria-hidden="true" />
            <input
              ref={passwordRef}
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                hasUserEditedCredentialsRef.current = true;
                setPassword(e.target.value);
                setDirty((prev) => ({ ...prev, password: true }));
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              onBlur={() => handleFieldBlur('password')}
              autoComplete="current-password"
              enterKeyHint={showVerificationCode ? 'next' : 'done'}
              placeholder="Nhập mật khẩu"
              required
              disabled={isSubmitting}
              className={`auth-input-control auth-input-control--with-icon auth-input-control--password ${
                fieldErrors.password ? 'auth-input-control--invalid' : ''
              }`}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
            />

            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-describedby={pwWarningId}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
            <span id={pwWarningId} className="visually-hidden">
              Cảnh báo: thao tác này sẽ hiển thị mật khẩu của bạn trên màn hình.
            </span>
          </div>

          {fieldErrors.password && (
            <p className="auth-field-error-msg">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        <div className="auth-forgot-row">
          <label className="auth-remember-label" htmlFor={rememberMeId}>
            <input
              id={rememberMeId}
              name="rememberMe"
              type="checkbox"
              className="auth-remember-checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              disabled={isSubmitting}
            />
            <span>Ghi nhớ tài khoản và mật khẩu</span>
          </label>
          <button
            type="button"
            className="auth-link-btn"
            onClick={openForgotPasswordView}
          >
            Quên mật khẩu?
          </button>
        </div>

        {showVerificationCode && (
          <div className="auth-otp-card">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor={codeId}>
                Mã xác nhận email (lần đầu) <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setShowVerificationCode(false);
                  setVerificationCode('');
                  setFieldErrors((prev) => ({ ...prev, verificationCode: '' }));
                }}
              >
                Đã kích hoạt trước đó?
              </button>
            </div>

            <span id={codeHintId} className="auth-hint">
              Nhập mã 6 chữ số đã gửi về email khi tạo tài khoản. Những lần đăng nhập sau sẽ không cần nhập mã này nữa.
            </span>

            <input
              ref={codeRef}
              id={codeId}
              name="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={6}
              pattern="\d{6}"
              enterKeyHint="done"
              placeholder="••••••"
              value={verificationCode}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(digitsOnly);
                setDirty((prev) => ({ ...prev, verificationCode: true }));
                if (fieldErrors.verificationCode) {
                  setFieldErrors((prev) => ({ ...prev, verificationCode: '' }));
                }
              }}
              onBlur={() => handleFieldBlur('verificationCode')}
              required
              disabled={isSubmitting}
              aria-describedby={codeHintId}
              aria-invalid={fieldErrors.verificationCode ? 'true' : 'false'}
              className={`auth-input-control auth-otp-input ${
                fieldErrors.verificationCode ? 'auth-input-control--invalid' : ''
              }`}
            />

            {fieldErrors.verificationCode && (
              <p className="auth-field-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{fieldErrors.verificationCode}</span>
              </p>
            )}

            <div className="auth-otp-actions">
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                style={{ minHeight: '38px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
              >
                {isResending ? (
                  <>
                    <Loader2 size={14} className="register-spin" aria-hidden="true" />
                    <span>Đang gửi lại...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw size={14} aria-hidden="true" />
                    <span>Gửi lại mã ({resendCooldown}s)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} aria-hidden="true" />
                    <span>Gửi lại mã xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <SlidePuzzleCaptcha
          key={captchaNonce}
          sliderRef={captchaThumbRef}
          externalError={captchaError}
          onVerified={(token) => {
            setCaptchaToken(token);
            setCaptchaError('');
          }}
          onInvalidated={() => {
            setCaptchaToken('');
          }}
        />

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="register-spin" aria-hidden="true" />
              <span>Đang xác thực đăng nhập...</span>
            </>
          ) : (
            <span>{showVerificationCode ? 'Kích hoạt & Đăng Nhập' : 'Đăng Nhập'}</span>
          )}
        </button>
      </form>

      <div className="auth-card-footer">
        Chưa có tài khoản?{' '}
        <Link to={registerHref} className="auth-register-link">
          Đăng ký thành viên
        </Link>
      </div>
    </div>
  );
}
