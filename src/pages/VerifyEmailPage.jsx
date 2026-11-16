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
  verifyCustomerEmailCode,
  verifyCustomerEmailToken,
} from '../utils/authApi.js';
import '../assets/styles/register.css';
import { customerLoginHref, resolveSafeReturnUrl } from '../utils/authReturnUrl.js';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const verifyTokenRequests = new Map();

function verifyTokenOnce(token) {
  if (!verifyTokenRequests.has(token)) {
    const requestPromise = verifyCustomerEmailToken(token).finally(() => verifyTokenRequests.delete(token));
    verifyTokenRequests.set(token, requestPromise);
  }
  return verifyTokenRequests.get(token);
}

function VerifyEmailContent({ token, initialEmail, loginHref, returnUrl }) {
  const emailInputId = useId();
  const codeInputId = useId();

  const [status, setStatus] = useState(token ? 'loading' : 'form');
  const [resultMessage, setResultMessage] = useState(
    token
      ? 'Đang xác thực địa chỉ email của bạn...'
      : 'Nhập email đăng ký và mã xác nhận 6 chữ số trong hộp thư (hoặc thực hiện trực tiếp tại trang Đăng nhập).',
  );
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            data?.message || 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.',
          );
        } else {
          setStatus('error');
          if (data?.data?.email) setEmail(data.data.email);
          setResultMessage(
            data?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.',
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setResultMessage(
          'Không thể kết nối đến máy chủ để xác thực email. Vui lòng thử lại.',
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

  async function handleCodeVerifySubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Vui lòng nhập email đã đăng ký.');
      return;
    }
    if (!/^\d{6}$/.test(trimmedCode)) {
      setFormError('Mã xác nhận phải gồm đúng 6 chữ số.');
      return;
    }

    setFormError('');
    setResendFeedback(null);
    setIsSubmitting(true);

    try {
      const { ok, data } = await verifyCustomerEmailCode({
        email: trimmedEmail,
        code: trimmedCode,
      });

      if (!ok || !data?.success) {
        setFormError(data?.message || 'Không thể xác nhận mã lúc này.');
        return;
      }

      setStatus('success');
      setAlreadyVerified(Boolean(data?.data?.alreadyVerified));
      setVerifiedEmail(data?.data?.email || trimmedEmail);
      setResultMessage(
        data?.message || 'Tài khoản đã được kích hoạt thành công! Bạn có thể đăng nhập ngay.',
      );
    } catch {
      setFormError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendClick() {
    if (isResending || resendCooldown > 0) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setFormError('Vui lòng nhập đúng email trước khi yêu cầu gửi lại mã.');
      return;
    }

    setFormError('');
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
          text: data?.message || 'Không thể gửi lại mã xác nhận.',
        });
        return;
      }

      setResendCooldown(data?.data?.cooldownSeconds || 60);
      setResendFeedback({
        type: 'success',
        text: data?.message || 'Đã gửi lại mã xác nhận mới tới email của bạn.',
      });
    } catch {
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
        <section className="register-card" aria-label="Xác nhận kích hoạt tài khoản">
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
              ) : status === 'error' ? (
                <AlertCircle size={28} aria-hidden="true" />
              ) : (
                <MailCheck size={28} aria-hidden="true" />
              )}
            </div>

            <div>
              <span className="register-card-eyebrow">VIETPEACE STAY · KÍCH HOẠT TÀI KHOẢN</span>
              <h1 className="register-verify-heading">
                {status === 'loading'
                  ? 'Đang xác thực tài khoản...'
                  : status === 'success'
                  ? alreadyVerified
                    ? 'Tài khoản đã được kích hoạt'
                    : 'Kích hoạt tài khoản thành công!'
                  : 'Xác nhận mã kích hoạt email'}
              </h1>
            </div>

            <div
              className={`register-message ${
                status === 'success'
                  ? 'register-message--success'
                  : status === 'error'
                  ? 'register-message--error'
                  : 'register-message--warning'
              }`}
              role={status === 'error' ? 'alert' : 'status'}
            >
              {status === 'success' ? (
                <MailCheck aria-hidden="true" />
              ) : status === 'loading' ? (
                <Loader2 className="register-spin" aria-hidden="true" />
              ) : (
                <AlertCircle aria-hidden="true" />
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

            {status === 'success' ? (
              <div className="register-verify-actions">
                <Link
                  className="register-submit"
                  to={
                    verifiedEmail
                      ? customerLoginHref({ email: verifiedEmail, returnUrl })
                      : loginHref
                  }
                >
                  Đăng nhập ngay <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="register-secondary-btn" to="/">
                  Về trang chủ
                </Link>
              </div>
            ) : status !== 'loading' ? (
              <>
                <form method="POST" onSubmit={handleCodeVerifySubmit} noValidate>
                  <div className="register-field" style={{ marginBottom: '12px' }}>
                    <label htmlFor={emailInputId}>Email đã đăng ký</label>
                    <input
                      id={emailInputId}
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formError) setFormError('');
                      }}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="ban@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="register-field">
                    <label htmlFor={codeInputId}>Mã xác nhận (6 chữ số)</label>
                    <input
                      id={codeInputId}
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="\d{6}"
                      placeholder="Ví dụ: 482915"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (formError) setFormError('');
                      }}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {formError && (
                    <p className="register-field-error" style={{ marginTop: '8px' }} role="alert">
                      <AlertCircle aria-hidden="true" />
                      <span>{formError}</span>
                    </p>
                  )}

                  {resendFeedback && (
                    <div
                      className={`register-message register-message--${resendFeedback.type}`}
                      role={resendFeedback.type === 'error' ? 'alert' : 'status'}
                      style={{ marginTop: '12px' }}
                    >
                      {resendFeedback.type === 'success' ? (
                        <CheckCircle2 aria-hidden="true" />
                      ) : (
                        <AlertCircle aria-hidden="true" />
                      )}
                      <span>{resendFeedback.text}</span>
                    </div>
                  )}

                  <div className="register-verify-actions" style={{ marginTop: '16px' }}>
                    <button
                      type="submit"
                      className="register-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="register-spin" aria-hidden="true" />
                          <span>Đang kiểm tra mã...</span>
                        </>
                      ) : (
                        <>
                          <MailCheck size={18} aria-hidden="true" />
                          <span>Xác nhận kích hoạt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="register-secondary-btn"
                      onClick={handleResendClick}
                      disabled={isResending || resendCooldown > 0}
                    >
                      <RefreshCw size={16} aria-hidden="true" />
                      <span>
                        {resendCooldown > 0
                          ? `Gửi lại mã (${resendCooldown}s)`
                          : 'Gửi lại mã xác nhận'}
                      </span>
                    </button>
                  </div>
                </form>

                <p className="register-login">
                  Hoặc nhập mã trực tiếp tại{' '}
                  <Link to={customerLoginHref({ email: email.trim(), returnUrl, requireCode: true })}>Trang Đăng nhập</Link>
                </p>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';
  const returnUrl = resolveSafeReturnUrl(searchParams.get('returnUrl'));
  const loginHref = customerLoginHref({ returnUrl });

  return (
    <VerifyEmailContent
      key={token || initialEmail || 'code-form'}
      token={token}
      initialEmail={initialEmail}
      loginHref={loginHref}
      returnUrl={returnUrl}
    />
  );
}
