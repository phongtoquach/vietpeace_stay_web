import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');

const REQUIRED_PARAMS = [
    'vnp_TmnCode',
    'vnp_TxnRef',
    'vnp_Amount',
    'vnp_ResponseCode',
    'vnp_TransactionStatus',
    'vnp_SecureHash',
];

const RESULT_COPY = {
    VERIFYING: {
        title: 'Đang xác minh thanh toán',
        message: 'VietPeace Stay đang kiểm tra kết quả giao dịch VNPay. Quý khách vui lòng chờ trong giây lát.',
    },
    VERIFY_PENDING: {
        title: 'Chưa xác nhận kết quả thanh toán',
        message: 'Quý khách có thể kiểm tra lại trạng thái giao dịch.',
    },
    INVALID: {
        title: 'Không thể xác minh thanh toán',
        message: 'Thông tin trả về từ VNPay thiếu hoặc không hợp lệ.',
    },
    FAILED: {
        title: 'Thanh toán thất bại',
        message: 'VNPay báo giao dịch thất bại. Quý khách có thể kiểm tra lại đơn đặt phòng.',
    },
    REFUND_PENDING: {
        title: 'Đang xử lý hoàn tiền',
        message: 'VNPay đã ghi nhận thanh toán nhưng không thể xác nhận đặt phòng. VietPeace Stay đang xử lý hoàn toàn bộ số tiền.',
    },
    REFUNDED: {
        title: 'Đã hoàn tiền',
        message: 'Đặt phòng không được xác nhận. VietPeace Stay đã ghi nhận hoàn toàn bộ số tiền.',
    },
};

const PAGE_STYLE = {
    minHeight: '100vh',
    backgroundColor: 'var(--color-ivory)',
    padding: '3.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const ACTIONS_STYLE = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    paddingTop: '8px',
};

const MESSAGE_STYLE = {
    fontSize: '0.875rem',
    color: 'var(--color-slate)',
    marginTop: '6px',
};

function readVnpayParams(search) {
    const fields = Object.create(null);

    for (const [key, value] of new URLSearchParams(search)) {
        if (!key.startsWith('vnp_')) continue;
        if (Object.hasOwn(fields, key)) return null;
        fields[key] = value;
    }

    if (!REQUIRED_PARAMS.every(key => fields[key])) return null;

    if (
        fields.vnp_ResponseCode === '00' &&
        fields.vnp_TransactionStatus === '00' &&
        (!fields.vnp_TransactionNo || !fields.vnp_PayDate)
    ) {
        return null;
    }

    return fields;
}

function StatusIcon({ Icon, color, backgroundColor }) {
    return (
        <div style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-full)',
            color,
            backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
        }}>
            <Icon aria-hidden="true" size={40} />
        </div>
    );
}

function ReceiptRow({ label, children }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>{label}</span>
            <strong style={{ color: 'var(--color-navy)' }}>{children}</strong>
        </div>
    );
}

function ConfirmedCard({ booking }) {
    return (
        <div className="success-card" role="status">
            <StatusIcon
                Icon={CheckCircle2}
                color="#059669"
                backgroundColor="var(--color-emerald-bg)"
            />

            <div>
                <span style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-emerald-bg)',
                    color: 'var(--color-emerald-text)',
                    border: '1px solid var(--color-emerald-border)',
                    marginBottom: '8px',
                }}>
                    ĐÃ THANH TOÁN THÀNH CÔNG
                </span>

                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                    Đặt Phòng Thành Công!
                </h1>

                <p style={MESSAGE_STYLE}>
                    Cảm ơn quý khách đã tin tưởng lựa chọn VietPeace Stay.
                    Xác nhận đặt phòng đã được lưu trữ trong hệ thống.
                </p>
            </div>

            {booking?.bookingCode && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-ivory)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--color-sunshine)',
                    textAlign: 'center',
                }}>
                    <span style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--color-slate)',
                    }}>
                        Mã Đặt Phòng Điện Tử
                    </span>

                    <strong className="tabular-nums" style={{
                        display: 'block',
                        marginTop: '2px',
                        fontSize: '1.5rem',
                        color: 'var(--color-navy)',
                    }}>
                        {booking.bookingCode}
                    </strong>
                </div>
            )}

            {booking && (
                <div style={{
                    textAlign: 'left',
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'var(--color-slate)',
                    border: '1px solid #E2E8F0',
                }}>
                    <ReceiptRow label="Chỗ nghỉ:">
                        {booking.accommodationName}
                    </ReceiptRow>

                    <ReceiptRow label="Thời gian lưu trú:">
                        {formatDateVN(booking.checkinDate)} – {formatDateVN(booking.checkoutDate)}
                        {' '}({booking.nights} đêm)
                    </ReceiptRow>

                    <ReceiptRow label="Số lượng phòng:">
                        {booking.numberOfRooms} phòng
                    </ReceiptRow>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                        <ReceiptRow label="Số tiền đã thanh toán:">
                            {formatVND(booking.totalAmount)}
                        </ReceiptRow>
                    </div>
                </div>
            )}

            <div style={ACTIONS_STYLE}>
                {booking?.bookingId && (
                    <Link
                        to={`/booking-detail?bookingId=${encodeURIComponent(booking.bookingId)}`}
                        className="btn-primary"
                    >
                        Xem chi tiết đặt phòng
                    </Link>
                )}

                <Link
                    to="/bookings"
                    style={{
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-navy)',
                        color: 'var(--color-white)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                    }}
                >
                    Xem các đặt phòng của tôi
                </Link>

                <Link
                    to="/"
                    style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-navy)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                    }}
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}

