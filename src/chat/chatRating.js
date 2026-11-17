export function mergeConversationRatingState(existing = {}, patch = {}, ratedIds = new Set()) {
  const changedHandoff = patch.currentHandoffId !== undefined &&
    Number(patch.currentHandoffId) !== Number(existing.currentHandoffId);
  const next = { ...existing, ...patch };
  if (changedHandoff) {
    if (patch.handoffFirstHumanReplyAt === undefined) next.handoffFirstHumanReplyAt = null;
    if (patch.hasRatedHandoff === undefined) next.hasRatedHandoff = false;
  }
  if (ratedIds.has(Number(next.currentHandoffId))) next.hasRatedHandoff = true;
  if (ratedIds.has(Number(next.pendingRatingHandoffId))) {
    // An old first-reply packet can arrive after a rating and its refresh.
    // Keep a different outstanding rating instead of replacing it with that packet.
    const previousId = Number(existing.pendingRatingHandoffId);
    const keepPrevious = previousId > 0 && !ratedIds.has(previousId);
    next.pendingRatingHandoffId = keepPrevious ? previousId : null;
    next.pendingRatingManagerName = keepPrevious ? existing.pendingRatingManagerName : null;
  }
  return next;
}
