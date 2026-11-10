import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function VnpayReturnPage({ paymentStatus, isVerifying = false }) {
    const [searchParams] = useSearchParams();
    const { bookings } = useBooking();

    const code = searchParams.get('code');
    const booking = bookings.find(b => b.bookingCode === code) || bookings[0];

    const pageStyle = {
        minHeight: '100vh',
        backgroundColor: 'var(--color-ivory)',
        padding: '3.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    if (isVerifying) {
        return (
            <div style={pageStyle}>
                <div className="success-card" role="status" style={{ border: '1px solid #BFDBFE', backgroundColor: '#F8FBFF' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <Clock aria-hidden="true" style={{ width: '40px', height: '40px' }} />
                    </div>

                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1E3A8A' }}>
                            Đang xác minh thanh toán
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>
                            VietPeace Stay đang kiểm tra kết quả giao dịch VNPay. Quý khách vui lòng chờ trong giây lát.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            {paymentStatus === 'FAILED' ? (
                <div className="success-card" role="alert" style={{ border: '1px solid #FECACA', backgroundColor: '#FFF7F7' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', backgroundColor: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <XCircle aria-hidden="true" style={{ width: '40px', height: '40px' }} />
                    </div>

                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#991B1B' }}>
                            Thanh toán thất bại
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>
                            Giao dịch qua VNPay chưa hoàn tất. Quý khách có thể kiểm tra trạng thái đơn đặt phòng trong mục Đặt phòng của tôi.
                        </p>
                    </div>

                    <div style={{ paddingTop: '8px' }}>
                        <Link to="/bookings" style={{ color: '#991B1B', fontWeight: 700, textDecoration: 'underline' }}>
                            Xem các đặt phòng của tôi
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="success-card">
        
                    {/* Success Icon */}
                    <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-emerald-bg)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: 'var(--shadow-xs)' }}>
                        <CheckCircle2 style={{ width: '40px', height: '40px' }} />
                    </div>

                    <div>
                        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-emerald-bg)', color: 'var(--color-emerald-text)', border: '1px solid var(--color-emerald-border)', marginBottom: '8px' }}>
                            ĐÃ THANH TOÁN THÀNH CÔNG
                        </span>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                            Đặt Phòng Thành Công!
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>
                            Cảm ơn quý khách đã tin tưởng lựa chọn VietPeace Stay. Xác nhận đặt phòng đã được lưu trữ trong hệ thống.
                        </p>
                    </div>

                    {/* Booking Code Card */}
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-sunshine)', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-slate)', display: 'block' }}>
                            Mã Đặt Phòng Điện Tử
                        </span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '0.025em', display: 'block', marginTop: '2px' }} className="tabular-nums">
                            {booking?.bookingCode || 'VNS-20261020-001'}
                        </span>
                    </div>

                    {/* Receipt Details */}
                    {booking && (
                        <div style={{ textAlign: 'left', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-slate)', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Chỗ nghỉ:</span>
                                <strong style={{ color: 'var(--color-navy)' }}>{booking.accommodationName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Thời gian lưu trú:</span>
                                <strong style={{ color: 'var(--color-navy)' }}>{formatDateVN(booking.checkinDate)} – {formatDateVN(booking.checkoutDate)} ({booking.nights} đêm)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Số lượng phòng:</span>
                                <strong style={{ color: 'var(--color-navy)' }}>{booking.numberOfRooms} phòng</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontWeight: 500 }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Số tiền đã thanh toán:</span>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
                                    {formatVND(booking.totalAmount)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px', paddingTop: '8px' }}>
                        {booking && (
                            <Link
                                to={`/booking-detail?code=${encodeURIComponent(booking.bookingCode)}`}
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
                                boxShadow: 'var(--shadow-sm)'
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
                                fontSize: '0.875rem'
                            }}
                        >
                            Về trang chủ
                        </Link>
                    </div>

                </div>
            )}
        </div>
    );
}
