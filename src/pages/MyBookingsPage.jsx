import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  CreditCard,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { resolveMediaUrl } from '../chat/chatUtils.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/+$/, '');

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'EXPIRED', label: 'Hết hạn' },
];

function StatusBadge({ status }) {
  const s = String(status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED') {
    return (
      <span className="status-badge badge-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle2 size={13} /> Đã xác nhận
      </span>
    );
  }
  if (s === 'PENDING_PAYMENT') {
    return (
      <span className="status-badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={13} /> Chờ thanh toán
      </span>
    );
  }
  if (s === 'CANCELLED' || s === 'EXPIRED' || s === 'FAILED') {
    return (
      <span className="status-badge badge-cancelled" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <XCircle size={13} /> {s === 'EXPIRED' ? 'Hết hạn thanh toán' : s === 'FAILED' ? 'Thất bại' : 'Đã hủy'}
      </span>
    );
  }
  return <span className="status-badge">{s}</span>;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadBookings() {
      setLoading(true);
      setError('');
      try {
        const qs = statusFilter !== 'ALL' ? `?status=${encodeURIComponent(statusFilter)}` : '';
        const res = await fetch(`${API_BASE_URL}/customer/bookings${qs}`, {
          credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          throw new Error(json.message || 'Không thể tải danh sách đặt phòng.');
        }
        if (active) {
          setBookings(json.data?.bookingsList || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Lỗi tải dữ liệu đặt phòng.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadBookings();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', padding: '2.5rem 0 5rem' }}>
      <div className="container-4xl">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
            Đặt phòng của tôi
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)' }}>
            Quản lý lịch sử đặt phòng, tình trạng thanh toán và kết nối hỗ trợ trực tiếp từng đơn trên VietPeace Stay.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? '1px solid var(--color-navy)' : '1px solid var(--color-border-dark)',
                  backgroundColor: active ? 'var(--color-navy)' : 'var(--color-white)',
                  color: active ? 'var(--color-white)' : 'var(--color-navy)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card-ivory" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate)' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
            <p>Đang tải danh sách đơn đặt phòng từ hệ thống…</p>
          </div>
        ) : error ? (
          <div className="card-ivory" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-rose-text)' }}>
            <AlertCircle size={28} style={{ marginBottom: '8px' }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card-ivory" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Calendar size={36} style={{ color: 'var(--color-slate-light)', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
              Chưa có đơn đặt phòng nào
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginBottom: '16px' }}>
              Hãy khám phá hệ thống khách sạn, resort và homestay VietPeace Stay trên toàn quốc.
            </p>
            <Link to="/search-accommodations" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
              Tìm chỗ nghỉ ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                className="card-ivory"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: 'var(--color-white)',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 320px' }}>
                  {b.coverImage && (
                    <img
                      src={resolveMediaUrl(b.coverImage)}
                      alt={b.accommodationName}
                      style={{ width: '92px', height: '78px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                      <span className="tabular-nums" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                        #{b.bookingCode}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
                      {b.accommodationName}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--color-slate)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {formatDateVN(b.checkInDate)} → {formatDateVN(b.checkOutDate)} ({b.totalNights} đêm)
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />
                        {b.locationName || b.addressLine}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-slate)' }}>
                      {b.totalRooms} phòng · {b.totalAdults} người lớn{b.totalChildren > 0 ? `, ${b.totalChildren} trẻ em` : ''}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                      {formatVND(b.totalAmount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/booking-detail?code=${encodeURIComponent(b.bookingCode)}`}
                      className="btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 12px', fontSize: '0.8rem' }}
                    >
                      <span>Chi tiết đơn</span>
                      <ChevronRight size={14} />
                    </Link>
                    {b.status === 'PENDING_PAYMENT' && (
                      <Link
                        to={`/checkout?bookingId=${encodeURIComponent(b.id)}`}
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', fontSize: '0.8rem' }}
                      >
                        <CreditCard size={14} />
                        <span>Thanh toán</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
