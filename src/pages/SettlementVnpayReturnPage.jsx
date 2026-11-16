import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, Receipt, XCircle } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/web').replace(/\/+$/, '');

const REQUIRED_PARAMS = [
  'vnp_TmnCode',
  'vnp_TxnRef',
  'vnp_Amount',
  'vnp_ResponseCode',
  'vnp_TransactionStatus',
  'vnp_SecureHash',
];

function readVnpayParams(search) {
  const fields = Object.create(null);

  for (const [key, value] of new URLSearchParams(search)) {
    if (!key.startsWith('vnp_')) continue;
    if (Object.hasOwn(fields, key)) return null;
    fields[key] = value;
  }

  if (!REQUIRED_PARAMS.every((key) => fields[key])) return null;

  if (
    fields.vnp_ResponseCode === '00' &&
    fields.vnp_TransactionStatus === '00' &&
    (!fields.vnp_TransactionNo || !fields.vnp_PayDate)
  ) {
    return null;
  }

  return fields;
}

function StatusBadgeIcon({ Icon, color, backgroundColor }) {
  return (
    <div
      style={{
        width: '72px',
        height: '72px',
        borderRadius: 'var(--radius-full)',
        color,
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <Icon aria-hidden="true" size={40} />
    </div>
  );
}

function ReceiptRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span>{label}</span>
      <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>
        {children}
      </strong>
    </div>
  );
}

function SettlementResultContent({ search }) {
  const [status, setStatus] = useState('VERIFYING');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  function retry() {
    setStatus('VERIFYING');
    setErrorMessage('');
    setAttempt((v) => v + 1);
  }

  useEffect(() => {
    let active = true;
    const fields = readVnpayParams(search);

    async function verifySettlement() {
      if (!fields) {
        setStatus('INVALID');
        setErrorMessage('Thiếu tham số xác thực VNPay hoặc dữ liệu trả về không hợp lệ.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/checkout-settlement/vnpay-return`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        });

        const body = await res.json().catch(() => ({}));
        if (!active) return;

        if (res.status === 400 || body?.success === false) {
          setStatus('INVALID');
          setErrorMessage(body?.message || 'Chữ ký giao dịch không hợp lệ.');
          return;
        }

        if (!res.ok) {
          setStatus('VERIFY_PENDING');
          setErrorMessage('Chưa thể xác nhận kết quả thanh toán lúc này.');
          return;
        }

        const payload = body?.data || {};
        setData(payload);
        setStatus(payload.paid ? 'PAID' : 'FAILED');
      } catch {
        if (active) {
          setStatus('VERIFY_PENDING');
          setErrorMessage('Kết nối tới máy chủ gặp gián đoạn khi xác minh VNPay.');
        }
      }
    }

    verifySettlement();
    return () => {
      active = false;
    };
  }, [search, attempt]);

  const detailUrl = data?.bookingId
    ? `/booking-detail?bookingId=${encodeURIComponent(data.bookingId)}`
    : data?.bookingCode
      ? `/booking-detail?code=${encodeURIComponent(data.bookingCode)}`
      : '/bookings';

  if (status === 'PAID') {
    return (
      <div className="success-card" role="status">
        <StatusBadgeIcon Icon={CheckCircle2} color="#059669" backgroundColor="var(--color-emerald-bg)" />

        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-emerald-bg)',
              color: 'var(--color-emerald-text)',
              border: '1px solid var(--color-emerald-border)',
              marginBottom: '8px',
            }}
          >
            ĐÃ KẾT TOÁN PHÁT SINH TRẢ PHÒNG
          </span>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy)' }}>
            Thanh Toán Phát Sinh Thành Công!
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>
            VietPeace Stay đã ghi nhận thanh toán chi phí phát sinh khi trả phòng và hoàn tất kết toán hóa đơn.
          </p>
        </div>

        <div
          style={{
            textAlign: 'left',
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-slate)',
            border: '1px solid #E2E8F0',
          }}
        >
          {data?.bookingCode && <ReceiptRow label="Mã đơn đặt phòng:">#{data.bookingCode}</ReceiptRow>}
          {data?.invoiceCode && <ReceiptRow label="Mã hóa đơn kết toán:">{data.invoiceCode}</ReceiptRow>}
          {data?.settlementCode && <ReceiptRow label="Mã chứng từ phát sinh:">{data.settlementCode}</ReceiptRow>}
          {data?.transactionNo && <ReceiptRow label="Mã giao dịch VNPay:">{data.transactionNo}</ReceiptRow>}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
            <ReceiptRow label="Số tiền đã thanh toán:">{formatVND(data?.amount || 0)}</ReceiptRow>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', paddingTop: '8px' }}>
          <Link to={detailUrl} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={16} />
            <span>Xem chi tiết hóa đơn</span>
          </Link>
          <Link
            to="/bookings"
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-navy)',
              color: 'var(--color-white)',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            Đặt phòng của tôi
          </Link>
        </div>
      </div>
    );
  }

  const isPending = status === 'VERIFYING' || status === 'VERIFY_PENDING';
  const color = isPending ? '#1E3A8A' : '#991B1B';
  const border = isPending ? '#BFDBFE' : '#FECACA';
  const background = isPending ? '#F8FBFF' : '#FFF7F7';
  const iconBackground = isPending ? '#DBEAFE' : '#FEE2E2';
  const Icon = isPending ? Clock : XCircle;

  const title =
    status === 'VERIFYING'
      ? 'Đang xác minh thanh toán phát sinh'
      : status === 'VERIFY_PENDING'
        ? 'Chưa thể xác nhận giao dịch'
        : status === 'INVALID'
          ? 'Thông tin thanh toán không hợp lệ'
          : 'Thanh toán phát sinh chưa hoàn tất';

  const message =
    errorMessage ||
    (status === 'VERIFYING'
      ? 'Hệ thống đang đối chiếu chữ ký giao dịch với VNPay, quý khách vui lòng chờ giây lát.'
      : `Giao dịch chưa thành công${data?.responseCode ? ` (Mã phản hồi VNPay: ${data.responseCode})` : ''}. Quý khách có thể thử thanh toán lại trong chi tiết hóa đơn.`);

  return (
    <div
      className="success-card"
      role={isPending ? 'status' : 'alert'}
      style={{ border: `1px solid ${border}`, backgroundColor: background }}
    >
      <StatusBadgeIcon Icon={Icon} color={color} backgroundColor={iconBackground} />

      <div>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color }}>{title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>{message}</p>
      </div>

      {status !== 'VERIFYING' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', paddingTop: '8px' }}>
          {status === 'VERIFY_PENDING' && (
            <button type="button" className="btn-primary" onClick={retry}>
              Kiểm tra lại
            </button>
          )}
          <Link to={detailUrl} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
            Quay lại hóa đơn đơn đặt phòng
          </Link>
          <Link to="/bookings" style={{ padding: '10px 16px', color, fontWeight: 700, fontSize: '0.875rem' }}>
            Đặt phòng của tôi
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SettlementVnpayReturnPage() {
  const { search } = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-ivory)',
        padding: '3.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SettlementResultContent key={search} search={search} />
    </div>
  );
}
