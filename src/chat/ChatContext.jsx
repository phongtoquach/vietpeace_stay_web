import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AuthContext from "../context/AuthContext";
import { webChatClient } from "./ChatClient";
import { usePageChatContext } from "./usePageChatContext";

const ChatContext = createContext(null);

function makeClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ChatProvider({ children }) {
  const { currentLoggedInUser, isCheckingAuthen } = useContext(AuthContext) || {};
  const pageContext = usePageChatContext();

  const stableCustomerId = currentLoggedInUser?.id ? String(currentLoggedInUser.id) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [actor, setActor] = useState(null);
  const [greetingText, setGreetingText] = useState("");
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [streamingByConv, setStreamingByConv] = useState({});
  const [typingByConv, setTypingByConv] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [handoffGuideState, setHandoffGuideState] = useState({ open: false });
  const [socketConnected, setSocketConnected] = useState(false);

  const isOpenRef = useRef(isOpen);
  const activeIdRef = useRef(activeConversationId);
  const actorRef = useRef(actor);
  const pageContextRef = useRef(pageContext);
  const prevCustomerIdRef = useRef(undefined);
  const lastReadSentRef = useRef({});
  const lastDeliveredSentRef = useRef({});

  useEffect(() => {
    isOpenRef.current = isOpen;
    activeIdRef.current = activeConversationId;
    actorRef.current = actor;
    pageContextRef.current = pageContext;
  }, [isOpen, activeConversationId, actor, pageContext]);

  const upsertConversation = useCallback((conv) => {
    if (!conv || !conv.id) return;
    setConversations((prev) => {
      const cid = Number(conv.id);
      const exists = prev.some((c) => Number(c.id) === cid);
      const next = exists
        ? prev.map((c) => (Number(c.id) === cid ? { ...c, ...conv } : c))
        : [conv, ...prev];
      return [...next].sort(
        (a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0),
      );
    });
  }, []);

  const appendOrReplaceMessage = useCallback((cid, msg) => {
    if (!cid || !msg) return;
    const convId = Number(cid);
    setMessagesByConv((prev) => {
      const list = prev[convId] || [];
      if (msg.clientMessageId) {
        const idxByClient = list.findIndex(
          (m) => m.clientMessageId && m.clientMessageId === msg.clientMessageId,
        );
        if (idxByClient !== -1) {
          const updated = [...list];
          updated[idxByClient] = { ...msg, localStatus: undefined };
          return { ...prev, [convId]: updated };
        }
      }
      if (msg.id && list.some((m) => Number(m.id) === Number(msg.id))) {
        return {
          ...prev,
          [convId]: list.map((m) => (Number(m.id) === Number(msg.id) ? { ...m, ...msg } : m)),
        };
      }
      const next = [...list, msg].sort((a, b) => {
        const sa = Number(a.sequence || Number.MAX_SAFE_INTEGER);
        const sb = Number(b.sequence || Number.MAX_SAFE_INTEGER);
        return sa - sb;
      });
      return { ...prev, [convId]: next };
    });
  }, []);

  const syncReadIfVisible = useCallback(async (cid, maxSequence) => {
    if (!cid || !maxSequence) return;
    if (!isOpenRef.current || Number(activeIdRef.current) !== Number(cid)) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    const prevSent = Number(lastReadSentRef.current[cid] || 0);
    if (maxSequence <= prevSent) return;
    lastReadSentRef.current[cid] = maxSequence;
    try {
      await webChatClient.markRead(cid, maxSequence);
      setConversations((prev) =>
        prev.map((c) => (Number(c.id) === Number(cid) ? { ...c, unreadCount: 0 } : c)),
      );
    } catch {
      // retry next trigger
    }
  }, []);

  const syncDelivered = useCallback(async (cid, maxSequence) => {
    if (!cid || !maxSequence) return;
    const prevSent = Number(lastDeliveredSentRef.current[cid] || 0);
    if (maxSequence <= prevSent) return;
    lastDeliveredSentRef.current[cid] = maxSequence;
    try {
      await webChatClient.markDelivered(cid, maxSequence);
    } catch {
      // ignore
    }
  }, []);

  const loadConversationMessages = useCallback(
    async (cid) => {
      if (!cid) return [];
      const res = await webChatClient.getMessages(cid, { limit: 60 });
      const items = res.items || [];
      setMessagesByConv((prev) => ({ ...prev, [Number(cid)]: items }));
      const maxSeq = items.reduce((m, x) => Math.max(m, Number(x.sequence || 0)), 0);
      if (maxSeq > 0) {
        syncDelivered(cid, maxSeq);
        syncReadIfVisible(cid, maxSeq);
      }
      return items;
    },
    [syncDelivered, syncReadIfVisible],
  );

  const attachSocketListeners = useCallback(
    (socket) => {
      socket.on("connect", () => {
        setSocketConnected(true);
        webChatClient.syncDeliveredAll().catch(() => {});
        const curId = activeIdRef.current;
        if (curId) {
          socket.emit("conversation:join", { conversationId: curId });
        }
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      socket.on("conversation:updated", ({ conversation, notification }) => {
        if (conversation) {
          upsertConversation(conversation);
        }
        if (notification) {
          setStatusNotice(notification);
        }
      });

      socket.on("message:created", ({ conversationId, message }) => {
        if (!conversationId || !message) return;
        const cid = Number(conversationId);
        appendOrReplaceMessage(cid, message);

        // Stop streaming bubble once finalized AI message lands
        if (message.senderType === "AI") {
          setStreamingByConv((prev) => {
            if (!prev[cid]) return prev;
            const copy = { ...prev };
            delete copy[cid];
            return copy;
          });
        }

        const seq = Number(message.sequence || 0);
        const isCounterparty =
          message.senderType !== "CUSTOMER" &&
          message.senderType !== "GUEST" &&
          message.senderActorKey !== actorRef.current?.actorKey;

        if (seq > 0) {
          syncDelivered(cid, seq);
          if (isOpenRef.current && Number(activeIdRef.current) === cid && document.visibilityState === "visible") {
            syncReadIfVisible(cid, seq);
          } else if (isCounterparty) {
            setConversations((prev) =>
              prev.map((c) =>
                Number(c.id) === cid
                  ? {
                      ...c,
                      lastSequence: Math.max(Number(c.lastSequence || 0), seq),
                      lastMessagePreview: message.content?.slice(0, 120) || c.lastMessagePreview,
                      lastMessageAt: message.createdAt || c.lastMessageAt,
                      unreadCount: Number(c.unreadCount || 0) + 1,
                    }
                  : c,
              ),
            );
          }
        }
      });

      socket.on("message:delivery-updated", (payload) => {
        if (!payload?.conversationId) return;
        if (payload.actorRole !== "ACCOMMODATION_MANAGER") return;
        const cid = Number(payload.conversationId);
        setConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === cid
              ? {
                  ...c,
                  counterpartyDelivery: {
                    ...(c.counterpartyDelivery || {}),
                    deliveredSequence: Math.max(
                      Number(c.counterpartyDelivery?.deliveredSequence || 0),
                      Number(payload.deliveredSequence || 0),
                    ),
                    deliveredAt: payload.deliveredAt || c.counterpartyDelivery?.deliveredAt || null,
                    readSequence: Math.max(
                      Number(c.counterpartyDelivery?.readSequence || 0),
                      Number(payload.readSequence || 0),
                    ),
                    readAt: payload.readAt || c.counterpartyDelivery?.readAt || null,
                  },
                }
              : c,
          ),
        );
      });

      socket.on("message:read-updated", (payload) => {
        if (!payload?.conversationId) return;
        if (payload.actorRole !== "ACCOMMODATION_MANAGER") return;
        const cid = Number(payload.conversationId);
        setConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === cid
              ? {
                  ...c,
                  counterpartyDelivery: {
                    ...(c.counterpartyDelivery || {}),
                    deliveredSequence: Math.max(
                      Number(c.counterpartyDelivery?.deliveredSequence || 0),
                      Number(payload.deliveredSequence || 0),
                    ),
                    deliveredAt: payload.deliveredAt || c.counterpartyDelivery?.deliveredAt || null,
                    readSequence: Math.max(
                      Number(c.counterpartyDelivery?.readSequence || 0),
                      Number(payload.readSequence || 0),
                    ),
                    readAt: payload.readAt || c.counterpartyDelivery?.readAt || null,
                  },
                }
              : c,
          ),
        );
      });

      socket.on("ai:started", ({ conversationId, runId }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => ({
          ...prev,
          [cid]: { runId, text: "", startedAt: Date.now() },
        }));
      });

      socket.on("ai:delta", ({ conversationId, runId, delta }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => ({
          ...prev,
          [cid]: {
            runId,
            text: `${prev[cid]?.text || ""}${delta || ""}`,
            startedAt: prev[cid]?.startedAt || Date.now(),
          },
        }));
      });

      socket.on("ai:completed", ({ conversationId, guestAiCloseAt, messages }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => {
          const copy = { ...prev };
          delete copy[cid];
          return copy;
        });
        if (Array.isArray(messages)) {
          for (const m of messages) appendOrReplaceMessage(cid, m);
        }
        if (guestAiCloseAt) {
          setConversations((prev) =>
            prev.map((c) => (Number(c.id) === cid ? { ...c, guestAiCloseAt } : c)),
          );
        }
      });

      socket.on("ai:cancelled", ({ conversationId }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => {
          const copy = { ...prev };
          delete copy[cid];
          return copy;
        });
      });

      socket.on("ai:failed", ({ conversationId, message }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => {
          const copy = { ...prev };
          delete copy[cid];
          return copy;
        });
        if (message) {
          setStatusNotice(message);
        }
      });

      socket.on("typing:update", ({ conversationId, actorName, isTyping }) => {
        const cid = Number(conversationId);
        setTypingByConv((prev) => ({
          ...prev,
          [cid]: isTyping ? actorName || "Quản lý" : null,
        }));
      });

      socket.on("handoff:missed", ({ conversationId, message }) => {
        setStatusNotice(
          message ||
            "Quản lý chưa tiếp nhận yêu cầu trong 5 phút. Hệ thống đã ghi nhận báo cáo và chuyển về trạng thái phù hợp.",
        );
        if (conversationId) {
          webChatClient
            .getConversationDetail(conversationId)
            .then((conv) => upsertConversation(conv))
            .catch(() => {});
        }
      });

      socket.on("conversation:expired", ({ conversationId, reason, message }) => {
        const cid = Number(conversationId);
        setConversations((prev) => prev.filter((c) => Number(c.id) !== cid));
        setMessagesByConv((prev) => {
          const copy = { ...prev };
          delete copy[cid];
          return copy;
        });
        setStreamingByConv((prev) => {
          const copy = { ...prev };
          delete copy[cid];
          return copy;
        });
        if (Number(activeIdRef.current) === cid) {
          setActiveConversationId(null);
        }
        setStatusNotice(
          message ||
            (reason === "MANAGER_WAIT_TIMEOUT"
              ? "Quản lý cơ sở chưa phản hồi trong 5 phút. Phiên trò chuyện tạm thời đã được đóng và xóa sạch theo chính sách ẩn danh."
              : "Phiên trò chuyện tạm thời đã tự động kết thúc và xóa sạch dữ liệu sau khi không hoạt động."),
        );
      });

      socket.on("access:revoked", () => {
        webChatClient.disconnectSocket();
        setSocketConnected(false);
      });
    },
    [appendOrReplaceMessage, syncDelivered, syncReadIfVisible, upsertConversation],
  );

  const ensureRealtimeConnected = useCallback(async () => {
    const socket = await webChatClient.connectSocket();
    if (!socket._vpsListenersAttached) {
      attachSocketListeners(socket);
      socket._vpsListenersAttached = true;
    }
    return socket;
  }, [attachSocketListeners]);

  const hydrateChatSession = useCallback(
    async ({ shouldClaimGuest = false } = {}) => {
      try {
        if (shouldClaimGuest) {
          await webChatClient.claimGuestConversations().catch(() => {});
        }
        const boot = await webChatClient.bootstrap();
        setActor(boot.actor || null);
        setGreetingText(boot.greetingText || "");
        setFeaturedLocations(boot.featuredLocations || []);
        const list = boot.conversations || [];
        setConversations(list);

        if (boot.actor) {
          await ensureRealtimeConnected().catch(() => {});
        }

        if (list.length > 0 && !activeIdRef.current) {
          const first = list[0];
          setActiveConversationId(first.id);
        } else if (activeIdRef.current && !list.some((c) => Number(c.id) === Number(activeIdRef.current))) {
          setActiveConversationId(list[0]?.id || null);
        }
      } catch (err) {
        console.error("[ChatContext.hydrate]", err);
      }
    },
    [ensureRealtimeConnected],
  );

  // Key chat initialization strictly on stable user identity, never tearing down during isCheckingAuthen
  useEffect(() => {
    if (isCheckingAuthen) return;
    const prevId = prevCustomerIdRef.current;
    const changed = prevId !== undefined && prevId !== stableCustomerId;
    prevCustomerIdRef.current = stableCustomerId;
    let active = true;

    async function syncIdentity() {
      await Promise.resolve();
      if (!active) return;
      if (changed) {
        webChatClient.disconnectSocket();
        setSocketConnected(false);
        lastReadSentRef.current = {};
        lastDeliveredSentRef.current = {};
        if (!stableCustomerId) {
          // Customer logged out -> reset old private threads
          setConversations([]);
          setMessagesByConv({});
          setActiveConversationId(null);
        }
      }
      const becameCustomer = changed && Boolean(stableCustomerId);
      await hydrateChatSession({ shouldClaimGuest: becameCustomer || Boolean(stableCustomerId) });
    }

    syncIdentity();
    return () => {
      active = false;
    };
  }, [isCheckingAuthen, stableCustomerId, hydrateChatSession]);

  // Open or focus widget with current page context
  const openChatWidget = useCallback(
    async ({ forceContextCard = false, scopeType = null, accommodationId = null, autoRequestHandoff = false } = {}) => {
      setIsOpen(true);
      setHandoffGuideState({ open: false });
      setLoading(true);
      try {
        const ctxNow = pageContextRef.current;
        const resolvedScope =
          scopeType ||
          (accommodationId || ctxNow.pageType === "ACCOMMODATION_DETAIL" ? "PROPERTY" : "PLATFORM");
        const resolvedAccomId =
          resolvedScope === "PROPERTY" ? accommodationId || ctxNow.accommodationId : null;

        const openRes = await webChatClient.openOrReuseConversation({
          scopeType: resolvedScope,
          accommodationId: resolvedAccomId,
          bookingId: ctxNow.bookingId || undefined,
          clientRequestId: makeClientId(),
          pageContext: {
            ...ctxNow,
            accommodationId: resolvedAccomId || ctxNow.accommodationId,
            attachContextCard: forceContextCard ? true : ctxNow.pageType !== "HOME",
          },
        });

        setActor((prev) => prev || { type: stableCustomerId ? "CUSTOMER" : "GUEST" });
        upsertConversation(openRes.conversation);
        setActiveConversationId(openRes.conversation.id);
        setMessagesByConv((prev) => ({
          ...prev,
          [Number(openRes.conversation.id)]: openRes.messages || [],
        }));

        const socket = await ensureRealtimeConnected().catch(() => null);
        if (socket && socket.connected) {
          socket.emit("conversation:join", { conversationId: openRes.conversation.id });
        }

        const maxSeq = (openRes.messages || []).reduce((m, x) => Math.max(m, Number(x.sequence || 0)), 0);
        if (maxSeq > 0) {
          syncReadIfVisible(openRes.conversation.id, maxSeq);
        }

        if (autoRequestHandoff && resolvedScope === "PROPERTY") {
          const handoffRes = await webChatClient.requestHandoff(openRes.conversation.id, {
            reason: "Khách yêu cầu gặp Quản lý trực tiếp từ trang chi tiết cơ sở",
          });
          if (handoffRes?.conversation) {
            upsertConversation(handoffRes.conversation);
          }
          await loadConversationMessages(openRes.conversation.id);
        }

        return openRes.conversation;
      } catch (err) {
        setStatusNotice(err.message || "Không thể mở hội thoại lúc này.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [stableCustomerId, upsertConversation, ensureRealtimeConnected, syncReadIfVisible, loadConversationMessages],
  );

  // When widget is already open and user navigates to a new location / hotel / booking, sync context cleanly
  useEffect(() => {
    if (!isOpen || !activeConversationId || !actor) return;
    const conv = conversations.find((c) => Number(c.id) === Number(activeConversationId));
    if (!conv || conv.status !== "OPEN") return;
    if (pageContext.contextKey === "HOME") return;
    if (conv.context?.lastAttachedContextKey === pageContext.contextKey) return;

    // For a PROPERTY conversation, only sync if viewing same accommodation; if user moved to a different property, show choice pill / allow auto-attach only on PLATFORM or matching property
    if (
      conv.scopeType === "PROPERTY" &&
      pageContext.pageType === "ACCOMMODATION_DETAIL" &&
      Number(conv.accommodationId) !== Number(pageContext.accommodationId)
    ) {
      return;
    }

    webChatClient
      .updateContext(conv.id, { ...pageContext, attachContextCard: true })
      .then((updated) => {
        upsertConversation(updated);
      })
      .catch(() => {});
  }, [isOpen, activeConversationId, actor, pageContext, conversations, upsertConversation]);

  // Load messages and join room when switching active conversation while widget is open
  useEffect(() => {
    if (!isOpen || !activeConversationId) return;
    const cid = Number(activeConversationId);
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      loadConversationMessages(cid).catch(() => {});
      if (webChatClient.socket?.connected) {
        webChatClient.socket.emit("conversation:join", { conversationId: cid });
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, activeConversationId, loadConversationMessages]);

  // Read sync on tab focus / visibility change
  useEffect(() => {
    function onVisibleOrFocus() {
      if (!isOpenRef.current || !activeIdRef.current) return;
      if (document.visibilityState !== "visible") return;
      const msgs = messagesByConv[Number(activeIdRef.current)] || [];
      const maxSeq = msgs.reduce((m, x) => Math.max(m, Number(x.sequence || 0)), 0);
      if (maxSeq > 0) {
        syncReadIfVisible(activeIdRef.current, maxSeq);
      }
    }
    window.addEventListener("focus", onVisibleOrFocus);
    document.addEventListener("visibilitychange", onVisibleOrFocus);
    return () => {
      window.removeEventListener("focus", onVisibleOrFocus);
      document.removeEventListener("visibilitychange", onVisibleOrFocus);
    };
  }, [messagesByConv, syncReadIfVisible]);

  const sendMessage = useCallback(
    async (text) => {
      const clean = String(text || "").trim();
      if (!clean) return;

      let cid = activeIdRef.current;
      if (!cid) {
        const opened = await openChatWidget();
        cid = opened?.id;
        if (!cid) return;
      }

      const clientMessageId = makeClientId();
      const optimisticMsg = {
        id: `temp-${clientMessageId}`,
        conversationId: Number(cid),
        sequence: Number.MAX_SAFE_INTEGER - Math.floor(Math.random() * 1000),
        senderActorKey: actorRef.current?.actorKey || "self",
        senderType: stableCustomerId ? "CUSTOMER" : "GUEST",
        messageType: "TEXT",
        visibility: "PUBLIC",
        content: clean,
        clientMessageId,
        createdAt: new Date().toISOString(),
        localStatus: "sending",
      };

      appendOrReplaceMessage(cid, optimisticMsg);

      try {
        const res = await webChatClient.sendMessage(cid, {
          content: clean,
          clientMessageId,
        });
        if (res?.message) {
          appendOrReplaceMessage(cid, res.message);
        }
        if (res?.conversation) {
          upsertConversation(res.conversation);
        }
      } catch (err) {
        setMessagesByConv((prev) => ({
          ...prev,
          [Number(cid)]: (prev[Number(cid)] || []).map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, localStatus: "failed" } : m,
          ),
        }));
        setStatusNotice(err.message || "Không thể gửi tin nhắn.");
      }
    },
    [stableCustomerId, openChatWidget, appendOrReplaceMessage, upsertConversation],
  );

  const selectDestinationInChat = useCallback(
    async (locationObj) => {
      if (!locationObj?.id) return;
      let cid = activeIdRef.current;
      if (!cid) {
        const opened = await openChatWidget();
        cid = opened?.id;
        if (!cid) return;
      }
      const updated = await webChatClient.updateContext(cid, {
        pageType: "LOCATION_SEARCH",
        locationId: Number(locationObj.id),
        checkin: pageContextRef.current.checkin,
        checkout: pageContextRef.current.checkout,
        rooms: pageContextRef.current.rooms,
        adults: pageContextRef.current.adults,
        children: pageContextRef.current.children,
        attachContextCard: true,
      });
      upsertConversation(updated);
      await loadConversationMessages(cid);
    },
    [openChatWidget, upsertConversation, loadConversationMessages],
  );

  const selectPropertyInChat = useCallback(
    async (accommodationId, { autoHandoff = false } = {}) => {
      return openChatWidget({
        scopeType: "PROPERTY",
        accommodationId: Number(accommodationId),
        forceContextCard: true,
        autoRequestHandoff: autoHandoff,
      });
    },
    [openChatWidget],
  );

  const requestHumanHandoff = useCallback(async () => {
    let cid = activeIdRef.current;
    if (!cid) {
      const opened = await openChatWidget();
      cid = opened?.id;
    }
    if (!cid) return;

    const conv = conversations.find((c) => Number(c.id) === Number(cid));
    if (!conv || conv.scopeType !== "PROPERTY" || !conv.accommodationId) {
      // Polite guided flow on HOME/SEARCH: Step 1 Destination -> Step 2 Property
      setHandoffGuideState({ open: true });
      return;
    }

    setLoading(true);
    try {
      const res = await webChatClient.requestHandoff(cid, {
        reason: "Khách yêu cầu kết nối Quản lý cơ sở",
      });
      if (res?.conversation) {
        upsertConversation(res.conversation);
      }
      if (res?.message && res?.supported === false) {
        setStatusNotice(res.message);
      }
      await loadConversationMessages(cid);
    } catch (err) {
      if (err.errorCode === "PROPERTY_SELECTION_REQUIRED") {
        setHandoffGuideState({ open: true });
      } else {
        setStatusNotice(err.message || "Không thể kết nối Quản lý lúc này.");
      }
    } finally {
      setLoading(false);
    }
  }, [conversations, openChatWidget, upsertConversation, loadConversationMessages]);

  const cancelHumanHandoff = useCallback(async () => {
    const cid = activeIdRef.current;
    if (!cid) return;
    setLoading(true);
    try {
      const res = await webChatClient.cancelHandoff(cid);
      if (res?.conversation) upsertConversation(res.conversation);
      await loadConversationMessages(cid);
    } catch (err) {
      setStatusNotice(err.message || "Không thể hủy yêu cầu kết nối.");
    } finally {
      setLoading(false);
    }
  }, [upsertConversation, loadConversationMessages]);

  const endGuestSession = useCallback(async () => {
    const cid = activeIdRef.current;
    if (!cid) return;
    setLoading(true);
    try {
      await webChatClient.endGuestConversation(cid);
      setConversations((prev) => prev.filter((c) => Number(c.id) !== Number(cid)));
      setMessagesByConv((prev) => {
        const copy = { ...prev };
        delete copy[Number(cid)];
        return copy;
      });
      setActiveConversationId(null);
      setStatusNotice("Phiên trò chuyện tạm thời đã được kết thúc và xóa sạch khỏi hệ thống.");
    } catch (err) {
      setStatusNotice(err.message || "Không thể kết thúc phiên trò chuyện.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRating = useCallback(
    async (handoffId, { rating, comment }) => {
      const res = await webChatClient.submitRating(handoffId, { rating, comment });
      if (activeIdRef.current) {
        setConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === Number(activeIdRef.current) ? { ...c, hasRatedHandoff: true } : c,
          ),
        );
      }
      setStatusNotice("Cảm ơn bạn đã gửi đánh giá chất lượng phục vụ!");
      return res;
    },
    [],
  );

  const emitTyping = useCallback((isTyping) => {
    if (!activeIdRef.current || !webChatClient.socket?.connected) return;
    webChatClient.socket.emit("typing:update", {
      conversationId: activeIdRef.current,
      isTyping: Boolean(isTyping),
    });
  }, []);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0),
    [conversations],
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => Number(c.id) === Number(activeConversationId)) || null,
    [conversations, activeConversationId],
  );

  const activeMessages = useMemo(
    () => (activeConversationId ? messagesByConv[Number(activeConversationId)] || [] : []),
    [messagesByConv, activeConversationId],
  );

  const activeStreaming = activeConversationId
    ? streamingByConv[Number(activeConversationId)] || null
    : null;

  const activeTypingName = activeConversationId
    ? typingByConv[Number(activeConversationId)] || null
    : null;

  const value = {
    isOpen,
    setIsOpen,
    openChatWidget,
    closeChatWidget: () => setIsOpen(false),
    actor,
    isAuthenticatedCustomer: Boolean(stableCustomerId),
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
    socketConnected,
    statusNotice,
    clearStatusNotice: () => setStatusNotice(""),
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}

export default ChatContext;
