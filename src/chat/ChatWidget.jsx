import React, { useEffect, useId, useRef, useState } from "react";
import {
  X,
  Send,
  Bot,
  UserCheck,
  Clock,
  Star,
  Check,
  CheckCheck,
  Sparkles,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useChat } from "./ChatContext";
import { HandoffGuideCard, MessageCard } from "./ChatCards";
import {
  formatClockTime,
  formatCountdownSeconds,
  getOutgoingReceiptMeta,
} from "./chatUtils";
import "./chat.css";

function ConciergeChatLogo() {
  return (
    <svg
      className="vps-launcher-svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="vps-svg-bubble"
        d="M14 4.5C8.201 4.5 3.5 8.606 3.5 13.67c0 2.025.755 3.896 2.03 5.41-.24 1.38-.82 2.674-1.572 3.63a.55.55 0 0 0 .485.887c1.805-.165 3.627-.75 5.016-1.525A11.75 11.75 0 0 0 14 22.84c5.799 0 10.5-4.106 10.5-9.17S19.799 4.5 14 4.5Z"
        fill="currentColor"
      />
      <circle className="vps-svg-dot vps-svg-dot-1" cx="9.8" cy="13.7" r="1.45" fill="var(--color-navy-dark)" />
      <circle className="vps-svg-dot vps-svg-dot-2" cx="14" cy="13.7" r="1.45" fill="var(--color-navy-dark)" />
      <circle className="vps-svg-dot vps-svg-dot-3" cx="18.2" cy="13.7" r="1.45" fill="var(--color-navy-dark)" />
      <path
        className="vps-svg-sparkle"
        d="M23.2 2.2l.55 1.65 1.65.55-1.65.55-.55 1.65-.55-1.65-1.65-.55 1.65-.55.55-1.65Z"
        fill="#FDE68A"
      />
    </svg>
  );
}

function renderFormattedText(text) {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^\s*](?:[^*\n]*[^\s*])?\*)/g);
    return (
      <React.Fragment key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={j}>{part.slice(1, -1)}</em>;
          }
          return <React.Fragment key={j}>{part}</React.Fragment>;
        })}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function secondsRemaining(isoString, nowMs) {
  if (!isoString) return 0;
  const target = new Date(isoString).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - nowMs) / 1000));
}

function getSenderMeta(senderType, managerName) {
  if (senderType === "CUSTOMER" || senderType === "GUEST") {
    return { isSelf: true, key: "SELF", label: "", kind: "self" };
  }
  if (senderType === "MANAGER") {
    const label = managerName || "Quản lý cơ sở";
    return { isSelf: false, key: `MANAGER:${label}`, label, kind: "mgr" };
  }
  return { isSelf: false, key: "AI", label: "Trợ lý AI VietPeace", kind: "ai" };
}

const RATING_LABELS = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Cần cải thiện",
  4: "Hài lòng",
  5: "Rất hài lòng",
};

function RateTriggerButton({ buttonRef, isOpen, controlsId, onClick }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`vps-rate-trigger-btn${isOpen ? " is-open" : ""}`}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={onClick}
    >
      <Star size={12} fill="currentColor" />
      <span>Đánh giá</span>
    </button>
  );
}

