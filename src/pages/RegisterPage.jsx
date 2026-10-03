import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = register({ fullName, email, phone, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', padding: '3.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card">
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="brand-text" style={{ display: 'inline-block', marginBottom: '12px' }}>
            VinaStay <span>Group</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>Đăng Ký Thành Viên</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Trở thành hội viên để nhận quyền lợi tốt nhất.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn An"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-primary--full"
            style={{ padding: '12px', borderRadius: 'var(--radius-lg)', marginTop: '6px' }}
          >
            Tạo Tài Khoản
          </button>
        </form>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--color-navy)', fontWeight: 700, textDecoration: 'underline' }}>
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
}
