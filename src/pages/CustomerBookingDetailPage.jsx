import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import RoomTypePriceBreakdownTooltip from '../components/room_types/RoomTypePriceBreakdownTooltip.jsx';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');
const BACKEND_APP_BASE_URL = (import.meta.env.VITE_BACKEND_APP_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');
const BOOKINGS_PATH = '/my-account/my-bookings';

const bookingStatusLabels = {
    CONFIRMED: ['Đã xác nhận', 'emerald'],
    PENDING: ['Chờ thanh toán', 'amber'],
    PAYMENT_PROCESSING: ['Đang xử lý thanh toán', 'amber'],
    CANCELLED: ['Đã hủy', 'rose'],
    EXPIRED: ['Đã hết hạn', 'rose'],
    FAILED: ['Đặt phòng thất bại', 'rose'],
};

const paymentStatusLabels = {
    PROCESSING: 'Đang xử lý',
    SUCCESS: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    EXPIRED: 'Phiên thanh toán đã hết hạn',
    REFUND_PENDING: 'Đang chờ hoàn tiền',
    REFUND_PROCESSING: 'Đang xử lý hoàn tiền',
    REFUNDED: 'Đã hoàn tiền',
    PARTIALLY_REFUNDED: 'Đã hoàn tiền một phần',
};

function getAccommodationImageUrl(value) {
    if (!value) return null;
    if (/^(https?:)?\/\//i.test(value)) return value;
    return `${BACKEND_APP_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function getStatusBadge(status) {
    const [label, color] = bookingStatusLabels[status] ?? [status, 'amber'];

    return (
        <span style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `var(--color-${color}-bg)`,
            color: `var(--color-${color}-text)`,
            border: `1px solid var(--color-${color}-border)`,
        }}>
            {label}
        </span>
    );
}

function BookingContactDetails({ title, name, email, phone }) {
    return (
        <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
                {title}
            </h4>
            <dl style={{ display: 'grid', gap: '4px', margin: 0, color: 'var(--color-slate)', fontSize: '0.875rem' }}>
                {[
                    ['Họ và tên', name],
                    ['Email', email],
                    ['Số điện thoại', phone],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt style={{ display: 'inline' }}>{label}: </dt>
                        <dd style={{ display: 'inline', margin: 0, overflowWrap: 'anywhere' }}>
                            {value?.trim() || 'Chưa cung cấp'}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function BookingRoomPriceDetails({ item, roomNumber }) {
    const nightlyRates = item.nightlyRates ?? [];
    const extraAdults = Math.max(0, item.adults - item.includedAdults);
    const extraChildren = Math.max(0, item.children - item.includedChildren);
    const priceLines = [
        {
            label: 'Tiền phòng trước phụ thu',
            amount: item.roomStayPrice,
            rates: nightlyRates,
        },
        {
            label: 'Phụ thu người lớn',
            amount: item.extraAdultTotal,
            rates: nightlyRates.map(({ stayDate }) => ({
                stayDate,
                price: item.extraAdultFee * extraAdults,
            })),
            subtitle: `Số người lớn tính phụ thu: ${extraAdults}`,
            emptyNotice: item.extraAdultTotal === 0 ? 'Không phát sinh phụ thu người lớn.' : undefined,
        },
        {
            label: 'Phụ thu trẻ em',
            amount: item.extraChildTotal,
            rates: nightlyRates.map(({ stayDate }) => ({
                stayDate,
                price: item.extraChildFee * extraChildren,
            })),
            subtitle: `Số trẻ em tính phụ thu: ${extraChildren}`,
            emptyNotice: item.extraChildTotal === 0 ? 'Không phát sinh phụ thu trẻ em.' : undefined,
        },
    ];

    return (
        <div style={{ display: 'grid', gap: '6px', color: 'var(--color-slate)' }}>
            {priceLines.map(({ label, amount, rates, subtitle, emptyNotice }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {label}
                        <RoomTypePriceBreakdownTooltip
                            title={label}
                            subtitle={subtitle}
                            nightlyRates={rates}
                            emptyNotice={emptyNotice ?? (rates.length === 0 ? 'Chưa có dữ liệu chi tiết theo đêm.' : undefined)}
                            totalLabel="Tổng cộng"
                            totalAmount={amount}
                            ariaLabel={`Xem ${label.toLowerCase()} của phòng ${roomNumber}`}
                        />
                    </span>
                    <strong className="tabular-nums" style={{ color: 'var(--color-navy)', whiteSpace: 'nowrap' }}>
                        {formatVND(amount)}
                    </strong>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--color-border)', fontWeight: 700, color: 'var(--color-navy)' }}>
                <span>Tổng tiền phòng</span>
                <span className="tabular-nums">{formatVND(item.totalAmount)}</span>
            </div>
        </div>
    );
}

export default function CustomerBookingDetailPage() {
    const { bookingId } = useParams();
    const [result, setResult] = useState(null);
    const isValidBookingId = /^[1-9]\d{0,18}$/.test(bookingId ?? '')
        && BigInt(bookingId) <= 9223372036854775807n;

    useEffect(() => {
        if (!isValidBookingId) return;

        let ignore = false;

        async function loadBooking() {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/customer/bookings/booking/${encodeURIComponent(bookingId)}`,
                    { credentials: 'include' }
                );
                const payload = await response.json().catch(() => null);

                if (!response.ok || payload?.success !== true || !payload.data) {
                    throw new Error(payload?.message || 'Không thể tải thông tin đặt phòng.');
                }

                if (!ignore) setResult({ bookingId, booking: payload.data });
            } catch (error) {
                if (!ignore) {
                    setResult({
                        bookingId,
                        message: error instanceof TypeError
                            ? 'Không thể kết nối để tải thông tin đặt phòng.'
                            : error.message,
                    });
                }
            }
        }

        void loadBooking();

        return () => {
            ignore = true;
        };
    }, [bookingId, isValidBookingId]);

    const currentResult = result?.bookingId === bookingId ? result : null;
    const booking = currentResult?.booking;
    const isLoading = isValidBookingId && !currentResult;

    if (!booking || !isValidBookingId) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center', maxWidth: '28rem' }}>
                    <p role={isLoading ? 'status' : 'alert'} style={{ fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 700, marginBottom: '1rem' }}>
                        {isLoading
                            ? 'Đang tải thông tin đặt phòng…'
                            : currentResult?.message || 'Không tìm thấy thông tin đặt phòng.'}
                    </p>
                    <Link to={BOOKINGS_PATH} className="btn-primary">
                        Về danh sách đặt phòng
                    </Link>
                </div>
            </div>
        );
    }

    const fullAddress = [booking.address, booking.wardFullName, booking.provinceFullname]
        .map(part => part?.trim())
        .filter(Boolean)
        .join(', ');
    const accommodationImageUrl = getAccommodationImageUrl(booking.accommodationImageUrl);
    const bookingStatus = booking.status === 'PENDING' && !booking.isPendingOpen
        ? 'EXPIRED'
        : booking.status;

    const adjustments = [
        // { label: 'Giảm giá phòng', amount: booking.roomDiscountTotal, sign: '−' },
        // { label: 'Ưu đãi đặt phòng', amount: booking.discountAmount, sign: '−' },
        { label: 'Thuế', amount: booking.taxAmount, sign: '+' },
        //{ label: 'Phí dịch vụ', amount: booking.serviceFee, sign: '+' },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div className="container-3xl">

                {/* Back Link */}
                <Link to={BOOKINGS_PATH} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '1rem' }}>
                    <ArrowLeft style={{ width: '14px', height: '14px' }} />
                    <span>Về danh sách đặt phòng</span>
                </Link>

                {/* Card Header */}
                <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sunshine)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                                Chi tiết đặt phòng
                            </span>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.025em', marginTop: '2px' }}>
                                {booking.bookingCode}
                            </h1>
                        </div>
                        <div>
                            {getStatusBadge(bookingStatus)}
                        </div>
                    </div>

                    {booking.status === 'FAILED' && (
                        <p style={{ color: 'var(--color-rose-text)', fontSize: '0.875rem' }}>
                            {booking.failureMessage || 'Đặt phòng không thành công.'}
                        </p>
                    )}

                    {booking.payment && (
                        <p style={{ color: 'var(--color-slate)', fontSize: '0.875rem' }}>
                            <strong>Thanh toán:</strong>{' '}
                            {paymentStatusLabels[booking.payment.status] ?? booking.payment.status}
                        </p>
                    )}

                    {accommodationImageUrl && (
                        <img
                            src={accommodationImageUrl}
                            alt={booking.accommodationName || 'Ảnh cơ sở lưu trú'}
                            style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                        />
                    )}

                    {/* Hotel Details */}
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)' }}>{booking.accommodationName}</h2>
                        {booking.locationName && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>
                                <strong>Điểm đến:</strong> {booking.locationName}
                            </p>
                        )}
                        {fullAddress && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
                                <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
                                <span>{fullAddress}</span>
                            </div>
                        )}
                    </div>

                    {/* Stay Dates Box */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '1rem', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', fontSize: '12px' }}>
                        <div>
                            <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Nhận phòng:</span>
                            <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{formatDateVN(booking.checkinDate)}</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Trả phòng:</span>
                            <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{formatDateVN(booking.checkoutDate)}</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Lưu trú:</span>
                            <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{booking.nights} đêm · {booking.numberOfRooms} phòng</strong>
                        </div>
                    </div>

                    <section style={{ display: 'grid', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                            Thông tin khách và lưu trú
                        </h3>

                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-slate)' }}>
                            <strong>Số khách:</strong>{' '}
                            {booking.totalAdults ?? '—'} người lớn · {booking.totalChildren ?? '—'} trẻ em
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                            <BookingContactDetails
                                title="Người đặt phòng"
                                name={booking.contactName}
                                email={booking.contactEmail}
                                phone={booking.contactPhone}
                            />
                            {booking.isBookingForOther === true && (
                                <BookingContactDetails
                                    title="Người đại diện nhận phòng"
                                    name={booking.guestName}
                                    email={booking.guestEmail}
                                    phone={booking.guestPhone}
                                />
                            )}
                        </div>

                        <dl style={{ display: 'grid', gap: '8px', margin: 0, fontSize: '0.875rem', color: 'var(--color-slate)' }}>
                            <div>
                                <dt style={{ fontWeight: 700, color: 'var(--color-navy)' }}>Giờ đến dự kiến</dt>
                                <dd style={{ margin: 0 }}>{booking.expectedArrivalTime?.trim() || 'Chưa cung cấp'}</dd>
                            </div>
                            <div>
                                <dt style={{ fontWeight: 700, color: 'var(--color-navy)' }}>Yêu cầu đặc biệt</dt>
                                <dd style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                                    {booking.specialRequests?.trim() || 'Không có'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* Individual Room Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Chi Tiết Từng Phòng</h3>
                        {booking.items?.map((item, idx) => (
                            <div key={item.id} style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px solid #F1F5F9', display: 'grid', gap: '8px', fontSize: '12px' }}>
                                <div>
                                    <strong style={{ color: 'var(--color-navy)', display: 'block' }}>Phòng {idx + 1}: {item.roomName}</strong>
                                    <span style={{ color: 'var(--color-slate)' }}>{item.adults} người lớn, {item.children} trẻ em</span>
                                </div>
                                <BookingRoomPriceDetails item={item} roomNumber={idx + 1} />
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                            <span>Tiền phòng:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">{formatVND(booking.roomSubtotal)}</span>
                        </div>

                        {booking.extraGuestsSubtotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                                <span>Phụ thu khách/trẻ em thêm:</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">+{formatVND(booking.extraGuestsSubtotal)}</span>
                            </div>
                        )}

                        {adjustments.map(({ label, amount, sign }) => amount > 0 && (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                                <span>{label}</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">
                                    {sign}{formatVND(amount)}
                                </span>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                            <span>Tổng thanh toán:</span>
                            <span className="tabular-nums" style={{ fontSize: '1.25rem' }}>{formatVND(booking.totalAmount)}</span>
                        </div>
                    </div>

                    {booking.status === 'PENDING' && booking.isPendingOpen && (
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            <Link to={`/checkout?bookingId=${encodeURIComponent(booking.id)}`} className="btn-primary">
                                Tiếp tục thanh toán ngay
                            </Link>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
