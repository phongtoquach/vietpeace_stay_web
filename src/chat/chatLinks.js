import { validChatDate, chatBookingDraftFromParams } from "./chatBooking.js";

const MAX_SQL_ID = 9223372036854775807n;
const positiveId = value => /^[1-9]\d{0,18}$/.test(value || "") && BigInt(value) <= MAX_SQL_ID;
const staticPages = new Set(["/", "/about", "/contact", "/terms", "/privacy", "/login", "/register", "/verify-email", "/profile", "/my-account/my-bookings"]);
const staticLabels = { '/': 'Trang chủ', '/about': 'Giới thiệu', '/contact': 'Liên hệ', '/terms': 'Điều khoản',
  '/privacy': 'Chính sách bảo mật', '/login': 'Đăng nhập', '/register': 'Đăng ký', '/verify-email': 'Xác thực email',
  '/profile': 'Tài khoản của tôi', '/my-account/my-bookings': 'Đơn đặt phòng của tôi' };

export function decodeChatHref(value) {
  return String(value || "").replace(/&amp;|&#0*38;|&#x0*26;/gi, "&");
}

export function trimChatUrl(value) {
  let clean = value.replace(/[.,;!?:…。；，！？]+$/, "");
  while (clean.endsWith(")") && (clean.match(/\)/g) || []).length > (clean.match(/\(/g) || []).length) clean = clean.slice(0, -1);
  return clean;
}

export function canonicalChatPath(value, origin) {
  if (typeof value !== "string" || !/^(?:\/(?!\/)|https?:\/\/)/i.test(value) || value.includes('\\') ||
      [...value].some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return null;
  try {
    const url = new URL(decodeChatHref(value), origin);
    if (url.origin !== origin || !["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    url.pathname = url.pathname.replace(/\/$/, "") || "/";
    if (url.pathname === "/bookings") url.pathname = "/my-account/my-bookings";
    if (url.pathname === "/search") url.pathname = "/search-accommodations";
    if (url.pathname === "/hotel-detail") url.pathname = "/accommodation-detail";
    const params = url.searchParams;
    for (const key of ["accommodationId", "bookingId", "locationId", "code", "id"]) if (params.getAll(key).length > 1) return null;
    if (url.pathname === "/accommodation-detail") {
      if (!positiveId(params.get("accommodationId")) || Number(params.get("accommodationId")) > 2147483647) return null;
      if (params.has("selection") && !chatBookingDraftFromParams(params)) return null;
    } else if (url.pathname === "/search-accommodations") {
      for (const key of ["accommodationId", "locationId"]) if (params.has(key) && !positiveId(params.get(key))) return null;
    } else if (url.pathname === "/checkout") {
      if (!positiveId(params.get("bookingId"))) return null;
    } else if (url.pathname === "/booking-detail") {
      const id = params.get("bookingId") || params.get("id");
      if (positiveId(id)) return `/my-account/my-bookings/booking/${id}${url.hash}`;
      if (id && /^-?\d+$/.test(id)) return null;
      if (!params.get("code")?.trim() && !id?.trim()) return null;
    } else if (/^\/my-account\/my-bookings\/booking\//.test(url.pathname)) {
      const match = /^\/my-account\/my-bookings\/booking\/([1-9]\d*)$/.exec(url.pathname);
      if (!match || !positiveId(match[1])) return null;
    } else if (!staticPages.has(url.pathname)) return null;
    if (["/accommodation-detail", "/search-accommodations"].includes(url.pathname)) {
      if (params.has("checkin") || params.has("checkout")) {
        if (!validChatDate(params.get("checkin")) || !validChatDate(params.get("checkout")) || params.get("checkout") <= params.get("checkin")) return null;
      }
      for (const [key, min, max] of [["rooms", 1, 10], ["adults", 1, 40], ["children", 0, 30]]) {
        if (params.has(key) && (!/^\d+$/.test(params.get(key)) || Number(params.get(key)) < min || Number(params.get(key)) > max)) return null;
      }
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

function comparableHref(value, origin) {
  try {
    const raw = decodeChatHref(value);
    const path = canonicalChatPath(raw, origin);
    const url = new URL(path || raw, origin);
    url.searchParams.sort();
    return url.href;
  } catch { return null; }
}

export function resolveChatLink(value, { origin, navigationLinks = null, legacyNavigationLinks = [] } = {}) {
  const raw = decodeChatHref(value);
  const path = canonicalChatPath(raw, origin);
  const key = comparableHref(raw, origin);
  const knownLinks = navigationLinks || legacyNavigationLinks;
  let verified = knownLinks.find(link => comparableHref(link.url, origin) === key);
  // A model may use the booking code from the same verified tool result.
  if (!verified && path?.startsWith("/booking-detail?")) {
    const code = new URL(path, origin).searchParams.get("code");
    const kind = new URL(path, origin).hash === '#checkout-folio' ? 'INVOICE' : 'BOOKING';
    verified = knownLinks.find(link => link.kind === kind && link.bookingCode === code);
  }
  if (verified) {
    const target = canonicalChatPath(verified.url, origin);
    if (target) return { href: target, label: verified.label, quoteDraft: verified.quoteDraft, internal: true };
    try {
      const url = new URL(verified.url);
      if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return { href: url.href, label: verified.label, external: true };
      if (url.protocol === "mailto:" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname)) return { href: url.href, label: verified.label };
      if (url.protocol === "tel:" && /^\+?\d{7,16}$/.test(url.pathname)) return { href: url.href, label: verified.label };
    } catch { return null; }
    return null;
  }
  if (!path) return null;
  // Legacy messages lack metadata; still support actual application routes.
  if (navigationLinks === null) return { href: path, internal: true };
  const label = staticLabels[new URL(path, origin).pathname];
  if (label) return { href: path, label, internal: true };
  return null;
}

