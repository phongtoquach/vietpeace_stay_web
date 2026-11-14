import { io } from "socket.io-client";

const BACKEND_BASE = (import.meta.env?.VITE_BACKEND_APP_BASE_URL || "http://localhost:3002").replace(/\/+$/, "");
const CHAT_API_BASE = `${BACKEND_BASE}/api/web/chat`;

async function request(path, { method = "GET", body = null } = {}) {
  const opts = {
    method,
    credentials: "include",
    headers: {},
  };
  if (body !== null) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${CHAT_API_BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || `Chat API failed (${res.status})`);
    err.statusCode = res.status;
    err.errorCode = json.errorCode || "CHAT_API_ERROR";
    err.data = json.data || null;
    throw err;
  }
  return json.data;
}

export class WebChatClient {
  constructor() {
    this.socket = null;
    this.connectingPromise = null;
    this.connectionVersion = 0;
  }

  bootstrap() {
    return request("/bootstrap");
  }

  ensureGuestSession() {
    return request("/guest-session", { method: "POST", body: {} });
  }

  getSocketTicket() {
    return request("/socket-ticket", { method: "POST", body: {} });
  }

  claimGuestConversations() {
    return request("/claim-guest-conversations", { method: "POST", body: {} });
  }

  getHandoffDestinations() {
    return request("/handoff-guide/destinations");
  }

  getHandoffAccommodations(locationId) {
    const qs = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
    return request(`/handoff-guide/accommodations${qs}`);
  }

  listConversations() {
    return request("/conversations");
  }

  openOrReuseConversation(body) {
    return request("/conversations", { method: "POST", body });
  }

  getConversationDetail(conversationId) {
    return request(`/conversations/${conversationId}`);
  }

  updateContext(conversationId, pageContext) {
    return request(`/conversations/${conversationId}/context`, { method: "POST", body: pageContext });
  }

  getMessages(conversationId, { limit = 50, beforeSequence = null } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (beforeSequence) params.set("beforeSequence", String(beforeSequence));
    return request(`/conversations/${conversationId}/messages?${params.toString()}`);
  }

  sendMessage(conversationId, body) {
    return request(`/conversations/${conversationId}/messages`, { method: "POST", body });
  }

  transferScopeOrReopen(conversationId, body) {
    return request(`/conversations/${conversationId}/transfer`, { method: "POST", body });
  }

  reopenConversation(conversationId) {
    return request(`/conversations/${conversationId}/reopen`, { method: "POST", body: {} });
  }

  endGuestConversation(conversationId) {
    return request(`/conversations/${conversationId}/end-guest`, { method: "POST", body: {} });
  }

  requestHandoff(conversationId, body = {}) {
    return request(`/conversations/${conversationId}/handoff`, { method: "POST", body });
  }

  cancelHandoff(conversationId) {
    return request(`/conversations/${conversationId}/cancel-handoff`, { method: "POST", body: {} });
  }

  returnToAi(conversationId) {
    return request(`/conversations/${conversationId}/return-ai`, { method: "POST", body: {} });
  }

  markDelivered(conversationId, sequence) {
    return request(`/conversations/${conversationId}/delivered`, { method: "POST", body: { sequence } });
  }

  syncDeliveredAll() {
    return request("/conversations/delivered-sync", { method: "POST", body: {} });
  }

  markRead(conversationId, sequence) {
    return request(`/conversations/${conversationId}/read`, { method: "POST", body: { sequence } });
  }

  submitRating(handoffId, { rating, comment }) {
    return request(`/handoffs/${handoffId}/rating`, {
      method: "POST",
      body: { rating, comment },
    });
  }

  getConversationRatings(conversationId) {
    return request(`/conversations/${conversationId}/ratings`);
  }

  async connectSocket() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    const version = this.connectionVersion;
    const connectingPromise = (async () => {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const { ticket } = await this.getSocketTicket();
      if (version !== this.connectionVersion) {
        throw Object.assign(new Error("Phiên kết nối chat đã thay đổi."), { errorCode: "CHAT_CONNECTION_CANCELLED" });
      }
      let pendingInitialTicket = ticket;

      const socket = io(`${BACKEND_BASE}/chat`, {
        path: "/socket.io",
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: (cb) => {
          if (pendingInitialTicket) {
            const first = pendingInitialTicket;
            pendingInitialTicket = null;
            cb({ ticket: first });
            return;
          }
          this.getSocketTicket()
            .then((refreshed) => {
              cb({ ticket: refreshed?.ticket || "" });
            })
            .catch(() => {
              cb({});
            });
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1500,
        reconnectionDelayMax: 8000,
      });

      this.socket = socket;
      return socket;
    })();
    this.connectingPromise = connectingPromise;

    try {
      return await connectingPromise;
    } finally {
      if (this.connectingPromise === connectingPromise) this.connectingPromise = null;
    }
  }

  disconnectSocket() {
    this.connectionVersion += 1;
    this.connectingPromise = null;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitAck(eventName, payload) {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({ ok: false, offline: true });
        return;
      }
      this.socket.timeout(6000).emit(eventName, payload, (err, res) => {
        if (err) {
          resolve({ ok: false, timeout: true });
          return;
        }
        resolve(res || { ok: false });
      });
    });
  }
}

export const webChatClient = new WebChatClient();
