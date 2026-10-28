import { useEffect, useRef, useState, useContext } from "react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Search,
    MapPin,
    Building,
    Calendar,
    Users,
    Plus,
    Minus,
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import AppContext from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Chuyển YYYY-MM-DD thành Date theo giờ local.
function parseDateString(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
}

// Chuyển Date thành YYYY-MM-DD theo giờ local.
function formatDateToString(date) {
    if (!date || Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Chuẩn hóa để tìm kiếm không phân biệt hoa/thường và dấu.
function normalizeText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export default function AccommodationSearchForm({ className = "" }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { showToast } = useAuth();

	const { activeLocations, activeAccommodations, loadingDestinations, destinationsError } = useContext(AppContext);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultCheckin = formatDateToString(today);
    const defaultCheckout = formatDateToString(tomorrow);

    const [destinationQuery, setDestinationQuery] = useState("");

    const [selectedLocationId, setSelectedLocationId] = useState("");

    const [selectedAccommodationId, setSelectedAccommodationId] = useState("");

    const [checkin, setCheckin] = useState(searchParams.get("checkin") || defaultCheckin);

    const [checkout, setCheckout] = useState(searchParams.get("checkout") || defaultCheckout);

    const [rooms, setRooms] = useState(Number(searchParams.get("rooms") || 1));

    const [autocompleteOpen, setAutocompleteOpen] = useState(false);

    const [roomPopoverOpen, setRoomPopoverOpen] = useState(false);

    const autocompleteRef = useRef(null);
    const roomPopoverRef = useRef(null);

    // Điền tên điểm đến/chỗ nghỉ từ ID trên URL.
    // Chạy lại khi dữ liệu API đã tải xong.
    useEffect(() => {
        if (loadingDestinations || destinationsError) {
            return;
        }

        const locationId = searchParams.get("locationId") || "";
        const accommodationId = searchParams.get("accommodationId") || "";

        setDestinationQuery("");
        setSelectedLocationId("");
        setSelectedAccommodationId("");

        if (accommodationId) {
            const accommodation = activeAccommodations.find(
                (item) => String(item.id) === accommodationId
            );

            if (accommodation) {
                setDestinationQuery(accommodation.accommodation_name);
                setSelectedAccommodationId(accommodationId);
            }
        } else if (locationId) {
            const location = activeLocations.find(
                (item) => String(item.id) === locationId
            );

            if (location) {
                setDestinationQuery(location.name);
                setSelectedLocationId(locationId);
            }
        }
    }, [
        searchParams,
        activeLocations,
        activeAccommodations,
        loadingDestinations,
        destinationsError,
    ]);

    // Đồng bộ ngày và số phòng khi URL thay đổi.
    useEffect(() => {
        setCheckin(searchParams.get("checkin") || defaultCheckin);
        setCheckout(searchParams.get("checkout") || defaultCheckout);
        setRooms(Number(searchParams.get("rooms") || 1));
    }, [searchParams, defaultCheckin, defaultCheckout]);

    // Click bên ngoài thì đóng dropdown/popover.
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                autocompleteRef.current &&
                !autocompleteRef.current.contains(event.target)
            ) {
                setAutocompleteOpen(false);
            }

            if (
                roomPopoverRef.current &&
                !roomPopoverRef.current.contains(event.target)
            ) {
                setRoomPopoverOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    function getLocation(locationId) {
        return activeLocations.find(
            (item) => String(item.id) === String(locationId)
        );
    }

    // Lọc riêng hai mảng, không gộp thành AUTOCOMPLETE_OPTIONS.
    const keyword = normalizeText(destinationQuery);

    const filteredLocations = activeLocations.filter(
        (location) => {
            if (!keyword) return true;

            return (
                normalizeText(location.name).includes(keyword) ||
                normalizeText(location.search_keywords).includes(
                    keyword
                )
            );
        }
    );

    const filteredAccommodations = activeAccommodations.filter(
        (accommodation) => {
            if (!keyword) return true;

            const location = getLocation(
                accommodation.location_id
            );

            return (
                normalizeText(accommodation.accommodation_name).includes(keyword) ||
                normalizeText(location?.name).includes(keyword) ||
                normalizeText(location?.search_keywords).includes(keyword)
            );
        }
    );

    function handleDestinationChange(event) {
        setDestinationQuery(event.target.value);

        // Khi sửa nội dung textbox, bỏ lựa chọn trước đó.
        setSelectedLocationId("");
        setSelectedAccommodationId("");

        setAutocompleteOpen(true);
    }

    function handleSelectLocation(location) {
        setDestinationQuery(location.name);
        setSelectedLocationId(String(location.id));
        setSelectedAccommodationId("");
        setAutocompleteOpen(false);
    }

    function handleSelectAccommodation(accommodation) {
        setDestinationQuery(accommodation.accommodation_name);
        setSelectedAccommodationId(String(accommodation.id));
        setSelectedLocationId("");
        setAutocompleteOpen(false);
    }

    function handleCheckinDateChange(date) {
        if (!date) return;

        setCheckin(formatDateToString(date));

        const currentCheckout = parseDateString(checkout);

        if (!currentCheckout || currentCheckout <= date) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            setCheckout(formatDateToString(nextDay));
        }
    }

    function handleCheckoutDateChange(date) {
        if (!date) return;

        if (date <= parseDateString(checkin)) {
            showToast(
                "Ngày trả phòng phải sau ngày nhận phòng.",
                "error"
            );
            return;
        }

        setCheckout(formatDateToString(date));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (loadingDestinations) {
            showToast(
                "Danh sách điểm đến đang được tải.",
                "error"
            );
            return;
        }

        if (destinationsError) {
            showToast(destinationsError, "error");
            return;
        }

        if (!selectedLocationId && !selectedAccommodationId) {
            showToast(
                "Vui lòng chọn điểm đến hoặc chỗ nghỉ từ danh sách gợi ý.",
                "error"
            );

            setAutocompleteOpen(true);
            return;
        }

        if (!checkin || !checkout) {
            showToast(
                "Vui lòng chọn ngày nhận phòng và trả phòng.",
                "error"
            );
            return;
        }

        // Chuỗi ngày có cùng định dạng YYYY-MM-DD.
        if (checkin < defaultCheckin) {
            showToast(
                "Ngày nhận phòng không được trước hôm nay.",
                "error"
            );
            return;
        }

        if (checkout <= checkin) {
            showToast(
                "Ngày trả phòng phải sau ngày nhận phòng.",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(rooms) ||
            rooms < 1 ||
            rooms > 8
        ) {
            showToast(
                "Số phòng phải từ 1 đến 8.",
                "error"
            );
            return;
        }

        const params = new URLSearchParams();

        if (selectedAccommodationId) {
            params.set("accommodationId", selectedAccommodationId);
        } else {
            params.set("locationId", selectedLocationId);
        }

        params.set("checkin", checkin);
        params.set("checkout", checkout);
        params.set("rooms", String(rooms));

        setAutocompleteOpen(false);
        setRoomPopoverOpen(false);

        navigate(`/search?${params.toString()}`);
    }

    const minCheckoutDate =
        parseDateString(checkin) || new Date(today);

    minCheckoutDate.setDate(
        minCheckoutDate.getDate() + 1
    );

    return (
        <div className={`hotel-search-card ${className}`}>
            <form
                onSubmit={handleSubmit}
                className="hotel-search-form-grid"
            >
                {/* Điểm đến / chỗ nghỉ */}
                <div
                    className="search-col-destination"
                    style={{ position: "relative" }}
                    ref={autocompleteRef}
                >
                    <label
                        htmlFor="destination"
                        className="search-field-label"
                    >
                        Điểm đến hoặc Chỗ nghỉ
                    </label>

                    <div
                        className="search-input-box"
                        onClick={() => setAutocompleteOpen(true)}
                    >
                        <MapPin
                            size={20}
                            style={{
                                color: "var(--color-sunshine)",
                                flexShrink: 0,
                            }}
                        />

                        <input
                            id="destination"
                            type="text"
                            value={destinationQuery}
                            onChange={handleDestinationChange}
                            onFocus={() =>
                                setAutocompleteOpen(true)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setAutocompleteOpen(false);
                                }
                            }}
                            placeholder="Nhập điểm đến hay chỗ nghỉ"
                            className="search-text-input"
                            autoComplete="off"
                        />
                    </div>

                    {autocompleteOpen && (
                        <div className="autocomplete-panel">
                            {loadingDestinations ? (
                                <div style={{ padding: 16 }}>
                                    Đang tải danh sách điểm đến...
                                </div>
                            ) : destinationsError ? (
                                <div
                                    role="alert"
                                    style={{ padding: 16 }}
                                >
                                    {destinationsError}
                                </div>
                            ) : filteredLocations.length === 0 &&
                              filteredAccommodations.length ===
                                  0 ? (
                                <div style={{ padding: 16 }}>
                                    Không tìm thấy điểm đến hoặc
                                    chỗ nghỉ phù hợp.
                                </div>
                            ) : (
                                <>
                                    {filteredLocations.length >
                                        0 && (
                                        <div>
                                            <div className="autocomplete-group-title">
                                                Điểm đến
                                            </div>

                                            {filteredLocations.map(
                                                (location) => {
                                                    const parent = getLocation(location.parent_id);

                                                    return (
                                                        <button
                                                            key={location.id}
                                                            type="button"
                                                            className="autocomplete-item-btn"
                                                            onClick={() => handleSelectLocation(location)}
                                                        >
                                                            <div className="autocomplete-item-icon">
                                                                <MapPin
                                                                    size={16}
                                                                />
                                                            </div>

                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                    minWidth: 0,
                                                                    textAlign:
                                                                        "left",
                                                                }}
                                                            >
                                                                <div className="autocomplete-item-title">
                                                                    {
                                                                        location.name
                                                                    }
                                                                </div>

                                                                <div className="autocomplete-item-subtitle">
                                                                    {parent?.name || "Việt Nam"}
                                                                </div>
                                                            </div>

                                                            <span className="autocomplete-tag">
                                                                Điểm đến
                                                            </span>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                    {filteredAccommodations.length >
                                        0 && (
                                        <div>
                                            <div className="autocomplete-group-title">
                                                Chỗ nghỉ VietPeace
                                                Stay
                                            </div>

                                            {filteredAccommodations.map(
                                                (accommodation) => {
                                                    const location = getLocation(accommodation.location_id);

                                                    return (
                                                        <button
                                                            key={accommodation.id}
                                                            type="button"
                                                            className="autocomplete-item-btn"
                                                            onClick={() => handleSelectAccommodation(accommodation)}
                                                        >
                                                            <div className="autocomplete-item-icon">
                                                                <Building size={16}/>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                    minWidth: 0,
                                                                    textAlign:
                                                                        "left",
                                                                }}
                                                            >
                                                                <div className="autocomplete-item-title">
                                                                    {
                                                                        accommodation.accommodation_name
                                                                    }
                                                                </div>

                                                                <div className="autocomplete-item-subtitle">
                                                                    {
                                                                        location?.name
                                                                    }
                                                                </div>
                                                            </div>

                                                            <span className="autocomplete-tag">
                                                                Chỗ nghỉ
                                                            </span>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Ngày nhận phòng */}
                <div className="search-col-date">
                    <label className="search-field-label">
                        Nhận phòng
                    </label>

                    <div className="search-input-box">
                        <Calendar size={16} />

                        <div className="datepicker-field-wrap">
                            <DatePicker
                                selected={parseDateString(checkin)}
                                onChange={
                                    handleCheckinDateChange
                                }
                                dateFormat="dd/MM/yyyy"
                                className="custom-datepicker-input"
                                minDate={today}
                                placeholderText="Chọn ngày"
                            />
                        </div>
                    </div>
                </div>

                {/* Ngày trả phòng */}
                <div className="search-col-date">
                    <label className="search-field-label">
                        Trả phòng
                    </label>

                    <div className="search-input-box">
                        <Calendar size={16} />

                        <div className="datepicker-field-wrap">
                            <DatePicker
                                selected={parseDateString(
                                    checkout
                                )}
                                onChange={
                                    handleCheckoutDateChange
                                }
                                dateFormat="dd/MM/yyyy"
                                className="custom-datepicker-input"
                                minDate={minCheckoutDate}
                                placeholderText="Chọn ngày"
                            />
                        </div>
                    </div>
                </div>

                {/* Số phòng */}
                <div
                    className="search-col-guests"
                    style={{ position: "relative" }}
                    ref={roomPopoverRef}
                >
                    <label className="search-field-label">
                        Số phòng
                    </label>

                    <button
                        type="button"
                        onClick={() =>
                            setRoomPopoverOpen(
                                !roomPopoverOpen
                            )
                        }
                        className="search-input-box"
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <Users size={16} />
                            <span>{rooms} phòng</span>
                        </div>
                    </button>

                    {roomPopoverOpen && (
                        <div className="guest-popover-panel">
                            <div className="guest-counter-row">
                                <div>
                                    <div>Số phòng</div>
                                    <small>Số phòng cần đặt</small>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRooms(
                                                Math.max(
                                                    1,
                                                    rooms - 1
                                                )
                                            )
                                        }
                                        disabled={rooms <= 1}
                                        className="counter-btn"
                                        aria-label="Giảm số phòng"
                                    >
                                        <Minus size={14} />
                                    </button>

                                    <span className="tabular-nums">
                                        {rooms}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRooms(
                                                Math.min(
                                                    8,
                                                    rooms + 1
                                                )
                                            )
                                        }
                                        disabled={rooms >= 8}
                                        className="counter-btn"
                                        aria-label="Tăng số phòng"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setRoomPopoverOpen(false)
                                }
                                style={{
                                    width: "100%",
                                    marginTop: 8,
                                    padding: 8,
                                    border: "none",
                                    borderRadius:
                                        "var(--radius-md)",
                                    backgroundColor:
                                        "var(--color-sunshine-light)",
                                    color: "var(--color-navy)",
                                    cursor: "pointer",
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    )}
                </div>

                {/* Nút tìm kiếm */}
                <div className="search-col-submit">
                    <button
                        type="submit"
                        className="search-btn-submit"
                        aria-label="Tìm kiếm"
                        disabled={loadingDestinations}
                    >
                        <Search size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}