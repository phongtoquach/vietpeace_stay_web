import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { resendCustomerVerification } from '../utils/authApi.js';

export default function UnverifiedEmailBanner({ bannerError, unverifiedEmail }) {
    const [isResending, setIsResending] = useState(false);
    const [feedback, setFeedback] = useState(null);

    if (!bannerError && !feedback) return null;

    const handleResend = async () => {
        if (!unverifiedEmail || isResending) return;
        setIsResending(true);
        setFeedback(null);

        try {
            const { ok, data } = await resendCustomerVerification(unverifiedEmail);
            setFeedback({
                type: ok && data?.success ? 'success' : 'error',
                text: data?.message || (ok ? 'Đã gửi lại email xác thực.' : 'Không thể gửi lại email xác thực.'),
            });
        } catch (err) {
            console.error('Resend verification error:', err);
            setFeedback({
                type: 'error',
                text: 'Không thể kết nối đến máy chủ để gửi lại email xác thực.',
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            {bannerError && (
                <div
                    className="auth-banner-error"
                    role="alert"
                    style={{ marginBottom: '1rem', flexDirection: 'column', alignItems: 'stretch' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        <span>{bannerError}</span>
                    </div>
                    {unverifiedEmail && (
                        <div style={{ paddingTop: '6px' }}>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: 'var(--color-navy)',
                                    textDecoration: 'underline',
                                }}
                            >
                                {isResending ? (
                                    <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <RefreshCw style={{ width: '13px', height: '13px' }} />
                                )}
                                <span>
                                    {isResending
                                        ? 'Đang gửi lại email xác thực...'
                                        : `Gửi lại email xác thực tới ${unverifiedEmail}`}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {feedback && (
                <div
                    role="status"
                    style={{
                        marginBottom: '1rem',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: feedback.type === 'success' ? '#ECFDF3' : '#FFF1F2',
                        border: `1px solid ${feedback.type === 'success' ? '#ABEFC6' : '#FECDD3'}`,
                        color: feedback.type === 'success' ? '#067647' : '#9F1239',
                    }}
                >
                    {feedback.type === 'success' ? (
                        <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    ) : (
                        <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    )}
                    <span>{feedback.text}</span>
                </div>
            )}
        </>
    );
}
