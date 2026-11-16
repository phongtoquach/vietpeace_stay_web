import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Printer,
  Receipt,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';
import { formatFullDateTime, resolveMediaUrl } from '../chat/chatUtils.js';

const CATEGORY_META = {
  MINIBAR_FB: {
    label: 'Minibar / Ăn uống',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#BFDBFE',
  },
  EXTRA_SERVICE: {
    label: 'Dịch vụ bổ sung',
    bg: '#F0FDF4',
    color: '#15803D',
    border: '#BBF7D0',
  },
  SPECIAL_CLEANING: {
    label: 'Vệ sinh đặc biệt',
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#FDE68A',
  },
  DAMAGE_COMPENSATION: {
    label: 'Bồi thường thiết bị',
    bg: '#FEF2F2',
    color: '#B91C1C',
    border: '#FECACA',
  },
};

const COMP_MODE_LABELS = {
  REPAIR: 'Chi phí sửa chữa',
  DEPRECIATED_REPLACE: 'Thay thế theo khấu hao tuổi đời',
  FULL_REPLACE: 'Thay mới 100%',
};

const PAYMENT_METHOD_LABELS = {
  NO_EXTRA_CHARGE: 'Không phát sinh (0 ₫)',
  CASH: 'Tiền mặt tại quầy',
  BANK_TRANSFER: 'Chuyển khoản / VietQR',
  VNPAY: 'Cổng thanh toán VNPay',
  POS_CARD: 'Thẻ thanh toán (POS)',
};

function SettlementStatusBadge({ status }) {
  const s = String(status || 'DRAFT').toUpperCase();
  if (s === 'SETTLED') {
    return (
      <span
        className="status-badge"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--color-emerald-bg)',
          color: 'var(--color-emerald-text)',
          border: '1px solid var(--color-emerald-border)',
        }}
      >
        <CheckCircle2 size={13} /> Đã kết toán
      </span>
    );
  }
  if (s === 'PENDING_PAYMENT') {
    return (
      <span className="status-badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={13} /> Chờ thanh toán phát sinh
      </span>
    );
  }
  return (
    <span
      className="status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#F1F5F9',
        color: '#334155',
        border: '1px solid #CBD5E1',
      }}
    >
      <Receipt size={13} /> Đang ghi nhận lưu trú
    </span>
  );
}

