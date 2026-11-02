import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

export default function PriceBreakdownTooltip({
  title,
  subtitle,
  emptyNotice,
  items = [],
  totalLabel,
  totalAmount,
  ariaLabel = 'Xem chi tiết giá từng đêm',
  iconSize = 18
}) {
  console.log("[PriceBreakdownTooltip] Vừa vào hàm component PriceBreakdownTooltip !");

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // Measure and position the tooltip popover relative to the viewport
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = popoverRef.current?.offsetWidth || 300;
    const tooltipHeight = popoverRef.current?.offsetHeight || 180;

    // Horizontal centering relative to trigger, clamped within viewport bounds
    let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - 12 - tooltipWidth;
    }

    // Vertical positioning: prefer above trigger; flip below if tight
    let top = triggerRect.top - tooltipHeight - 8;
    if (top < 12) {
      top = triggerRect.bottom + 8;
    }
    // Safety clamp within viewport
    if (top + tooltipHeight > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - tooltipHeight - 12);
    }

    setCoords({ left, top });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, items, title, subtitle, emptyNotice, totalAmount]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="price-breakdown-icon-btn"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={ariaLabel}
        onClick={handleClick}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={(e) => {
          if (!popoverRef.current?.contains(e.relatedTarget)) {
            setIsOpen(false);
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          padding: 0,
          margin: '0 2px',
          borderRadius: '50%',
          border: '1px solid rgba(30, 58, 138, 0.25)',
          backgroundColor: isOpen ? 'rgba(245, 184, 46, 0.25)' : '#F8FAFC',
          color: 'var(--color-navy)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          flexShrink: 0,
          verticalAlign: 'middle',
          outline: 'none'
        }}
      >
        <Info style={{ width: `${iconSize}px`, height: `${iconSize}px`, color: '#1E3A8A' }} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={title}
            className="price-breakdown-popover"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              width: 'min(320px, calc(100vw - 24px))',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.2), 0 4px 12px -2px rgba(15, 23, 42, 0.1)',
              padding: '12px 14px',
              zIndex: 99999,
              fontSize: '12px',
              color: 'var(--color-navy)',
              lineHeight: 1.5,
              animation: 'tooltipFadeIn 120ms ease-out',
              pointerEvents: 'auto'
            }}
          >
            {/* Popover Header */}
            <div style={{ paddingBottom: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-navy)' }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', marginTop: '2px', fontWeight: 600 }}>
                  {subtitle}
                </div>
              )}
            </div>

            {/* Popover Body */}
            {emptyNotice ? (
              <div style={{ padding: '6px 0', color: 'var(--color-slate)', fontSize: '11.5px', fontStyle: 'italic' }}>
                {emptyNotice}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '2px'
                }}
              >
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: item.calculationStr ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: item.calculationStr ? 'flex-start' : 'center',
                      gap: '2px',
                      padding: '3px 0',
                      borderBottom: idx < items.length - 1 ? '1px dashed #F1F5F9' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                      {item.label}{!item.calculationStr ? ':' : ''}
                    </span>
                    {item.calculationStr ? (
                      <span className="tabular-nums" style={{ color: '#0F172A', fontSize: '11px', paddingLeft: '4px' }}>
                        {item.calculationStr}
                      </span>
                    ) : (
                      <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                        {item.amountStr}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Popover Footer Total */}
            <div
              style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontWeight: 700
              }}
            >
              <span style={{ color: 'var(--color-navy)' }}>{totalLabel}:</span>
              <span className="tabular-nums" style={{ color: '#0F172A', fontWeight: 800, fontSize: '12.5px' }}>
                {formatVND(totalAmount)}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