function ResultCard({ state, onRetry }) {
    const copy = RESULT_COPY[state] || RESULT_COPY.VERIFY_PENDING;
    const verifying = state === 'VERIFYING';
    const canRetry = state === 'VERIFY_PENDING' || state === 'REFUND_PENDING';
    const pending = verifying || canRetry;
    const refunded = state === 'REFUNDED';

    const color = pending ? '#1E3A8A' : refunded ? '#047857' : '#991B1B';
    const border = pending ? '#BFDBFE' : refunded ? '#A7F3D0' : '#FECACA';
    const background = pending ? '#F8FBFF' : refunded ? '#F0FDF4' : '#FFF7F7';
    const iconBackground = pending ? '#DBEAFE' : refunded ? '#D1FAE5' : '#FEE2E2';
    const Icon = pending ? Clock : refunded ? CheckCircle2 : XCircle;

    return (
        <div
            className="success-card"
            role={pending || refunded ? 'status' : 'alert'}
            style={{ border: `1px solid ${border}`, backgroundColor: background }}
        >
            <StatusIcon Icon={Icon} color={color} backgroundColor={iconBackground} />

            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color }}>
                    {copy.title}
                </h1>
                <p style={MESSAGE_STYLE}>{copy.message}</p>
            </div>

            {!verifying && (
                <div style={ACTIONS_STYLE}>
                    {canRetry && (
                        <button type="button" className="btn-primary" onClick={onRetry}>
                            Kiểm tra lại
                        </button>
                    )}

                    <Link to="/bookings" style={{ color, fontWeight: 700 }}>
                        Xem các đặt phòng của tôi
                    </Link>
                </div>
            )}
        </div>
    );
}

function VnpayResult({ search }) {
    const [result, setResult] = useState({ state: 'VERIFYING' });
    const [attempt, setAttempt] = useState(0);

    function retry() {
        setResult({ state: 'VERIFYING' });
        setAttempt(value => value + 1);
    }

    useEffect(() => {
        let active = true;
        const fields = readVnpayParams(search);

        async function verify() {
            if (!fields) {
                setResult({ state: 'INVALID' });
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/payment/vnpay/return`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fields),
                    }
                );

                const body = await response.json();
                if (!active) return;

                if (response.status === 400) {
                    setResult({ state: 'INVALID' });
                } else if (!response.ok || body?.success !== true || !body.data?.state) {
                    setResult({ state: 'VERIFY_PENDING' });
                } else if (
                    body.data.state === 'CONFIRMED' ||
                    Object.hasOwn(RESULT_COPY, body.data.state)
                ) {
                    setResult(body.data);
                } else {
                    setResult({ state: 'VERIFY_PENDING' });
                }
            } catch {
                if (active) setResult({ state: 'VERIFY_PENDING' });
            }
        }

        verify();

        return () => {
            active = false;
        };
    }, [search, attempt]);

    return (
        <div style={PAGE_STYLE}>
            {result.state === 'CONFIRMED'
                ? <ConfirmedCard booking={result.booking} />
                : <ResultCard state={result.state} onRetry={retry} />}
        </div>
    );
}

export default function VnpayReturnPage() {
    const { search } = useLocation();

    return <VnpayResult key={search} search={search} />;
}