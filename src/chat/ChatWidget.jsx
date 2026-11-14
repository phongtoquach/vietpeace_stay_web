import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
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
  Layers,
  Loader2,
} from "lucide-react";
import { useChat } from "./ChatContext";
import { HandoffGuideCard, MessageCard } from "./ChatCards";
import {
  formatClockTime,
  formatCountdownSeconds,
  getOutgoingReceiptMeta,
  resolveMediaUrl,
} from "./chatUtils";
import "./chat.css";

function renderFormattedText(text) {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
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

function HandoffRatingBox({ handoffId, onSubmit }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
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
        <span>Đánh giá trải nghiệm với Quản lý cơ sở</span>
      </div>
      <div className="vps-rating-stars" role="radiogroup" aria-label="Chọn số sao đánh giá">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`vps-star-btn ${stars >= n ? "active" : ""}`}
            onClick={() => setStars(n)}
            aria-label={`${n} sao`}
          >
            <Star size={18} fill={stars >= n ? "currentColor" : "none"} />
          </button>
        ))}
        <span className="vps-rating-score">{stars}/5</span>
      </div>
      <input
        type="text"
        className="vps-rating-input"
        placeholder="Nhận xét thêm về thái độ hoặc tốc độ hỗ trợ (không bắt buộc)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      {err && <div className="vps-inline-alert">{err}</div>}
      <button type="submit" className="vps-btn-primary-xs" disabled={submitting}>
        {submitting ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
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
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
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
    endGuestSession,
    submitRating,
    emitTyping,
  } = useChat();

  const [draft, setDraft] = useState("");
  const [showConvSwitcher, setShowConvSwitcher] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const scrollEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Live 1s countdown clock for Guest 3m / Manager 5m timers
  useEffect(() => {
    if (!isOpen) return undefined;
    if (!activeConversation?.managerWaitExpiresAt && !activeConversation?.guestAiCloseAt) return undefined;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen, activeConversation?.managerWaitExpiresAt, activeConversation?.guestAiCloseAt]);

  // Auto scroll when new messages / deltas appear
  useEffect(() => {
    if (!isOpen) return;
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

  const waitSecs = secondsRemaining(activeConversation?.managerWaitExpiresAt, nowMs);
  const guestAiSecs = secondsRemaining(activeConversation?.guestAiCloseAt, nowMs);

  const handlingMode = activeConversation?.handlingMode || "AI";
  const isGuestTemp =
    !isAuthenticatedCustomer && activeConversation?.retentionState === "TEMPORARY";
  const isHumanInvolved =
    handlingMode === "WAITING_HUMAN" ||
    handlingMode === "HUMAN" ||
    Boolean(activeConversation?.currentHandoffId);

  const canRateHandoff =
    isAuthenticatedCustomer &&
    Boolean(activeConversation?.currentHandoffId) &&
    Boolean(activeConversation?.handoffFirstHumanReplyAt) &&
    !activeConversation?.hasRatedHandoff;

  // Find last outgoing message (GUEST or CUSTOMER) to display delivery/read status pill cleanly
  const lastOutgoingIdx = (() => {
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      const m = activeMessages[i];
      if (m.senderType === "CUSTOMER" || m.senderType === "GUEST") return i;
    }
    return -1;
  })();

  const quickPrompts =
    pageContext.pageType === "ACCOMMODATION_DETAIL"
      ? [
          "Cơ sở này còn phòng trống cuối tuần này cho 2 người không?",
          "Giờ nhận phòng, trả phòng và chính sách hủy thế nào?",
          "Có tiện ích miễn phí và phụ thu gì không?",
        ]
      : pageContext.pageType === "LOCATION_SEARCH"
        ? [
            "Gợi ý giúp mình 3 cơ sở tốt nhất ở khu vực này",
            "Có resort hoặc homestay nào gần biển / trung tâm giá tốt?",
          ]
        : [
            "Tôi muốn tìm khách sạn / resort cho 2 người cuối tuần này",
            "VietPeace Stay có cơ sở ở những thành phố nào?",
            ...(isAuthenticatedCustomer ? ["Kiểm tra các đơn đặt phòng của tôi"] : []),
          ];

  return (
    <div className="vps-chat-root">
      {/* Live region for polite non-streaming announcements */}
      <div className="vps-sr-only" aria-live="polite">
        {statusNotice}
      </div>

      {/* Floating Concierge Launcher */}
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          className="vps-chat-launcher"
          onClick={() => openChatWidget({})}
          aria-label="Mở hộp thoại tư vấn VietPeace Stay"
        >
          <span className="vps-launcher-icon">
            <MessageCircle size={22} />
          </span>
          <span className="vps-launcher-text">
            <strong>Tư vấn trực tuyến</strong>
            <small>
              {pageContext.pageType === "ACCOMMODATION_DETAIL" && pageContext.accommodationName
                ? pageContext.accommodationName
                : "AI & Quản lý 24/7"}
            </small>
          </span>
          {totalUnread > 0 && (
            <span className="vps-launcher-badge" aria-label={`${totalUnread} tin nhắn chưa đọc`}>
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
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
              <div className="vps-header-avatar">
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
              {conversations.length > 1 && (
                <button
                  type="button"
                  className="vps-icon-btn"
                  onClick={() => setShowConvSwitcher((s) => !s)}
                  aria-label="Chuyển hội thoại"
                  title="Chuyển đổi giữa các cuộc trò chuyện"
                >
                  <Layers size={16} />
                  <span className="vps-count-pill">{conversations.length}</span>
                </button>
              )}
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

          {/* Multi-conversation switcher dropdown */}
          {showConvSwitcher && conversations.length > 0 && (
            <div className="vps-conv-switcher">
              {conversations.map((c) => {
                const isSelected = Number(c.id) === Number(activeConversationId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`vps-conv-switch-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setActiveConversationId(c.id);
                      setShowConvSwitcher(false);
                    }}
                  >
                    {c.accommodationCoverImage && (
                      <img
                        src={resolveMediaUrl(c.accommodationCoverImage)}
                        alt={c.accommodationName || "VietPeace Stay"}
                        className="vps-conv-switch-thumb"
                      />
                    )}
                    <div className="vps-conv-switch-meta">
                      <strong>{c.accommodationName || "Tư vấn chung VietPeace Stay"}</strong>
                      <small>{c.lastMessagePreview || "Hội thoại đang mở"}</small>
                    </div>
                    {c.unreadCount > 0 && <span className="vps-mini-unread">{c.unreadCount}</span>}
                  </button>
                );
              })}
            </div>
          )}

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
                  <UserCheck size={14} />
                  <span>Kết nối nhân viên / Quản lý</span>
                </button>

                {isGuestTemp && (
                  <div className="vps-guest-actions">
                    {activeConversation?.guestAiCloseAt && guestAiSecs > 0 && (
                      <span
                        className="vps-timer-chip"
                        title="Phiên khách vãng lai tự động đóng & xóa sau 3 phút không nhắn thêm"
                      >
                        <Clock size={12} /> {formatCountdownSeconds(guestAiSecs)}
                      </span>
                    )}
                    <button
                      type="button"
                      className="vps-end-guest-btn"
                      onClick={endGuestSession}
                      title="Kết thúc ngay và xóa dữ liệu phiên tạm thời"
                    >
                      <LogOut size={12} />
                      <span>Kết thúc</span>
                    </button>
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
                <CheckCircle2Icon />
                <span>Bạn đang chat trực tiếp cùng Quản lý cơ sở</span>
              </div>
            )}
          </div>

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
          <div className="vps-chat-stream">
            {activeMessages.length === 0 && !loading && (
              <div className="vps-msg-row bot">
                <div className="vps-msg-bubble bot">
                  <p>{greetingText || "Xin chào Quý khách! Mình là Trợ lý ảo của VietPeace Stay."}</p>
                </div>
              </div>
            )}

            {activeMessages.map((msg, index) => {
              const isSelf = msg.senderType === "CUSTOMER" || msg.senderType === "GUEST";
              const isSystem = msg.senderType === "SYSTEM";

              if (isSystem) {
                return (
                  <div key={msg.id || msg.clientMessageId} className="vps-msg-system">
                    <span>{msg.content}</span>
                  </div>
                );
              }

              const showReceipt = isSelf && index === lastOutgoingIdx && isHumanInvolved;
              const receipt = showReceipt
                ? getOutgoingReceiptMeta(msg, activeConversation?.counterpartyDelivery)
                : null;

              return (
                <div key={msg.id || msg.clientMessageId || index} className={`vps-msg-row ${isSelf ? "self" : "bot"}`}>
                  {!isSelf && (
                    <div className={`vps-msg-avatar ${msg.senderType === "MANAGER" ? "mgr" : "ai"}`}>
                      {msg.senderType === "MANAGER" ? <UserCheck size={13} /> : <Sparkles size={13} />}
                    </div>
                  )}
                  <div className="vps-msg-col">
                    {!isSelf && (
                      <span className="vps-msg-sender">
                        {msg.senderType === "MANAGER"
                          ? activeConversation?.assignedManagerName || "Quản lý cơ sở"
                          : "Trợ lý AI VietPeace Stay"}
                      </span>
                    )}
                    {msg.payload ? (
                      <MessageCard
                        message={msg}
                        onSelectDestination={selectDestinationInChat}
                        onSelectProperty={selectPropertyInChat}
                        onRequestHandoff={requestHumanHandoff}
                      />
                    ) : (
                      <div className={`vps-msg-bubble ${isSelf ? "self" : msg.senderType === "MANAGER" ? "mgr" : "bot"}`}>
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
            {activeStreaming && (
              <div className="vps-msg-row bot">
                <div className="vps-msg-avatar ai">
                  <Sparkles size={13} />
                </div>
                <div className="vps-msg-col">
                  <span className="vps-msg-sender">Trợ lý AI VietPeace Stay đang trả lời…</span>
                  <div className="vps-msg-bubble bot">
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
            )}

            {/* Manager typing indicator */}
            {activeTypingName && !activeStreaming && (
              <div className="vps-typing-label">
                <span>{activeTypingName} đang nhập…</span>
              </div>
            )}

            {/* Interactive 2-step Handoff Guide inside chatbox */}
            {handoffGuideState.open && (
              <HandoffGuideCard
                initialLocations={featuredLocations}
                onSelectProperty={(accomId, opts) => {
                  setHandoffGuideState({ open: false });
                  selectPropertyInChat(accomId, opts);
                }}
                onClose={() => setHandoffGuideState({ open: false })}
              />
            )}

            {/* Post-Handoff 5-star Rating */}
            {canRateHandoff && (
              <HandoffRatingBox
                handoffId={activeConversation.currentHandoffId}
                onSubmit={submitRating}
              />
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          {handlingMode === "AI" && activeMessages.length <= 4 && !handoffGuideState.open && (
            <div className="vps-quick-chips">
              {quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="vps-quick-chip"
                  onClick={() => sendMessage(promptText)}
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {/* IME-Safe Composer */}
          <form className="vps-chat-composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              rows={1}
              className="vps-chat-input"
              placeholder={
                handlingMode === "HUMAN"
                  ? "Nhắn tin trực tiếp với Quản lý cơ sở…"
                  : "Hỏi phòng, báo giá hoặc chính sách VietPeace Stay…"
              }
              value={draft}
              onChange={handleTextareaChange}
              onKeyDown={handleComposerKeyDown}
              aria-label="Nội dung tin nhắn"
            />
            <button
              type="submit"
              className="vps-send-btn"
              disabled={!draft.trim()}
              aria-label="Gửi tin nhắn"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function CheckCircle2Icon() {
  return <UserCheck size={14} />;
}
