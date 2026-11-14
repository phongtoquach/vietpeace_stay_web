import { useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import {
  resendCustomerVerification,
  verifyCustomerEmailToken,
} from '../utils/authApi.js';
import '../assets/styles/register.css';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Chống gọi POST hai lần khi React StrictMode mount lại trong môi trường dev.
const verifyTokenRequests = new Map();

function verifyTokenOnce(token) {
  if (!verifyTokenRequests.has(token)) {
    const requestPromise = verifyCustomerEmailToken(token).catch((err) => {
      verifyTokenRequests.delete(token);
      throw err;
    });
    verifyTokenRequests.set(token, requestPromise);
  }
  return verifyTokenRequests.get(token);
}

function VerifyEmailContent({ token, loginHref }) {
  const resendInputId = useId();
  const resendErrorId = useId();

  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [resultMessage, setResultMessage] = useState(
    token
      ? 'Đang xác thực địa chỉ email của bạn...'
      : 'Thiếu mã xác thực email trong đường dẫn. Vui lòng mở lại liên kết trong hộp thư hoặc yêu cầu gửi lại email mới.',
  );
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const [resendEmail, setResendEmail] = useState('');
  const [resendEmailError, setResendEmailError] = useState('');
  const [resendFeedback, setResendFeedback] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    verifyTokenOnce(token)
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok && data?.success) {
          setStatus('success');
          setAlreadyVerified(Boolean(data?.data?.alreadyVerified));
          setVerifiedEmail(data?.data?.email || '');
          setResultMessage(
            data?.message || 'Xác thực email thành công! Bạn có thể đăng nhập ngay.',
          );
        } else {
          setStatus('error');
          if (data?.data?.email) {
            setResendEmail(data.data.email);
          }
          setResultMessage(
            data?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.',
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setResultMessage(
          'Không thể kết nối đến máy chủ để xác thực email. Vui lòng thử tải lại trang.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleResendSubmit(event) {
    event.preventDefault();
    if (isResending || resendCooldown > 0) return;

    const trimmedEmail = resendEmail.trim();
    if (!trimmedEmail) {
      setResendEmailError('Vui lòng nhập email đã đăng ký.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setResendEmailError('Email không đúng định dạng.');
      return;
    }

    setResendEmailError('');
    setResendFeedback(null);
    setIsResending(true);

    try {
      const { ok, data } = await resendCustomerVerification(trimmedEmail);
      if (!ok || !data?.success) {
        if (data?.data?.retryAfterSeconds) {
          setResendCooldown(data.data.retryAfterSeconds);
        }
        setResendFeedback({
          type: 'error',
          text: data?.message || 'Không thể gửi lại email xác thực.',
        });
        return;
      }

      setResendCooldown(data?.data?.cooldownSeconds || 60);
      setResendFeedback({
        type: 'success',
        text: data?.message || 'Đã gửi lại liên kết xác thực mới đến email của bạn.',
      });
    } catch (error) {
      console.error('[VerifyEmailPage] Resend failed:', error);
      setResendFeedback({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="register-page">
      <div className="verify-page-shell">
        <section className="register-card" aria-label="Xác thực email tài khoản">
          <div className="register-verify-panel">
            <div
              className={`register-verify-badge ${
                status === 'success'
                  ? 'register-verify-badge--success'
                  : status === 'error'
                  ? 'register-verify-badge--error'
                  : ''
              }`}
            >
              {status === 'loading' ? (
                <Loader2 size={28} className="register-spin" aria-hidden="true" />
              ) : status === 'success' ? (
                <CheckCircle2 size={28} aria-hidden="true" />
              ) : (
                <AlertCircle size={28} aria-hidden="true" />
              )}
            </div>

            <div>
              <span className="register-card-eyebrow">VIETPEACE STAY · KÍCH HOẠT TÀI KHOẢN</span>
              <h1 className="register-verify-heading">
                {status === 'loading'
                  ? 'Đang xác thực email...'
                  : status === 'success'
                  ? alreadyVerified
                    ? 'Email đã được xác thực'
                    : 'Xác thực email thành công!'
                  : 'Không thể xác thực email'}
              </h1>
            </div>

            <div
              className={`register-message ${
                status === 'success'
                  ? 'register-message--success'
                  : status === 'error'
                  ? 'register-message--error'
                  : ''
              }`}
              role={status === 'error' ? 'alert' : 'status'}
            >
              {status === 'success' ? (
                <MailCheck aria-hidden="true" />
              ) : status === 'error' ? (
                <AlertCircle aria-hidden="true" />
              ) : (
                <Loader2 className="register-spin" aria-hidden="true" />
              )}
              <span>
                {resultMessage}
                {verifiedEmail ? (
                  <>
                    {' '}
                    (<strong>{verifiedEmail}</strong>)
                  </>
                ) : null}
              </span>
            </div>

            {status === 'success' && (
              <div className="register-verify-actions">
                <Link className="register-submit" to={loginHref}>
                  Đăng nhập ngay <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="register-secondary-btn" to="/">
                  Về trang chủ
                </Link>
              </div>
            )}

            {status === 'error' && (
              <>
                <form method="POST" onSubmit={handleResendSubmit} noValidate>
                  <div className="register-field">
                    <label htmlFor={resendInputId}>
                      Gửi lại liên kết xác thực mới
                    </label>
                    <span className="register-hint">
                      Nhập email bạn đã dùng để đăng ký để nhận liên kết xác thực mới.
                    </span>
                    <input
                      id={resendInputId}
                      name="email"
                      type="email"
                      value={resendEmail}
                      onChange={(e) => {
                        setResendEmail(e.target.value);
                        if (resendEmailError) setResendEmailError('');
                      }}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="ban@email.com"
                      required
                      disabled={isResending}
                      className={resendEmailError ? 'register-input--invalid' : ''}
                      aria-invalid={resendEmailError ? 'true' : 'false'}
                      aria-describedby={resendEmailError ? resendErrorId : undefined}
                    />
                    {resendEmailError && (
                      <p id={resendErrorId} className="register-field-error">
                        <AlertCircle aria-hidden="true" />
                        <span>{resendEmailError}</span>
                      </p>
                    )}
                  </div>

                  {resendFeedback && (
                    <div
                      className={`register-message register-message--${resendFeedback.type}`}
                      role={resendFeedback.type === 'error' ? 'alert' : 'status'}
                    >
                      {resendFeedback.type === 'success' ? (
                        <CheckCircle2 aria-hidden="true" />
                      ) : (
                        <AlertCircle aria-hidden="true" />
                      )}
                      <span>{resendFeedback.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="register-submit"
                    disabled={isResending || resendCooldown > 0}
                  >
                    {isResending ? (
                      <>
                        <Loader2 size={18} className="register-spin" aria-hidden="true" />
                        <span>Đang gửi email xác thực...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw size={18} aria-hidden="true" />
                        <span>Gửi lại sau ({resendCooldown}s)</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} aria-hidden="true" />
                        <span>Gửi lại email xác thực</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="register-login">
                  Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link> ·{' '}
                  <Link to={loginHref}>Đăng nhập</Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const returnUrl = searchParams.get('returnUrl') || '';
  const loginHref = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';

  return <VerifyEmailContent key={token || 'missing'} token={token} loginHref={loginHref} />;
}
