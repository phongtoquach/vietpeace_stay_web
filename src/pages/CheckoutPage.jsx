import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVND, formatDateVN, formatCountdown } from '../utils/bookingUtils.js';
import { Clock, ShieldCheck, CreditCard, QrCode, Smartphone, Building, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { bookings, markBookingPaid, markBookingExpired } = useBooking();
  const { showToast } = useAuth();

  const bookingId = searchParams.get('bookingId');
  const booking = bookings.find(b => String(b.id) === String(bookingId)) || bookings.find(b => b.status === 'PENDING') || bookings[0];

  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [countdown, setCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!booking) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((booking.expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0 && booking.status === 'PENDING') {
        markBookingExpired(booking.id);
        showToast('Thời gian giữ phòng đã hết hạn!', 'error');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center', maxWidth: '28rem' }}>
          <p style={{ fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 700, marginBottom: '1rem' }}>Không tìm thấy thông tin đặt phòng cần thanh toán.</p>
          <Link to="/search" className="btn-primary">
            Quay lại tìm phòng
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = booking.status === 'EXPIRED' || (countdown <= 0 && booking.status === 'PENDING');

  const handleSubmitPayment = (e) => {
    e.preventDefault();

    if (isExpired) {
      showToast('Không thể thanh toán đơn đặt phòng đã hết hạn giữ chỗ.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      markBookingPaid(booking.id, paymentMethod);
      setIsProcessing(false);
      showToast('Thanh toán thành công!', 'success');
      navigate(`/booking-success?code=${encodeURIComponent(booking.bookingCode)}`);
    }, 1200);
  };

  return (
    <div className="checkout-page">
      
      {/* Header bar */}
      <div className="checkout-topbar">
        <div className="container-6xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="brand-text">
            VinaStay <span>Group</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-emerald-text)', backgroundColor: 'var(--color-emerald-bg)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-emerald-border)' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669' }} />
            <span>Thanh toán an toàn SSL 256-bit</span>
          </div>
        </div>
      </div>

      <main className="container-6xl" style={{ paddingTop: '2rem' }}>
        
        {/* Urgency Hold Banner */}
        <div className={`urgency-banner ${isExpired ? 'urgency-banner--expired' : 'urgency-banner--active'}`}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
              <Clock style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
              <span>{isExpired ? 'Đã hết thời gian giữ phòng!' : 'Hệ thống đang giữ phòng cho quý khách!'}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>
              {isExpired
                ? 'Đơn đặt phòng này đã hết hạn giữ chỗ. Quý khách vui lòng đặt lại phòng mới.'
                : 'Kho phòng tạm khóa trong 15 phút để bạn yên tâm thanh toán.'}
            </p>
          </div>

          <div 
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: 'var(--radius-lg)',
              border: isExpired ? '1px solid #FECDD3' : '1px solid var(--color-sunshine)',
              backgroundColor: 'var(--color-white)',
              color: isExpired ? '#BE123C' : 'var(--color-navy)'
            }}
            className="tabular-nums"
          >
            {formatCountdown(countdown)}
          </div>
        </div>

        <div className="checkout-grid">
          
          {/* Left: Payment Form & Methods */}
          <section className="checkout-form-col" style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1rem', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              Chọn Phương Thức Thanh Toán
            </h2>

            <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Payment Method 1: Credit Card */}
              <label className={`payment-method-card ${paymentMethod === 'CREDIT_CARD' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    style={{ marginTop: '4px', accentColor: 'var(--color-sunshine)' }}
                  />
                  <div style={{ flex: '1 1 0%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Thẻ Tín Dụng / Ghi Nợ Quốc Tế</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: 600 }}>Visa · Master · JCB</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>Thanh toán bảo mật trực tiếp không phí chuyển tiền.</p>
                  </div>
                </div>
              </label>

              {/* Credit Card Inputs */}
              {paymentMethod === 'CREDIT_CARD' && (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 249, 237, 0.7)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Số thẻ</label>
                    <input
                      type="text"
                      defaultValue="4123 8888 9999 6868"
                      className="auth-input"
                      placeholder="4123 0000 0000 0000"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Tên chủ thẻ</label>
                      <input
                        type="text"
                        defaultValue="NGUYEN VAN AN"
                        className="auth-input"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>Hết hạn</label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          className="auth-input"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '4px' }}>CVV</label>
                        <input
                          type="password"
                          defaultValue="888"
                          maxLength={4}
                          className="auth-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method 2: Domestic ATM */}
              <label className={`payment-method-card ${paymentMethod === 'DOMESTIC_ATM' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DOMESTIC_ATM"
                    checked={paymentMethod === 'DOMESTIC_ATM'}
                    onChange={() => setPaymentMethod('DOMESTIC_ATM')}
                    style={{ marginTop: '4px', accentColor: 'var(--color-sunshine)' }}
                  />
                  <div style={{ flex: '1 1 0%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Thẻ ATM Nội Địa / Internet Banking</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: 600 }}>Napas</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>Vietcombank, Techcombank, BIDV, MBBank...</p>
                  </div>
                </div>
              </label>

              {/* Payment Method 3: VNPAY QR */}
              <label className={`payment-method-card ${paymentMethod === 'VNPAY_QR' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY_QR"
                    checked={paymentMethod === 'VNPAY_QR'}
                    onChange={() => setPaymentMethod('VNPAY_QR')}
                    style={{ marginTop: '4px', accentColor: 'var(--color-sunshine)' }}
                  />
                  <div style={{ flex: '1 1 0%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Quét Mã VNPAY-QR / VietQR</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: 600 }}>⚡ Tức thì</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>Mở ứng dụng ngân hàng quét mã thanh toán không cần nhập thẻ.</p>
                  </div>
                </div>
              </label>

              {/* Payment Method 4: MoMo */}
              <label className={`payment-method-card ${paymentMethod === 'MOMO' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={paymentMethod === 'MOMO'}
                    onChange={() => setPaymentMethod('MOMO')}
                    style={{ marginTop: '4px', accentColor: 'var(--color-sunshine)' }}
                  />
                  <div style={{ flex: '1 1 0%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Ví Điện Tử MoMo / ZaloPay</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: 600 }}>MoMo</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>Xác nhận thanh toán 1 chạm trên ứng dụng ví.</p>
                  </div>
                </div>
              </label>

              {/* Simulation Note */}
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-lg)', fontSize: '12px', color: 'var(--color-slate)', lineHeight: 1.6 }}>
                <strong>Chế độ thử nghiệm:</strong> Thao tác thanh toán sẽ mô phỏng giao dịch thành công và cập nhật trạng thái đơn thành <strong>PAID</strong> mà không trừ tiền thật.
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                disabled={isExpired || isProcessing}
                className="btn-primary btn-primary--full"
                style={{ padding: '14px 20px', fontSize: '1rem', fontWeight: 800, borderRadius: 'var(--radius-lg)' }}
              >
                {isProcessing ? (
                  <span>Đang xử lý thanh toán an toàn...</span>
                ) : (
                  <span>Xác Nhận & Thanh Toán Ngay</span>
                )}
              </button>
            </form>
          </section>

          {/* Right: Order Summary Breakdown */}
          <aside className="checkout-summary-col" style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              Chi Tiết Đơn Đặt Phòng
            </h3>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sunshine)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mã giữ chỗ: {booking.bookingCode}
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
                {booking.accommodationName}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>{booking.address}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-slate)', display: 'block' }}>Thời gian lưu trú:</span>
                <strong style={{ color: 'var(--color-navy)' }}>{formatDateVN(booking.checkinDate)} – {formatDateVN(booking.checkoutDate)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-slate)', display: 'block' }}>Quy mô:</span>
                <strong style={{ color: 'var(--color-navy)' }}>{booking.nights} đêm · {booking.numberOfRooms} phòng</strong>
              </div>
            </div>

            {/* Individual Room Items */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-slate)', display: 'block' }}>Cấu hình từng phòng:</span>
              {booking.items && booking.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <strong style={{ color: 'var(--color-navy)' }}>Phòng {idx + 1}: {item.roomName}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--color-slate)' }}>{item.adults} người lớn, {item.children} trẻ em</div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">
                    {formatVND(item.roomStayPrice + (item.extraFeeTotal || 0))}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
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

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
                  {formatVND(booking.totalAmount)}
                </span>
              </div>
            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
