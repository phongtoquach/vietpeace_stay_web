import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { X, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import UnverifiedEmailBanner from './UnverifiedEmailBanner.jsx';
import { getWebApiBaseUrl } from '../utils/authApi.js';

export default function LoginModal({ isOpen, onClose, returnUrl = '/' }) {
    //const { loginAsync, login, setCurrentLoggedInUser } = useContext(AuthContext);
    const { setCurrentLoggedInUser } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bannerError, setBannerError] = useState('');
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

    const [errorsDetail, setErrorsDetail] = useState({});

    const emailInputRef = useRef(null);

    // Focus email input when modal opens & reset errors
    useEffect(() => {
        if (isOpen) {
            setBannerError('');
            setUnverifiedEmail('');
            setErrorsDetail({});
            setTimeout(() => {
                if (emailInputRef.current) {
                    emailInputRef.current.focus();
                }
            }, 50);
        }
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // Keyboard navigation: Escape to close modal
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;
        setBannerError('');
        setUnverifiedEmail('');
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
                `${getWebApiBaseUrl()}/auth/login`,
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
                setErrorsDetail(
                    response_data.errors || response_data.errorsDetail || {},
                );
                setBannerError(
                    response_data.message ||
                        'Không thể đăng nhập. Vui lòng thử lại.',
                );
                if (response_data.errorCode === 'EMAIL_NOT_VERIFIED') {
                    setUnverifiedEmail(emailVal);
                }
                return;
            }

            const customer = response_data.data?.loginCustomerInfo;
            if (!customer)
                throw new Error('Response đăng nhập thiếu loginCustomerInfo.');
            setCurrentLoggedInUser(customer);

            onClose();

            // let result;
            // if (typeof loginAsync === 'function') {
            // 	result = await loginAsync(email.trim(), password);
            // } else {
            // 	const ok = login(email.trim(), password);
            // 	result = ok ? { success: true } : { success: false, errorMsg: 'Email hoặc mật khẩu không chính xác' };
            // }

            // if (result.success) {
            // 	onClose();
            // } else {
            // 	setBannerError(result.errorMsg || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
            // 	if (result.errorsDetail) {
            // 		setErrorsDetail(result.errorsDetail);
            // 	}
            // }
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
        <div
            className="login-modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Đăng nhập tài khoản"
        >
            <div
                className="login-modal-dialog"
                onClick={(e) => e.stopPropagation()} // Prevent close on modal body click
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="login-modal-close-btn"
                    aria-label="Đóng cửa sổ đăng nhập"
                >
                    <X style={{ width: '20px', height: '20px' }} />
                </button>

                {/* Modal Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div
                        className="brand-text"
                        style={{
                            display: 'inline-block',
                            marginBottom: '8px',
                            fontSize: '1.25rem',
                        }}
                    >
                        VietPeace <span>Stay</span>
                    </div>
                    <h2
                        style={{
                            fontSize: '1.375rem',
                            fontWeight: 800,
                            color: 'var(--color-navy)',
                        }}
                    >
                        Đăng Nhập Khách Hàng
                    </h2>
                    <p
                        style={{
                            fontSize: '0.8125rem',
                            color: 'var(--color-slate)',
                            marginTop: '4px',
                        }}
                    >
                        Đăng nhập để tiếp tục đặt phòng và hưởng ưu đãi dành
                        riêng cho quý khách.
                    </p>
                </div>

                {/* Banner Error if any */}
                <UnverifiedEmailBanner
                    key={unverifiedEmail || bannerError || 'none'}
                    bannerError={bannerError}
                    unverifiedEmail={unverifiedEmail}
                />

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.875rem',
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--color-slate)',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            Địa chỉ Email
                        </label>
                        <div className="auth-input-wrapper">
                            <Mail
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    color: 'var(--color-slate)',
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            />
                            <input
                                ref={emailInputRef}
                                type="text"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errorsDetail.email) {
                                        setErrorsDetail((prev) => ({
                                            ...prev,
                                            email: null,
                                        }));
                                    }
                                }}
                                className={`auth-input ${errorsDetail.email ? 'auth-input--error' : ''}`}
                                style={{ paddingLeft: '36px' }}
                                placeholder="example@gmail.com"
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
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px',
                            }}
                        >
                            <label
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: 'var(--color-slate)',
                                }}
                            >
                                Mật khẩu
                            </label>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                                style={{
                                    fontSize: '11px',
                                    color: 'var(--color-sunshine)',
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                }}
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                        <div className="auth-input-wrapper">
                            <Lock
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    color: 'var(--color-slate)',
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorsDetail.password) {
                                        setErrorsDetail((prev) => ({
                                            ...prev,
                                            password: null,
                                        }));
                                    }
                                }}
                                className={`auth-input ${errorsDetail.password ? 'auth-input--error' : ''}`}
                                style={{
                                    paddingLeft: '36px',
                                    paddingRight: '40px',
                                }}
                                placeholder="Nhập mật khẩu của bạn"
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
                        {errorsDetail.password && (
                            <span className="auth-field-error">
                                {errorsDetail.password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-primary--full"
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-lg)',
                            marginTop: '4px',
                        }}
                        disabled={isLoading}
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

                <div
                    style={{
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--color-border)',
                        marginTop: '1.25rem',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--color-slate)',
                    }}
                >
                    Chưa có tài khoản?{' '}
                    <Link
                        to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
                        onClick={onClose}
                        style={{
                            color: 'var(--color-navy)',
                            fontWeight: 700,
                            textDecoration: 'underline',
                        }}
                    >
                        Đăng ký thành viên
                    </Link>
                </div>
            </div>
        </div>
    );
}
