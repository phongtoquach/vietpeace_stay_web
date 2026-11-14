import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Building2,
  UserCheck,
  Bot,
  Phone,
  Mail,
  Globe,
  LogIn,
  Calendar,
  BedDouble,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { webChatClient } from "./ChatClient";
import { formatVnd, resolveMediaUrl } from "./chatUtils";

function StarStrip({ count }) {
  const n = Number(count || 0);
  if (!n) return null;
  return (
    <span className="vps-card-stars" aria-label={`${n} sao`}>
      {Array.from({ length: n }).map((_, idx) => (
        <Star key={idx} size={11} fill="currentColor" strokeWidth={1.5} />
      ))}
    </span>
  );
}

function PropertySubline({ label, minPrice, addressLine }) {
  if (!label && minPrice == null && !addressLine) return null;
  return (
    <p className="vps-choice-subline" title={addressLine || undefined}>
      {label && <span>{label}</span>}
      {minPrice != null && (
        <>
          {label ? " · " : ""}
          <span className="vps-price-tag tabular-nums">Từ {formatVnd(minPrice)}/đêm</span>
        </>
      )}
      {addressLine && (
        <span>
          {label || minPrice != null ? " · " : ""}
          {addressLine}
        </span>
      )}
    </p>
  );
}

function renderPropertyMiniRow(p, { onSelectProperty, showLocationTag = false, isDiscussed = false }) {
  const pid = Number(p.accommodationId || p.id);
  const pname = p.accommodationName || p.name || "";
  return (
    <div key={pid} className="vps-prop-mini-item">
      <div className="vps-prop-mini-info">
        <div className="vps-prop-mini-title">
          <strong>{pname}</strong>
          {isDiscussed && <span className="vps-discussed-badge">Vừa trao đổi</span>}
          {showLocationTag && p.locationName && (
            <span className="vps-location-mini-badge">{p.locationName}</span>
          )}
        </div>
        <span className="vps-prop-mini-meta">
          {p.addressLine || p.locationName || p.accommodationTypeName || ""}
          {(p.addressLine || p.locationName || p.accommodationTypeName) ? " · " : ""}
          {p.hasActiveManager ? "Có Quản lý trực tuyến" : "Hỗ trợ AI & SĐT cơ sở"}
        </span>
      </div>
      <button
        type="button"
        className="vps-btn-primary-xs"
        onClick={() => onSelectProperty(pid, { autoHandoff: true })}
      >
        {p.hasActiveManager ? "Gặp Quản lý" : "Mở & xem liên hệ"}
      </button>
    </div>
  );
}

