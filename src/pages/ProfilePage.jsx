import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Lock, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateProfile, showToast } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center', maxWidth: '28rem' }}>
          <p style={{ fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 700, marginBottom: '1rem' }}>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
          <Link to="/login" className="btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfile({ fullName, phone });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Đổi mật khẩu thành công!', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container-4xl">
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>Thông Tin Tài Khoản</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Quản lý hồ sơ định danh và cài đặt bảo mật của bạn.</p>
          </div>
          <Link
            to="/bookings"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', color: 'var(--color-navy)', fontSize: '12px', fontWeight: 700 }}
          >
            <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
            <span>Xem đơn đặt phòng của tôi</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Personal Info Form */}
          <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <User style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>Hồ Sơ Khách Hàng</h2>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email đăng ký (Tài khoản)</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="auth-input"
                  style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-primary--full"
                style={{ padding: '10px', borderRadius: 'var(--radius-lg)', fontSize: '12px' }}
              >
                Lưu Thay Đổi
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <Lock style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>Đổi Mật Khẩu</h2>
            </div>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--color-navy)',
                  color: 'var(--color-white)',
                  fontWeight: 700,
                  fontSize: '12px',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                Cập Nhật Mật Khẩu
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
