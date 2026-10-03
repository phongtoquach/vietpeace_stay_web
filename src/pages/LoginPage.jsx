import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('nguyenvana@gmail.com');
  const [password, setPassword] = useState('VinaStay2026@');

  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate(returnUrl);
    }
  };

  const handleDemoFill = () => {
    setEmail('nguyenvana@gmail.com');
    setPassword('VinaStay2026@');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', padding: '3.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="brand-text" style={{ display: 'inline-block', marginBottom: '12px' }}>
            VinaStay <span>Group</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>Đăng Nhập Khách Hàng</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Đăng nhập để đặt phòng và hưởng ưu đãi trực tiếp.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)' }}>Mật khẩu</label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--color-sunshine)', fontWeight: 600, textDecoration: 'underline' }}>Quên mật khẩu?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-primary--full"
            style={{ padding: '12px', borderRadius: 'var(--radius-lg)' }}
          >
            Đăng Nhập
          </button>

          <button
            type="button"
            onClick={handleDemoFill}
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

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: 'var(--color-navy)', fontWeight: 700, textDecoration: 'underline' }}>
            Đăng ký thành viên
          </Link>
        </div>

      </div>
    </div>
  );
}
