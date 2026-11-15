import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  getCustomerCaptchaChallenge,
  verifyCustomerCaptchaChallenge,
} from '../utils/authApi.js';

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export default function SlidePuzzleCaptcha({
  onVerified,
  onInvalidated,
  externalError = '',
  sliderRef,
}) {
  const captionId = useId();
  const helpId = useId();

  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | verifying | verified | mismatch | error
  const [statusMessage, setStatusMessage] = useState('');
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [maxTravelPx, setMaxTravelPx] = useState(220);

  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const dragSessionRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const lastDragEndAtRef = useRef(0);
  const loadedAtRef = useRef(0);
  const keyboardStartRef = useRef(0);
  const mountedRef = useRef(true);
  const onVerifiedRef = useRef(onVerified);
  const onInvalidatedRef = useRef(onInvalidated);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onInvalidatedRef.current = onInvalidated;
  }, [onVerified, onInvalidated]);

  const updateTrackMetrics = useCallback(() => {
    const trackEl = trackRef.current;
    const thumbEl = thumbRef.current;
    if (!trackEl || !thumbEl) return;
    const travel = Math.max(1, trackEl.clientWidth - thumbEl.offsetWidth - 4);
    setMaxTravelPx(travel);
  }, []);

  const loadNewChallenge = useCallback(async () => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    setStatus('loading');
    setStatusMessage('');
    setOffsetX(0);
    setIsDragging(false);
    dragSessionRef.current = null;
    keyboardStartRef.current = 0;
    onInvalidatedRef.current?.();

    try {
      const { ok, data } = await getCustomerCaptchaChallenge();
      if (!mountedRef.current) return;

      if (!ok || !data?.success || !data?.data?.challengeId) {
        setStatus('error');
        setStatusMessage(
          data?.message || 'Không thể tải mảnh ghép bảo mật. Vui lòng thử bấm làm mới.',
        );
        return;
      }

      setChallenge(data.data);
      setOffsetX(0);
      setStatus('ready');
      loadedAtRef.current = Date.now();
      setLiveAnnouncement('Đã sẵn sàng mảnh ghép xác thực bảo mật mới.');
    } catch {
      if (!mountedRef.current) return;
      setStatus('error');
      setStatusMessage('Không thể kết nối máy chủ để tải captcha.');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      loadNewChallenge();
      updateTrackMetrics();
    }, 0);

    window.addEventListener('resize', updateTrackMetrics);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
      window.removeEventListener('resize', updateTrackMetrics);
    };
  }, [loadNewChallenge, updateTrackMetrics]);

  const setThumbRef = useCallback(
    (node) => {
      thumbRef.current = node;
      if (sliderRef) {
        sliderRef.current = node;
      }
    },
    [sliderRef],
  );

  const submitSliderOffset = useCallback(
    async (candidateOffsetX, { durationMs, trail = [], mode = 'pointer' }) => {
      if (!challenge || status === 'loading' || status === 'verifying' || status === 'verified') {
        return;
      }

      setStatus('verifying');
      setStatusMessage('');

      try {
        const { ok, data } = await verifyCustomerCaptchaChallenge({
          challengeId: challenge.challengeId,
          offsetX: candidateOffsetX,
          durationMs,
          trail,
          mode,
        });

        if (!mountedRef.current) return;

        if (ok && data?.success && data?.data?.captchaToken) {
          setStatus('verified');
          setStatusMessage('');
          setLiveAnnouncement('Xác thực bảo mật bằng mảnh ghép thành công.');
          onVerifiedRef.current?.(data.data.captchaToken);
          return;
        }

        const shouldRefresh = Boolean(data?.data?.shouldRefresh);
        const failMsg =
          data?.message || 'Mảnh ghép chưa khớp đúng vị trí. Vui lòng kéo lại.';
        setStatus('mismatch');
        setStatusMessage(failMsg);
        setLiveAnnouncement(failMsg);
        onInvalidatedRef.current?.();

        setTimeout(() => {
          if (!mountedRef.current) return;
          if (shouldRefresh) {
            loadNewChallenge();
          } else {
            setOffsetX(0);
            setStatus('ready');
            keyboardStartRef.current = 0;
          }
        }, 520);
      } catch {
        if (!mountedRef.current) return;
        setStatus('mismatch');
        setStatusMessage('Không thể kiểm tra captcha lúc này. Vui lòng thử lại.');
        onInvalidatedRef.current?.();
        setTimeout(() => {
          if (!mountedRef.current) return;
          setOffsetX(0);
          setStatus('ready');
        }, 520);
      }
    },
    [challenge, status, loadNewChallenge],
  );

  const maxOffsetX = challenge?.maxOffsetX || 258;
  const thumbLeftPx = (offsetX / maxOffsetX) * maxTravelPx;
  const trackThumbPx = status === 'verified' ? maxTravelPx : thumbLeftPx;

  const handleThumbPointerDown = (event) => {
    if (event.button !== 0) return;
    if (!challenge || status !== 'ready') return;

    event.preventDefault();
    const trackEl = trackRef.current;
    const thumbEl = thumbRef.current;
    const travelPx =
      trackEl && thumbEl
        ? Math.max(1, trackEl.clientWidth - thumbEl.offsetWidth - 4)
        : Math.max(1, maxTravelPx);
    setMaxTravelPx(travelPx);

    try {
      thumbEl?.setPointerCapture?.(event.pointerId);
    } catch {
      // Fallback to window listeners below
    }

    dragCleanupRef.current?.();

    const startAt = Date.now();
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startOffsetX: offsetX,
      startedAt: startAt,
      travelPx,
      moved: false,
      currentOffsetX: offsetX,
      trail: [{ x: Math.round(offsetX), t: 0 }],
    };
    setIsDragging(true);
    setStatusMessage('');

    const onWindowPointerMove = (moveEvent) => {
      const drag = dragSessionRef.current;
      if (!drag || drag.pointerId !== moveEvent.pointerId) return;

      const deltaPx = moveEvent.clientX - drag.startClientX;
      if (Math.abs(deltaPx) >= 3) {
        drag.moved = true;
      }

      const nextOffset = clampNumber(
        drag.startOffsetX + (deltaPx / drag.travelPx) * maxOffsetX,
        0,
        maxOffsetX,
      );

      drag.currentOffsetX = nextOffset;
      if (drag.trail.length < 60) {
        drag.trail.push({
          x: Math.round(nextOffset),
          t: Date.now() - drag.startedAt,
        });
      }
      setOffsetX(nextOffset);
    };

    const onWindowPointerEnd = (endEvent) => {
      const drag = dragSessionRef.current;
      if (!drag || drag.pointerId !== endEvent.pointerId) return;

      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
      dragSessionRef.current = null;
      lastDragEndAtRef.current = Date.now();
      setIsDragging(false);

      if (!drag.moved || drag.currentOffsetX <= 4) {
        setOffsetX(0);
        return;
      }

      const elapsed = Math.max(150, Date.now() - drag.startedAt);
      submitSliderOffset(drag.currentOffsetX, {
        durationMs: elapsed,
        trail: drag.trail,
        mode: 'pointer',
      });
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerEnd);
    window.addEventListener('pointercancel', onWindowPointerEnd);

    dragCleanupRef.current = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerEnd);
      window.removeEventListener('pointercancel', onWindowPointerEnd);
    };
  };

  const handleTrackClick = (event) => {
    if (!challenge || status !== 'ready') return;
    if (Date.now() - lastDragEndAtRef.current < 160) return;
    if (event.target === thumbRef.current || thumbRef.current?.contains(event.target)) {
      return;
    }

    const trackEl = trackRef.current;
    const thumbEl = thumbRef.current;
    if (!trackEl || !thumbEl) return;

    const travelPx = Math.max(1, trackEl.clientWidth - thumbEl.offsetWidth - 4);
    setMaxTravelPx(travelPx);
    const rect = trackEl.getBoundingClientRect();
    const thumbWidth = thumbEl.offsetWidth || 54;
    const clickTravel = clampNumber(
      event.clientX - rect.left - thumbWidth / 2 - 2,
      0,
      travelPx,
    );
    const nextOffset = (clickTravel / travelPx) * maxOffsetX;

    setOffsetX(nextOffset);
    const elapsedSinceLoad = Math.max(220, Date.now() - (loadedAtRef.current || Date.now() - 300));
    submitSliderOffset(nextOffset, {
      durationMs: elapsedSinceLoad,
      trail: [{ x: 0, t: 0 }, { x: Math.round(nextOffset), t: elapsedSinceLoad }],
      mode: 'track_click',
    });
  };

  const handleThumbKeyDown = (event) => {
    if (!challenge || status !== 'ready') return;

    const step = event.shiftKey ? 12 : 4;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (!keyboardStartRef.current) keyboardStartRef.current = Date.now();
      const next = clampNumber(offsetX + step, 0, maxOffsetX);
      setOffsetX(next);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (!keyboardStartRef.current) keyboardStartRef.current = Date.now();
      const next = clampNumber(offsetX - step, 0, maxOffsetX);
      setOffsetX(next);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setOffsetX(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      if (!keyboardStartRef.current) keyboardStartRef.current = Date.now();
      setOffsetX(maxOffsetX);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const elapsed = Math.max(
        220,
        Date.now() - (keyboardStartRef.current || loadedAtRef.current || Date.now() - 300),
      );
      submitSliderOffset(offsetX, {
        durationMs: elapsed,
        trail: [{ x: 0, t: 0 }, { x: Math.round(offsetX), t: elapsed }],
        mode: 'keyboard',
      });
    }
  };

  const displayError = statusMessage || (status !== 'verified' ? externalError : '');

  return (
    <section
      className={`slide-captcha ${
        status === 'verified'
          ? 'slide-captcha--verified'
          : status === 'mismatch'
            ? 'slide-captcha--error slide-captcha--shake'
            : displayError
              ? 'slide-captcha--error'
              : ''
      }`}
      aria-labelledby={captionId}
    >
      <div className="slide-captcha__header">
        <span id={captionId} className="slide-captcha__title">
          Kéo mảnh ghép vào đúng vị trí
        </span>
        <span
          className={`slide-captcha__badge ${
            status === 'verified' ? 'slide-captcha__badge--ok' : ''
          }`}
        >
          <ShieldCheck size={14} aria-hidden="true" />
          <span>{status === 'verified' ? 'Đã xác nhận' : 'Chống spam'}</span>
        </span>
      </div>

      <div className="slide-captcha__stage-row">
        <div className="slide-captcha__stage">
          {challenge && (
            <>
              <img
                className="slide-captcha__bg"
                src={challenge.backgroundUrl}
                alt=""
                draggable={false}
              />
              <img
                className={`slide-captcha__piece ${
                  status === 'verified' ? 'slide-captcha__piece--verified' : ''
                }`}
                src={challenge.pieceUrl}
                alt="Mảnh ghép cần kéo vào ô trống"
                draggable={false}
                style={{
                  width: `${(challenge.pieceBoxSize / challenge.width) * 100}%`,
                  height: `${(challenge.pieceBoxSize / challenge.height) * 100}%`,
                  top: `${((challenge.y - challenge.piecePad) / challenge.height) * 100}%`,
                  left: `${((offsetX - challenge.piecePad) / challenge.width) * 100}%`,
                }}
              />
            </>
          )}

          {status === 'loading' && (
            <div className="slide-captcha__overlay">
              <Loader2 size={22} className="register-spin" aria-hidden="true" />
              <span>Đang tạo hình xác nhận...</span>
            </div>
          )}

          {status === 'verified' && (
            <div className="slide-captcha__verified-pill">
              <Check size={14} aria-hidden="true" />
              <span>Đã khớp vị trí</span>
            </div>
          )}
        </div>

        <div className="slide-captcha__side-tools">
          <button
            type="button"
            className="slide-captcha__tool-btn"
            onClick={loadNewChallenge}
            disabled={status === 'loading' || status === 'verifying'}
            aria-label="Đổi hình xác nhận mới"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="slide-captcha__tool-btn"
            onClick={() => setShowHelp((prev) => !prev)}
            aria-expanded={showHelp}
            aria-controls={helpId}
            aria-label="Hướng dẫn thao tác captcha bằng chuột hoặc bàn phím"
          >
            <HelpCircle size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`slide-captcha__track ${
          status === 'verified' ? 'slide-captcha__track--verified' : ''
        }`}
        onClick={handleTrackClick}
      >
        <div
          className={`slide-captcha__fill ${
            status === 'verified'
              ? 'slide-captcha__fill--verified'
              : status === 'mismatch'
                ? 'slide-captcha__fill--mismatch'
                : ''
          }`}
          style={{ width: status === 'verified' ? '100%' : `${trackThumbPx + 26}px` }}
        />

        <span
          className={`slide-captcha__track-text ${
            status === 'verified' ? 'slide-captcha__track-text--verified' : ''
          }`}
        >
          {status === 'verified'
            ? 'Xác thực bảo mật thành công'
            : status === 'verifying'
              ? 'Đang kiểm tra mảnh ghép...'
              : 'Kéo nút mũi tên sang phải'}
        </span>

        <button
          ref={setThumbRef}
          type="button"
          role="slider"
          aria-label="Thanh kéo mảnh ghép bảo mật. Dùng phím mũi tên trái hoặc phải để di chuyển và Enter để xác nhận."
          aria-valuemin={0}
          aria-valuemax={maxOffsetX}
          aria-valuenow={Math.round(offsetX)}
          aria-valuetext={
            status === 'verified'
              ? 'Đã hoàn tất xác thực bảo mật'
              : `Vị trí ngang ${Math.round(offsetX)} trên ${maxOffsetX}`
          }
          aria-disabled={status !== 'ready'}
          className={`slide-captcha__thumb ${
            isDragging ? 'slide-captcha__thumb--dragging' : ''
          } ${status === 'verified' ? 'slide-captcha__thumb--verified' : ''} ${
            status === 'mismatch' ? 'slide-captcha__thumb--mismatch' : ''
          }`}
          style={{ transform: `translateX(${trackThumbPx}px)` }}
          onPointerDown={handleThumbPointerDown}
          onKeyDown={handleThumbKeyDown}
        >
          {status === 'verified' ? (
            <Check size={18} aria-hidden="true" />
          ) : status === 'verifying' ? (
            <Loader2 size={17} className="register-spin" aria-hidden="true" />
          ) : (
            <ArrowRight size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {showHelp && (
        <div id={helpId} className="slide-captcha__help-box">
          Kéo nút mũi tên màu xanh sang phải sao cho mảnh ghép khớp đúng vào vùng khuyết.
          Hoặc chạm trực tiếp lên thanh kéo, hoặc dùng phím mũi tên trái/phải rồi nhấn Enter.
        </div>
      )}

      {displayError && (
        <p className="auth-field-error-msg" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{displayError}</span>
        </p>
      )}

      <div className="visually-hidden" aria-live="polite">
        {liveAnnouncement}
      </div>
    </section>
  );
}
