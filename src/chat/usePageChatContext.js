import { useMemo, useContext } from "react";
import { useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";

function positiveInt(val) {
  const num = Number(val);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

function nonNegativeInt(val) {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  return Number.isSafeInteger(num) && num >= 0 ? num : null;
}

function validIsoDate(val) {
  if (!val) return null;
  const clean = String(val).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(clean) ? clean : null;
}

export function usePageChatContext() {
  const location = useLocation();
  const { activeLocations = [], activeAccommodations = [] } = useContext(AppContext) || {};

  return useMemo(() => {
    const pathname = location.pathname || "/";
    const params = new URLSearchParams(location.search || "");
    const checkin = validIsoDate(params.get("checkin"));
    const checkout = validIsoDate(params.get("checkout"));
    const rooms = positiveInt(params.get("rooms"));
    const adults = positiveInt(params.get("adults"));
    const children = nonNegativeInt(params.get("children"));

    if (pathname.startsWith("/accommodation-detail")) {
      const accommodationId = positiveInt(params.get("accommodationId"));
      const matchedProp = accommodationId
        ? activeAccommodations.find((a) => Number(a.id) === accommodationId)
        : null;
      const locationId =
        positiveInt(params.get("locationId")) ||
        (matchedProp?.location_id ? Number(matchedProp.location_id) : null);

      if (accommodationId) {
        return {
          pageType: "ACCOMMODATION_DETAIL",
          accommodationId,
          accommodationName: matchedProp?.accommodation_name || null,
          locationId,
          checkin,
          checkout,
          rooms,
          adults,
          children,
          contextKey: `PROPERTY:${accommodationId}:${checkin || ""}:${checkout || ""}`,
        };
      }
    }

    if (pathname.startsWith("/search-accommodations") || pathname.startsWith("/search")) {
      const locationId = positiveInt(params.get("locationId"));
      const matchedLoc = locationId
        ? activeLocations.find((l) => Number(l.id) === locationId)
        : null;
      if (locationId) {
        return {
          pageType: "LOCATION_SEARCH",
          locationId,
          locationName: matchedLoc?.name || null,
          accommodationId: null,
          checkin,
          checkout,
          rooms,
          adults,
          children,
          contextKey: `LOCATION:${locationId}:${checkin || ""}:${checkout || ""}`,
        };
      }
    }

    if (pathname.startsWith("/my-account/my-bookings/booking/")) {
      const bookingId = decodeURIComponent(
        pathname.slice("/my-account/my-bookings/booking/".length).split("/")[0] || ""
      ).trim();
      if (bookingId) {
        return {
          pageType: "BOOKING_DETAIL",
          bookingId: /^\d+$/.test(bookingId) ? bookingId : null,
          bookingCode: !/^\d+$/.test(bookingId) ? bookingId : null,
          locationId: null,
          accommodationId: null,
          contextKey: `BOOKING:${bookingId}`,
        };
      }
    }

    if (pathname.startsWith("/booking-detail")) {
      const bookingId = params.get("bookingId") || params.get("id") || null;
      const bookingCode = params.get("code") || null;
      if (bookingId || bookingCode) {
        return {
          pageType: "BOOKING_DETAIL",
          bookingId: bookingId && /^\d+$/.test(bookingId) ? bookingId : null,
          bookingCode: bookingCode || (bookingId && !/^\d+$/.test(bookingId) ? bookingId : null),
          locationId: null,
          accommodationId: null,
          contextKey: `BOOKING:${bookingId || bookingCode}`,
        };
      }
    }

    return {
      pageType: "HOME",
      locationId: null,
      accommodationId: null,
      checkin,
      checkout,
      rooms,
      adults,
      children,
      contextKey: "HOME",
    };
  }, [location.pathname, location.search, activeLocations, activeAccommodations]);
}
