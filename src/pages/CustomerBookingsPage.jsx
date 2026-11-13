import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/$/, '');
const BACKEND_APP_BASE_URL = (import.meta.env.VITE_BACKEND_APP_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');
const BOOKINGS_PATH = '/my-account/my-bookings';

const tabs = [
    { status: 'CONFIRMED', label: 'Đã xác nhận', color: 'emerald' },
    { status: 'PENDING', label: 'Đang chờ thanh toán', color: 'amber' },
    { status: 'PAYMENT_PROCESSING', label: 'Đang thanh toán', color: 'indigo' },
];

const cardStyle = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border)',
    padding: '1rem',
    boxShadow: 'var(--shadow-xs)',
};

function getPaginationItems(total, current) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
        return [1, 2, 3, 4, 5, '…', total];
    }
    if (current >= total - 3) {
        return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '…', current - 1, current, current + 1, '…', total];
}


function BookingCard({ booking, tab }) {
    const [imageFailed, setImageFailed] = useState(false);
    const bookingId = encodeURIComponent(booking.id);
    const image = booking.accommodationImageUrl;
    const imageUrl = image && (/^(https?:)?\/\//i.test(image)
        ? image
        : `${BACKEND_APP_BASE_URL}/${image.replace(/^\/+/, '')}`);
    const address = [
        booking.address,
        booking.wardFullName ?? booking.loc_ward_fullname,
        booking.provinceFullName ?? booking.provinceFullname ?? booking.loc_province_fullname,
    ].map(part => part?.trim()).filter(Boolean).join(', ');

    return (
        <article style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'clamp(76px, 22%, 160px) minmax(0, 1fr)', gap: 'clamp(10px, 2vw, 20px)', alignItems: 'start' }}>
            <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-ivory)', display: 'grid', placeItems: 'center' }}>
                {imageUrl && !imageFailed ? (
                    <img
                        src={imageUrl}
                        alt={booking.accommodationName || 'Ảnh chỗ nghỉ'}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <ImageOff aria-hidden="true" size={22} style={{ color: 'var(--color-slate)' }} />
                )}
            </div>

            <div style={{ display: 'grid', gap: '10px', minWidth: 0, overflowWrap: 'anywhere' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: 700 }}>
                        Mã đặt phòng:{' '}
                        <strong style={{ color: 'var(--color-indigo-text, #1e3a8a)', backgroundColor: 'var(--color-indigo-bg, #eef2ff)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 800 }}>
                            {booking.bookingCode}
                        </strong>
                    </span>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: `var(--color-${tab.color}-bg)`,
                        color: `var(--color-${tab.color}-text)`,
                        border: `1px solid var(--color-${tab.color}-border)`,
                    }}>
                        {tab.label}
                    </span>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', margin: 0 }}>
                        {booking.accommodationName}
                    </h2>
                    {booking.locationName && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-slate)' }}>
                            <strong>Điểm đến:</strong> {booking.locationName}
                        </p>
                    )}
                    {address && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-slate)' }}>
                            <strong>Địa chỉ:</strong> {address}
                        </p>
                    )}
                </div>

                <dl style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', margin: 0, fontSize: '13px', color: 'var(--color-slate)' }}>
                    <div>
                        <dt>Nhận phòng</dt>
                        <dd style={{ margin: 0, fontWeight: 700, color: 'var(--color-navy)' }}>{formatDateVN(booking.checkinDate)}</dd>
                    </div>
                    <div>
                        <dt>Trả phòng</dt>
                        <dd style={{ margin: 0, fontWeight: 700, color: 'var(--color-navy)' }}>{formatDateVN(booking.checkoutDate)}</dd>
                    </div>
                    <div>
                        <dt>Lưu trú</dt>
                        <dd style={{ margin: 0, fontWeight: 700, color: 'var(--color-navy)' }}>
                            {booking.nights} đêm · {booking.numberOfRooms} phòng
                        </dd>
                    </div>
                </dl>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                    <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Tổng tiền đặt phòng</span>
                        <div className="tabular-nums" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                            {formatVND(booking.totalAmount)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                        <Link
                            to={`${BOOKINGS_PATH}/booking/${bookingId}`}
                            className="customer-booking-detail-link"
                            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-navy)', color: 'var(--color-white)', fontWeight: 700, fontSize: '12px' }}
                        >
                            Xem chi tiết
                        </Link>
                        {booking.status === 'PENDING' && booking.isPendingOpen && (
                            <Link to={`/checkout?bookingId=${bookingId}`} className="btn-primary">
                                Thanh toán ngay
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function CustomerBookingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = tabs.find(tab => tab.status === searchParams.get('status')) ?? tabs[0];
    const status = activeTab.status;
    const requestedPage = searchParams.get('page') ?? '';
    const page = /^[1-9]\d{0,9}$/.test(requestedPage) && Number(requestedPage) <= 2147483647
        ? Number(requestedPage)
        : 1;

    const [result, setResult] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let ignore = false;
        setResult(null);

        async function loadBookings() {
            try {
                const response = await fetch(`${API_BASE_URL}/customer/bookings`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, page }),
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok || payload?.success !== true || !Array.isArray(payload.data?.items)) {
                    throw new Error(payload?.message || 'Không thể tải danh sách đặt phòng.');
                }
                if (!ignore) setResult({ status, page, retryKey, data: payload.data });
            } catch (error) {
                if (!ignore) {
                    setResult({
                        status,
                        page,
                        retryKey,
                        message: error instanceof TypeError
                            ? 'Không thể kết nối để tải danh sách đặt phòng.'
                            : error.message,
                    });
                }
            }
        }

        void loadBookings();
        return () => {
            ignore = true;
        };
    }, [status, page, retryKey]);

    const currentResult = result?.status === status && result.page === page && result.retryKey === retryKey
        ? result
        : null;
    const data = currentResult?.data;

    function changeList(nextStatus, nextPage) {
        const params = new URLSearchParams(searchParams);
        params.set('status', nextStatus);
        if (nextPage === 1) params.delete('page');
        else params.set('page', String(nextPage));
        setSearchParams(params);
    }

    function changePage(nextPage) {
        if (page === nextPage) return;
        changeList(status, nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div className="container-4xl">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '1.5rem' }}>
                    Đặt Phòng Của Tôi
                </h1>

                <div className="bookings-filter-tabs" role="group" aria-label="Lọc theo trạng thái đặt phòng" style={{ flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.status}
                            type="button"
                            aria-pressed={status === tab.status}
                            onClick={() => {
                                if (status !== tab.status) changeList(tab.status, 1);
                            }}
                            className={`booking-tab-btn ${status === tab.status ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <section aria-label={activeTab.label} aria-busy={!currentResult}>
                    {!currentResult && <p role="status" style={cardStyle}>Đang tải danh sách đặt phòng…</p>}
                    {currentResult?.message && (
                        <div style={cardStyle}>
                            <p role="alert">{currentResult.message}</p>
                            <button type="button" className="btn-primary" onClick={() => setRetryKey(value => value + 1)}>
                                Thử lại
                            </button>
                        </div>
                    )}
                    {data && (
                        <>
                            {data.items.length === 0 ? (
                                <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', color: 'var(--color-slate)' }}>
                                    <p>{data.totalItems > 0 ? 'Trang này không có đơn đặt phòng.' : 'Chưa có đơn đặt phòng nào trong mục này.'}</p>
                                    {/* {page > 1 ? (
                                        <button type="button" className="btn-primary" onClick={() => changeList(status, 1)}>
                                            Về trang đầu
                                        </button>
                                    ) : (
                                        <Link to="/search" className="btn-primary">Tìm chỗ nghỉ ngay</Link>
                                    )} */}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {data.items.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} tab={activeTab} />
                                    ))}
                                </div>
                            )}
                            {data.items.length > 0 && data.totalPages > 1 && (
                                <nav aria-label="Phân trang đặt phòng" className="customer-bookings-pagination-nav">
                                    <div className="customer-bookings-pagination-container">
                                        {page > 1 && (
                                            <button type="button" className="customer-bookings-pagination-link customer-bookings-pagination-arrow" aria-label="Trang trước" onClick={() => changePage(page - 1)}>
                                                ‹
                                            </button>
                                        )}
                                        {getPaginationItems(data.totalPages, page).map((item, index) => (
                                            item === '…' ? (
                                                <span key={`ellipsis-${index}`} className="customer-bookings-pagination-ellipsis" aria-hidden="true">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className="customer-bookings-pagination-link"
                                                    aria-current={page === item ? 'page' : undefined}
                                                    aria-label={`Trang ${item}`}
                                                    onClick={() => changePage(item)}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        ))}
                                        {page < data.totalPages && (
                                            <button type="button" className="customer-bookings-pagination-link customer-bookings-pagination-arrow" aria-label="Trang sau" onClick={() => changePage(page + 1)}>
                                                ›
                                            </button>
                                        )}
                                    </div>
                                </nav>
                            )}
                        </>
                    )}
                </section>
                <style>{`
              .customer-booking-detail-link:hover {
                filter: brightness(1.2);
              }
              .customer-bookings-pagination-nav {
                margin-top: 1.5rem;
                padding-top: 0.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .customer-bookings-pagination-container {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: center;
                background-color: var(--color-white);
                padding: 8px 12px;
                border-radius: var(--radius-xl);
                border: 1px solid var(--color-border);
                box-shadow: var(--shadow-xs);
              }
              .customer-bookings-pagination-link {
                min-width: 38px;
                height: 38px;
                padding: 0 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--color-navy);
                background-color: var(--color-white);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                text-decoration: none;
                transition: all 150ms ease;
                cursor: pointer;
                user-select: none;
              }
              .customer-bookings-pagination-link:hover {
                background-color: rgba(245, 184, 46, 0.15);
                border-color: var(--color-sunshine);
                color: var(--color-navy);
              }
              .customer-bookings-pagination-link.active,
              .customer-bookings-pagination-link[aria-current="page"] {
                background-color: var(--color-navy);
                border-color: var(--color-navy);
                color: var(--color-white);
                font-weight: 700;
                box-shadow: var(--shadow-sm);
                cursor: default;
              }
              .customer-bookings-pagination-link.active:hover,
              .customer-bookings-pagination-link[aria-current="page"]:hover {
                background-color: var(--color-navy);
                border-color: var(--color-navy);
                color: var(--color-white);
              }
              .customer-bookings-pagination-link.disabled,
              .customer-bookings-pagination-link[aria-disabled="true"] {
                opacity: 0.5;
                pointer-events: none;
                cursor: not-allowed;
              }
              .customer-bookings-pagination-arrow {
                font-size: 1.125rem;
                line-height: 1;
              }
              .customer-bookings-pagination-ellipsis {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 28px;
                height: 38px;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--color-slate);
                user-select: none;
                cursor: default;
              }
              @media (max-width: 640px) {
                .customer-bookings-pagination-container {
                  gap: 4px;
                  padding: 6px 8px;
                  width: 100%;
                }
                .customer-bookings-pagination-link {
                  min-width: 34px;
                  height: 34px;
                  padding: 0 8px;
                  font-size: 0.8125rem;
                }
                .customer-bookings-pagination-ellipsis {
                  min-width: 20px;
                  height: 34px;
                }
              }
                `}</style>
            </div>
        </div>
    );
}