function HandoffRatingBox({ handoffId, managerName, onSubmit, onDismiss }) {
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const displayStars = hoverStar || stars;
  const isLowRating = stars >= 1 && stars <= 3;

  async function handleSubmit(e) {
    e.preventDefault();
    if (stars < 1 || stars > 5) {
      setErr("Vui lòng chọn từ 1 đến 5 sao.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await onSubmit(handoffId, { rating: stars, comment });
    } catch (error) {
      setErr(error.message || "Không thể gửi đánh giá lúc này.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="vps-rating-card" onSubmit={handleSubmit}>
      <div className="vps-rating-head">
        <Star size={15} fill="currentColor" />
        <span>
          Đánh giá Quản lý {managerName ? <b>{managerName}</b> : "cơ sở"}
        </span>
        {onDismiss && (
          <button
            type="button"
            className="vps-rating-close"
            onClick={onDismiss}
            title="Thu gọn tạm thời"
            aria-label="Thu gọn khung đánh giá"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <div className="vps-rating-stars" role="radiogroup" aria-label="Chọn số sao đánh giá">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            className={`vps-star-btn ${displayStars >= n ? "active" : ""}`}
            onMouseEnter={() => setHoverStar(n)}
            onMouseLeave={() => setHoverStar(0)}
            onClick={() => {
              setStars(n);
              setErr("");
            }}
            aria-label={`${n} sao`}
          >
            <Star size={19} fill={displayStars >= n ? "currentColor" : "none"} />
          </button>
        ))}
        <span className="vps-rating-score">
          {displayStars > 0 ? `${displayStars}/5 · ${RATING_LABELS[displayStars]}` : "Chọn 1–5 sao"}
        </span>
      </div>
      {isLowRating && (
        <div className="vps-rating-low-hint">
          <AlertCircle size={13} />
          <span>Đánh giá 1–3 sao sẽ được gửi báo cáo tới Quản trị viên VietPeace Stay để kiểm tra.</span>
        </div>
      )}
      <input
        type="text"
        className="vps-rating-input"
        placeholder={
          isLowRating
            ? "Chia sẻ lý do chưa hài lòng để Quản trị viên hỗ trợ xử lý…"
            : "Nhận xét thêm về thái độ hoặc tốc độ hỗ trợ (không bắt buộc)…"
        }
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      {err && <div className="vps-inline-alert">{err}</div>}
      <div className="vps-rating-actions">
        <button type="submit" className="vps-btn-primary-xs" disabled={submitting || stars < 1}>
          {submitting ? "Đang gửi…" : "Gửi đánh giá"}
        </button>
      </div>
    </form>
  );
}

export default function ChatWidget() {
  const {
    isOpen,
    openChatWidget,
    closeChatWidget,
    isAuthenticatedCustomer,
    greetingText,
    featuredLocations,
    pageContext,
    activeConversation,
    activeConversationId,
    activeMessages,
    loadOlderMessages,
    hasOlderMessages,
    loadingOlderMessages,
    activeStreaming,
    activeTypingName,
    totalUnread,
    loading,
    statusNotice,
    clearStatusNotice,
    handoffGuideState,
    setHandoffGuideState,
    sendMessage,
    selectDestinationInChat,
    selectPropertyInChat,
    requestHumanHandoff,
    cancelHumanHandoff,
    returnFromManagerToAi,
    endGuestSession,
    submitRating,
    emitTyping,
  } = useChat();

  const [draft, setDraft] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [openRatingTarget, setOpenRatingTarget] = useState(null);
  const [dismissedSubmittedIds, setDismissedSubmittedIds] = useState([]);

  const launcherTooltipId = useId();
  const ratingPopoverId = useId();
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const scrollEndRef = useRef(null);
  const streamRef = useRef(null);
  const preservingScrollRef = useRef(false);
  const rateTriggerRef = useRef(null);
  const ratingPopoverRef = useRef(null);
  const typingTimerRef = useRef(null);

  const waitSecs = secondsRemaining(activeConversation?.managerWaitExpiresAt, nowMs);
  const guestAiSecs = secondsRemaining(activeConversation?.guestAiCloseAt, nowMs);

  const isResolved = activeConversation?.status === "RESOLVED";
  const handlingMode = isResolved ? "AI" : activeConversation?.handlingMode || "AI";
  const isGuestTemp =
    !isAuthenticatedCustomer && activeConversation?.retentionState === "TEMPORARY";
  const isHumanInvolved =
    handlingMode === "WAITING_HUMAN" ||
    handlingMode === "HUMAN" ||
    (!isResolved && Boolean(activeConversation?.currentHandoffId));

  const rateableHandoffId =
    activeConversation?.pendingRatingHandoffId ||
    (activeConversation?.currentHandoffId &&
    activeConversation?.handoffFirstHumanReplyAt &&
    !activeConversation?.hasRatedHandoff
      ? Number(activeConversation.currentHandoffId)
      : null);

  const canRateHandoff = Boolean(isAuthenticatedCustomer && rateableHandoffId);
  const showRateTrigger = Boolean(rateableHandoffId);
  const isRatingOpen = Boolean(
    showRateTrigger &&
      openRatingTarget &&
      Number(openRatingTarget.convId) === Number(activeConversationId) &&
      Number(openRatingTarget.handoffId) === Number(rateableHandoffId),
  );
  const submittedRating = activeConversation?.lastSubmittedRating || null;
  const showSubmittedRatingCard = Boolean(
    submittedRating && !dismissedSubmittedIds.includes(Number(submittedRating.handoffId)),
  );

  // Live 1s countdown clock for Guest 3m / Manager 5m timers
  useEffect(() => {
    if (!isOpen) return undefined;
    if (!activeConversation?.managerWaitExpiresAt && !activeConversation?.guestAiCloseAt) return undefined;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen, activeConversation?.managerWaitExpiresAt, activeConversation?.guestAiCloseAt]);

  // Dismiss top rating popover when clicking/tapping outside it
  useEffect(() => {
    if (!isOpen || !isRatingOpen) return undefined;
    function handleOutsidePointerDown(e) {
      if (ratingPopoverRef.current?.contains(e.target)) return;
      if (rateTriggerRef.current?.contains(e.target)) return;
      setOpenRatingTarget(null);
    }
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isOpen, isRatingOpen]);

  // Auto scroll when new messages / deltas / guide appear
  useEffect(() => {
    if (!isOpen || preservingScrollRef.current) return;
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, activeMessages.length, activeStreaming?.text, handoffGuideState.open]);

  // Focus input on open & Esc handler returning focus to launcher
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  function handleDrawerKeyDown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (isRatingOpen) {
        setOpenRatingTarget(null);
        setTimeout(() => rateTriggerRef.current?.focus(), 20);
        return;
      }
      closeChatWidget();
      setTimeout(() => launcherRef.current?.focus(), 30);
    }
  }

  function handleTextareaChange(e) {
    setDraft(e.target.value);
    emitTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(false), 1500);
  }

  function handleComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      // IME-safe Enter check for Vietnamese Telex/VNI/other IMEs
      if (e.nativeEvent?.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    emitTyping(false);
    await sendMessage(text);
  }

  function toggleRatingPopover(handoffId) {
    const hid = Number(handoffId);
    const cid = Number(activeConversationId);
    if (!hid || !cid) return;
    setOpenRatingTarget((prev) =>
      prev && Number(prev.convId) === cid && Number(prev.handoffId) === hid
        ? null
        : { convId: cid, handoffId: hid },
    );
  }

  async function handleRatingSubmit(handoffId, ratingPayload) {
    await submitRating(handoffId, ratingPayload);
    setOpenRatingTarget(null);
  }

  // Find last outgoing message (GUEST or CUSTOMER) to display delivery/read status pill cleanly
  const lastOutgoingIdx = (() => {
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      const m = activeMessages[i];
      if (m.senderType === "CUSTOMER" || m.senderType === "GUEST") return i;
    }
    return -1;
  })();

  const hasCustomerMessage = activeMessages.some(
    (m) => m.senderType === "CUSTOMER" || m.senderType === "GUEST"
  );

  return (
    <div className="vps-chat-root">
      {/* Live region for polite non-streaming announcements */}
      <div className="vps-sr-only" aria-live="polite">
        {statusNotice}
      </div>

      {/* Floating Concierge Launcher */}
      {!isOpen && (
        <div
          className={`vps-launcher-wrap${totalUnread > 0 ? " has-unread" : ""}`}
          data-tooltip-dismissed={tooltipDismissed ? "true" : "false"}
          onMouseLeave={() => setTooltipDismissed(false)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setTooltipDismissed(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setTooltipDismissed(true);
            }
          }}
        >
          <div id={launcherTooltipId} role="tooltip" className="vps-launcher-tooltip">
            <strong>Chat với VietPeace</strong>
            {pageContext.pageType === "ACCOMMODATION_DETAIL" && pageContext.accommodationName && (
              <small>{pageContext.accommodationName}</small>
            )}
          </div>
          <button
            ref={launcherRef}
            type="button"
            className="vps-chat-launcher"
            onClick={() => openChatWidget({})}
            aria-label={
              totalUnread > 0
                ? `Mở hộp thoại tư vấn VietPeace Stay (${totalUnread} tin nhắn chưa đọc)`
                : "Mở hộp thoại tư vấn VietPeace Stay"
            }
            aria-describedby={launcherTooltipId}
          >
            <span className="vps-launcher-halo" aria-hidden="true" />
            <span className="vps-launcher-surface" aria-hidden="true">
              <span className="vps-launcher-sheen" />
            </span>
            <span className="vps-launcher-icon" aria-hidden="true">
              <ConciergeChatLogo />
            </span>
            <span className="vps-launcher-online-dot" aria-hidden="true" />
            {totalUnread > 0 && (
              <span className="vps-launcher-badge" aria-hidden="true">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Chat Panel Drawer */}
      {isOpen && (
        <section
          className="vps-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="vps-chat-title"
          onKeyDown={handleDrawerKeyDown}
        >
          {/* Header */}
          <header className="vps-chat-header">
            <div className="vps-chat-header-main">
              <div className={`vps-header-avatar${handlingMode === "HUMAN" ? " is-human" : ""}`}>
                {handlingMode === "HUMAN" ? <UserCheck size={19} /> : <Bot size={19} />}
              </div>
              <div className="vps-header-titles">
                <h2 id="vps-chat-title">
                  {activeConversation?.accommodationName || "VietPeace Stay Concierge"}
                </h2>
                <div className="vps-header-status">
                  <span
                    className={`vps-status-dot ${
                      handlingMode === "HUMAN"
                        ? "human"
                        : handlingMode === "WAITING_HUMAN"
                          ? "waiting"
                          : "ai"
                    }`}
                  />
                  <span>
                    {handlingMode === "HUMAN"
                      ? `Quản lý ${activeConversation?.assignedManagerName || "cơ sở"} đang hỗ trợ`
                      : handlingMode === "WAITING_HUMAN"
                        ? `Đang chờ Quản lý (${formatCountdownSeconds(waitSecs)})`
                        : "Trợ lý ảo AI · Trả lời tức thì"}
                  </span>
                </div>
              </div>
            </div>

            <div className="vps-header-controls">
              <button
                type="button"
                className="vps-icon-btn"
                onClick={() => {
                  closeChatWidget();
                  setTimeout(() => launcherRef.current?.focus(), 30);
                }}
                aria-label="Đóng khung chat"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Action / Status Strip */}
          <div className="vps-chat-subbar">
            {handlingMode === "AI" && (
              <>
                <button
                  type="button"
                  className="vps-handoff-cta"
                  onClick={requestHumanHandoff}
                  disabled={loading}
                >
                  <UserCheck size={13} />
                  <span>Kết nối Quản lý</span>
                </button>

                {(showRateTrigger || (isGuestTemp && hasCustomerMessage)) && (
                  <div className="vps-subbar-right">
                    {showRateTrigger && (
                      <RateTriggerButton
                        buttonRef={rateTriggerRef}
                        isOpen={isRatingOpen}
                        controlsId={ratingPopoverId}
                        onClick={() => toggleRatingPopover(rateableHandoffId)}
                      />
                    )}

                    {isGuestTemp && hasCustomerMessage && (
                      <div className="vps-guest-actions">
                        {activeConversation?.guestAiCloseAt && guestAiSecs > 0 && (
                          <span
                            className="vps-timer-chip"
                            title="Cuộc trò chuyện tự động kết thúc sau 3 phút không có tin nhắn mới"
                          >
                            <Clock size={12} /> {formatCountdownSeconds(guestAiSecs)}
                          </span>
                        )}
                        <button
                          type="button"
                          className="vps-end-guest-btn"
                          onClick={endGuestSession}
                          title="Kết thúc cuộc trò chuyện"
                        >
                          <LogOut size={12} />
                          <span>Kết thúc</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {handlingMode === "WAITING_HUMAN" && (
              <div className="vps-waiting-strip">
                <div className="vps-waiting-info">
                  <Loader2 size={14} className="vps-spin" />
                  <span>
                    Đã gửi yêu cầu tới Quản lý · Hết hạn sau{" "}
                    <strong className="tabular-nums">{formatCountdownSeconds(waitSecs)}</strong>
                  </span>
                </div>
                <button type="button" className="vps-cancel-wait-btn" onClick={cancelHumanHandoff}>
                  Hủy chờ
                </button>
              </div>
            )}

            {handlingMode === "HUMAN" && (
              <div className="vps-human-strip">
                <div className="vps-human-strip-left">
                  <CheckCircle2Icon />
                  <span>
                    Quản lý {activeConversation?.assignedManagerName || "cơ sở"}
                  </span>
                </div>
                <div className="vps-subbar-right">
                  {showRateTrigger && (
                    <RateTriggerButton
                      buttonRef={rateTriggerRef}
                      isOpen={isRatingOpen}
                      controlsId={ratingPopoverId}
                      onClick={() => toggleRatingPopover(rateableHandoffId)}
                    />
                  )}
                  <button
                    type="button"
                    className="vps-return-ai-btn"
                    onClick={returnFromManagerToAi}
                    disabled={loading}
                  >
                    Quay lại AI
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Rating Disclosure Popover anchored to top subbar */}
            {isRatingOpen && (
              <div
                id={ratingPopoverId}
                ref={ratingPopoverRef}
                className="vps-rating-popover"
                role="dialog"
                aria-label="Đánh giá Quản lý cơ sở"
              >
                {canRateHandoff ? (
                  <HandoffRatingBox
                    handoffId={rateableHandoffId}
                    managerName={
                      activeConversation?.pendingRatingManagerName ||
                      activeConversation?.assignedManagerName
                    }
                    onSubmit={handleRatingSubmit}
                    onDismiss={() => {
                      setOpenRatingTarget(null);
                      setTimeout(() => rateTriggerRef.current?.focus(), 20);
                    }}
                  />
                ) : (
                  <div className="vps-rating-guest-note">
                    <Star size={14} />
                    <span>Đăng nhập tài khoản VietPeace Stay để gửi đánh giá 1–5 sao cho Quản lý cơ sở.</span>
                    <button
                      type="button"
                      className="vps-rating-close"
                      onClick={() => {
                        setOpenRatingTarget(null);
                        setTimeout(() => rateTriggerRef.current?.focus(), 20);
                      }}
                      aria-label="Đóng hộp thoại đánh giá"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compact Submitted Rating Confirmation Strip below top bar */}
          {showSubmittedRatingCard && (
            <div className="vps-rating-done-banner">
              <div className="vps-rating-done-head">
                <Star size={13} fill="currentColor" />
                <span>
                  Đã gửi đánh giá {submittedRating.rating}/5 sao
                  {Number(submittedRating.rating) <= 3
                    ? " · Đã chuyển báo cáo tới Quản trị viên"
                    : " · Cảm ơn Quý khách!"}
                </span>
                <button
                  type="button"
                  className="vps-rating-close"
                  onClick={() =>
                    setDismissedSubmittedIds((prev) => [...prev, Number(submittedRating.handoffId)])
                  }
                  aria-label="Đóng thông báo đánh giá"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Notice banner if any */}
          {statusNotice && (
            <div className="vps-notice-banner">
              <AlertCircle size={14} />
              <span>{statusNotice}</span>
              <button type="button" onClick={clearStatusNotice} aria-label="Ẩn thông báo">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Scrollable Message Stream */}
          <div className="vps-chat-stream" ref={streamRef}>
            {hasOlderMessages && (
              <button type="button" className="vps-btn-outline-xs" disabled={loadingOlderMessages}
                onClick={async () => {
                  const el = streamRef.current;
                  const height = el?.scrollHeight || 0;
                  const top = el?.scrollTop || 0;
                  preservingScrollRef.current = true;
                  await loadOlderMessages();
                  requestAnimationFrame(() => {
                    if (el) el.scrollTop = top + el.scrollHeight - height;
                    preservingScrollRef.current = false;
                  });
                }}>
                {loadingOlderMessages ? "Đang tải…" : "Tải tin nhắn cũ"}
              </button>
            )}
            {activeMessages.length === 0 && !loading && (
              <div className="vps-msg-row bot">
                <div className="vps-msg-col">
                  <div className="vps-msg-sender-row">
                    <span className="vps-msg-avatar-inline ai" aria-hidden="true">
                      <Sparkles size={11} />
                    </span>
                    <span className="vps-msg-sender">Trợ lý AI VietPeace</span>
                  </div>
                  <div className="vps-msg-bubble bot">
                    <p>
                      {greetingText ||
                        "Xin chào! Mình là Trợ lý AI của VietPeace Stay. Bạn đang dự định đi đâu để mình gợi ý phòng và báo giá nhanh nhé? Nếu cần trao đổi trực tiếp, bạn hãy nhấn Kết nối Quản lý ở phía trên."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeMessages.map((msg, index) => {
              const isSystem = msg.senderType === "SYSTEM";

              if (isSystem) {
                return (
                  <div key={msg.id || msg.clientMessageId} className="vps-msg-system">
                    <span>{msg.content}</span>
                  </div>
                );
              }

              const meta = getSenderMeta(msg.senderType, activeConversation?.assignedManagerName);
              const prevMsg = index > 0 ? activeMessages[index - 1] : null;
              const prevMeta =
                prevMsg && prevMsg.senderType !== "SYSTEM"
                  ? getSenderMeta(prevMsg.senderType, activeConversation?.assignedManagerName)
                  : null;
              const nextMsg = index < activeMessages.length - 1 ? activeMessages[index + 1] : null;
              const nextMeta =
                nextMsg && nextMsg.senderType !== "SYSTEM"
                  ? getSenderMeta(nextMsg.senderType, activeConversation?.assignedManagerName)
                  : null;

              const isGroupedWithPrev = Boolean(prevMeta && prevMeta.key === meta.key);
              const isGroupedWithNext = Boolean(nextMeta && nextMeta.key === meta.key);
              const showSenderHeader = !meta.isSelf && !isGroupedWithPrev;

              const showReceipt = meta.isSelf && index === lastOutgoingIdx && isHumanInvolved;
              const receipt = showReceipt
                ? getOutgoingReceiptMeta(msg, activeConversation?.counterpartyDelivery)
                : null;

              return (
                <div
                  key={msg.id || msg.clientMessageId || index}
                  className={`vps-msg-row ${meta.isSelf ? "self" : "bot"}${
                    isGroupedWithPrev ? " is-grouped" : ""
                  }${msg.payload ? " has-card" : ""}`}
                >
                  <div className="vps-msg-col">
                    {showSenderHeader && (
                      <div className="vps-msg-sender-row">
                        <span className={`vps-msg-avatar-inline ${meta.kind}`} aria-hidden="true">
                          {meta.kind === "mgr" ? <UserCheck size={11} /> : <Sparkles size={11} />}
                        </span>
                        <span className="vps-msg-sender">{meta.label}</span>
                      </div>
                    )}
                    {msg.payload ? (
                      <MessageCard
                        message={msg}
                        onSelectDestination={selectDestinationInChat}
                        onSelectProperty={selectPropertyInChat}
                        onRequestHandoff={requestHumanHandoff}
                      />
                    ) : (
                      <div
                        className={`vps-msg-bubble ${
                          meta.isSelf ? "self" : meta.kind
                        }${isGroupedWithPrev ? " is-grouped-top" : ""}${
                          isGroupedWithNext ? " is-grouped-bottom" : ""
                        }`}
                      >
                        <div className="vps-msg-text">{renderFormattedText(msg.content)}</div>
                        <span className="vps-msg-time">{formatClockTime(msg.createdAt)}</span>
                      </div>
                    )}

                    {receipt && (
                      <div className={`vps-receipt vps-receipt--${receipt.state.toLowerCase()}`} title={receipt.tooltip}>
                        {receipt.state === "READ" || receipt.state === "DELIVERED" ? (
                          <CheckCheck size={12} />
                        ) : (
                          <Check size={12} />
                        )}
                        <span>{receipt.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live AI Streaming Bubble */}
            {activeStreaming && (() => {
              const lastMsg = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1] : null;
              const lastMeta =
                lastMsg && lastMsg.senderType !== "SYSTEM"
                  ? getSenderMeta(lastMsg.senderType, activeConversation?.assignedManagerName)
                  : null;
              const isStreamingGrouped = Boolean(lastMeta && lastMeta.key === "AI");

              return (
                <div className={`vps-msg-row bot${isStreamingGrouped ? " is-grouped" : ""}`}>
                  <div className="vps-msg-col">
                    {!isStreamingGrouped && (
                      <div className="vps-msg-sender-row">
                        <span className="vps-msg-avatar-inline ai" aria-hidden="true">
                          <Sparkles size={11} />
                        </span>
                        <span className="vps-msg-sender">Trợ lý AI VietPeace đang trả lời…</span>
                      </div>
                    )}
                    <div className={`vps-msg-bubble bot${isStreamingGrouped ? " is-grouped-top" : ""}`}>
                      <div className="vps-msg-text">
                        {activeStreaming.text ? (
                          renderFormattedText(activeStreaming.text)
                        ) : (
                          <span className="vps-typing-dots">
                            <i /> <i /> <i />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Manager typing indicator */}
            {activeTypingName && !activeStreaming && (
              <div className="vps-typing-label">
                <span>{activeTypingName} đang nhập…</span>
              </div>
            )}

            {/* Context-aware Handoff Guide inside chatbox */}
            {handoffGuideState.open && (
              <HandoffGuideCard
                key={`${handoffGuideState.mode || "PICK_LOCATION"}-${handoffGuideState.location?.id || "all"}-${handoffGuideState.property?.accommodationId || ""}`}
                guideState={handoffGuideState}
                initialLocations={featuredLocations}
                onSelectProperty={(accomId, opts) => {
                  setHandoffGuideState({ open: false });
                  selectPropertyInChat(accomId, opts);
                }}
                onClose={() => setHandoffGuideState({ open: false })}
              />
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* IME-Safe Composer */}
          <form className="vps-chat-composer" onSubmit={handleSubmit}>
            <div className="vps-composer-box">
              <textarea
                ref={inputRef}
                rows={1}
                className="vps-chat-input"
                placeholder={
                  handlingMode === "HUMAN"
                    ? "Nhắn trực tiếp với Quản lý cơ sở…"
                    : "Hỏi phòng, báo giá hoặc dịch vụ…"
                }
                value={draft}
                disabled={loading}
                onChange={handleTextareaChange}
                onKeyDown={handleComposerKeyDown}
                aria-label="Nội dung tin nhắn"
              />
              <button
                type="submit"
                className="vps-send-btn"
                disabled={loading || !draft.trim()}
                aria-label="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function CheckCircle2Icon() {
  return <UserCheck size={14} />;
}
