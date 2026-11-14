import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { formatFullDateTime } from '../chat/chatUtils.js';
import { useChat } from '../chat/ChatContext.jsx';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/+$/, '');

export default function BookingDetailPage() {
  const [searchParams] = useSearchParams();
  const { openChatWidget } = useChat();
  const lookupKey = searchParams.get('bookingId') || searchParams.get('code') || searchParams.get('id') || '';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDetail() {
      if (!lookupKey) {
        setError('Thiếu mã đơn đặt phòng.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/customer/bookings/${encodeURIComponent(lookupKey)}`, {
          credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          throw new Error(json.message || 'Không tìm thấy đơn đặt phòng.');
        }
        if (active) {
          setBooking(json.data);
        }
      } catch (err) {
        if (active) setError(err.message || 'Không thể tải thông tin đơn đặt phòng.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDetail();
    return () => {
      active = false;
    };
  }, [lookupKey]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '75vh', padding: '4rem 1rem', textAlign: 'center', color: 'var(--color-slate)' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
        <p>Đang tải chi tiết đơn đặt phòng…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '75vh', padding: '4rem 1rem', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: 'var(--color-rose-text)', marginBottom: '10px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '10px' }}>
          {error || 'Không tìm thấy đơn đặt phòng'}
        </h2>
        <Link to="/bookings" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
          Quay lại Đặt phòng của tôi
        </Link>
      </div>
    );
  }

  const s = String(booking.status || '').toUpperCase();

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', padding: '2rem 0 5rem' }}>
      <div className="container-4xl">
        <Link
          to="/bookings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--color-slate)',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={15} /> Quay lại danh sách đặt phòng
        </Link>

        <div className="card-ivory" style={{ backgroundColor: 'var(--color-white)', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Mã đơn #{booking.bookingCode}
                </span>
                <span
                  className={`status-badge ${
                    s === 'CONFIRMED' || s === 'COMPLETED'
                      ? 'badge-confirmed'
                      : s === 'PENDING_PAYMENT'
                        ? 'badge-pending'
                        : 'badge-cancelled'
                  }`}
                >
                  {s === 'CONFIRMED' || s === 'COMPLETED' ? (
                    <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                  ) : s === 'PENDING_PAYMENT' ? (
                    <Clock size={13} style={{ marginRight: '4px' }} />
                  ) : (
                    <XCircle size={13} style={{ marginRight: '4px' }} />
                  )}
                  {s}
                </span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                {booking.accommodationName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-slate)' }}>
                <MapPin size={14} style={{ color: 'var(--color-sunshine)' }} />
                <span>{booking.addressLine}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => openChatWidget({ forceContextCard: true })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem' }}
              >
                <MessageCircle size={15} />
                <span>Hỏi Trợ lý về đơn này</span>
              </button>
              {s === 'PENDING_PAYMENT' && (
                <Link
                  to={`/checkout?bookingId=${encodeURIComponent(booking.id)}`}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.82rem' }}
                >
                  <CreditCard size={15} />
                  <span>Tiếp tục thanh toán</span>
                </Link>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', padding: '14px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-ivory)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Nhận phòng</div>
              <div style={{ fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> {formatDateVN(booking.checkInDate)}
                {booking.accommodationContact?.checkInTime ? ` (từ ${booking.accommodationContact.checkInTime.slice(0, 5)})` : ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Trả phòng</div>
              <div style={{ fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> {formatDateVN(booking.checkOutDate)}
                {booking.accommodationContact?.checkOutTime ? ` (trước ${booking.accommodationContact.checkOutTime.slice(0, 5)})` : ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Khách lưu trú</div>
              <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                {booking.totalRooms} phòng · {booking.totalAdults} người lớn{booking.totalChildren > 0 ? `, ${booking.totalChildren} trẻ em` : ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Liên hệ cơ sở</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                {booking.accommodationContact?.phone && (
                  <span style={{ display: 'block' }}><Phone size={12} /> {booking.accommodationContact.phone}</span>
                )}
                {booking.accommodationContact?.email && (
                  <span style={{ display: 'block' }}><Mail size={12} /> {booking.accommodationContact.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Room items */}
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)', margin: '20px 0 10px' }}>
            Chi tiết phòng đã đặt
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(booking.items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-navy)', fontSize: '0.92rem' }}>{item.roomName}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate)' }}>
                    {item.adults} người lớn{item.children > 0 ? `, ${item.children} trẻ em` : ''}
                  </div>
                </div>
                <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>
                  {formatVND(item.totalAmount)}
                </strong>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={{ marginTop: '18px', borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tiền phòng ({booking.totalNights} đêm)</span>
              <span className="tabular-nums">{formatVND(booking.roomsSubtotal)}</span>
            </div>
            {booking.extraGuestTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phụ thu khách thêm</span>
                <span className="tabular-nums">{formatVND(booking.extraGuestTotal)}</span>
              </div>
            )}
            {booking.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-emerald-text)' }}>
                <span>Ưu đãi / Giảm giá</span>
                <span className="tabular-nums">-{formatVND(booking.discountAmount)}</span>
              </div>
            )}
            {booking.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Thuế</span>
                <span className="tabular-nums">{formatVND(booking.taxAmount)}</span>
              </div>
            )}
            {booking.serviceFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí dịch vụ</span>
                <span className="tabular-nums">{formatVND(booking.serviceFee)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-navy)', paddingTop: '6px', borderTop: '1px dashed var(--color-border)' }}>
              <span>Tổng thanh toán</span>
              <span className="tabular-nums">{formatVND(booking.totalAmount)}</span>
            </div>
          </div>

          {/* Payment records */}
          {booking.payments?.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
                Lịch sử giao dịch thanh toán
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <strong>#{p.paymentCode}</strong> · {p.paymentMethod} · <span>{p.status}</span>
                      {p.paidAt && <div style={{ color: 'var(--color-slate)', fontSize: '0.75rem' }}>Thanh toán lúc {formatFullDateTime(p.paidAt)}</div>}
                    </div>
                    <strong className="tabular-nums">{formatVND(p.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
