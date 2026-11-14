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

export function HandoffGuideCard({ initialLocations = [], onSelectProperty, onClose }) {
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState(initialLocations);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(initialLocations.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (locations.length > 0) return;
    let active = true;
    webChatClient
      .getHandoffDestinations()
      .then((res) => {
        if (active) setLocations(res.items || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách điểm đến.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locations.length]);

  async function handleChooseLocation(loc) {
    setSelectedLoc(loc);
    setStep(2);
    setError("");
    setLoading(true);
    try {
      const res = await webChatClient.getHandoffAccommodations(loc.id);
      setProperties(res.items || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách cơ sở lưu trú.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vps-card vps-card--guide" role="region" aria-label="Chọn điểm đến và cơ sở để gặp Quản lý">
      <div className="vps-card-head">
        <div className="vps-card-head-title">
          <UserCheck size={16} />
          <span>Kết nối trực tiếp Quản lý cơ sở</span>
        </div>
        <button type="button" className="vps-chip-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
      <p className="vps-card-subtitle">
        {step === 1
          ? "Bước 1/2: Chọn thành phố hoặc điểm đến bạn muốn liên hệ:"
          : `Bước 2/2: Chọn cơ sở tại ${selectedLoc?.name || "khu vực đã chọn"}:`}
      </p>

      {error && <div className="vps-inline-alert">{error}</div>}

      {loading ? (
        <div className="vps-card-loading">
          <Loader2 size={16} className="vps-spin" />
          <span>Đang tải dữ liệu…</span>
        </div>
      ) : step === 1 ? (
        <div className="vps-dest-grid">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="vps-dest-pill"
              onClick={() => handleChooseLocation(loc)}
            >
              <MapPin size={13} />
              <span>{loc.name}</span>
              {loc.accommodationCount > 0 && (
                <small className="vps-dest-count">{loc.accommodationCount}</small>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="vps-guide-step2">
          <button type="button" className="vps-back-link" onClick={() => setStep(1)}>
            <ArrowLeft size={14} />
            <span>Chọn điểm đến khác</span>
          </button>
          {properties.length === 0 ? (
            <p className="vps-empty-note">Chưa có cơ sở khả dụng ở điểm đến này.</p>
          ) : (
            <div className="vps-prop-mini-list">
              {properties.map((p) => (
                <div key={p.id} className="vps-prop-mini-item">
                  <div className="vps-prop-mini-info">
                    <strong>{p.name}</strong>
                    <span className="vps-prop-mini-meta">
                      {p.addressLine || p.locationName}
                      {p.hasActiveManager ? " · Có Quản lý trực tuyến" : " · Hỗ trợ AI & SĐT cơ sở"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="vps-btn-primary-xs"
                    onClick={() => onSelectProperty(p.id, { autoHandoff: true })}
                  >
                    {p.hasActiveManager ? "Kết nối Quản lý" : "Mở & xem liên hệ"}
                  </button>
                </div>
              ))}
            </div>
          )}
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
    const locs = payload.featuredLocations || [];
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
                  <div className="vps-choice-meta">
                    {item.accommodationTypeName && <span>{item.accommodationTypeName}</span>}
                    {item.minPrice != null && (
                      <span className="vps-price-tag tabular-nums">Từ {formatVnd(item.minPrice)}/đêm</span>
                    )}
                  </div>
                  {item.addressLine && <p className="vps-choice-addr">{item.addressLine}</p>}
                  <div className="vps-choice-actions">
                    <button
                      type="button"
                      className="vps-btn-outline-xs"
                      onClick={() => onSelectProperty?.(item.accommodationId, { autoHandoff: false })}
                    >
                      <Bot size={13} />
                      <span>Tư vấn cơ sở này</span>
                    </button>
                    <button
                      type="button"
                      className="vps-btn-primary-xs"
                      onClick={() => onSelectProperty?.(item.accommodationId, { autoHandoff: true })}
                    >
                      <UserCheck size={13} />
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
    return (
      <div className="vps-card vps-card--attachment">
        <div className="vps-attachment-badge">Đính kèm cơ sở bạn đang xem</div>
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
            <div className="vps-choice-meta">
              <span>{payload.locationName || payload.accommodationTypeName}</span>
              {payload.minPrice != null && (
                <span className="vps-price-tag tabular-nums">Từ {formatVnd(payload.minPrice)}/đêm</span>
              )}
            </div>
            {payload.addressLine && <p className="vps-choice-addr">{payload.addressLine}</p>}
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
              Xem trang cơ sở
            </button>
          )}
          <button
            type="button"
            className="vps-btn-primary-xs"
            onClick={() => onRequestHandoff?.()}
          >
            <UserCheck size={13} />
            <span>{payload.hasActiveManager ? "Kết nối Quản lý cơ sở" : "Liên hệ trực tiếp"}</span>
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
