// Merge HTTP snapshots, optimistic sends and socket events without losing newer messages.
export function mergeChatMessages(existing = [], incoming = []) {
  const merged = [...existing];
  for (const message of incoming) {
    const index = merged.findIndex((item) =>
      (message.id != null && String(item.id) === String(message.id)) ||
      (message.clientMessageId && item.clientMessageId === message.clientMessageId),
    );
    if (index < 0) {
      merged.push(message);
    } else {
      const current = merged[index];
      // A delayed optimistic update must not replace the server's acknowledged message.
      if (message.localStatus && !current.localStatus) continue;
      merged[index] = { ...current, ...message, localStatus: message.localStatus };
    }
  }
  return merged.sort((a, b) =>
    Number(a.sequence || Number.MAX_SAFE_INTEGER) - Number(b.sequence || Number.MAX_SAFE_INTEGER),
  );
}

export function lastServerSequence(messages = []) {
  return messages.reduce((max, message) =>
    message.localStatus ? max : Math.max(max, Number(message.sequence) || 0),
  0);
}

// Retain terminal run IDs so late packets cannot revive a completed/cancelled bubble.
export function updateAiStream(streams, event, payload) {
  const cid = Number(payload.conversationId);
  if (!cid) return streams;
  const current = streams[cid];
  const runId = Number(payload.runId || current?.runId || 0);
  if (current && runId < current.runId) return streams;
  const sameRun = current?.runId === runId;
  if (sameRun && current.done && (event === "started" || event === "delta")) return streams;
  const done = event !== "started" && event !== "delta";
  return {
    ...streams,
    [cid]: {
      runId,
      text: done ? "" : `${sameRun ? current.text : ""}${event === "delta" ? payload.delta || "" : ""}`,
      startedAt: sameRun ? current.startedAt : Date.now(),
      done,
    },
  };
}
