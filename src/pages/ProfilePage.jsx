import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Lock, Calendar } from 'lucide-react';

const fieldErrorStyle = {
    fontSize: '12px',
    color: '#DC2626',
    marginTop: '4px',
};

function ProfilePersonalInfoForm({ customer, updateProfile, showToast }) {
    const [fullName, setFullName] = useState(customer.fullName || '');
    const [displayName, setDisplayName] = useState(customer.displayName ?? customer.fullName ?? '');
    const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber ?? customer.phone ?? '');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setFieldErrors({});
        setFormMessage('');
        setIsSubmitting(true);

        const result = await updateProfile({
            fullName,
            displayName,
            phoneNumber,
        });

        setIsSubmitting(false);

        if (!result?.success) {
            const errors = result?.errors || {};
            setFieldErrors(errors);
            const message = result?.message || 'Cập nhật hồ sơ thất bại.';
            setFormMessage(message);
            showToast(message, 'error');
            return;
        }

        showToast(result.message || 'Cập nhật thông tin tài khoản thành công.', 'success');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <User style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>Hồ Sơ Khách Hàng</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Họ và tên</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                            setFullName(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        className="auth-input"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.fullName && <p style={fieldErrorStyle}>{fieldErrors.fullName}</p>}
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Tên hiển thị</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
                        }}
                        className="auth-input"
                        placeholder="Mặc định dùng họ và tên nếu để trống"
                        disabled={isSubmitting}
                    />
                    {fieldErrors.displayName && <p style={fieldErrorStyle}>{fieldErrors.displayName}</p>}
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email đăng ký (Tài khoản)</label>
                    <input
                        type="email"
                        value={customer.email || ''}
                        disabled
                        className="auth-input"
                        style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, phone: undefined, phoneNumber: undefined }));
                        }}
                        className="auth-input"
                        required
                        disabled={isSubmitting}
                    />
                    {(fieldErrors.phone || fieldErrors.phoneNumber) && (
                        <p style={fieldErrorStyle}>{fieldErrors.phone || fieldErrors.phoneNumber}</p>
                    )}
                </div>

                {formMessage && !Object.values(fieldErrors).some(Boolean) && (
                    <p style={{ ...fieldErrorStyle, marginTop: 0 }}>{formMessage}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary btn-primary--full"
                    style={{ padding: '10px', borderRadius: 'var(--radius-lg)', fontSize: '12px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </form>
        </div>
    );
}

function ChangePasswordForm({ changePassword, showToast }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formMessage, setFormMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const clientErrors = {};
        if (!currentPassword) {
            clientErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
        }
        if (!newPassword || newPassword.length < 8) {
            clientErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        } else if (currentPassword && currentPassword === newPassword) {
            clientErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
        }
        if (newPassword !== confirmPassword) {
            clientErrors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';
        }

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            const firstError = Object.values(clientErrors)[0];
            setFormMessage(firstError);
            showToast(firstError, 'error');
            return;
        }

        setFieldErrors({});
        setFormMessage('');
        setIsSubmitting(true);

        const result = await changePassword({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        setIsSubmitting(false);

        if (!result?.success) {
            const errors = result?.errors || {};
            setFieldErrors(errors);
            const message = result?.message || 'Không thể đổi mật khẩu.';
            setFormMessage(message);
            showToast(message, 'error');
            return;
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setFieldErrors({});
        setFormMessage('');
        showToast(result.message || 'Đổi mật khẩu thành công!', 'success');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <Lock style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>Đổi Mật Khẩu</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }));
                        }}
                        className="auth-input"
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.currentPassword && <p style={fieldErrorStyle}>{fieldErrors.currentPassword}</p>}
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Mật khẩu mới</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                        }}
                        className="auth-input"
                        placeholder="Tối thiểu 8 ký tự"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.newPassword && <p style={fieldErrorStyle}>{fieldErrors.newPassword}</p>}
                </div>

                <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        className="auth-input"
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                    />
                    {fieldErrors.confirmPassword && <p style={fieldErrorStyle}>{fieldErrors.confirmPassword}</p>}
                </div>

                {formMessage && !Object.values(fieldErrors).some(Boolean) && (
                    <p style={{ ...fieldErrorStyle, marginTop: 0 }}>{formMessage}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'var(--color-navy)',
                        color: 'var(--color-white)',
                        fontWeight: 700,
                        fontSize: '12px',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: 'background-color var(--transition-fast)'
                    }}
                >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
            </form>
        </div>
    );
}

export default function ProfilePage() {
    const { currentLoggedInUser, updateProfile, changePassword, showToast } = useAuth();

    if (!currentLoggedInUser) {
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

    const profileKey = [
        currentLoggedInUser.id || '',
        currentLoggedInUser.fullName || '',
        currentLoggedInUser.displayName || '',
        currentLoggedInUser.phoneNumber || '',
    ].join('|');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div className="container-4xl">

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>Thông Tin Tài Khoản</h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Quản lý hồ sơ định danh và cài đặt bảo mật của bạn.</p>
                    </div>
                    <Link
                        to="/my-account/my-bookings"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', color: 'var(--color-navy)', fontSize: '12px', fontWeight: 700 }}
                    >
                        <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
                        <span>Xem đơn đặt phòng của tôi</span>
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <ProfilePersonalInfoForm
                        key={profileKey}
                        customer={currentLoggedInUser}
                        updateProfile={updateProfile}
                        showToast={showToast}
                    />
                    <ChangePasswordForm
                        key={currentLoggedInUser.id || 'password-form'}
                        changePassword={changePassword}
                        showToast={showToast}
                    />
                </div>

            </div>
        </div>
    );
}

