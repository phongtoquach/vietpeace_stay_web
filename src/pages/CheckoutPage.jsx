import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import RoomTypePriceBreakdownTooltip from '../components/room_types/RoomTypePriceBreakdownTooltip.jsx';

// 24 one-hour windows covering the full day with standard ASCII hyphen and exact spacing
const ARRIVAL_TIME_WINDOWS = [
  '00:00 - 01:00',
  '01:00 - 02:00',
  '02:00 - 03:00',
  '03:00 - 04:00',
  '04:00 - 05:00',
  '05:00 - 06:00',
  '06:00 - 07:00',
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00',
  '23:00 - 00:00'
];

/**
 * Normalizes an arrival time string to the exact "HH:MM - HH:MM" format
 */
const normalizeArrivalTime = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  const match = trimmed.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (match) {
    return `${match[1]} - ${match[2]}`;
  }
  const start = /^(\d{2}):00(?::00)?$/.exec(trimmed);
  return start ? ARRIVAL_TIME_WINDOWS[Number(start[1])] || '' : '';
};

/**
 * Standard email format validation
 */
const isValidEmail = (emailStr) => {
  if (!emailStr) return false;
  const trimmed = emailStr.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

/**
 * Flexible phone format validation allowing international prefixes, dashes, spaces, parentheses
 */
const isValidPhone = (phoneStr) => {
  if (!phoneStr) return false;
  const trimmed = phoneStr.trim();
  if (!/^\+?[0-9\s\-().]{7,25}$/.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 7 && digitCount <= 16;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');

async function requestCheckout(bookingId, body) {
  const isStartingPayment = body !== undefined;
  const path = isStartingPayment
    ? '/booking/checkout/start-checkout'
    : `/booking/checkout/get-booking-checkout/${encodeURIComponent(bookingId)}`;

  console.log("[requestCheckout] isStartingPayment : ", isStartingPayment);
  console.log("[requestCheckout] Data cua body : ", body);

  const response = await fetch(API_BASE_URL + path, {
    credentials: 'include',
    ...(isStartingPayment ? {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, bookingId }),
    } : {}),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    const error = new Error(result.message || result.errorMsg || 'Không thể tải thông tin thanh toán.');
    error.status = response.status;
    error.code = result.errorCode;
    error.fields = result.errors || result.errorsDetail || {};
    throw error;
  }
  return result.data;
}

function CheckoutMessage({ message, onRetry, loading }) {
  return (
    <main className="checkout-page container-7xl" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <p role={loading ? 'status' : 'alert'}>{message}</p>
      {onRetry && <button type="button" className="btn-primary" onClick={onRetry}>Thử lại</button>}
      {' '}
      <Link to="/search-accommodations">Quay lại tìm phòng</Link>
    </main>
  );
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  if (!/^[1-9]\d{0,18}$/.test(bookingId) || BigInt(bookingId) > 9223372036854775807n) {
    return <CheckoutMessage message="Không tìm thấy thông tin đặt phòng cần thanh toán." />;
  }
  return <CheckoutLoader key={bookingId} bookingId={bookingId} />;
}

function CheckoutLoader({ bookingId }) {
  const [requestKey, setRequestKey] = useState(0);
  const [result, setResult] = useState(null);
  const reload = () => {
    setResult(null);
    setRequestKey(value => value + 1);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await requestCheckout(bookingId);
        if (!ignore) setResult({ data });
      } catch (error) {
        if (!ignore) setResult({ error });
      }
    }
    load();
    // Khi bấm Back từ VNPay, trình duyệt có thể khôi phục nguyên trang từ bộ nhớ.
    const handlePageShow = event => {
      if (event.persisted) reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      ignore = true;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [bookingId, requestKey]);

  if (!result) return <CheckoutMessage loading message="Đang tải thông tin đặt phòng..." />;
  if (result.error) return <CheckoutMessage message={result.error.message} onRetry={reload} />;
  if (!result.data?.booking) {
    return <CheckoutMessage message={result.data?.message || 'Không tìm thấy thông tin đặt phòng cần thanh toán.'} />;
  }
  return <CheckoutContent checkout={result.data} onReload={reload} />;
}

function CheckoutContent({ checkout, onReload }) {
  const { booking, state, bookingVersion } = checkout;
  const isReadOnly = state !== 'READY';
  const canResume = state === 'RESUME_PAYMENT';

  // Section A: Contact Information
  const [contactName, setContactName] = useState(() => {
    return (booking.contactName || '').trim();
  });
  const [contactEmail, setContactEmail] = useState(() => {
    return (booking.contactEmail || '').trim();
  });
  const [contactPhone, setContactPhone] = useState(() => {
    return (booking.contactPhone || '').trim();
  });

  // Section B: Lead Guest Information
  const [isBookingForOther, setIsBookingForOther] = useState(() => Boolean(booking.guestName || booking.guestPhone || booking.guestEmail));
  const [guestName, setGuestName] = useState(() => (booking?.guest_name || booking?.guestName || ''));
  const [guestPhone, setGuestPhone] = useState(() => (booking?.guest_phone || booking?.guestPhone || ''));
  const [guestEmail, setGuestEmail] = useState(() => (booking?.guest_email || booking?.guestEmail || ''));

  // Section C: Additional Information
  const [specialRequests, setSpecialRequests] = useState(() => {
    return booking?.special_requests || booking?.specialRequests || '';
  });
  const [expectedArrivalTime, setExpectedArrivalTime] = useState(() => {
    const raw = booking?.expected_arrival_time || booking?.expectedArrivalTime || '';
    return normalizeArrivalTime(raw);
  });

  // Payment Method: Default and only VNPAY
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  // Terms Acceptance: Unchecked by default
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [needsReload, setNeedsReload] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function redirectToVnpay(fields = {}) {
    if (submitting.current || needsReload) return;
    submitting.current = true;
    setIsProcessing(true);
    setPaymentError('');
    let redirecting = false;
    try {
      const data = await requestCheckout(booking.id, {
        ...fields,
        booking_version: bookingVersion,
        payment_method: 'VNPAY',
      });
      if (!mounted.current) return;
      if (!data?.paymentUrl) throw new Error('Không nhận được đường dẫn thanh toán VNPay.');
      window.location.assign(data.paymentUrl);
      redirecting = true;
    } catch (error) {
      if (!mounted.current) return;
      setPaymentError(error.message);
      setErrors(error.fields || {});
      if (error.status === 409 || !error.status || error.status >= 500) setNeedsReload(true);
    } finally {
      if (!redirecting) {
        submitting.current = false;
        if (mounted.current) setIsProcessing(false);
      }
    }
  }

  // Switch guest options without wiping typed values
  const handleGuestOptionChange = (forOther) => {
    setIsBookingForOther(forOther);
    // Clear validation messages that no longer apply
    if (!forOther) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.guest_name;
        delete next.guest_phone;
        delete next.guest_email;
        return next;
      });
    }
  };

  const handleFieldChange = (field, setter, value) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();

    if (isReadOnly || submitting.current || needsReload) return;

    const newErrors = {};

    // 1. Validate Contact Info
    const trimmedContactName = contactName.trim();
    if (!trimmedContactName) {
      newErrors.contact_name = 'Vui lòng nhập họ và tên người đặt phòng.';
    }

    const trimmedContactEmail = contactEmail.trim();
    if (!trimmedContactEmail) {
      newErrors.contact_email = 'Vui lòng nhập email nhận xác nhận.';
    } else if (!isValidEmail(trimmedContactEmail)) {
      newErrors.contact_email = 'Địa chỉ email nhận xác nhận không hợp lệ.';
    }

    const trimmedContactPhone = contactPhone.trim();
    if (!trimmedContactPhone) {
      newErrors.contact_phone = 'Vui lòng nhập số điện thoại người đặt phòng.';
    } else if (!isValidPhone(trimmedContactPhone)) {
      newErrors.contact_phone = 'Số điện thoại không hợp lệ.';
    }

    // 2. Validate Lead Guest Info (Only when booking for another person)
    let trimmedGuestName = '';
    let trimmedGuestPhone = '';
    let trimmedGuestEmail = '';

    if (isBookingForOther) {
      trimmedGuestName = guestName.trim();
      if (!trimmedGuestName) {
        newErrors.guest_name = 'Vui lòng nhập họ tên khách đại diện nhận phòng.';
      }

      trimmedGuestPhone = guestPhone.trim();
      if (!trimmedGuestPhone) {
        newErrors.guest_phone = 'Vui lòng nhập số điện thoại khách nhận phòng.';
      } else if (!isValidPhone(trimmedGuestPhone)) {
        newErrors.guest_phone = 'Số điện thoại khách nhận phòng không hợp lệ.';
      }

      trimmedGuestEmail = guestEmail.trim();
      if (trimmedGuestEmail && !isValidEmail(trimmedGuestEmail)) {
        newErrors.guest_email = 'Địa chỉ email khách nhận phòng không hợp lệ.';
      }
    }

    // 3. Validate Terms Acceptance Checkbox
    if (!termsAccepted) {
      newErrors.terms_accepted = 'Vui lòng đồng ý với Điều khoản và quy định đặt phòng trước khi thanh toán.';
    }

    // If validation fails, set errors and move focus to first invalid control
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      setErrors(newErrors);
      const firstKey = errorKeys[0];
      setTimeout(() => {
        const el = document.getElementById(firstKey);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    // Clear existing errors
    setErrors({});

    // Prepare submission payload per backend boundary requirements
    const trimmedSpecialRequests = specialRequests.trim();
    const preparedSubmission = {
      contact_name: trimmedContactName,
      contact_email: trimmedContactEmail,
      contact_phone: trimmedContactPhone,
      is_booking_for_other: Boolean(isBookingForOther),
      guest_name: isBookingForOther ? trimmedGuestName : null,
      guest_phone: isBookingForOther ? trimmedGuestPhone : null,
      guest_email: isBookingForOther ? (trimmedGuestEmail || null) : null,
      special_requests: trimmedSpecialRequests ? trimmedSpecialRequests : null,
      expected_arrival_time: expectedArrivalTime ? expectedArrivalTime : null,
      terms_accepted: termsAccepted
    };

    redirectToVnpay(preparedSubmission);
  };

  const nightsCount = booking.nights;
  const roomCount = booking.numberOfRooms;
  const roomsSubtotal = booking.roomSubtotal ?? (booking.items || []).reduce((sum, it) => sum + (it.roomStayPrice || 0), 0);
  const extraGuestTotal = booking.extraGuestsSubtotal ?? (booking.items || []).reduce((sum, it) => sum + (it.extraFeeTotal || 0), 0);
  const taxAmount = (booking.taxAmount !== null && booking.taxAmount !== undefined) ? booking.taxAmount : 0;
  const hasServiceFee = booking.serviceFee !== null && booking.serviceFee !== undefined;
  const serviceFee = booking.serviceFee;
  const totalAmount = booking.totalAmount;

  return (
    <div className="checkout-page">
      <style>{`
        .checkout-page {
          min-height: 100vh;
          background-color: var(--color-ivory, #FFF9ED);
          padding-bottom: 5rem;
        }
        .checkout-summary-col {
          background-color: var(--color-white, #FFFFFF);
          border-radius: var(--radius-xl, 0.75rem);
          border: 1px solid var(--color-border, #E2E8F0);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .checkout-summary-col .selected-room-row {
          padding: 10px;
          background-color: var(--color-ivory, #FFF9ED);
          border-radius: var(--radius-lg, 0.5rem);
          border: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .checkout-summary-col .selected-room-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-navy, #233B53);
          line-height: 1.3;
          margin: 0;
        }
        .checkout-summary-col .selected-room-guests-static {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-slate, #64748B);
          background-color: rgba(241, 245, 249, 0.7);
          padding: 4px 8px;
          border-radius: var(--radius-sm, 0.25rem);
          display: inline-block;
          width: fit-content;
        }
        .checkout-summary-col .selected-room-pricing-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-top: 6px;
          border-top: 1px dashed var(--color-border, #CBD5E1);
          font-size: 11px;
        }
        .checkout-summary-col .selected-room-price-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          color: var(--color-slate, #64748B);
        }
        .checkout-summary-col .selected-room-price-line--total {
          font-weight: 700;
          color: var(--color-navy, #233B53);
        }
        .checkout-card-section {
          background-color: var(--color-white, #FFFFFF);
          border-radius: var(--radius-xl, 0.75rem);
          border: 1px solid var(--color-border, #E2E8F0);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
          margin-bottom: 1.25rem;
        }
        .checkout-section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-navy, #233B53);
          margin-top: 0;
          margin-bottom: 0.25rem;
        }
        .checkout-section-desc {
          font-size: 0.8125rem;
          color: var(--color-slate, #64748B);
          margin-top: 0;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }
        .checkout-field-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .checkout-field-grid--2col {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .checkout-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .checkout-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-navy, #233B53);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .checkout-required-star {
          color: #DC2626;
          font-weight: 700;
        }
        .checkout-input,
        .checkout-select,
        .checkout-textarea {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.875rem;
          color: var(--color-navy, #233B53);
          background-color: #FFFFFF;
          border: 1px solid var(--color-border, #CBD5E1);
          border-radius: var(--radius-lg, 0.5rem);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .checkout-input:focus,
        .checkout-select:focus,
        .checkout-textarea:focus {
          border-color: var(--color-sunshine, #B45309);
          box-shadow: 0 0 0 3px rgba(245, 184, 46, 0.25);
        }
        .checkout-input--error,
        .checkout-select--error,
        .checkout-textarea--error {
          border-color: #EF4444 !important;
          background-color: #FEF2F2 !important;
        }
        .checkout-helper-text {
          font-size: 0.75rem;
          color: var(--color-slate, #64748B);
          line-height: 1.4;
          margin-top: 2px;
        }
        .checkout-field-error {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #DC2626;
          font-weight: 500;
          margin-top: 2px;
        }
        .checkout-radio-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: var(--radius-lg, 0.5rem);
          border: 1px solid var(--color-border, #CBD5E1);
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .checkout-radio-card:hover {
          border-color: var(--color-border-dark, #94A3B8);
        }
        .checkout-radio-card--active {
          border-color: var(--color-sunshine, #B45309);
          background-color: rgba(255, 249, 237, 0.7);
        }
        .checkout-payment-card {
          display: block;
          padding: 14px 16px;
          border-radius: var(--radius-xl, 0.75rem);
          border: 1.5px solid var(--color-border, #CBD5E1);
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .checkout-payment-card--active {
          border-color: var(--color-sunshine, #B45309);
          background-color: rgba(255, 249, 237, 0.85);
        }
        .checkout-terms-box {
          background-color: #F8FAFC;
          border: 1px solid var(--color-border, #E2E8F0);
          border-radius: var(--radius-xl, 0.75rem);
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
        }
      `}</style>
      
      {/* Header bar */}
      <div className="checkout-topbar">
        <div className="container-6xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="brand-text">
            Xác nhận đặt phòng & Thanh Toán
          </Link>
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-emerald-text)', backgroundColor: 'var(--color-emerald-bg)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-emerald-border)' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669' }} />
            <span>Thanh toán an toàn SSL 256-bit</span>
          </div> */}
        </div>
      </div>

      <main className="container-6xl" style={{ paddingTop: '2rem' }}>
        <div className="checkout-grid">
          
          {/* Left Column: Form & Information Sections */}
          <div className="checkout-form-col">
            {paymentError && <p role="alert">{paymentError}</p>}
            {needsReload && <button type="button" className="btn-primary" onClick={onReload}>Kiểm tra lại đơn</button>}
            {isReadOnly ? (
              <div>
                <p role="status">{checkout.message || 'Đơn đang có phiên thanh toán VNPay.'}</p>
                {canResume ? (
                  <button type="button" className="btn-primary" disabled={isProcessing || needsReload}
                    onClick={() => redirectToVnpay()}>
                    {isProcessing ? 'Đang mở VNPay...' : 'Tiếp tục thanh toán'}
                  </button>
                ) : (
                  <button type="button" className="btn-primary" onClick={onReload}>Kiểm tra trạng thái</button>
                )}
              </div>
            ) : (
            <form onSubmit={handleSubmitPayment} noValidate>
              
              {/* Section A: Booking contact information */}
              <section className="checkout-card-section">
                <h2 className="checkout-section-title">
                  Thông tin người đặt phòng
                </h2>
                <p className="checkout-section-desc">
                  Dùng để nhận xác nhận đặt phòng và liên hệ về booking.
                </p>

                <div className="checkout-field-grid">
                  {/* contact_name */}
                  <div className="checkout-field-group">
                    <label htmlFor="contact_name" className="checkout-label">
                      <span>Họ và tên</span>
                      <span className="checkout-required-star" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      autoComplete="name"
                      value={contactName}
                      onChange={(e) => handleFieldChange('contact_name', setContactName, e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className={`checkout-input ${errors.contact_name ? 'checkout-input--error' : ''}`}
                      aria-required="true"
                      aria-invalid={Boolean(errors.contact_name)}
                      aria-describedby={errors.contact_name ? 'contact_name_error' : undefined}
                    />
                    {errors.contact_name && (
                      <div id="contact_name_error" className="checkout-field-error">
                        <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                        <span>{errors.contact_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="checkout-field-grid checkout-field-grid--2col">
                    {/* contact_email */}
                    <div className="checkout-field-group">
                      <label htmlFor="contact_email" className="checkout-label">
                        <span>Email nhận xác nhận</span>
                        <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        autoComplete="email"
                        value={contactEmail}
                        onChange={(e) => handleFieldChange('contact_email', setContactEmail, e.target.value)}
                        placeholder="email@example.com"
                        className={`checkout-input ${errors.contact_email ? 'checkout-input--error' : ''}`}
                        aria-required="true"
                        aria-invalid={Boolean(errors.contact_email)}
                        aria-describedby={errors.contact_email ? 'contact_email_error' : undefined}
                      />
                      {errors.contact_email && (
                        <div id="contact_email_error" className="checkout-field-error">
                          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          <span>{errors.contact_email}</span>
                        </div>
                      )}
                    </div>

                    {/* contact_phone */}
                    <div className="checkout-field-group">
                      <label htmlFor="contact_phone" className="checkout-label">
                        <span>Số điện thoại</span>
                        <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="tel"
                        id="contact_phone"
                        name="contact_phone"
                        autoComplete="tel"
                        value={contactPhone}
                        onChange={(e) => handleFieldChange('contact_phone', setContactPhone, e.target.value)}
                        placeholder="Ví dụ: 0912345678 hoặc +84 912 345 678"
                        className={`checkout-input ${errors.contact_phone ? 'checkout-input--error' : ''}`}
                        aria-required="true"
                        aria-invalid={Boolean(errors.contact_phone)}
                        aria-describedby={errors.contact_phone ? 'contact_phone_error' : undefined}
                      />
                      {errors.contact_phone && (
                        <div id="contact_phone_error" className="checkout-field-error">
                          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          <span>{errors.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section B: Lead guest information */}
              <section className="checkout-card-section">
                <h2 className="checkout-section-title">
                  Khách đại diện nhận phòng
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: isBookingForOther ? '1.25rem' : 0 }}>
                  <label
                    htmlFor="guest_option_self"
                    className={`checkout-radio-card ${!isBookingForOther ? 'checkout-radio-card--active' : ''}`}
                  >
                    <input
                      type="radio"
                      id="guest_option_self"
                      name="guest_option"
                      value="self"
                      checked={!isBookingForOther}
                      onChange={() => handleGuestOptionChange(false)}
                      style={{ accentColor: 'var(--color-sunshine, #B45309)' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy, #233B53)' }}>
                      Tôi là khách đại diện nhận phòng
                    </span>
                  </label>

                  <label
                    htmlFor="guest_option_other"
                    className={`checkout-radio-card ${isBookingForOther ? 'checkout-radio-card--active' : ''}`}
                  >
                    <input
                      type="radio"
                      id="guest_option_other"
                      name="guest_option"
                      value="other"
                      checked={isBookingForOther}
                      onChange={() => handleGuestOptionChange(true)}
                      style={{ accentColor: 'var(--color-sunshine, #B45309)' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy, #233B53)' }}>
                      Tôi đặt phòng cho người khác
                    </span>
                  </label>
                </div>

                {/* Additional inputs when booking for another person */}
                {isBookingForOther && (
                  <div className="checkout-field-grid" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border, #E2E8F0)' }}>
                    {/* guest_name */}
                    <div className="checkout-field-group">
                      <label htmlFor="guest_name" className="checkout-label">
                        <span>Họ tên khách đại diện nhận phòng</span>
                        <span className="checkout-required-star" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        id="guest_name"
                        name="guest_name"
                        autoComplete="name"
                        value={guestName}
                        onChange={(e) => handleFieldChange('guest_name', setGuestName, e.target.value)}
                        placeholder="Nhập họ và tên khách nhận phòng"
                        className={`checkout-input ${errors.guest_name ? 'checkout-input--error' : ''}`}
                        aria-required="true"
                        aria-invalid={Boolean(errors.guest_name)}
                        aria-describedby={errors.guest_name ? 'guest_name_error guest_name_helper' : 'guest_name_helper'}
                      />
                      <div id="guest_name_helper" className="checkout-helper-text">
                        Họ tên cần khớp với giấy tờ dùng khi nhận phòng.
                      </div>
                      {errors.guest_name && (
                        <div id="guest_name_error" className="checkout-field-error">
                          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          <span>{errors.guest_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="checkout-field-grid checkout-field-grid--2col">
                      {/* guest_phone */}
                      <div className="checkout-field-group">
                        <label htmlFor="guest_phone" className="checkout-label">
                          <span>Số điện thoại khách nhận phòng</span>
                          <span className="checkout-required-star" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="tel"
                          id="guest_phone"
                          name="guest_phone"
                          autoComplete="tel"
                          value={guestPhone}
                          onChange={(e) => handleFieldChange('guest_phone', setGuestPhone, e.target.value)}
                          placeholder="Số điện thoại khách nhận phòng"
                          className={`checkout-input ${errors.guest_phone ? 'checkout-input--error' : ''}`}
                          aria-required="true"
                          aria-invalid={Boolean(errors.guest_phone)}
                          aria-describedby={errors.guest_phone ? 'guest_phone_error' : undefined}
                        />
                        {errors.guest_phone && (
                          <div id="guest_phone_error" className="checkout-field-error">
                            <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                            <span>{errors.guest_phone}</span>
                          </div>
                        )}
                      </div>

                      {/* guest_email */}
                      <div className="checkout-field-group">
                        <label htmlFor="guest_email" className="checkout-label">
                          <span>Email khách nhận phòng</span>
                        </label>
                        <input
                          type="email"
                          id="guest_email"
                          name="guest_email"
                          autoComplete="email"
                          value={guestEmail}
                          onChange={(e) => handleFieldChange('guest_email', setGuestEmail, e.target.value)}
                          placeholder="email@example.com (không bắt buộc)"
                          className={`checkout-input ${errors.guest_email ? 'checkout-input--error' : ''}`}
                          aria-invalid={Boolean(errors.guest_email)}
                          aria-describedby={errors.guest_email ? 'guest_email_error guest_email_helper' : 'guest_email_helper'}
                        />
                        <div id="guest_email_helper" className="checkout-helper-text">
                          Nhập email để khách nhận phòng cũng nhận được xác nhận đặt phòng.
                        </div>
                        {errors.guest_email && (
                          <div id="guest_email_error" className="checkout-field-error">
                            <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                            <span>{errors.guest_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Section C: Additional information */}
              <section className="checkout-card-section">
                <h2 className="checkout-section-title">
                  Thông tin bổ sung
                </h2>

                <div className="checkout-field-grid">
                  {/* special_requests */}
                  <div className="checkout-field-group">
                    <label htmlFor="special_requests" className="checkout-label">
                      <span>Yêu cầu đặc biệt</span>
                    </label>
                    <textarea
                      id="special_requests"
                      name="special_requests"
                      maxLength={2000}
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Ví dụ: ưu tiên phòng gần nhau, tầng thấp hoặc thông báo nhu cầu hỗ trợ…"
                      className="checkout-textarea"
                      aria-describedby="special_requests_helper"
                    />
                    <div id="special_requests_helper" className="checkout-helper-text">
                      Yêu cầu đặc biệt tùy thuộc khả năng đáp ứng của chỗ nghỉ và có thể phát sinh phụ phí. Yêu cầu chưa được đảm bảo cho đến khi chỗ nghỉ xác nhận.
                    </div>
                  </div>

                  {/* expected_arrival_time */}
                  <div className="checkout-field-group">
                    <label htmlFor="expected_arrival_time" className="checkout-label">
                      <span>Giờ đến dự kiến</span>
                    </label>
                    <select
                      id="expected_arrival_time"
                      name="expected_arrival_time"
                      value={expectedArrivalTime}
                      onChange={(e) => setExpectedArrivalTime(e.target.value)}
                      className="checkout-select"
                      aria-describedby="expected_arrival_time_helper"
                    >
                      <option value="">Chưa xác định</option>
                      {ARRIVAL_TIME_WINDOWS.map((windowStr) => (
                        <option key={windowStr} value={windowStr}>
                          {windowStr}
                        </option>
                      ))}
                    </select>
                    <div id="expected_arrival_time_helper" className="checkout-helper-text">
                      Giờ đến dự kiến giúp chỗ nghỉ chuẩn bị đón tiếp, không đảm bảo nhận phòng sớm. Nếu đến sau nửa đêm, vui lòng liên hệ chỗ nghỉ để xác nhận.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section D: Payment method */}
              <section className="checkout-card-section">
                <h2 className="checkout-section-title">
                  Phương thức thanh toán
                </h2>

                <div className="checkout-payment-options">
                  <label
                    htmlFor="payment_vnpay"
                    className={`checkout-payment-card ${paymentMethod === 'VNPAY' ? 'checkout-payment-card--active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                      <input
                        type="radio"
                        id="payment_vnpay"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={() => setPaymentMethod('VNPAY')}
                        style={{ marginTop: '3px', accentColor: 'var(--color-sunshine, #B45309)', width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-navy, #233B53)' }}>
                            VNPay
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#0369A1',
                              backgroundColor: '#E0F2FE',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              letterSpacing: '0.02em'
                            }}
                          >
                            Cổng thanh toán quốc gia
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-slate, #64748B)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                          Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất thanh toán.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Terms Acceptance Checkbox */}
              <div className="checkout-terms-box">
                <label
                  htmlFor="terms_accepted"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'var(--color-navy, #233B53)',
                    lineHeight: 1.5,
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    id="terms_accepted"
                    name="terms_accepted"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked && errors.terms_accepted) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.terms_accepted;
                          return next;
                        });
                      }
                    }}
                    style={{
                      marginTop: '3px',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--color-sunshine, #B45309)',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    aria-invalid={Boolean(errors.terms_accepted)}
                    aria-describedby={errors.terms_accepted ? 'terms_accepted_error' : undefined}
                  />
                  <span>
                    Tôi đã đọc và đồng ý với{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#0284C7',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      Điều khoản và quy định đặt phòng
                    </Link>
                    .
                  </span>
                </label>
                {errors.terms_accepted && (
                  <div id="terms_accepted_error" className="checkout-field-error" style={{ marginTop: '6px', marginLeft: '28px' }}>
                    <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span>{errors.terms_accepted}</span>
                  </div>
                )}
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                disabled={needsReload || isProcessing}
                className="btn-primary btn-primary--full"
                style={{
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg, 0.5rem)',
                  cursor: (needsReload || isProcessing) ? 'not-allowed' : 'pointer',
                  opacity: (needsReload || isProcessing) ? 0.7 : 1
                }}
              >
                {isProcessing ? (
                  <span>Đang xử lý thanh toán an toàn...</span>
                ) : (
                  <span>Xác Nhận & Thanh Toán Ngay</span>
                )}
              </button>
            </form>
            )}
          </div>

          {/* Right Column: Order Summary Breakdown */}
          <aside className="checkout-summary-col">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                Chi tiết đơn đặt phòng
              </h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)' }}>
                {roomCount} phòng đã chọn
              </span>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sunshine)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mã đặt phòng: {booking.bookingCode}
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

            {/* Individual Selected Rooms List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {(booking.items || []).map((item, idx) => {
                // Sequence per room type, e.g. "Deluxe King Hướng Sông - Phòng 1"
                const typeIndex = (booking.items || [])
                  .slice(0, idx + 1)
                  .filter(r => (r.roomTypeId || r.id) === (item.roomTypeId || item.id))
                  .length;

                const extraAdults = Math.max(0, item.adults - item.includedAdults);
                const extraChildren = Math.max(0, item.children - item.includedChildren);
                const { nightlyRates, roomStayPrice, extraAdultTotal, extraChildTotal } = item;
                const roomTotal = item.totalAmount;
                const adultBreakdown = nightlyRates.map(({ stayDate }) => ({
                  label: formatDateVN(stayDate),
                  amountStr: formatVND(item.extraAdultFee * extraAdults),
                }));
                const childBreakdown = nightlyRates.map(({ stayDate }) => ({
                  label: formatDateVN(stayDate),
                  amountStr: formatVND(item.extraChildFee * extraChildren),
                }));

                return (
                  <div key={item.id} className="selected-room-row">
                    <h4 className="selected-room-title">
                      {item.roomName} - Phòng {typeIndex}
                    </h4>

                    {/* Static guest information: e.g. “2 người lớn, 1 trẻ em” */}
                    <div className="selected-room-guests-static">
                      {item.adults || 1} người lớn, {item.children || 0} trẻ em
                    </div>

                    {/* Pricing Details for this single room */}
                    <div className="selected-room-pricing-box">
                      {/* Base room price across stay */}
                      <div className="selected-room-price-line selected-room-price-line--total" style={{ alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Tiền phòng {nightsCount} đêm:</span>
                          <RoomTypePriceBreakdownTooltip
                            title="Chi tiết tiền phòng"
                            nightlyRates={nightlyRates}
                            totalLabel="Tổng tiền phòng"
                            totalAmount={roomStayPrice}
                            ariaLabel={`Xem chi tiết tiền phòng ${item.roomName} - Phòng ${typeIndex}`}
                          />
                        </div>
                        <span className="tabular-nums" style={{ color: 'var(--color-navy)', fontWeight: 700 }}>
                          {formatVND(roomStayPrice)}
                        </span>
                      </div>

                      {/* Phụ thu người lớn */}
                      <div
                        className="selected-room-price-line"
                        style={{
                          alignItems: 'center',
                          color: extraAdultTotal > 0 ? '#B45309' : 'var(--color-slate)',
                          fontSize: '11px',
                          marginTop: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Phụ thu người lớn:</span>
                          <RoomTypePriceBreakdownTooltip
                            title="Chi tiết phụ thu người lớn"
                            subtitle={`Số người lớn tính phụ thu: ${extraAdults}`}
                            emptyNotice={
                              extraAdults === 0
                                ? 'Số người lớn nằm trong tiêu chuẩn đã bao gồm.'
                                : undefined
                            }
                            items={extraAdults > 0 ? adultBreakdown : []}
                            totalLabel="Tổng phụ thu người lớn"
                            totalAmount={extraAdultTotal}
                            ariaLabel={`Xem chi tiết phụ thu người lớn ${item.roomName} - Phòng ${typeIndex}`}
                          />
                        </div>
                        <span className="tabular-nums" style={{ fontWeight: 600 }}>
                          {extraAdultTotal > 0 ? `+${formatVND(extraAdultTotal)}` : '0 ₫'}
                        </span>
                      </div>

                      {/* Phụ thu trẻ em */}
                      <div
                        className="selected-room-price-line"
                        style={{
                          alignItems: 'center',
                          color: extraChildTotal > 0 ? '#B45309' : 'var(--color-slate)',
                          fontSize: '11px',
                          marginTop: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Phụ thu trẻ em:</span>
                          <RoomTypePriceBreakdownTooltip
                            title="Chi tiết phụ thu trẻ em"
                            subtitle={`Số trẻ em tính phụ thu: ${extraChildren}`}
                            emptyNotice={
                              extraChildren === 0
                                ? 'Số trẻ em nằm trong tiêu chuẩn đã bao gồm.'
                                : undefined
                            }
                            items={extraChildren > 0 ? childBreakdown : []}
                            totalLabel="Tổng phụ thu trẻ em"
                            totalAmount={extraChildTotal}
                            ariaLabel={`Xem chi tiết phụ thu trẻ em ${item.roomName} - Phòng ${typeIndex}`}
                          />
                        </div>
                        <span className="tabular-nums" style={{ fontWeight: 600 }}>
                          {extraChildTotal > 0 ? `+${formatVND(extraChildTotal)}` : '0 ₫'}
                        </span>
                      </div>

                      {item.discountAmount > 0 && (
                        <div className="selected-room-price-line">
                          <span>Giảm giá phòng:</span>
                          <span className="tabular-nums">-{formatVND(item.discountAmount)}</span>
                        </div>
                      )}

                      {/* Tổng phòng */}
                      <div
                        className="selected-room-price-line selected-room-price-line--total"
                        style={{
                          alignItems: 'center',
                          marginTop: '4px',
                          paddingTop: '4px',
                          borderTop: '1px dashed #E2E8F0'
                        }}
                      >
                        <span>Tổng phòng:</span>
                        <span className="tabular-nums" style={{ color: 'var(--color-navy)', fontWeight: 800 }}>
                          {formatVND(roomTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                <span>Tiền phòng ({nightsCount} đêm):</span>
                <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">{formatVND(roomsSubtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                <span>Phụ thu khách:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">
                  {extraGuestTotal > 0 ? `+${formatVND(extraGuestTotal)}` : formatVND(extraGuestTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                <span>Thuế:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">{formatVND(taxAmount)}</span>
              </div>

              {hasServiceFee && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                  <span>Phí dịch vụ:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">{formatVND(serviceFee)}</span>
                </div>
              )}

              {/* Discount rows remain commented out / hidden as in reference */}
              {/*
              {booking.roomDiscountTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Giảm giá theo phòng:</span>
                  <span className="tabular-nums">-{formatVND(booking.roomDiscountTotal)}</span>
                </div>
              )}
              {booking.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-emerald-text)', fontWeight: 600, backgroundColor: 'var(--color-emerald-bg)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                  <span>{booking.promotionName || 'Ưu đãi áp dụng'}:</span>
                  <span className="tabular-nums">-{formatVND(booking.discountAmount)}</span>
                </div>
              )}
              */}

              <div style={{ paddingTop: '8px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>Tổng cộng:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
                  {formatVND(totalAmount)}
                </span>
              </div>
            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
