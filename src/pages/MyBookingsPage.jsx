import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { Calendar } from 'lucide-react';

export default function MyBookingsPage() {
    console.log("[MyBookingsPage] Vừa vào hàm component MyBookingsPage !");

    const { bookings } = useBooking();
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        console.log("[MyBookingsPage] đang chạy useEffect() của component MyBookingsPage !");
        
        // hàm cleanup
        return () => {
            console.log("[MyBookingsPage] đang chạy hàm cleanup của useEffect() !");
        };
    });


    const tabs = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ thanh toán' },
        { key: 'PAID', label: 'Đã thanh toán' },
        { key: 'COMPLETED', label: 'Đã hoàn tất' },
        { key: 'CANCELLED', label: 'Đã hủy' },
        { key: 'EXPIRED', label: 'Hết hạn' }
    ];

    const filtered = bookings.filter(b => {
        if (activeTab === 'ALL') return true;
        return b.status === activeTab;
    });

    const getStatusBadge = (status) => {
        switch (status) {
        case 'PAID':
            return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-emerald-bg)', color: 'var(--color-emerald-text)', border: '1px solid var(--color-emerald-border)' }}>Đã thanh toán</span>;
        case 'PENDING':
            return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-amber-bg)', color: 'var(--color-amber-text)', border: '1px solid var(--color-amber-border)' }}>Chờ thanh toán</span>;
        case 'COMPLETED':
            return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-indigo-bg)', color: 'var(--color-indigo-text)', border: '1px solid var(--color-indigo-border)' }}>Đã hoàn tất</span>;
        case 'CANCELLED':
            return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-rose-bg)', color: 'var(--color-rose-text)', border: '1px solid var(--color-rose-border)' }}>Đã hủy</span>;
        case 'EXPIRED':
            return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid var(--color-border)' }}>Hết hạn</span>;
        default:
            return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div className="container-4xl">
                
                {/* Title */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                        Đặt Phòng Của Tôi
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>
                        Theo dõi trạng thái thanh toán và xem lại lịch sử lưu trú tại các cơ sở của VinaStay Group.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="bookings-filter-tabs">
                    {tabs.map((tab) => (
                        <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`booking-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        >
                        {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {filtered.length === 0 ? (
                    <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)', padding: '2.5rem', textAlign: 'center', color: 'var(--color-slate)' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Chưa có đơn đặt phòng nào trong mục này.</p>
                        <Link to="/search" className="btn-primary" style={{ marginTop: '12px', padding: '8px 16px', fontSize: '12px' }}>
                        Tìm chỗ nghỉ ngay
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filtered.map((b) => (
                        <article key={b.id} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sunshine)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                                MÃ: {b.bookingCode}
                                </span>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: '2px' }}>
                                {b.accommodationName}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
                                <Calendar style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
                                <span>{formatDateVN(b.checkinDate)} – {formatDateVN(b.checkoutDate)} ({b.nights} đêm)</span>
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(b.status)}
                            </div>
                            </div>

                            <div style={{ paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>{b.numberOfRooms} phòng</span>
                                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
                                {formatVND(b.totalAmount)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Link
                                to={`/booking-detail?code=${encodeURIComponent(b.bookingCode)}`}
                                style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px' }}
                                >
                                Xem chi tiết
                                </Link>

                                {b.status === 'PENDING' && (
                                <Link
                                    to={`/checkout?bookingId=${b.id}`}
                                    style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-sunshine)', color: 'var(--color-navy)', fontWeight: 700, fontSize: '12px', boxShadow: 'var(--shadow-xs)' }}
                                >
                                    Thanh toán ngay
                                </Link>
                                )}
                            </div>
                            </div>
                        </article>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
