export const MAX_CHAT_BOOKING_ROOMS = 10;

export function validChatDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Carry only the selection. Prices and availability must come from booking-preview.
export function normalizeChatBookingDraft(value) {
  if (!value || !Number.isSafeInteger(Number(value.accommodationId)) || Number(value.accommodationId) < 1 ||
      !validChatDate(value.checkinDate) || !validChatDate(value.checkoutDate) || value.checkoutDate <= value.checkinDate ||
      !Array.isArray(value.selectedRooms) || !value.selectedRooms.length || value.selectedRooms.length > MAX_CHAT_BOOKING_ROOMS) return null;
  const selectedRooms = value.selectedRooms.map((room) => ({
    roomTypeId: Number(room?.roomTypeId), adults: Number(room?.adults), children: Number(room?.children ?? 0),
  }));
  if (selectedRooms.some((room) => !Number.isSafeInteger(room.roomTypeId) || room.roomTypeId < 1 ||
      !Number.isSafeInteger(room.adults) || room.adults < 1 || !Number.isSafeInteger(room.children) || room.children < 0)) return null;
  return { accommodationId: Number(value.accommodationId), checkinDate: value.checkinDate,
    checkoutDate: value.checkoutDate, selectedRooms };
}

export function buildChatBookingTarget(payload, option) {
  const draft = normalizeChatBookingDraft({ accommodationId: payload?.accommodation?.id,
    checkinDate: payload?.checkinDate, checkoutDate: payload?.checkoutDate,
    selectedRooms: option?.quote?.selectedRooms });
  if (!draft) return null;
  const params = new URLSearchParams({ accommodationId: String(draft.accommodationId),
    checkin: draft.checkinDate, checkout: draft.checkoutDate, rooms: String(draft.selectedRooms.length),
    adults: String(draft.selectedRooms.reduce((sum, room) => sum + room.adults, 0)),
    children: String(draft.selectedRooms.reduce((sum, room) => sum + room.children, 0)) });
  params.set("selection", JSON.stringify(draft.selectedRooms));
  return { url: `/accommodation-detail?${params}#room-selection`, draft };
}

export function chatBookingDraftFromParams(params) {
  if (!params.get("selection")) return null;
  try {
    return normalizeChatBookingDraft({ accommodationId: params.get("accommodationId"),
      checkinDate: params.get("checkin"), checkoutDate: params.get("checkout"),
      selectedRooms: JSON.parse(params.get("selection")) });
  } catch { return null; }
}
