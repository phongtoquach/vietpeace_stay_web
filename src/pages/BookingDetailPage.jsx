import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { MapPin, Calendar, Clock, AlertCircle, ArrowLeft, X } from 'lucide-react';

export default function BookingDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { bookings, cancelBooking } = useBooking();
  const { showToast } = useAuth();

  const code = searchParams.get('code');
  const booking = bookings.find(b => b.bookingCode === code) || bookings[0];

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center', maxWidth: '28rem' }}>
          <p style={{ fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 700, marginBottom: '1rem' }}>Không tìm thấy thông tin đặt phòng.</p>
          <Link to="/bookings" className="btn-primary">
            Về danh sách đặt phòng
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmCancel = () => {
    cancelBooking(booking.id);
    setIsCancelModalOpen(false);
    showToast('Hủy đặt phòng thành công! Tiền sẽ được hoàn 100% về tài khoản.', 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-emerald-bg)', color: 'var(--color-emerald-text)', border: '1px solid var(--color-emerald-border)' }}>Đã thanh toán (PAID)</span>;
      case 'PENDING':
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-amber-bg)', color: 'var(--color-amber-text)', border: '1px solid var(--color-amber-border)' }}>Chờ thanh toán (PENDING)</span>;
      case 'COMPLETED':
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-indigo-bg)', color: 'var(--color-indigo-text)', border: '1px solid var(--color-indigo-border)' }}>Đã hoàn tất</span>;
      case 'CANCELLED':
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-rose-bg)', color: 'var(--color-rose-text)', border: '1px solid var(--color-rose-border)' }}>Đã hủy (Đã hoàn tiền 100%)</span>;
      case 'EXPIRED':
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-md)', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid var(--color-border)' }}>Đã hết hạn giữ chỗ</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container-3xl">
        
        {/* Back Link */}
        <Link to="/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '1rem' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          <span>Về danh sách đặt phòng</span>
        </Link>

        {/* Card Header */}
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sunshine)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Phiếu Xác Nhận Đặt Phòng
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.025em', marginTop: '2px' }}>
                {booking.bookingCode}
              </h1>
            </div>
            <div>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Hotel Details */}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)' }}>{booking.accommodationName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
              <span>{booking.address}</span>
            </div>
          </div>

          {/* Stay Dates Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '1rem', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Nhận phòng (14:00):</span>
              <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{formatDateVN(booking.checkinDate)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Trả phòng (12:00):</span>
              <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{formatDateVN(booking.checkoutDate)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-slate)', display: 'block', fontWeight: 500 }}>Lưu trú:</span>
              <strong style={{ color: 'var(--color-navy)', fontSize: '0.875rem' }}>{booking.nights} đêm · {booking.numberOfRooms} phòng</strong>
            </div>
          </div>

          {/* Individual Room Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Chi Tiết Từng Phòng</h3>
            {booking.items && booking.items.map((item, idx) => (
              <div key={idx} style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--color-navy)', display: 'block' }}>Phòng {idx + 1}: {item.roomName}</strong>
                  <span style={{ color: 'var(--color-slate)' }}>{item.adults} người lớn, {item.children} trẻ em</span>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">
                  {formatVND(item.roomStayPrice + (item.extraFeeTotal || 0))}
                </div>
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

            {booking.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-emerald-text)', fontWeight: 600, backgroundColor: 'var(--color-emerald-bg)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                <span>{booking.promotionName || 'Ưu đãi áp dụng'}:</span>
                <span className="tabular-nums">-{formatVND(booking.discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
              <span>Tổng thanh toán:</span>
              <span className="tabular-nums" style={{ fontSize: '1.25rem' }}>{formatVND(booking.totalAmount)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {booking.status === 'PENDING' && (
              <Link
                to={`/checkout?bookingId=${booking.id}`}
                className="btn-primary"
              >
                Tiếp tục thanh toán ngay
              </Link>
            )}

            {booking.status === 'PAID' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                style={{ padding: '8px 16px', border: '1px solid #FECDD3', color: '#BE123C', borderRadius: 'var(--radius-lg)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
              >
                Hủy đặt phòng
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', maxWidth: '28rem', width: '100%', padding: '1.5rem', boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>Xác Nhận Hủy Đặt Phòng</h4>
              <button onClick={() => setIsCancelModalOpen(false)} style={{ color: 'var(--color-slate)', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', lineHeight: 1.6 }}>
              Quý khách có chắc chắn muốn hủy đơn đặt phòng <strong>{booking.bookingCode}</strong> tại <strong>{booking.accommodationName}</strong> không?
            </p>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-emerald-bg)', border: '1px solid var(--color-emerald-border)', borderRadius: 'var(--radius-lg)', fontSize: '12px', color: 'var(--color-emerald-text)', lineHeight: 1.6 }}>
              <strong>Chính sách hoàn tiền:</strong> Đơn đặt phòng này đủ điều kiện miễn phí hủy phòng (&gt; 48 giờ trước nhận phòng). Số tiền <strong>{formatVND(booking.totalAmount)}</strong> sẽ được hoàn trả 100%.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', cursor: 'pointer' }}
              >
                Giữ lại phòng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#E11D48', color: 'var(--color-white)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none' }}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