export default function BookingCheckoutFolioCard({ booking, apiBaseUrl }) {
  const folio = booking?.checkoutFolio;
  const [payingVnpay, setPayingVnpay] = useState(false);
  const [vnpayError, setVnpayError] = useState('');
  const [previewEvidence, setPreviewEvidence] = useState(null);
  const evidenceDialogRef = useRef(null);

  useEffect(() => {
    const dialog = evidenceDialogRef.current;
    if (!dialog) return undefined;

    if (previewEvidence) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Fallback light-dismiss only when closedby="any" is unsupported
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        let pressedOutside = false;
        const isOutside = (e) => {
          const r = dialog.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        const onDown = (e) => {
          pressedOutside = isOutside(e);
        };
        const onUp = (e) => {
          if (pressedOutside && isOutside(e)) dialog.close();
        };
        dialog.addEventListener('pointerdown', onDown);
        dialog.addEventListener('pointerup', onUp);
        return () => {
          dialog.removeEventListener('pointerdown', onDown);
          dialog.removeEventListener('pointerup', onUp);
        };
      }
    } else if (dialog.open) {
      dialog.close();
    }
    return undefined;
  }, [previewEvidence]);

  if (!folio && !booking?.checkedInAt && !booking?.checkedOutAt) {
    return null;
  }

  const invoice = folio?.invoice || null;
  const summary = folio?.summary || {
    bookingOriginalTotal: Number(booking?.totalAmount || 0),
    prepaidAmount: Number(booking?.paidAmount || booking?.totalAmount || 0),
    minibarTotal: 0,
    extraServiceTotal: 0,
    specialCleaningTotal: 0,
    compensationTotal: 0,
    incidentalTaxTotal: 0,
    incidentalGrandTotal: 0,
    stayGrandTotal: Number(booking?.totalAmount || 0),
    settlementDueAmount: 0,
    settlementPaidAmount: 0,
  };

  const activeCharges = (folio?.charges || []).filter((c) => String(c.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  const settlementPayments = folio?.settlementPayments || [];
  const specialCleaningCharges = activeCharges.filter((c) => c.category === 'SPECIAL_CLEANING');
  const settlementStatus = String(invoice?.settlementStatus || 'DRAFT').toUpperCase();
  const remainingBalance =
    settlementStatus === 'SETTLED'
      ? 0
      : Math.max(0, Number(summary.settlementDueAmount || 0) - Number(summary.settlementPaidAmount || 0));

  async function handlePayVnpay() {
    setPayingVnpay(true);
    setVnpayError('');
    try {
      const res = await fetch(`${apiBaseUrl}/customer/bookings/${encodeURIComponent(booking.id)}/settlement/vnpay-create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false || !json.data?.vnpayUrl) {
        throw new Error(json.message || 'Không thể khởi tạo liên kết thanh toán VNPay.');
      }
      window.location.assign(json.data.vnpayUrl);
    } catch (err) {
      setVnpayError(err.message || 'Lỗi tạo giao dịch VNPay cho phần phát sinh.');
      setPayingVnpay(false);
    }
  }

  return (
    <section
      id="checkout-folio"
      aria-labelledby="checkout-folio-heading"
      className="card-ivory"
      style={{ backgroundColor: 'var(--color-white)', padding: '24px', marginBottom: '20px' }}
    >
      {/* Invoice Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '18px',
        }}
      >
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {invoice?.invoiceCode && (
              <span className="tabular-nums" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                #{invoice.invoiceCode}
              </span>
            )}
            <SettlementStatusBadge status={settlementStatus} />
          </div>
          <h2 id="checkout-folio-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
            Hóa Đơn Tổng Hợp &amp; Kết Toán Trả Phòng
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--color-slate)' }}>
            {booking.checkedInAt && <span>Nhận phòng thực tế: {formatFullDateTime(booking.checkedInAt)}</span>}
            {booking.checkedOutAt && <span>Trả phòng thực tế: {formatFullDateTime(booking.checkedOutAt)}</span>}
            {invoice?.settledAt && <span>Kết toán lúc: {formatFullDateTime(invoice.settledAt)}</span>}
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary no-print"
          onClick={() => window.print()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem' }}
        >
          <Printer size={15} />
          <span>In / Lưu PDF hóa đơn</span>
        </button>
      </div>

      {/* Block 1: Prepaid Original Booking */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
          Phần 1 · Tiền phòng &amp; tiện ích đặt trước (Đã thanh toán)
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            padding: '14px',
            backgroundColor: 'var(--color-ivory)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '0.86rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--color-slate)', fontSize: '0.76rem' }}>Tổng đơn phòng ban đầu</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-navy)', fontSize: '1.02rem' }}>
              {formatVND(summary.bookingOriginalTotal)}
            </strong>
          </div>
          <div>
            <div style={{ color: 'var(--color-slate)', fontSize: '0.76rem' }}>Số tiền đã thanh toán trước</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-emerald-text)', fontSize: '1.02rem' }}>
              -{formatVND(summary.prepaidAmount)} (Đã hoàn tất)
            </strong>
          </div>
        </div>
      </div>

      {/* Block 2: Incidental & Compensation Charges */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
          Phần 2 · Chi phí phát sinh trong thời gian lưu trú
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-slate)' }}>Minibar / Ăn uống</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>{formatVND(summary.minibarTotal)}</strong>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-slate)' }}>Dịch vụ bổ sung</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>{formatVND(summary.extraServiceTotal)}</strong>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-slate)' }}>Vệ sinh đặc biệt</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>{formatVND(summary.specialCleaningTotal)}</strong>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-slate)' }}>Bồi thường thiết bị</div>
            <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>{formatVND(summary.compensationTotal)}</strong>
          </div>
        </div>

        {specialCleaningCharges.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              marginBottom: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-emerald-bg)',
              color: 'var(--color-emerald-text)',
              border: '1px solid var(--color-emerald-border)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={15} />
            <span>Phụ phí vệ sinh phòng đặc biệt: 0 ₫ (Không áp dụng — phòng được giữ gìn sạch sẽ).</span>
          </div>
        )}

        {activeCharges.length === 0 ? (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-slate)',
              fontSize: '0.85rem',
            }}
          >
            Không ghi nhận khoản chi phí phát sinh hay bồi thường nào khi trả phòng.
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="web-folio-charges-caption"
            className="web-folio-table-wrapper"
          >
            <table className="web-folio-table">
              <caption id="web-folio-charges-caption">
                Chi tiết {activeCharges.length} khoản phát sinh / bồi thường được lập cho đơn #{booking.bookingCode}
              </caption>
              <thead>
                <tr>
                  <th>Hạng mục</th>
                  <th style={{ textAlign: 'right' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Điều chỉnh / Thuế</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {activeCharges.map((c) => {
                  const meta = CATEGORY_META[c.category] || {
                    label: c.category,
                    bg: '#F1F5F9',
                    color: '#334155',
                    border: '#CBD5E1',
                  };
                  const evidenceSrc = c.evidenceImageUrl ? resolveMediaUrl(c.evidenceImageUrl) : '';
                  return (
                    <tr key={c.id}>
                      <th scope="row">
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: meta.bg,
                              color: meta.color,
                              border: `1px solid ${meta.border}`,
                            }}
                          >
                            {meta.label}
                          </span>
                          {c.category === 'DAMAGE_COMPENSATION' && c.compensationMode && (
                            <span style={{ fontSize: '0.72rem', color: '#B91C1C', fontWeight: 600 }}>
                              {COMP_MODE_LABELS[c.compensationMode] || c.compensationMode}
                              {c.depreciationPercent != null ? ` · ${c.depreciationPercent}%` : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{c.itemName}</div>
                        {c.note && (
                          <div style={{ fontSize: '0.76rem', fontWeight: 400, color: 'var(--color-slate)', marginTop: '2px' }}>
                            Ghi chú: {c.note}
                          </div>
                        )}
                        {evidenceSrc && (
                          <div className="no-print" style={{ marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setPreviewEvidence({ url: evidenceSrc, title: c.itemName, note: c.note })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border-dark)',
                                backgroundColor: 'var(--color-ivory)',
                                color: 'var(--color-navy)',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Camera size={12} /> Xem ảnh minh chứng
                            </button>
                          </div>
                        )}
                      </th>
                      <td className="tabular-nums" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {c.quantity} {c.unitLabel || ''}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatVND(c.unitPrice)}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-slate)' }}>
                        {Number(c.adjustmentAmount || 0) > 0 && (
                          <div className="tabular-nums" style={{ color: 'var(--color-emerald-text)' }}>
                            Giảm trừ: -{formatVND(c.adjustmentAmount)}
                          </div>
                        )}
                        <div>
                          {Number(c.taxRate || 0) > 0
                            ? c.isTaxInclusive
                              ? `Đã gồm ${c.taxRate}% VAT`
                              : `+${c.taxRate}% VAT (${formatVND(c.taxAmount)})`
                            : '0% VAT (Không chịu thuế)'}
                        </div>
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-navy)', whiteSpace: 'nowrap' }}>
                        {formatVND(c.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Block 3: Grand Total & Settlement Reconciliation */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#F8FAFC',
          border: '1px solid #CBD5E1',
        }}
      >
        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
          Phần 3 · Tổng kết thanh toán &amp; Kết toán cuối kỳ
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Tổng tiền phòng &amp; tiện ích đặt trước</span>
            <span className="tabular-nums">{formatVND(summary.bookingOriginalTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>
              (+) Tổng chi phí phát sinh tại cơ sở
              {Number(summary.incidentalTaxTotal || 0) > 0 ? ` (đã gồm ${formatVND(summary.incidentalTaxTotal)} thuế)` : ''}
            </span>
            <span className="tabular-nums">{formatVND(summary.incidentalGrandTotal)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '8px',
              borderTop: '1px solid #E2E8F0',
              fontWeight: 700,
              color: 'var(--color-navy)',
            }}
          >
            <span>(=) Tổng giá trị toàn bộ kỳ nghỉ</span>
            <span className="tabular-nums">{formatVND(summary.stayGrandTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'var(--color-emerald-text)' }}>
            <span>(-) Đã thanh toán trước khi nhận phòng</span>
            <span className="tabular-nums">-{formatVND(summary.prepaidAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontWeight: 700, color: 'var(--color-navy)' }}>
            <span>Tổng phát sinh cần quyết toán khi trả phòng</span>
            <span className="tabular-nums">{formatVND(summary.settlementDueAmount)}</span>
          </div>
          {Number(summary.settlementPaidAmount || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'var(--color-emerald-text)' }}>
              <span>(-) Đã thanh toán phát sinh khi trả phòng</span>
              <span className="tabular-nums">-{formatVND(summary.settlementPaidAmount)}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '10px',
              borderTop: '2px dashed #94A3B8',
              fontSize: '1.12rem',
              fontWeight: 800,
              color: remainingBalance > 0 ? '#B45309' : 'var(--color-emerald-text)',
            }}
          >
            <span>(=) Số tiền còn phải thanh toán</span>
            <span className="tabular-nums">{formatVND(remainingBalance)}</span>
          </div>
        </div>

        {/* Settled confirmation */}
        {settlementStatus === 'SETTLED' && folio?.settledPayment && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-emerald-bg)',
              border: '1px solid var(--color-emerald-border)',
              color: 'var(--color-emerald-text)',
              fontSize: '0.84rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span>
              <strong>Đã hoàn tất kết toán</strong> qua{' '}
              {PAYMENT_METHOD_LABELS[folio.settledPayment.paymentMethod] || folio.settledPayment.paymentMethod}
              {invoice?.settledByName ? ` · Xác nhận bởi ${invoice.settledByName}` : ''}
            </span>
            {folio.settledPayment.paidAt && (
              <span className="tabular-nums">{formatFullDateTime(folio.settledPayment.paidAt)}</span>
            )}
          </div>
        )}

        {/* Online VNPAY payment action for pending settlement */}
        {folio?.canPayOnlineVnpay && (
          <div
            className="no-print"
            style={{
              marginTop: '14px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.92rem' }}>
                  Cơ sở đã chốt bảng kê phát sinh cần thanh toán
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78350F', marginTop: '2px' }}>
                  Quý khách có thể thanh toán trực tuyến {formatVND(summary.settlementDueAmount)} ngay qua cổng VNPay hoặc thanh toán trực tiếp tại quầy lễ tân.
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={payingVnpay}
                onClick={handlePayVnpay}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.86rem' }}
              >
                {payingVnpay ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={15} />}
                <span>{payingVnpay ? 'Đang chuyển sang VNPay…' : 'Thanh toán phần phát sinh qua VNPay'}</span>
              </button>
            </div>
            {vnpayError && (
              <div
                role="alert"
                style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldAlert size={14} />
                <span>{vnpayError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phase 2 Settlement Payment Records */}
      {settlementPayments.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
            Chứng từ thanh toán phát sinh khi trả phòng
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {settlementPayments.map((sp) => (
              <div
                key={sp.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <strong>#{sp.settlementCode}</strong> ·{' '}
                  {PAYMENT_METHOD_LABELS[sp.paymentMethod] || sp.paymentMethod} ·{' '}
                  <span style={{ fontWeight: 700 }}>{sp.status}</span>
                  {sp.vnpTxnRef && <span style={{ color: 'var(--color-slate)' }}> · Mã GD: {sp.vnpTxnRef}</span>}
                  {sp.cashReceived != null && (
                    <div style={{ color: 'var(--color-slate)', fontSize: '0.75rem' }}>
                      Khách đưa: {formatVND(sp.cashReceived)} · Tiền thừa: {formatVND(sp.cashChange || 0)}
                    </div>
                  )}
                  {(sp.paidAt || sp.createdAt) && (
                    <div style={{ color: 'var(--color-slate)', fontSize: '0.75rem' }}>
                      {sp.paidAt ? `Thanh toán lúc ${formatFullDateTime(sp.paidAt)}` : `Khởi tạo lúc ${formatFullDateTime(sp.createdAt)}`}
                      {sp.confirmedByName ? ` · Lễ tân/QL: ${sp.confirmedByName}` : ''}
                    </div>
                  )}
                </div>
                <strong className="tabular-nums" style={{ color: 'var(--color-navy)' }}>
                  {formatVND(sp.amount)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Native top-layer Evidence Lightbox Modal */}
      <dialog
        ref={evidenceDialogRef}
        className="web-evidence-dialog"
        aria-labelledby="web-evidence-dialog-title"
        closedby="any"
        onClose={() => setPreviewEvidence(null)}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 id="web-evidence-dialog-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            Ảnh minh chứng: {previewEvidence?.title || ''}
          </h3>
          <button
            type="button"
            autoFocus
            aria-label="Đóng ảnh minh chứng"
            onClick={() => setPreviewEvidence(null)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              cursor: 'pointer',
              display: 'inline-flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {previewEvidence && (
          <div style={{ padding: '16px', overflow: 'auto', textAlign: 'center' }}>
            <img
              src={previewEvidence.url}
              alt={`Minh chứng cho ${previewEvidence.title}`}
              style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
            />
            {previewEvidence.note && (
              <p style={{ marginTop: '10px', fontSize: '0.84rem', color: 'var(--color-slate)' }}>
                {previewEvidence.note}
              </p>
            )}
            <div style={{ marginTop: '12px' }}>
              <a
                href={previewEvidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
              >
                Mở ảnh kích thước gốc
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
