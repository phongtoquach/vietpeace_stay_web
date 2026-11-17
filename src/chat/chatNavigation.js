import { MAX_CHAT_BOOKING_ROOMS, validChatDate, buildChatBookingTarget } from "./chatBooking.js";

export function buildChatPropertyTarget(payload, currentSearch = "") {
  let legacyParams;
  try {
    const legacyUrl = new URL(payload?.detailUrl || "", "https://chat.local");
    if (legacyUrl.pathname === "/accommodation-detail") legacyParams = legacyUrl.searchParams;
  } catch { /* Older cards can omit the URL; the verified ID is sufficient. */ }
  const id = Number(payload?.accommodationId || legacyParams?.get("accommodationId"));
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const current = new URLSearchParams(currentSearch);
  const params = new URLSearchParams({ accommodationId: String(id) });
  const checkin = payload?.checkin || legacyParams?.get("checkin") || current.get("checkin");
  const checkout = payload?.checkout || legacyParams?.get("checkout") || current.get("checkout");
  if (validChatDate(checkin) && validChatDate(checkout) && checkout > checkin) {
    params.set("checkin", checkin);
    params.set("checkout", checkout);
    for (const key of ["rooms", "adults", "children"]) {
      const value = payload?.[key] ?? legacyParams?.get(key) ?? current.get(key);
      if (value === null || value === undefined || value === "") continue;
      const number = Number(value);
      if (Number.isSafeInteger(number) && number >= (key === "children" ? 0 : 1) &&
          (key !== "rooms" || number <= MAX_CHAT_BOOKING_ROOMS)) params.set(key, String(number));
    }
  }
  return `/accommodation-detail?${params}`;
}

export function buildChatBookingDetailTarget(payload) {
  const id = String(payload?.bookingId || "");
  if (/^[1-9]\d{0,18}$/.test(id) && BigInt(id) <= 9223372036854775807n) return `/my-account/my-bookings/booking/${id}`;
  const code = String(payload?.bookingCode || "").trim();
  return code ? `/booking-detail?code=${encodeURIComponent(code)}` : null;
}

export function resolvePropertyWebsite(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/\//, "")}`);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function propertyPhoneLinks(value) {
  return String(value || "").split(/\s+-\s+|[;,|/]/).map((label) => {
    const number = label.replace(/[\s().-]/g, "");
    return /^\+?\d{7,16}$/.test(number) ? { label: label.trim(), href: `tel:${number}` } : null;
  }).filter(Boolean);
}

// Older text messages can reuse destinations already verified by their cards.
export function navigationLinksFromMessages(messages) {
  const byUrl = new Map();
  const add = link => { if (link?.url) byUrl.set(link.url, link); };
  for (const message of messages) {
    const payload = message.payload;
    if (!payload) continue;
    if (payload.kind === 'CHAT_TEXT') {
      if (Array.isArray(payload.navigationLinks)) payload.navigationLinks.forEach(add);
    } else if (payload.kind === 'PROPERTY_ATTACHMENT') {
      const url = buildChatPropertyTarget({ accommodationId: payload.accommodationId, detailUrl: payload.detailUrl });
      add({ url, label: `Xem cơ sở ${payload.accommodationName}`, kind: 'PROPERTY' });
      const website = resolvePropertyWebsite(payload.websiteUrl);
      if (website) add({ url: website, label: `Website ${payload.accommodationName}`, kind: 'WEBSITE' });
      if (typeof payload.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        add({ url: `mailto:${payload.email.trim()}`, label: payload.email.trim(), kind: 'EMAIL' });
      }
      for (const phone of propertyPhoneLinks(payload.phone)) add({ url: phone.href, label: phone.label, kind: 'PHONE' });
    } else if (payload.kind === 'ROOM_QUOTE') {
      for (const option of payload.options || []) {
        const target = buildChatBookingTarget(payload, option);
        if (target) add({ url: option.bookingUrl || target.url, label: `${option.label} · ${payload.accommodation?.accommodationName}`,
          kind: 'ROOM_QUOTE', quoteDraft: target.draft });
      }
    } else if (payload.kind === 'VERIFIED_BOOKING_CONTEXT') {
      add({ url: buildChatBookingDetailTarget(payload), label: `Xem đơn #${payload.bookingCode}`, kind: 'BOOKING', bookingCode: payload.bookingCode });
    }
  }
  return [...byUrl.values()];
}
