import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Eye, EyeOff, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import '../assets/styles/register.css';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get('fullName').trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập họ và tên của bạn.' });
      return;
    }
    if (data.get('password') !== data.get('confirmPassword')) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận chưa khớp. Bạn kiểm tra lại nhé.' });
      return;
    }
    setMessage({ type: 'info', text: 'Thông tin hợp lệ! Đây là bản xem thử giao diện, tài khoản chưa được tạo.' });
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

        <section className="register-card" aria-labelledby="register-title">
          <span className="register-card-eyebrow">CHÀO MỪNG BẠN ĐẾN VỚI VIETPEACESTAY</span>
          <h2 id="register-title">Tạo tài khoản</h2>
          <p className="register-card-description">Hành trình mới bắt đầu từ đây.</p>
          <form onSubmit={handleSubmit} onChange={() => setMessage(null)}>
            <div className="register-field">
              <label htmlFor="register-name">Họ và tên <span>*</span></label>
              <input id="register-name" name="fullName" autoComplete="name" placeholder="Nhập họ và tên của bạn" required maxLength={100} />
            </div>
            <div className="register-field">
              <label htmlFor="register-email">Email <span>*</span></label>
              <input id="register-email" name="email" type="email" autoComplete="email" placeholder="ban@email.com" required />
            </div>
            <div className="register-field">
              <label htmlFor="register-phone">Số điện thoại <span>*</span></label>
              <input id="register-phone" name="phone" type="tel" autoComplete="tel" placeholder="0912 345 678" pattern="[+0-9 ()\-]{9,20}" title="Nhập số điện thoại từ 9 đến 20 ký tự, gồm chữ số, dấu +, khoảng trắng, ngoặc hoặc dấu gạch ngang." required />
            </div>
            <div className="register-field">
              <label htmlFor="register-password">Mật khẩu <span>*</span></label>
              <div className="register-password">
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Tạo mật khẩu của bạn" minLength={8} aria-describedby="register-password-hint" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
              </div>
              <small id="register-password-hint">Sử dụng ít nhất 8 ký tự.</small>
            </div>
            <div className="register-field">
              <label htmlFor="register-confirm">Xác nhận mật khẩu <span>*</span></label>
              <input id="register-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Nhập lại mật khẩu" minLength={8} required />
            </div>
            {message && <p className={`register-message register-message--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}
            <button className="register-submit" type="submit">Tạo tài khoản <ArrowRight size={19} aria-hidden="true" /></button>
            <p className="register-preview">Bản xem thử giao diện · Chưa tạo tài khoản thật</p>
          </form>
          <p className="register-login">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </section>
      </div>
    </main>
  );
}
