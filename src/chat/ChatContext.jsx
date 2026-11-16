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
import { lastServerSequence, mergeChatMessages, updateAiStream } from "./chatState";

const ChatContext = createContext(null);

function makeClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Decide initial HandoffGuideCard view from discussed properties & active location context. */
function resolveHandoffGuideState(conv, convMessages = []) {
  const ctx = conv?.context || {};
  let discussed = Array.isArray(ctx.discussedAccommodations)
    ? ctx.discussedAccommodations.filter((x) => Number(x?.accommodationId) > 0)
    : [];

  // Fallback for legacy conversations before backend context tracking: inspect quote cards newest-first
  if (discussed.length === 0 && Array.isArray(convMessages) && convMessages.length > 0) {
    const seen = new Set();
    const extracted = [];
    for (let i = convMessages.length - 1; i >= 0; i -= 1) {
      const p = convMessages[i]?.payload;
      if (p?.kind === "ROOM_QUOTE" && Number(p.accommodation?.id) > 0) {
        const aid = Number(p.accommodation.id);
        if (seen.has(aid)) continue;
        seen.add(aid);
        extracted.push({
          accommodationId: aid,
          accommodationName: p.accommodation.name || p.accommodation.accommodationName || "",
          accommodationTypeName: p.accommodation.accommodationTypeName || null,
          starRating: p.accommodation.starRating ?? null,
          addressLine: p.accommodation.addressLine || null,
          coverImage: p.accommodation.coverImage || null,
          locationId: p.accommodation.locationId ? Number(p.accommodation.locationId) : null,
          locationName: p.accommodation.locationName || null,
          hasActiveManager: Boolean(p.accommodation.hasActiveManager),
        });
      }
    }
    discussed = extracted;
  }

  let activeLoc = ctx.activeLocation?.id
    ? { id: Number(ctx.activeLocation.id), name: ctx.activeLocation.name || "" }
    : ctx.pageContext?.pageType === "LOCATION_SEARCH" && Number(ctx.pageContext.locationId) > 0
      ? { id: Number(ctx.pageContext.locationId), name: ctx.pageContext.locationName || "" }
      : null;

  if (!activeLoc && Array.isArray(convMessages)) {
    for (let i = convMessages.length - 1; i >= 0; i -= 1) {
      const p = convMessages[i]?.payload;
      if (p?.kind === "PROPERTY_CHOICES" && Number(p.locationId) > 0) {
        activeLoc = { id: Number(p.locationId), name: p.locationName || "" };
        break;
      }
    }
  }

  if (discussed.length === 1) {
    const prop = discussed[0];
    if (activeLoc?.id && prop.locationId && Number(activeLoc.id) !== Number(prop.locationId)) {
      return {
        open: true,
        mode: "PICK_ACCOMMODATION",
        location: activeLoc,
        discussedProperties: [],
      };
    }
    return {
      open: true,
      mode: "CONFIRM_SINGLE",
      property: prop,
      discussedProperties: discussed,
      location: prop.locationId
        ? { id: Number(prop.locationId), name: prop.locationName || activeLoc?.name || "" }
        : activeLoc,
    };
  }

  if (discussed.length >= 2) {
    const locIds = [...new Set(discussed.map((d) => Number(d.locationId)).filter(Boolean))];
    if (locIds.length === 1) {
      return {
        open: true,
        mode: "PICK_ACCOMMODATION",
        location: { id: locIds[0], name: discussed[0].locationName || activeLoc?.name || "" },
        discussedProperties: discussed,
      };
    }
    if (activeLoc?.id && discussed.every((d) => !d.locationId)) {
      return {
        open: true,
        mode: "PICK_ACCOMMODATION",
        location: activeLoc,
        discussedProperties: discussed,
      };
    }
    return {
      open: true,
      mode: "PICK_FROM_DISCUSSED",
      discussedProperties: discussed,
      location: activeLoc,
    };
  }

  if (activeLoc?.id) {
    return {
      open: true,
      mode: "PICK_ACCOMMODATION",
      location: activeLoc,
      discussedProperties: [],
    };
  }

  return {
    open: true,
    mode: "PICK_LOCATION",
    discussedProperties: [],
    location: null,
  };
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
  const [historyByConv, setHistoryByConv] = useState({});
  const loadingHistoryRef = useRef(new Set());

  const isOpenRef = useRef(isOpen);
  const activeIdRef = useRef(activeConversationId);
  const actorRef = useRef(actor);
  const pageContextRef = useRef(pageContext);
  const prevCustomerIdRef = useRef(undefined);
  const lastReadSentRef = useRef({});
  const lastDeliveredSentRef = useRef({});
  const sessionEpochRef = useRef(0);
  const receivedMessageKeysRef = useRef(new Set());
  const conversationRevisionRef = useRef(0);
  const expiredConversationIdsRef = useRef(new Set());
  const manualContextPageKeyRef = useRef(null);
  const pendingPageSyncRef = useRef(null);
  const contextMutationVersionRef = useRef(0);
  const contextQueueRef = useRef(Promise.resolve());

  const runContextMutation = useCallback((work) => {
    const epoch = sessionEpochRef.current;
    const version = ++contextMutationVersionRef.current;
    const isCurrent = () => epoch === sessionEpochRef.current && version === contextMutationVersionRef.current;
    const scheduled = contextQueueRef.current.catch(() => {}).then(async () => {
      if (!isCurrent()) return null;
      try {
        const result = await work();
        return isCurrent() ? result : null;
      } catch (err) {
        if (isCurrent()) throw err;
        return null;
      }
    });
    contextQueueRef.current = scheduled.catch(() => {});
    return scheduled;
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
    activeIdRef.current = activeConversationId;
    actorRef.current = actor;
    pageContextRef.current = pageContext;
    if (manualContextPageKeyRef.current && manualContextPageKeyRef.current !== pageContext.contextKey) {
      manualContextPageKeyRef.current = null;
    }
  }, [isOpen, activeConversationId, actor, pageContext]);

  const upsertConversation = useCallback((conv) => {
    if (!conv || !conv.id) return;
    const cid = Number(conv.id);
    if (expiredConversationIdsRef.current.has(cid)) return;
    conversationRevisionRef.current += 1;
    if (conv.status === "RESOLVED" || (conv.handlingMode && conv.handlingMode !== "AI")) {
      setStreamingByConv((prev) => prev[cid]
        ? updateAiStream(prev, "cancelled", { conversationId: cid, runId: prev[cid].runId })
        : prev);
    }
    setConversations((prev) => {
      const cid = Number(conv.id);
      const existing = prev.find((c) => Number(c.id) === cid);
      return [existing ? { ...existing, ...conv } : conv];
    });
  }, []);

  const refreshConversation = useCallback(async (cid) => {
    const epoch = sessionEpochRef.current;
    const revision = conversationRevisionRef.current;
    const conv = await webChatClient.getConversationDetail(cid);
    if (epoch !== sessionEpochRef.current || revision !== conversationRevisionRef.current || expiredConversationIdsRef.current.has(Number(cid))) return null;
    upsertConversation(conv);
    return conv;
  }, [upsertConversation]);

  const appendOrReplaceMessage = useCallback((cid, msg) => {
    if (!cid || !msg) return;
    const convId = Number(cid);
    setMessagesByConv((prev) => ({
      ...prev,
      [convId]: mergeChatMessages(prev[convId], [msg]),
    }));
  }, []);

  const syncReadIfVisible = useCallback(async (cid, maxSequence) => {
    if (!cid || !maxSequence) return;
    if (!isOpenRef.current || Number(activeIdRef.current) !== Number(cid)) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    const prevSent = Number(lastReadSentRef.current[cid] || 0);
    if (maxSequence <= prevSent) return;
    const epoch = sessionEpochRef.current;
    try {
      await webChatClient.markRead(cid, maxSequence);
      if (epoch !== sessionEpochRef.current) return;
      lastReadSentRef.current[cid] = Math.max(Number(lastReadSentRef.current[cid] || 0), maxSequence);
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
    const epoch = sessionEpochRef.current;
    try {
      await webChatClient.markDelivered(cid, maxSequence);
      if (epoch !== sessionEpochRef.current) return;
      lastDeliveredSentRef.current[cid] = Math.max(Number(lastDeliveredSentRef.current[cid] || 0), maxSequence);
    } catch {
      // ignore
    }
  }, []);

  const loadConversationMessages = useCallback(
    async (cid) => {
      if (!cid) return [];
      const epoch = sessionEpochRef.current;
      const res = await webChatClient.getMessages(cid, { limit: 60 });
      if (epoch !== sessionEpochRef.current || expiredConversationIdsRef.current.has(Number(cid))) return [];
      const items = res.items || [];
      setMessagesByConv((prev) => ({ ...prev, [Number(cid)]: mergeChatMessages(prev[Number(cid)], items) }));
      setHistoryByConv((prev) => prev[Number(cid)] ? prev : {
        ...prev, [Number(cid)]: { hasMore: items.length >= 60, loading: false },
      });
      const maxSeq = lastServerSequence(items);
      if (maxSeq > 0) {
        syncDelivered(cid, maxSeq);
        syncReadIfVisible(cid, maxSeq);
      }
      return items;
    },
    [syncDelivered, syncReadIfVisible],
  );

  const loadOlderMessages = useCallback(async () => {
    const cid = Number(activeIdRef.current);
    if (!cid || loadingHistoryRef.current.has(cid)) return;
    const sequences = (messagesByConv[cid] || [])
      .filter((m) => !m.localStatus && Number.isSafeInteger(Number(m.sequence)) && Number(m.sequence) > 0)
      .map((m) => Number(m.sequence));
    if (!sequences.length) return;
    const beforeSequence = Math.min(...sequences);
    const epoch = sessionEpochRef.current;
    loadingHistoryRef.current.add(cid);
    setHistoryByConv((prev) => ({ ...prev, [cid]: { ...prev[cid], loading: true } }));
    try {
      const res = await webChatClient.getMessages(cid, { limit: 60, beforeSequence });
      if (epoch !== sessionEpochRef.current || expiredConversationIdsRef.current.has(cid)) return;
      const items = res.items || [];
      setMessagesByConv((prev) => ({ ...prev, [cid]: mergeChatMessages(prev[cid], items) }));
      setHistoryByConv((prev) => ({ ...prev, [cid]: {
        loading: false, hasMore: items.length >= 60 && items.some((m) => Number(m.sequence) < beforeSequence),
      } }));
    } catch (err) {
      if (epoch === sessionEpochRef.current) setStatusNotice(err.message || "Không thể tải tin nhắn cũ.");
    } finally {
      if (epoch === sessionEpochRef.current) {
        loadingHistoryRef.current.delete(cid);
        setHistoryByConv((prev) => prev[cid] ? { ...prev, [cid]: { ...prev[cid], loading: false } } : prev);
      }
    }
  }, [messagesByConv]);

  const attachSocketListeners = useCallback(
    (socket) => {
      socket.on("connect", () => {
        setSocketConnected(true);
        webChatClient.syncDeliveredAll().catch(() => {});
        const curId = activeIdRef.current;
        if (curId) {
          socket.emit("conversation:join", { conversationId: curId });
          loadConversationMessages(curId).catch(() => {});
          refreshConversation(curId).catch(() => {});
        }
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
        setStreamingByConv((prev) => Object.fromEntries(
          Object.entries(prev).map(([cid, stream]) => [cid, { ...stream, done: true, text: "" }]),
        ));
        setTypingByConv({});
      });

      socket.on("conversation:updated", (payload = {}) => {
        const patch = payload.conversation
          ? payload.conversation
          : payload.conversationId
            ? {
                id: Number(payload.conversationId),
                ...(payload.status !== undefined ? { status: payload.status } : {}),
                ...(payload.handlingMode !== undefined ? { handlingMode: payload.handlingMode } : {}),
                ...(payload.retentionState !== undefined ? { retentionState: payload.retentionState } : {}),
                ...(payload.assignedUserId !== undefined ? { assignedUserId: payload.assignedUserId } : {}),
                ...(payload.assignedManagerName !== undefined ? { assignedManagerName: payload.assignedManagerName } : {}),
                ...(payload.currentHandoffId !== undefined ? { currentHandoffId: payload.currentHandoffId } : {}),
                ...(payload.pendingRatingHandoffId !== undefined
                  ? { pendingRatingHandoffId: payload.pendingRatingHandoffId }
                  : {}),
                ...(payload.pendingRatingManagerName !== undefined
                  ? { pendingRatingManagerName: payload.pendingRatingManagerName }
                  : {}),
                ...(payload.managerWaitExpiresAt !== undefined
                  ? { managerWaitExpiresAt: payload.managerWaitExpiresAt }
                  : {}),
                ...(payload.handoffFirstHumanReplyAt !== undefined
                  ? { handoffFirstHumanReplyAt: payload.handoffFirstHumanReplyAt }
                  : {}),
                ...(payload.hasRatedHandoff !== undefined ? { hasRatedHandoff: payload.hasRatedHandoff } : {}),
              }
            : null;

        if (patch) {
          upsertConversation(patch);
        }
        if (payload.notification) {
          setStatusNotice(payload.notification);
        }
      });

      socket.on("rating:submitted", (payload = {}) => {
        const cid = Number(payload.conversationId || 0);
        if (!cid) return;
        setConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === cid
              ? { ...c, hasRatedHandoff: true, pendingRatingHandoffId: null }
              : c,
          ),
        );
      });

      socket.on("message:created", ({ conversationId, message }) => {
        if (!conversationId || !message) return;
        const cid = Number(conversationId);
        appendOrReplaceMessage(cid, message);

        // Stop streaming bubble once finalized AI message lands
        if (message.senderType === "AI" && message.aiRunId) {
          setStreamingByConv((prev) => updateAiStream(prev, "completed", { conversationId: cid, runId: message.aiRunId }));
        }

        const eventKey = `${cid}:${message.id || message.clientMessageId || message.sequence}`;
        if (receivedMessageKeysRef.current.has(eventKey)) return;
        receivedMessageKeysRef.current.add(eventKey);
        if (receivedMessageKeysRef.current.size > 1000) {
          receivedMessageKeysRef.current.delete(receivedMessageKeysRef.current.values().next().value);
        }

        // Manager message safety net: immediately clear wait state & enable handoff rating
        if (message.senderType === "MANAGER" && message.visibility === "PUBLIC") {
          setConversations((prev) =>
            prev.map((c) =>
              Number(c.id) === cid
                ? {
                    ...c,
                    handlingMode: c.handlingMode === "WAITING_HUMAN" ? "HUMAN" : c.handlingMode,
                    managerWaitExpiresAt: null,
                    handoffFirstHumanReplyAt:
                      c.handoffFirstHumanReplyAt || message.createdAt || new Date().toISOString(),
                    pendingRatingHandoffId:
                      c.hasRatedHandoff
                        ? c.pendingRatingHandoffId
                        : c.pendingRatingHandoffId || message.handoffId || c.currentHandoffId || null,
                  }
                : c,
            ),
          );
          refreshConversation(cid).catch(() => {});
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
        setStreamingByConv((prev) => updateAiStream(prev, "started", { conversationId, runId }));
      });

      socket.on("ai:delta", ({ conversationId, runId, delta }) => {
        setStreamingByConv((prev) => updateAiStream(prev, "delta", { conversationId, runId, delta }));
      });

      socket.on("ai:completed", ({ conversationId, runId, guestAiCloseAt, context, messages }) => {
        const cid = Number(conversationId);
        setStreamingByConv((prev) => updateAiStream(prev, "completed", { conversationId, runId }));
        if (Array.isArray(messages)) {
          for (const m of messages) appendOrReplaceMessage(cid, m);
        }
        if (guestAiCloseAt || context) {
          setConversations((prev) =>
            prev.map((c) =>
              Number(c.id) === cid
                ? {
                    ...c,
                    ...(guestAiCloseAt ? { guestAiCloseAt } : {}),
                    ...(context ? { context } : {}),
                  }
                : c,
            ),
          );
        }
      });

      socket.on("ai:cancelled", (payload) => {
        setStreamingByConv((prev) => updateAiStream(prev, "cancelled", payload));
      });

      socket.on("ai:failed", ({ conversationId, runId, message }) => {
        setStreamingByConv((prev) => updateAiStream(prev, "failed", { conversationId, runId }));
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

      socket.on("handoff:missed", ({ conversationId }) => {
        if (conversationId) {
          refreshConversation(conversationId).catch(() => {});
        }
      });

      socket.on("conversation:expired", ({ conversationId }) => {
        const cid = Number(conversationId);
        expiredConversationIdsRef.current.add(cid);
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
          activeIdRef.current = null;
          setActiveConversationId(null);
        }
      });

      socket.on("access:revoked", () => {
        webChatClient.disconnectSocket();
        setSocketConnected(false);
      });
    },
    [appendOrReplaceMessage, loadConversationMessages, refreshConversation, syncDelivered, syncReadIfVisible, upsertConversation],
  );

  const ensureRealtimeConnected = useCallback(async () => {
    const epoch = sessionEpochRef.current;
    const socket = await webChatClient.connectSocket();
    if (epoch !== sessionEpochRef.current) return null;
    if (!socket._vpsListenersAttached) {
      attachSocketListeners(socket);
      socket._vpsListenersAttached = true;
    }
    if (!socket.connected) socket.connect();
    return socket;
  }, [attachSocketListeners]);

  const hydrateChatSession = useCallback(
    async ({ shouldClaimGuest = false, isCurrent = () => true } = {}) => {
      try {
        if (shouldClaimGuest) {
          await webChatClient.claimGuestConversations().catch(() => {});
        }
        if (!isCurrent()) return;
        const revision = conversationRevisionRef.current;
        const boot = await webChatClient.bootstrap();
        if (!isCurrent()) return;
        setGreetingText(boot.greetingText || "");
        setFeaturedLocations(boot.featuredLocations || []);
        // Opening chat or receiving a realtime update can overtake bootstrap.
        if (revision !== conversationRevisionRef.current) return;
        setActor(boot.actor || null);
        const list = boot.conversations || [];
        setConversations(list);

        if (boot.actor) {
          await ensureRealtimeConnected().catch(() => {});
        }
        if (!isCurrent()) return;

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
    sessionEpochRef.current += 1;
    if (isCheckingAuthen) return;
    const prevId = prevCustomerIdRef.current;
    const changed = prevId !== undefined && prevId !== stableCustomerId;
    prevCustomerIdRef.current = stableCustomerId;
    let active = true;

    async function syncIdentity() {
      await Promise.resolve();
      if (!active) return;
      if (changed) {
        manualContextPageKeyRef.current = null;
        pendingPageSyncRef.current = null;
        contextMutationVersionRef.current += 1;
        webChatClient.disconnectSocket();
        setSocketConnected(false);
        lastReadSentRef.current = {};
        lastDeliveredSentRef.current = {};
        receivedMessageKeysRef.current.clear();
        expiredConversationIdsRef.current.clear();
        // Reset on every account change, including Customer A -> Customer B.
        setConversations([]);
        setMessagesByConv({});
        setHistoryByConv({});
        loadingHistoryRef.current.clear();
        setStreamingByConv({});
        setTypingByConv({});
        setActor(null);
        setActiveConversationId(null);
        activeIdRef.current = null;
        actorRef.current = null;
        setHandoffGuideState({ open: false });
        setStatusNotice("");
        setLoading(false);
      }
      const becameCustomer = changed && Boolean(stableCustomerId);
      await hydrateChatSession({
        shouldClaimGuest: becameCustomer || Boolean(stableCustomerId),
        isCurrent: () => active,
      });
    }

    syncIdentity();
    return () => {
      active = false;
    };
  }, [isCheckingAuthen, stableCustomerId, hydrateChatSession]);

  useEffect(() => () => {
    sessionEpochRef.current += 1;
    webChatClient.disconnectSocket();
  }, []);

  // Open or focus unified single-thread widget with current page context
  const openChatWidget = useCallback(
    async ({ forceContextCard = false, scopeType = null, accommodationId = null, autoRequestHandoff = false } = {}) => {
      conversationRevisionRef.current += 1;
      setIsOpen(true);
      isOpenRef.current = true;
      setHandoffGuideState({ open: false });
      setStatusNotice("");

      const currentUnified = conversations[0] || null;
      const targetAccomCheck = accommodationId ? Number(accommodationId) : null;
      if (
        currentUnified &&
        currentUnified.status === "OPEN" &&
        currentUnified.handlingMode !== "AI" &&
        targetAccomCheck &&
        Number(currentUnified.accommodationId) !== targetAccomCheck
      ) {
        setActiveConversationId(currentUnified.id);
        setStatusNotice(
          currentUnified.handlingMode === "WAITING_HUMAN"
            ? "Bạn đang chờ Quản lý cơ sở hiện tại. Vui lòng nhấn Hủy chờ nếu muốn đổi sang cơ sở khác."
            : "Bạn đang trao đổi trực tiếp với Quản lý cơ sở hiện tại. Hãy hoàn tất phiên trao đổi này trước khi chuyển sang cơ sở khác.",
        );
        await loadConversationMessages(currentUnified.id).catch(() => {});
        return currentUnified;
      }

      setLoading(true);
      const epoch = sessionEpochRef.current;
      try {
        const viewingContext = pageContextRef.current;
        const ctxNow = !accommodationId && manualContextPageKeyRef.current === viewingContext.contextKey
          ? currentUnified?.context?.pageContext || viewingContext
          : viewingContext;
        if (accommodationId) manualContextPageKeyRef.current = viewingContext.contextKey;
        const resolvedScope =
          scopeType ||
          (accommodationId || ctxNow.pageType === "ACCOMMODATION_DETAIL" ? "PROPERTY" : "PLATFORM");
        const resolvedAccomId =
          resolvedScope === "PROPERTY" ? accommodationId || ctxNow.accommodationId : null;

        const openRes = await runContextMutation(async () => {
          const opened = await webChatClient.openOrReuseConversation({
            scopeType: resolvedScope,
            accommodationId: resolvedAccomId,
            bookingId: accommodationId ? undefined : ctxNow.bookingId || undefined,
            clientRequestId: makeClientId(),
            pageContext: {
              ...ctxNow,
              ...(accommodationId ? { pageType: "ACCOMMODATION_DETAIL", bookingId: null, bookingCode: null } : {}),
              accommodationId: resolvedAccomId || ctxNow.accommodationId,
              attachContextCard: forceContextCard ? true : ctxNow.pageType !== "HOME",
            },
          });
          if (autoRequestHandoff && epoch === sessionEpochRef.current && opened.conversation?.handlingMode === "AI") {
            const handoff = await webChatClient.requestHandoff(opened.conversation.id, {
              accommodationId: Number(opened.conversation.accommodationId),
              reason: "Khách yêu cầu gặp Quản lý trực tiếp từ thẻ cơ sở",
            });
            return { ...opened, conversation: handoff?.conversation || opened.conversation,
              handoffNotice: handoff?.supported === false ? handoff.message : null };
          }
          return opened;
        });
        if (!openRes || epoch !== sessionEpochRef.current) return null;

        setActor((prev) => prev || { type: stableCustomerId ? "CUSTOMER" : "GUEST" });
        upsertConversation(openRes.conversation);
        activeIdRef.current = openRes.conversation.id;
        setActiveConversationId(openRes.conversation.id);
        setMessagesByConv((prev) => ({
          ...prev,
          [Number(openRes.conversation.id)]: mergeChatMessages(prev[Number(openRes.conversation.id)], openRes.messages),
        }));

        const socket = await ensureRealtimeConnected().catch(() => null);
        if (epoch !== sessionEpochRef.current) return null;
        if (socket && socket.connected) {
          socket.emit("conversation:join", { conversationId: openRes.conversation.id });
        }

        const maxSeq = lastServerSequence(openRes.messages);
        if (maxSeq > 0) {
          syncReadIfVisible(openRes.conversation.id, maxSeq);
        }

        if (openRes.handoffNotice) setStatusNotice(openRes.handoffNotice);
        if (autoRequestHandoff) await loadConversationMessages(openRes.conversation.id);

        return openRes.conversation;
      } catch (err) {
        if (epoch !== sessionEpochRef.current) return null;
        setStatusNotice(err.message || "Không thể mở hội thoại lúc này.");
        return null;
      } finally {
        if (epoch === sessionEpochRef.current) setLoading(false);
      }
    },
    [
      conversations,
      stableCustomerId,
      upsertConversation,
      ensureRealtimeConnected,
      syncReadIfVisible,
      loadConversationMessages,
      runContextMutation,
    ],
  );

  // When widget is already open in AI mode and user navigates to a new location / hotel / booking, sync context seamlessly into the unified stream
  useEffect(() => {
    if (!isOpen || !activeConversationId || !actor) return;
    const conv = conversations.find((c) => Number(c.id) === Number(activeConversationId));
    if (!conv || conv.status !== "OPEN" || conv.handlingMode !== "AI") return;
    if (pageContext.contextKey === "HOME") return;
    if (manualContextPageKeyRef.current === pageContext.contextKey) return;
    if (conv.context?.lastAttachedContextKey === pageContext.contextKey) return;

    const syncKey = `${conv.id}:${pageContext.contextKey}`;
    if (pendingPageSyncRef.current === syncKey) return;
    pendingPageSyncRef.current = syncKey;
    manualContextPageKeyRef.current = null;
    const epoch = sessionEpochRef.current;
    runContextMutation(() => webChatClient.updateContext(conv.id, { ...pageContext, attachContextCard: true }))
      .then((updated) => {
        if (!updated || epoch !== sessionEpochRef.current) return;
        upsertConversation(updated);
        return loadConversationMessages(conv.id);
      })
      .catch(() => {})
      .finally(() => {
        if (pendingPageSyncRef.current === syncKey) pendingPageSyncRef.current = null;
      });
  }, [
    isOpen,
    activeConversationId,
    actor,
    pageContext,
    conversations,
    upsertConversation,
    loadConversationMessages,
    runContextMutation,
  ]);

  // Load messages + refresh conversation detail and join room when switching active conversation while widget is open
  useEffect(() => {
    if (!isOpen || !activeConversationId) return;
    const cid = Number(activeConversationId);
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      loadConversationMessages(cid).catch(() => {});
      refreshConversation(cid).catch(() => {});
      if (webChatClient.socket?.connected) {
        webChatClient.socket.emit("conversation:join", { conversationId: cid });
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, activeConversationId, loadConversationMessages, refreshConversation]);

  // Read + state sync on tab focus / visibility change
  useEffect(() => {
    function onVisibleOrFocus() {
      if (!isOpenRef.current || !activeIdRef.current) return;
      if (document.visibilityState !== "visible") return;
      const cid = Number(activeIdRef.current);
      loadConversationMessages(cid).catch(() => {});
      const msgs = messagesByConv[cid] || [];
      const maxSeq = lastServerSequence(msgs);
      if (maxSeq > 0) {
        syncReadIfVisible(cid, maxSeq);
      }
      refreshConversation(cid).catch(() => {});
    }
    window.addEventListener("focus", onVisibleOrFocus);
    document.addEventListener("visibilitychange", onVisibleOrFocus);
    return () => {
      window.removeEventListener("focus", onVisibleOrFocus);
      document.removeEventListener("visibilitychange", onVisibleOrFocus);
    };
  }, [messagesByConv, loadConversationMessages, refreshConversation, syncReadIfVisible]);

  const sendMessage = useCallback(
    async (text) => {
      const clean = String(text || "").trim();
      if (!clean) return;

      let cid = activeIdRef.current;
      const curConv = conversations.find((c) => Number(c.id) === Number(cid));
      if (!cid || curConv?.status === "RESOLVED") {
        const opened = await openChatWidget({ forceContextCard: false });
        cid = opened?.id;
        if (!cid) return;
      }

      const clientMessageId = makeClientId();
      const optimisticMsg = {
        id: `temp-${clientMessageId}`,
        conversationId: Number(cid),
        sequence: Number.MAX_SAFE_INTEGER,
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

      const epoch = sessionEpochRef.current;
      try {
        const res = await webChatClient.sendMessage(cid, {
          content: clean,
          clientMessageId,
        });
        if (epoch !== sessionEpochRef.current) return;
        if (res?.message) {
          appendOrReplaceMessage(cid, res.message);
        }
        if (res?.conversation) {
          upsertConversation(res.conversation);
        }
      } catch (err) {
        if (epoch !== sessionEpochRef.current) return;
        setMessagesByConv((prev) => ({
          ...prev,
          [Number(cid)]: (prev[Number(cid)] || []).map((m) =>
            m.clientMessageId === clientMessageId && m.localStatus === "sending" ? { ...m, localStatus: "failed" } : m,
          ),
        }));
        setStatusNotice(err.message || "Không thể gửi tin nhắn.");
      }
    },
    [conversations, stableCustomerId, openChatWidget, appendOrReplaceMessage, upsertConversation],
  );

  const selectDestinationInChat = useCallback(
    async (locationObj) => {
      if (!locationObj?.id) return;
      let cid = activeIdRef.current;
      const curConv = conversations.find((c) => Number(c.id) === Number(cid));
      if (!cid || curConv?.status === "RESOLVED") {
        const opened = await openChatWidget({ forceContextCard: false });
        cid = opened?.id;
        if (!cid) return;
      }
      const epoch = sessionEpochRef.current;
      manualContextPageKeyRef.current = pageContextRef.current.contextKey;
      const updated = await runContextMutation(() => webChatClient.updateContext(cid, {
        pageType: "LOCATION_SEARCH",
        locationId: Number(locationObj.id),
        checkin: pageContextRef.current.checkin,
        checkout: pageContextRef.current.checkout,
        rooms: pageContextRef.current.rooms,
        adults: pageContextRef.current.adults,
        children: pageContextRef.current.children,
        attachContextCard: true,
      }));
      if (!updated || epoch !== sessionEpochRef.current) return;
      upsertConversation(updated);
      await loadConversationMessages(cid);
    },
    [conversations, openChatWidget, upsertConversation, loadConversationMessages, runContextMutation],
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
    let conv = conversations.find((c) => Number(c.id) === Number(cid));
    if (!cid || conv?.status === "RESOLVED") {
      const opened = await openChatWidget({ forceContextCard: false });
      cid = opened?.id;
      conv = opened || conv;
    }
    if (!cid) return;

    if (!conv || conv.scopeType !== "PROPERTY" || !conv.accommodationId) {
      setHandoffGuideState(resolveHandoffGuideState(conv, messagesByConv[Number(cid)] || []));
      return;
    }

    setLoading(true);
    const epoch = sessionEpochRef.current;
    try {
      const res = await webChatClient.requestHandoff(cid, {
        accommodationId: Number(conv.accommodationId),
        reason: "Khách yêu cầu kết nối Quản lý cơ sở",
      });
      if (epoch !== sessionEpochRef.current) return;
      if (res?.conversation) {
        upsertConversation(res.conversation);
      }
      if (res?.message && res?.supported === false) {
        setStatusNotice(res.message);
      }
      await loadConversationMessages(cid);
    } catch (err) {
      if (epoch !== sessionEpochRef.current) return;
      if (err.errorCode === "PROPERTY_SELECTION_REQUIRED") {
        setHandoffGuideState(resolveHandoffGuideState(conv, messagesByConv[Number(cid)] || []));
      } else {
        setStatusNotice(err.message || "Không thể kết nối Quản lý lúc này.");
      }
    } finally {
      if (epoch === sessionEpochRef.current) setLoading(false);
    }
  }, [conversations, messagesByConv, openChatWidget, upsertConversation, loadConversationMessages]);

  const cancelHumanHandoff = useCallback(async () => {
    const cid = activeIdRef.current;
    if (!cid) return;
    setLoading(true);
    const epoch = sessionEpochRef.current;
    try {
      const res = await webChatClient.cancelHandoff(cid);
      if (epoch !== sessionEpochRef.current) return;
      const convObj = res?.conversation || (res?.id ? res : null);
      if (convObj) upsertConversation(convObj);
      await loadConversationMessages(cid);
    } catch (err) {
      if (epoch !== sessionEpochRef.current) return;
      setStatusNotice(err.message || "Không thể hủy yêu cầu kết nối.");
    } finally {
      if (epoch === sessionEpochRef.current) setLoading(false);
    }
  }, [upsertConversation, loadConversationMessages]);

  const returnFromManagerToAi = useCallback(async () => {
    const cid = activeIdRef.current;
    if (!cid) return;
    setLoading(true);
    const epoch = sessionEpochRef.current;
    try {
      const res = await webChatClient.returnToAi(cid);
      if (epoch !== sessionEpochRef.current) return;
      const convObj = res?.conversation || (res?.id ? res : null);
      if (convObj) upsertConversation(convObj);
      await loadConversationMessages(cid);
    } catch (err) {
      if (epoch !== sessionEpochRef.current) return;
      setStatusNotice(err.message || "Không thể chuyển về Trợ lý AI lúc này.");
    } finally {
      if (epoch === sessionEpochRef.current) setLoading(false);
    }
  }, [upsertConversation, loadConversationMessages]);

  const endGuestSession = useCallback(async () => {
    const cid = activeIdRef.current;
    if (!cid) return;
    setLoading(true);
    const epoch = sessionEpochRef.current;
    try {
      await webChatClient.endGuestConversation(cid);
      if (epoch !== sessionEpochRef.current) return;
      setConversations((prev) => prev.filter((c) => Number(c.id) !== Number(cid)));
      setMessagesByConv((prev) => {
        const copy = { ...prev };
        delete copy[Number(cid)];
        return copy;
      });
      setActiveConversationId(null);
      setStatusNotice("");
    } catch (err) {
      if (epoch !== sessionEpochRef.current) return;
      setStatusNotice(err.message || "Không thể kết thúc cuộc trò chuyện.");
    } finally {
      if (epoch === sessionEpochRef.current) setLoading(false);
    }
  }, []);

  const submitRating = useCallback(
    async (handoffId, { rating, comment }) => {
      const epoch = sessionEpochRef.current;
      const cid = activeIdRef.current;
      const res = await webChatClient.submitRating(handoffId, { rating, comment });
      if (epoch !== sessionEpochRef.current) return res;
      if (cid) {
        setConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === Number(cid)
              ? {
                  ...c,
                  hasRatedHandoff: true,
                  pendingRatingHandoffId: null,
                  lastSubmittedRating: res,
                }
              : c,
          ),
        );
      }
      setStatusNotice(
        Number(rating) <= 3
          ? `Đã ghi nhận đánh giá ${rating}/5 sao và gửi báo cáo tới Quản trị viên VietPeace Stay.`
          : `Cảm ơn bạn đã đánh giá ${rating}/5 sao chất lượng phục vụ!`,
      );
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

  // Fallback polling while WAITING_HUMAN so timer/state clears even across transient socket drops
  const activeWaitingId =
    isOpen && activeConversation?.handlingMode === "WAITING_HUMAN" ? Number(activeConversation.id) : null;
  useEffect(() => {
    if (!activeWaitingId) return undefined;
    const t = setInterval(() => {
      refreshConversation(activeWaitingId)
        .then((conv) => {
          if (conv && conv.handlingMode !== "WAITING_HUMAN") {
            loadConversationMessages(activeWaitingId).catch(() => {});
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [activeWaitingId, refreshConversation, loadConversationMessages]);

  const activeMessages = useMemo(
    () => (activeConversationId ? messagesByConv[Number(activeConversationId)] || [] : []),
    [messagesByConv, activeConversationId],
  );

  const activeStreaming = activeConversationId
    ? (streamingByConv[Number(activeConversationId)]?.done ? null : streamingByConv[Number(activeConversationId)] || null)
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
    loadOlderMessages,
    hasOlderMessages: Boolean(historyByConv[Number(activeConversationId)]?.hasMore),
    loadingOlderMessages: Boolean(historyByConv[Number(activeConversationId)]?.loading),
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
    returnFromManagerToAi,
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
