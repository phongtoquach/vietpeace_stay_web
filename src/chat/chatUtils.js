const BACKEND_BASE = (import.meta.env.VITE_BACKEND_APP_BASE_URL || "http://localhost:3002").replace(/\/+$/, "");

export function resolveMediaUrl(path) {
  if (!path) return "";
  const str = String(path).trim();
  if (!str) return "";
  if (/^https?:\/\//i.test(str) || str.startsWith("//") || str.startsWith("data:")) return str;
  return `${BACKEND_BASE}/${str.replace(/^\/+/, "")}`;
}

export function formatVnd(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "Liên hệ";
  return `${Math.round(num).toLocaleString("vi-VN")} ₫`;
}

export function formatClockTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function formatFullDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCountdownSeconds(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Compute delivery/read status label & tooltip for an outgoing user message
 * in a conversation with a Manager (WAITING_HUMAN / HUMAN / RESOLVED).
 */
export function getOutgoingReceiptMeta(msg, counterpartyDelivery) {
  if (!msg) return null;
  if (msg.localStatus === "sending") {
    return {
      state: "SENDING",
      label: "Đang gửi…",
      tooltip: "Đang gửi tin nhắn lên máy chủ…",
    };
  }
  if (msg.localStatus === "failed") {
    return {
      state: "FAILED",
      label: "Gửi thất bại",
      tooltip: "Không thể gửi tin nhắn. Vui lòng thử gửi lại.",
    };
  }

  const seq = Number(msg.sequence || 0);
  const readSeq = Number(counterpartyDelivery?.readSequence || 0);
  const delivSeq = Number(counterpartyDelivery?.deliveredSequence || 0);

  if (seq > 0 && readSeq >= seq) {
    return {
      state: "READ",
      label: "Đã xem",
      tooltip: counterpartyDelivery?.readAt
        ? `Quản lý đã xem lúc ${formatFullDateTime(counterpartyDelivery.readAt)}`
        : "Quản lý đã xem",
    };
  }

  if (seq > 0 && delivSeq >= seq) {
    return {
      state: "DELIVERED",
      label: "Đã nhận",
      tooltip: counterpartyDelivery?.deliveredAt
        ? `Thiết bị Quản lý đã nhận lúc ${formatFullDateTime(counterpartyDelivery.deliveredAt)}`
        : "Thiết bị Quản lý đã nhận",
    };
  }

  return {
    state: "SENT",
    label: "Đã gửi",
    tooltip: msg.createdAt ? `Đã gửi lên hệ thống lúc ${formatFullDateTime(msg.createdAt)}` : "Đã gửi",
  };
}