export function HandoffGuideCard({ guideState = {}, initialLocations = [], onSelectProperty, onClose }) {
  const initialMode = guideState?.mode || "PICK_LOCATION";
  const discussedList = Array.isArray(guideState?.discussedProperties) ? guideState.discussedProperties : [];
  const discussedIdSet = new Set(discussedList.map((d) => Number(d.accommodationId)));

  const [mode, setMode] = useState(initialMode);
  const [locations, setLocations] = useState(initialLocations);
  const [selectedLoc, setSelectedLoc] = useState(guideState?.location || null);
  const [properties, setProperties] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(
    initialMode === "PICK_LOCATION" && initialLocations.length === 0,
  );
  const [loadingProperties, setLoadingProperties] = useState(
    initialMode === "PICK_ACCOMMODATION" && Boolean(guideState?.location?.id),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    webChatClient
      .getHandoffDestinations()
      .then((res) => {
        if (active && Array.isArray(res?.items) && res.items.length > 0) {
          setLocations(res.items);
        }
      })
      .catch((err) => {
        if (active && initialMode === "PICK_LOCATION" && initialLocations.length === 0) {
          setError(err.message || "Không thể tải danh sách điểm đến.");
        }
      })
      .finally(() => {
        if (active) setLoadingLocations(false);
      });
    return () => {
      active = false;
    };
  }, [initialMode, initialLocations.length]);

  useEffect(() => {
    if (initialMode !== "PICK_ACCOMMODATION" || !guideState?.location?.id) return undefined;
    let active = true;
    webChatClient
      .getHandoffAccommodations(guideState.location.id)
      .then((res) => {
        if (active) setProperties(res?.items || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách cơ sở lưu trú.");
      })
      .finally(() => {
        if (active) setLoadingProperties(false);
      });
    return () => {
      active = false;
    };
  }, [initialMode, guideState?.location?.id]);

  async function loadLocationAccommodations(loc) {
    if (!loc?.id) {
      setMode("PICK_LOCATION");
      return;
    }
    setSelectedLoc(loc);
    setMode("PICK_ACCOMMODATION");
    setError("");
    setLoadingProperties(true);
    try {
      const res = await webChatClient.getHandoffAccommodations(loc.id);
      setProperties(res?.items || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách cơ sở lưu trú.");
    } finally {
      setLoadingProperties(false);
    }
  }

  const orderedProperties = [...properties].sort((a, b) => {
    const aDisc = discussedIdSet.has(Number(a.accommodationId || a.id)) ? 0 : 1;
    const bDisc = discussedIdSet.has(Number(b.accommodationId || b.id)) ? 0 : 1;
    return aDisc - bDisc;
  });

  const confirmProp = guideState?.property;
  const subtitleMap = {
    CONFIRM_SINGLE: "Kết nối nhanh với cơ sở bạn đang trao đổi:",
    PICK_FROM_DISCUSSED: "Chọn cơ sở bạn vừa trao đổi để gặp Quản lý:",
    PICK_ACCOMMODATION: `Chọn cơ sở tại ${selectedLoc?.name || "khu vực đã chọn"}:`,
    PICK_LOCATION: "Chọn thành phố hoặc điểm đến bạn muốn liên hệ:",
  };

  return (
    <div className="vps-card vps-card--guide" role="region" aria-label="Chọn cơ sở để gặp Quản lý">
      <div className="vps-card-head">
        <div className="vps-card-head-title">
          <UserCheck size={16} />
          <span>Kết nối trực tiếp Quản lý cơ sở</span>
        </div>
        <button type="button" className="vps-chip-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
      <p className="vps-card-subtitle">{subtitleMap[mode] || subtitleMap.PICK_LOCATION}</p>

      {error && <div className="vps-inline-alert">{error}</div>}

      {mode === "CONFIRM_SINGLE" && confirmProp ? (
        <div className="vps-handoff-confirm">
          <div className="vps-handoff-confirm-row">
            {confirmProp.coverImage && (
              <img
                src={resolveMediaUrl(confirmProp.coverImage)}
                alt={confirmProp.accommodationName}
                className="vps-handoff-confirm-img"
              />
            )}
            <div className="vps-handoff-confirm-info">
              <div className="vps-choice-title-row">
                <strong>{confirmProp.accommodationName}</strong>
                <StarStrip count={confirmProp.starRating} />
              </div>
              <span className="vps-prop-mini-meta">
                {[confirmProp.accommodationTypeName, confirmProp.locationName, confirmProp.addressLine]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span className="vps-prop-mini-meta">
                {confirmProp.hasActiveManager ? "Có Quản lý trực tuyến" : "Hỗ trợ AI & SĐT cơ sở"}
              </span>
            </div>
          </div>
          <div className="vps-handoff-confirm-actions">
            <button
              type="button"
              className="vps-btn-primary-xs"
              onClick={() => onSelectProperty(Number(confirmProp.accommodationId), { autoHandoff: true })}
            >
              {confirmProp.hasActiveManager ? "Gặp Quản lý" : "Mở & xem liên hệ"}
            </button>
            <button
              type="button"
              className="vps-btn-outline-xs"
              onClick={() => {
                if (selectedLoc?.id) {
                  loadLocationAccommodations(selectedLoc);
                } else {
                  setMode("PICK_LOCATION");
                }
              }}
            >
              Chọn cơ sở khác
            </button>
          </div>
        </div>
      ) : mode === "PICK_FROM_DISCUSSED" ? (
        <div className="vps-guide-step2">
          <div className="vps-prop-mini-list">
            {discussedList.map((p) =>
              renderPropertyMiniRow(p, {
                onSelectProperty,
                showLocationTag: true,
              }),
            )}
          </div>
          <button type="button" className="vps-back-link" onClick={() => setMode("PICK_LOCATION")}>
            <MapPin size={13} />
            <span>Xem tất cả điểm đến</span>
          </button>
        </div>
      ) : mode === "PICK_ACCOMMODATION" ? (
        <div className="vps-guide-step2">
          <button type="button" className="vps-back-link" onClick={() => setMode("PICK_LOCATION")}>
            <ArrowLeft size={14} />
            <span>Chọn điểm đến khác</span>
          </button>
          {loadingProperties ? (
            <div className="vps-card-loading">
              <Loader2 size={16} className="vps-spin" />
              <span>Đang tải danh sách cơ sở…</span>
            </div>
          ) : orderedProperties.length === 0 ? (
            <p className="vps-empty-note">Chưa có cơ sở khả dụng ở điểm đến này.</p>
          ) : (
            <div className="vps-prop-mini-list">
              {orderedProperties.map((p) =>
                renderPropertyMiniRow(p, {
                  onSelectProperty,
                  isDiscussed: discussedIdSet.has(Number(p.accommodationId || p.id)),
                }),
              )}
            </div>
          )}
        </div>
      ) : loadingLocations ? (
        <div className="vps-card-loading">
          <Loader2 size={16} className="vps-spin" />
          <span>Đang tải điểm đến…</span>
        </div>
      ) : (
        <div className="vps-dest-grid">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="vps-dest-pill"
              onClick={() => loadLocationAccommodations(loc)}
            >
              <MapPin size={13} />
              <span>{loc.name}</span>
              {loc.accommodationCount > 0 && (
                <small className="vps-dest-count">{loc.accommodationCount}</small>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageCard({ message, onSelectDestination, onSelectProperty, onRequestHandoff }) {
  const navigate = useNavigate();
  const payload = message?.payload;
  if (!payload) return null;

  // 1. HOME Destination Quick Chips
  if (payload.kind === "HOME_DESTINATIONS") {
    const locs = (payload.featuredLocations || []).slice(0, 6);
    return (
      <div className="vps-card vps-card--destinations">
        <div className="vps-card-label">
          <MapPin size={14} />
          <span>Điểm đến nổi bật trên VietPeace Stay</span>
        </div>
        <div className="vps-dest-grid">
          {locs.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="vps-dest-pill"
              onClick={() => onSelectDestination?.(loc)}
            >
              <span>{loc.name}</span>
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. LOCATION_SEARCH -> Horizontal/Compact Property Cards
  if (payload.kind === "PROPERTY_CHOICES") {
    const items = payload.items || [];
    return (
      <div className="vps-card vps-card--choices">
        <div className="vps-card-label">
          <Building2 size={14} />
          <span>Cơ sở gợi ý tại {payload.locationName || "điểm đến"}</span>
        </div>
        {items.length === 0 ? (
          <p className="vps-empty-note">Hiện chưa có cơ sở phù hợp bộ lọc tại khu vực này.</p>
        ) : (
          <div className="vps-choice-list">
            {items.map((item) => (
              <div key={item.accommodationId} className="vps-choice-item">
                {item.coverImage && (
                  <img
                    src={resolveMediaUrl(item.coverImage)}
                    alt={item.accommodationName}
                    className="vps-choice-img"
                  />
                )}
                <div className="vps-choice-body">
                  <div className="vps-choice-title-row">
                    <strong>{item.accommodationName}</strong>
                    <StarStrip count={item.starRating} />
                  </div>
                  <PropertySubline
                    label={item.accommodationTypeName}
                    minPrice={item.minPrice}
                    addressLine={item.addressLine}
                  />
                  <div className="vps-choice-actions">
                    <button
                      type="button"
                      className="vps-btn-outline-xs"
                      onClick={() => onSelectProperty?.(item.accommodationId, { autoHandoff: false })}
                    >
                      <Bot size={12} />
                      <span>Tư vấn AI</span>
                    </button>
                    <button
                      type="button"
                      className="vps-btn-primary-xs"
                      onClick={() => onSelectProperty?.(item.accommodationId, { autoHandoff: true })}
                    >
                      <UserCheck size={12} />
                      <span>Gặp Quản lý</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Shopee-style Pinned Property Card when opening chat on Accommodation Detail
  if (payload.kind === "PROPERTY_ATTACHMENT") {
    const areaOrType = payload.locationName || payload.accommodationTypeName;
    return (
      <div className="vps-card vps-card--attachment">
        <div className="vps-attachment-badge">Đang xem cơ sở</div>
        <div className="vps-attachment-row">
          {payload.coverImage && (
            <img
              src={resolveMediaUrl(payload.coverImage)}
              alt={payload.accommodationName}
              className="vps-attachment-img"
            />
          )}
          <div className="vps-attachment-info">
            <div className="vps-choice-title-row">
              <strong>{payload.accommodationName}</strong>
              <StarStrip count={payload.starRating} />
            </div>
            <PropertySubline
              label={areaOrType}
              minPrice={payload.minPrice}
              addressLine={payload.addressLine}
            />
            {payload.checkin && payload.checkout && (
              <div className="vps-stay-chip">
                <Calendar size={12} />
                <span>
                  {payload.checkin} → {payload.checkout}
                  {payload.rooms ? ` · ${payload.rooms} phòng` : ""}
                </span>
              </div>
            )}
          </div>
        </div>
        {(payload.phone || payload.email || payload.websiteUrl) && (
          <div className="vps-contact-strip">
            {payload.phone && (
              <span>
                <Phone size={11} /> {payload.phone}
              </span>
            )}
            {payload.email && (
              <span>
                <Mail size={11} /> {payload.email}
              </span>
            )}
            {payload.websiteUrl && (
              <span>
                <Globe size={11} /> Website cơ sở
              </span>
            )}
          </div>
        )}
        <div className="vps-attachment-actions">
          {payload.detailUrl && (
            <button
              type="button"
              className="vps-btn-outline-xs"
              onClick={() => navigate(payload.detailUrl)}
            >
              Xem cơ sở
            </button>
          )}
          <button
            type="button"
            className="vps-btn-primary-xs"
            onClick={() => onRequestHandoff?.()}
          >
            <UserCheck size={12} />
            <span>{payload.hasActiveManager ? "Gặp Quản lý" : "Liên hệ trực tiếp"}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Multi-room Recommendation & Exact Quote Card
  if (payload.kind === "ROOM_QUOTE") {
    const options = payload.options || [];
    return (
      <div className="vps-card vps-card--quote">
        <div className="vps-card-label">
          <BedDouble size={14} />
          <span>
            Báo giá {payload.accommodation?.accommodationName} ({payload.totalNights} đêm:{" "}
            {payload.checkinDate} → {payload.checkoutDate})
          </span>
        </div>
        <div className="vps-quote-list">
          {options.slice(0, 3).map((opt, idx) => (
            <div key={idx} className="vps-quote-option">
              <div className="vps-quote-opt-head">
                <strong>{opt.label}</strong>
                <strong className="vps-quote-total tabular-nums">
                  {formatVnd(opt.quote?.totalAmount)}
                </strong>
              </div>
              <div className="vps-quote-opt-meta">
                <span>
                  {opt.totalRooms} phòng · {opt.totalAdults} người lớn
                  {opt.totalChildren > 0 ? `, ${opt.totalChildren} trẻ em` : ""}
                </span>
                {opt.quote?.discountAmount > 0 && (
                  <span className="vps-discount-tag">
                    Đã giảm {formatVnd(opt.quote.discountAmount)}
                  </span>
                )}
              </div>
              {opt.bookingUrl && (
                <button
                  type="button"
                  className="vps-btn-primary-xs vps-btn-full"
                  onClick={() => navigate(opt.bookingUrl)}
                >
                  <CheckCircle2 size={13} />
                  <span>Xem phòng & đặt ngay</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Login Required CTA for Booking lookup
  if (payload.kind === "LOGIN_REQUIRED") {
    return (
      <div className="vps-card vps-card--login">
        <strong>{payload.title || "Đăng nhập để tiếp tục"}</strong>
        <p className="vps-empty-note">{payload.description}</p>
        <button
          type="button"
          className="vps-btn-primary-xs"
          onClick={() => navigate(payload.loginUrl || "/login")}
        >
          <LogIn size={13} />
          <span>Đăng nhập VietPeace Stay</span>
        </button>
      </div>
    );
  }

  // 6. Verified Booking Context Card
  if (payload.kind === "VERIFIED_BOOKING_CONTEXT") {
    return (
      <div className="vps-card vps-card--booking">
        <div className="vps-card-label">
          <Calendar size={14} />
          <span>Đơn đặt phòng #{payload.bookingCode}</span>
        </div>
        <div className="vps-booking-card-body">
          <strong>{payload.accommodationName}</strong>
          <span>
            Nhận: {payload.checkInDate} · Trả: {payload.checkOutDate}
          </span>
          <span className="tabular-nums">
            Trạng thái: <b>{payload.status}</b> · Tổng: <b>{formatVnd(payload.totalAmount)}</b>
          </span>
        </div>
      </div>
    );
  }

  return null;
}
