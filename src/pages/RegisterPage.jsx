import { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  MailCheck,
  MailWarning,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  getWebApiBaseUrl,
  registerCustomerAccount,
  resendCustomerVerification,
} from '../utils/authApi.js';
import '../assets/styles/register.css';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^[+0-9 ()-]{9,20}$/;

const FIELD_ORDER = ['fullName', 'email', 'phone', 'password', 'confirmPassword'];

const FIELD_LABELS = {
  fullName: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại',
  password: 'Mật khẩu',
  confirmPassword: 'Xác nhận mật khẩu',
};

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function validateFieldValue(name, values) {
  const value = values[name] ?? '';

  switch (name) {
    case 'fullName': {
      const trimmed = value.trim();
      if (!trimmed) return 'Vui lòng nhập họ và tên của bạn.';
      if (trimmed.length > 255) return 'Họ và tên không được vượt quá 255 ký tự.';
      return '';
    }
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'Vui lòng nhập địa chỉ email.';
      if (trimmed.length > 255) return 'Email không được vượt quá 255 ký tự.';
      if (!EMAIL_REGEX.test(trimmed)) {
        return 'Vui lòng nhập email đúng định dạng (ví dụ: ban@email.com).';
      }
      return '';
    }
    case 'phone': {
      const trimmed = value.trim();
      if (!trimmed) return 'Vui lòng nhập số điện thoại.';
      const digits = trimmed.replace(/\D/g, '');
      if (!PHONE_REGEX.test(trimmed) || digits.length < 9 || digits.length > 15) {
        return 'Số điện thoại phải gồm 9–15 chữ số hợp lệ.';
      }
      return '';
    }
    case 'password': {
      if (!value) return 'Vui lòng tạo mật khẩu.';
      if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
      if (new TextEncoder().encode(value).length > 72) {
        return 'Mật khẩu không được vượt quá 72 byte.';
      }
      return '';
    }
    case 'confirmPassword': {
      if (!value) return 'Vui lòng nhập lại mật khẩu để xác nhận.';
      if (value !== values.password) {
        return 'Mật khẩu xác nhận chưa khớp. Vui lòng kiểm tra lại.';
      }
      return '';
    }
    default:
      return '';
  }
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '';
  const loginHref = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';

  const cardHeadingId = useId();
  const phoneHintId = useId();
  const passwordHintId = useId();
  const passwordToggleWarningId = useId();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [dirty, setDirty] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [bannerMessage, setBannerMessage] = useState(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verificationState, setVerificationState] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState(null);

  const inputRefs = useRef({});
  const verificationHeadingRef = useRef(null);
  const announceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (verificationState) {
      verificationHeadingRef.current?.focus();
    }
  }, [verificationState]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function schedulePoliteAnnouncement(fieldName, errorText) {
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    setLiveAnnouncement('');
    if (!errorText) return;
    announceTimerRef.current = setTimeout(() => {
      setLiveAnnouncement(`${FIELD_LABELS[fieldName]}: ${errorText}`);
    }, 400);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setDirty((prev) => ({ ...prev, [name]: true }));
    setBannerMessage(null);

    if (touched[name] || fieldErrors[name]) {
      const nextErr = validateFieldValue(name, nextValues);
      setFieldErrors((prev) => {
        const updated = { ...prev, [name]: nextErr };
        if (name === 'password' && (touched.confirmPassword || prev.confirmPassword)) {
          updated.confirmPassword = validateFieldValue('confirmPassword', nextValues);
        }
        return updated;
      });
      if (!nextErr) {
        if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
        setLiveAnnouncement('');
      }
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    if (!dirty[name]) return;

    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateFieldValue(name, values);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
    schedulePoliteAnnouncement(name, err);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const allTouched = {};
    const nextErrors = {};
    for (const key of FIELD_ORDER) {
      allTouched[key] = true;
      const err = validateFieldValue(key, values);
      if (err) nextErrors[key] = err;
    }

    setTouched(allTouched);
    setFieldErrors(nextErrors);
    setBannerMessage(null);

    const firstInvalid = FIELD_ORDER.find((key) => Boolean(nextErrors[key]));
    if (firstInvalid) {
      setBannerMessage({
        type: 'error',
        text: 'Vui lòng kiểm tra và hoàn thiện các thông tin được đánh dấu bên dưới.',
      });
      inputRefs.current[firstInvalid]?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const { ok, data } = await registerCustomerAccount({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (!ok || !data?.success) {
        const serverErrors = data?.errors || {};
        const mappedErrors = {
          fullName: serverErrors.fullName || serverErrors.full_name || '',
          email: serverErrors.email || '',
          phone: serverErrors.phone || serverErrors.phoneNumber || serverErrors.phone_number || '',
          password: serverErrors.password || '',
          confirmPassword: serverErrors.confirmPassword || serverErrors.confirm_password || '',
        };
        setFieldErrors(mappedErrors);
        setBannerMessage({
          type: 'error',
          text: data?.message || 'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.',
        });

        const firstServerErrorField = FIELD_ORDER.find((key) => Boolean(mappedErrors[key]));
        if (firstServerErrorField) {
          inputRefs.current[firstServerErrorField]?.focus();
        }
        return;
      }

      const registeredEmail = data?.data?.customer?.email || values.email.trim().toLowerCase();
      const emailSent = Boolean(data?.data?.emailSent);
      const expiresInHours = data?.data?.expiresInHours || 24;

      setVerificationState({
        email: registeredEmail,
        fullName: data?.data?.customer?.fullName || values.fullName.trim(),
        emailSent,
        expiresInHours,
      });
      setResendCooldown(emailSent ? 60 : 0);
      setResendFeedback(
        emailSent
          ? null
          : {
              type: 'warning',
              text: data?.message || 'Tài khoản đã được ghi nhận nhưng chưa gửi được email xác thực. Bạn có thể bấm gửi lại bên dưới.',
            },
      );
    } catch (error) {
      console.error('[RegisterPage] Register request failed:', error);
      setBannerMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau ít phút.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    if (!verificationState?.email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    setResendFeedback(null);

    try {
      const { ok, data } = await resendCustomerVerification(verificationState.email);
      if (!ok || !data?.success) {
        const retryAfter = data?.data?.retryAfterSeconds;
        if (retryAfter) {
          setResendCooldown(retryAfter);
        }
        setResendFeedback({
          type: 'error',
          text: data?.message || 'Không thể gửi lại email xác thực lúc này.',
        });
        return;
      }

      setVerificationState((prev) => (prev ? { ...prev, emailSent: true } : prev));
      setResendCooldown(data?.data?.cooldownSeconds || 60);
      setResendFeedback({
        type: 'success',
        text: data?.message || 'Đã gửi lại liên kết xác thực. Vui lòng kiểm tra hộp thư của bạn.',
      });
    } catch (error) {
      console.error('[RegisterPage] Resend verification failed:', error);
      setResendFeedback({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ để gửi lại email.',
      });
    } finally {
      setIsResending(false);
    }
  }

  function handleUseDifferentEmail() {
    setVerificationState(null);
    setResendFeedback(null);
    setResendCooldown(0);
    setBannerMessage(null);
    setFieldErrors({});
    setValues((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  }

  function getDescribedBy(name, baseHintId) {
    const ids = [];
    if (baseHintId) ids.push(baseHintId);
    if (fieldErrors[name]) ids.push(`register-${name}-error`);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  return (
    <main className="register-page">
      <div className="visually-hidden" aria-live="polite">
        {liveAnnouncement}
      </div>

      <div className="register-layout">
        <section className="register-intro" aria-labelledby="register-intro-title">
          <span className="register-eyebrow">
            <Leaf size={17} aria-hidden="true" /> VIETPEACE STAY
          </span>
          <h1 id="register-intro-title">
            Một tài khoản.<br />
            Nhiều hành trình.<br />
            <span>Trọn vẹn an yên.</span>
          </h1>
          <p className="register-description">
            Gia nhập VietPeaceStay để tìm chốn nghỉ yêu thích và bắt đầu những chuyến đi theo cách của riêng bạn.
          </p>
          <div className="register-benefits">
            <div>
              <span className="register-benefit-icon">
                <MapPin aria-hidden="true" />
              </span>
              <div>
                <h2>Khám phá chốn nghỉ phù hợp</h2>
                <p>Tìm nơi dừng chân cho mỗi hành trình.</p>
              </div>
            </div>
            <div>
              <span className="register-benefit-icon">
                <CalendarDays aria-hidden="true" />
              </span>
              <div>
                <h2>Quản lý đặt phòng dễ dàng</h2>
                <p>Theo dõi chuyến đi ngay trong tài khoản.</p>
              </div>
            </div>
            <div>
              <span className="register-benefit-icon">
                <ShieldCheck aria-hidden="true" />
              </span>
              <div>
                <h2>Đồng hành cùng bạn</h2>
                <p>Kết nối với VietPeaceStay khi cần hỗ trợ.</p>
              </div>
            </div>
          </div>
          <div className="register-note">
            <span aria-hidden="true">✦</span>
            <p>
              Đi để khám phá.<br />
              <strong>Ở để cảm nhận bình yên.</strong>
            </p>
          </div>
        </section>

        <section className="register-card" aria-label="Đăng ký tài khoản">
          {verificationState ? (
            <div className="register-verify-panel">
              <div
                className={`register-verify-badge ${
                  verificationState.emailSent ? 'register-verify-badge--success' : ''
                }`}
              >
                {verificationState.emailSent ? (
                  <MailCheck size={28} aria-hidden="true" />
                ) : (
                  <MailWarning size={28} aria-hidden="true" />
                )}
              </div>

              <div>
                <span className="register-card-eyebrow">BƯỚC TIẾP THEO · XÁC THỰC EMAIL</span>
                <h2
                  ref={verificationHeadingRef}
                  tabIndex={-1}
                  className="register-verify-heading"
                >
                  Kiểm tra hộp thư của bạn
                </h2>
              </div>

              <p className="register-verify-text">
                Chúng tôi đã ghi nhận tài khoản cho{' '}
                <strong>{verificationState.fullName}</strong> và gửi liên kết xác thực đến địa chỉ{' '}
                <strong>{verificationState.email}</strong>.
              </p>

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

              <div className="register-verify-tips">
                <strong>Lưu ý khi kích hoạt tài khoản:</strong>
                <ul>
                  <li>
                    Mở email có tiêu đề <em>"[VietPeace Stay] Xác thực địa chỉ email tài khoản của bạn"</em> và nhấn nút xác thực.
                  </li>
                  <li>
                    Liên kết xác thực có hiệu lực trong vòng{' '}
                    <strong>{verificationState.expiresInHours} giờ</strong>.
                  </li>
                  <li>Nếu chưa thấy thư ở Hộp thư đến, hãy kiểm tra thêm mục Thư rác (Spam) hoặc Quảng cáo.</li>
                </ul>
              </div>

              <div className="register-verify-actions">
                <button
                  type="button"
                  className="register-secondary-btn"
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                >
                  {isResending ? (
                    <>
                      <Loader2 size={17} className="register-spin" aria-hidden="true" />
                      <span>Đang gửi lại email...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw size={17} aria-hidden="true" />
                      <span>Gửi lại email xác thực ({resendCooldown}s)</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={17} aria-hidden="true" />
                      <span>Gửi lại email xác thực</span>
                    </>
                  )}
                </button>

                <Link className="register-submit" to={loginHref}>
                  Đi tới trang Đăng nhập <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  className="register-inline-link-btn"
                  onClick={handleUseDifferentEmail}
                >
                  Đăng ký bằng email khác
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="register-card-eyebrow">CHÀO MỪNG BẠN ĐẾN VỚI VIETPEACESTAY</span>
              <h2 id={cardHeadingId}>Tạo tài khoản mới</h2>
              <p className="register-card-description">
                Hành trình mới bắt đầu từ đây. Email xác thực sẽ được gửi sau khi đăng ký.
              </p>

              {bannerMessage && (
                <div
                  className={`register-message register-message--${bannerMessage.type}`}
                  role={bannerMessage.type === 'error' ? 'alert' : 'status'}
                >
                  <AlertCircle aria-hidden="true" />
                  <span>{bannerMessage.text}</span>
                </div>
              )}

              <form
                method="POST"
                action={`${getWebApiBaseUrl()}/auth/register`}
                onSubmit={handleSubmit}
                aria-labelledby={cardHeadingId}
                noValidate
              >
                <div className="register-field">
                  <label htmlFor="register-name">
                    Họ và tên <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={(el) => { inputRefs.current.fullName = el; }}
                    id="register-name"
                    name="fullName"
                    type="text"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="Nhập họ và tên của bạn"
                    maxLength={100}
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.fullName ? 'register-input--invalid' : ''}
                    aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
                    aria-describedby={getDescribedBy('fullName')}
                  />
                  {fieldErrors.fullName && (
                    <p id="register-fullName-error" className="register-field-error">
                      <AlertCircle aria-hidden="true" />
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>

                <div className="register-field">
                  <label htmlFor="register-email">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={(el) => { inputRefs.current.email = el; }}
                    id="register-email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="ban@email.com"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.email ? 'register-input--invalid' : ''}
                    aria-invalid={fieldErrors.email ? 'true' : 'false'}
                    aria-describedby={getDescribedBy('email')}
                  />
                  {fieldErrors.email && (
                    <p id="register-email-error" className="register-field-error">
                      <AlertCircle aria-hidden="true" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div className="register-field">
                  <label htmlFor="register-phone">
                    Số điện thoại <span aria-hidden="true">*</span>
                  </label>
                  <span id={phoneHintId} className="register-hint">
                    Nhập 9–15 chữ số (ví dụ: 0912 345 678 hoặc +84 912 345 678).
                  </span>
                  <input
                    ref={(el) => { inputRefs.current.phone = el; }}
                    id="register-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="0912 345 678"
                    pattern="[+0-9 ()\-]{9,20}"
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.phone ? 'register-input--invalid' : ''}
                    aria-invalid={fieldErrors.phone ? 'true' : 'false'}
                    aria-describedby={getDescribedBy('phone', phoneHintId)}
                  />
                  {fieldErrors.phone && (
                    <p id="register-phone-error" className="register-field-error">
                      <AlertCircle aria-hidden="true" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                <div className="register-field">
                  <label htmlFor="register-password">
                    Mật khẩu <span aria-hidden="true">*</span>
                  </label>
                  <span id={passwordHintId} className="register-hint">
                    Sử dụng ít nhất 8 ký tự.
                  </span>
                  <div className="register-password">
                    <input
                      ref={(el) => { inputRefs.current.password = el; }}
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      placeholder="Tạo mật khẩu của bạn"
                      minLength={8}
                      required
                      disabled={isSubmitting}
                      className={fieldErrors.password ? 'register-input--invalid' : ''}
                      aria-invalid={fieldErrors.password ? 'true' : 'false'}
                      aria-describedby={getDescribedBy('password', passwordHintId)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-pressed={showPassword}
                      aria-describedby={passwordToggleWarningId}
                    >
                      {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                    </button>
                    <span id={passwordToggleWarningId} className="visually-hidden">
                      Cảnh báo: thao tác này sẽ hiển thị mật khẩu trên màn hình.
                    </span>
                  </div>
                  {fieldErrors.password && (
                    <p id="register-password-error" className="register-field-error">
                      <AlertCircle aria-hidden="true" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                <div className="register-field">
                  <label htmlFor="register-confirm">
                    Xác nhận mật khẩu <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={(el) => { inputRefs.current.confirmPassword = el; }}
                    id="register-confirm"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                    enterKeyHint="done"
                    placeholder="Nhập lại mật khẩu"
                    minLength={8}
                    required
                    disabled={isSubmitting}
                    className={fieldErrors.confirmPassword ? 'register-input--invalid' : ''}
                    aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={getDescribedBy('confirmPassword')}
                  />
                  {fieldErrors.confirmPassword && (
                    <p id="register-confirmPassword-error" className="register-field-error">
                      <AlertCircle aria-hidden="true" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                <button className="register-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={19} className="register-spin" aria-hidden="true" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo tài khoản</span>
                      <ArrowRight size={19} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="register-login">
                Đã có tài khoản? <Link to={loginHref}>Đăng nhập</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
