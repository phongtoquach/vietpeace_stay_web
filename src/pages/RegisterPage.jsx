import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Eye, EyeOff, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import '../assets/styles/register.css';
import { registerCustomer, validateRegistration } from '../services/registration.js';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  function handleChange(event) {
    const name = event.target.name;
    setErrors(previous => ({ ...previous, [name]: undefined, ...(name === 'password' ? { confirmPassword: undefined } : {}) }));
    setMessage(null);
  }

  function fieldProps(name) {
    return {
      disabled: isSubmitting,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': [name === 'password' ? 'register-password-hint' : '', errors[name] ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined,
    };
  }

  function fieldError(name) {
    return errors[name] && <p id={`${name}-error`} className="register-field-error" role="alert">{errors[name]}</p>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);
    setMessage(null);
    if (Object.keys(validationErrors).length) return;
    submitting.current = true;
    setIsSubmitting(true);
    try {
      const result = await registerCustomer(values);
      if (result.errors) setErrors(result.errors);
      else if (result.success) setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-layout">
        <section className="register-intro" aria-labelledby="register-intro-title">
          <span className="register-eyebrow"><Leaf size={17} aria-hidden="true" /> VIETPEACE STAY</span>
          <h1 id="register-intro-title">Một tài khoản.<br />Nhiều hành trình.<br /><span>Trọn vẹn an yên.</span></h1>
          <p className="register-description">Gia nhập VietPeaceStay để tìm chốn nghỉ yêu thích và bắt đầu những chuyến đi theo cách của riêng bạn.</p>
          <div className="register-benefits">
            <div><span className="register-benefit-icon"><MapPin aria-hidden="true" /></span><div><h2>Khám phá chốn nghỉ phù hợp</h2><p>Tìm nơi dừng chân cho mỗi hành trình.</p></div></div>
            <div><span className="register-benefit-icon"><CalendarDays aria-hidden="true" /></span><div><h2>Quản lý đặt phòng dễ dàng</h2><p>Theo dõi chuyến đi ngay trong tài khoản.</p></div></div>
            <div><span className="register-benefit-icon"><ShieldCheck aria-hidden="true" /></span><div><h2>Đồng hành cùng bạn</h2><p>Kết nối với VietPeaceStay khi cần hỗ trợ.</p></div></div>
          </div>
          <div className="register-note"><span aria-hidden="true">✦</span><p>Đi để khám phá.<br /><strong>Ở để cảm nhận bình yên.</strong></p></div>
        </section>

        <section className="register-card" aria-label="Đăng ký tài khoản">
          <span className="register-card-eyebrow">CHÀO MỪNG BẠN ĐẾN VỚI VIETPEACESTAY</span>
          <p className="register-card-description">Hành trình mới bắt đầu từ đây.</p>
          <form noValidate onSubmit={handleSubmit} onChange={handleChange} aria-busy={isSubmitting}>
            <div className="register-field">
              <label htmlFor="register-name">Họ và tên <span>*</span></label>
              <input id="register-name" name="fullName" {...fieldProps('fullName')} autoComplete="name" placeholder="Nhập họ và tên của bạn" required maxLength={100} />
              {fieldError('fullName')}
            </div>
            <div className="register-field">
              <label htmlFor="register-email">Email <span>*</span></label>
              <input id="register-email" name="email" {...fieldProps('email')} type="email" autoComplete="email" placeholder="ban@email.com" required />
              {fieldError('email')}
            </div>
            <div className="register-field">
              <label htmlFor="register-phone">Số điện thoại <span>*</span></label>
              <input id="register-phone" name="phone" {...fieldProps('phone')} type="tel" autoComplete="tel" placeholder="0912 345 678" pattern="[+0-9 ()\-]{9,20}" title="Nhập số điện thoại từ 9 đến 20 ký tự, gồm chữ số, dấu +, khoảng trắng, ngoặc hoặc dấu gạch ngang." required />
              {fieldError('phone')}
            </div>
            <div className="register-field">
              <label htmlFor="register-password">Mật khẩu <span>*</span></label>
              <div className="register-password">
                <input id="register-password" name="password" {...fieldProps('password')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Tạo mật khẩu của bạn" minLength={8} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
              </div>
              {fieldError('password')}
              <small id="register-password-hint">Sử dụng ít nhất 8 ký tự.</small>
            </div>
            <div className="register-field">
              <label htmlFor="register-confirm">Xác nhận mật khẩu <span>*</span></label>
              <input id="register-confirm" name="confirmPassword" {...fieldProps('confirmPassword')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Nhập lại mật khẩu" minLength={8} required />
              {fieldError('confirmPassword')}
            </div>
            {message?.type === 'error' && <p className="register-message register-message--error" role="alert">{message.text}</p>}
            <button className="register-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang đăng ký…' : 'Đăng ký'} <ArrowRight size={19} aria-hidden="true" /></button>
            {message?.type === 'success' && <small className="register-success-note" role="status">{message.text}</small>}
          </form>
          <p className="register-login">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </section>
      </div>
    </main>
  );
}
