import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext.jsx';

import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    console.log("[LoginPage] Vừa vào hàm component LoginPage !");

    const { state } = useLocation();
    const navigate = useNavigate();
    //const [searchParams] = useSearchParams();
    //const { login } = useAuth();
    const fromUrl = state?.from ?? "/";

    console.log("[LoginPage] Value của biến fromUrl : " + fromUrl);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bannerError, setBannerError] = useState('');
    const [errorsDetail, setErrorsDetail] = useState({});

    //const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        console.log("[LoginPage] đang chạy useEffect() của component LoginPage !");
        
        // hàm cleanup
        return () => {
            console.log("[LoginPage] đang chạy hàm cleanup của useEffect() !");
        };
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setBannerError('');
        setErrorsDetail({});

        const fieldErrors = {};

        // validate email
        let emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        let emailVal = email.trim();
        if (emailVal == '') {
            fieldErrors.email = 'Vui lòng nhập địa chỉ email';
        } else if (emailRegex.test(emailVal) == false) {
            fieldErrors.email = 'Email không đúng định dạng';
        }

        // validate password
        if (!password) {
            fieldErrors.password = 'Vui lòng nhập mật khẩu';
        }

        if (Object.keys(fieldErrors).length > 0) {
            setErrorsDetail(fieldErrors);
            setBannerError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
            return;
        }

        setIsLoading(true);

        try {
            const api_response = await fetch(
                `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '')}/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailVal,
                        password: password,
                    }),
                    credentials: 'include',
                },
            );

            const response_data = await api_response.json();

            if (!api_response.ok || !response_data.success) {
                setErrorsDetail(response_data.errors || response_data.errorsDetail || {},);
                setBannerError(response_data.message || 'Không thể đăng nhập. Vui lòng thử lại.',);
                return;
            }

            const customer = response_data.data?.loginCustomerInfo;
            if (!customer)
                throw new Error('Response đăng nhập thiếu loginCustomerInfo.');
            
            // navigate
            navigate(fromUrl, { replace: true });
            
        } catch (err) {
            console.error('Login error:', err);
            setBannerError(
                'Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', padding: '3.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-card">
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Link to="/" className="brand-text" style={{ display: 'inline-block', marginBottom: '12px' }}>
                    VietPeace <span>Stay</span>
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>Đăng Nhập Khách Hàng</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>Đăng nhập để đặt phòng và hưởng ưu đãi trực tiếp.</p>
                </div>

                {/* Banner Error if any */}
                {bannerError && (
                    <div
                        className="auth-banner-error"
                        role="alert"
                        style={{ marginBottom: '1rem' }}
                    >
                        <AlertCircle
                            style={{
                                width: '16px',
                                height: '16px',
                                flexShrink: 0,
                            }}
                        />
                        <span>{bannerError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input"
                                disabled={isLoading}
                            />
                        </div>
                        {errorsDetail.email && (
                            <span className="auth-field-error">
                                {errorsDetail.email}
                            </span>
                        )}
                    </div>
                    
                    <div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)' }}>Mật khẩu</label>
                                <a href="#" style={{ fontSize: '12px', color: 'var(--color-sunshine)', fontWeight: 600, textDecoration: 'underline' }}>Quên mật khẩu?</a>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input"
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-slate)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                    }}
                                    aria-label={
                                        showPassword
                                            ? 'Ẩn mật khẩu'
                                            : 'Hiện mật khẩu'
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                            }}
                                        />
                                    ) : (
                                        <Eye
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                            }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                        {errorsDetail.password && (
                            <span className="auth-field-error">
                                {errorsDetail.password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-primary--full"
                        disabled={isLoading}
                        style={{ padding: '12px', borderRadius: 'var(--radius-lg)' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <span>Đăng Nhập</span>
                        )}
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
