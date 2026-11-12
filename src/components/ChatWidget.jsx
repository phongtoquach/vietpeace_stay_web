import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Hotel } from "lucide-react";

// Chat widget (T12): floating bubble góc phải dưới, guest + customer đều dùng được.
// sessionKey lưu localStorage để giữ hội thoại giữa các lần mở lại trang.
// Đã đăng nhập thì cookie session customer tự gửi theo (credentials: "include").
// Màu sắc dùng đúng design tokens của site (variables.css): navy + gold.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SESSION_KEY_STORAGE = "vietpeace.chatbot.session_key";
const HISTORY_STORAGE_PREFIX = "vietpeace.chatbot.history.";

function getSessionKey() {
    let sessionKey = localStorage.getItem(SESSION_KEY_STORAGE);
    if (!sessionKey) {
        sessionKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(SESSION_KEY_STORAGE, sessionKey);
    }
    return sessionKey;
}

const GREETING = {
    from: "bot",
    text: "Xin chào! Mình là trợ lý VietPeace Stay. Bạn có thể hỏi về cơ sở lưu trú, phòng, giá, booking hoặc thanh toán nhé!",
};

export default function ChatWidget() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [sessionKey] = useState(() => getSessionKey());
    const sessionKeyRef = useRef(sessionKey);
    const historyStorageKey = `${HISTORY_STORAGE_PREFIX}${sessionKey}`;
    const [messages, setMessages] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(historyStorageKey) || "null");
            return Array.isArray(stored) && stored.length > 0 ? stored : [GREETING];
        } catch {
            return [GREETING];
        }
    });
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem(historyStorageKey, JSON.stringify(messages.slice(-100)));
        } catch {
            // Không làm gián đoạn chat nếu localStorage bị đầy hoặc bị chặn.
        }
    }, [historyStorageKey, messages]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, open]);

    async function sendMessage() {
        const content = input.trim();
        if (!content || sending) {
            return;
        }

        setInput("");
        setMessages((prev) => [...prev, { from: "user", text: content }]);
        setSending(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionKey: sessionKeyRef.current, content }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok || !payload?.success) {
                setMessages((prev) => [
                    ...prev,
                    { from: "bot", text: payload?.message || "Có lỗi xảy ra. Bạn thử lại giúp mình nhé!", error: true },
                ]);
                return;
            }

            let text = payload.data.reply;
            if (payload.data.ticket_code) {
                text = `${text}\n(Mã yêu cầu: ${payload.data.ticket_code})`;
            }
            setMessages((prev) => [
                ...prev,
                {
                    from: "bot",
                    text,
                    accommodations: payload.data.accommodations || null,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "Không kết nối được hệ thống. Bạn kiểm tra mạng rồi thử lại nhé!", error: true },
            ]);
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            {/* Bubble mở chat */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    position: "fixed",
                    right: 24,
                    bottom: 24,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: open ? "1px solid var(--color-sunshine)" : "none",
                    background: open ? "var(--color-navy-dark)" : "var(--color-navy)",
                    color: "var(--color-sunshine)",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(23, 42, 60, 0.35)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-navy-dark)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = open ? "var(--color-navy-dark)" : "var(--color-navy)"; }}
                aria-label={open ? "Đóng chat hỗ trợ" : "Mở chat hỗ trợ"}
                title="Hỗ trợ VietPeace Stay"
            >
                {open ? <X size={24} strokeWidth={2} /> : <MessageCircle size={26} strokeWidth={2} />}
            </button>

            {/* Panel chat */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        right: 24,
                        bottom: 92,
                        width: 340,
                        maxWidth: "calc(100vw - 40px)",
                        height: 460,
                        maxHeight: "calc(100vh - 130px)",
                        background: "var(--color-white)",
                        borderRadius: 14,
                        boxShadow: "0 12px 40px rgba(23, 42, 60, 0.28)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 1000,
                        border: "1px solid var(--color-border)",
                    }}
                >
                    {/* Header panel: navy + gold như brand */}
                    <div
                        style={{
                            background: "var(--color-navy)",
                            color: "var(--color-white)",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "var(--color-sunshine)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--color-navy-dark)",
                                flexShrink: 0,
                            }}
                        >
                            <MessageCircle size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Hỗ trợ VietPeace Stay</div>
                            <div style={{ fontSize: 11, color: "var(--color-sunshine-light)", marginTop: 2 }}>
                                Trả lời tự động • Nhân viên luôn sẵn sàng
                            </div>
                        </div>
                    </div>

                    <div
                        ref={listRef}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: 12,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            background: "var(--color-ivory)",
                        }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                                    maxWidth: "85%",
                                    background: msg.error
                                        ? "var(--color-rose-bg)"
                                        : msg.from === "user"
                                            ? "var(--color-navy)"
                                            : "var(--color-white)",
                                    color: msg.error
                                        ? "var(--color-rose-text)"
                                        : msg.from === "user"
                                            ? "var(--color-white)"
                                            : "var(--color-navy-dark)",
                                    border: msg.error
                                        ? "1px solid var(--color-rose-border)"
                                        : "1px solid var(--color-border)",
                                    borderRadius: 12,
                                    borderBottomLeftRadius: msg.from === "user" ? 12 : 4,
                                    borderBottomRightRadius: msg.from === "user" ? 4 : 12,
                                    padding: "9px 12px",
                                    fontSize: 14,
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.45,
                                }}
                            >
                                {msg.text}
                                {msg.accommodations?.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                                        {msg.accommodations.map((acc) => (
                                            <button
                                                key={acc.id}
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    navigate(`/accommodation-detail?accommodationId=${acc.id}`);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    background: "var(--color-ivory)",
                                                    border: "1px solid var(--color-sunshine)",
                                                    borderRadius: 8,
                                                    padding: "7px 10px",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: "var(--color-navy)",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-sunshine-light)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-ivory)"; }}
                                            >
                                                <Hotel size={15} style={{ flexShrink: 0, color: "var(--color-sunshine-hover)" }} />
                                                Xem chi tiết: {acc.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {sending && (
                            <div style={{ alignSelf: "flex-start", fontSize: 13, color: "var(--color-slate)" }}>
                                Đang soạn trả lời...
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", borderTop: "1px solid var(--color-border)", background: "var(--color-white)" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                            placeholder="Nhập câu hỏi của bạn..."
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                padding: "12px 14px",
                                fontSize: 14,
                                fontFamily: "inherit",
                                color: "var(--color-navy-dark)",
                            }}
                            disabled={sending}
                        />
                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={sending || !input.trim()}
                            style={{
                                border: "none",
                                background: sending || !input.trim() ? "var(--color-border)" : "var(--color-sunshine)",
                                color: sending || !input.trim() ? "var(--color-slate)" : "var(--color-navy-dark)",
                                padding: "0 18px",
                                cursor: sending || !input.trim() ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                            }}
                            aria-label="Gửi tin nhắn"
                        >
                            <Send size={17} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
