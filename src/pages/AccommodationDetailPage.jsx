import React, { useState, useEffect, useRef } from 'react';
import {
    useSearchParams,
    useNavigate,
    useLocation,
    Link,
} from 'react-router-dom';
import AccommodationStayDatesSearchForm from '../components/AccommodationStayDatesSearchForm';
import RoomTypeDetailCard from '../components/room_types/RoomTypeDetailCard';
import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import AccommodationOverview from '../components/AccommodationOverview';
import LoginModal from '../components/LoginModal.jsx';
import RoomTypePriceBreakdownTooltip from '../components/room_types/RoomTypePriceBreakdownTooltip';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVND, formatDateVN } from '../utils/bookingUtils.js';
import {
    MapPin,
    Star,
    Eye,
    Calendar,
    Sparkles,
    X,
    AlertCircle,
} from 'lucide-react';

const STORAGE_STAY_SELECTION_KEY = 'vinastay_stay_selection';
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
).replace(/\/$/, '');

const BACKEND_APP_BASE_URL = import.meta.env.VITE_BACKEND_APP_BASE_URL;

function mediaUrl(value) {
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:'))
        return value;
    return `${BACKEND_APP_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function isValidDateString(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function normalizeAccommodation(data) {
    return {
        ...data,
        name: data.accommodation_name,
        propertyType: data.accommodation_type_name,
        starRating: Number(data.star_rating) || 0,
        address: [
            data.address_line,
            data.loc_ward_fullname,
            data.loc_province_fullname,
        ]
            .filter(Boolean)
            .join(', '),
        images: [...(data.images || [])]
            .sort(
                (a, b) =>
                    Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)),
            )
            .map((image) => mediaUrl(image.image_url))
            .filter(Boolean),
    };
}

function normalizeRoomType(room) {
    return {
        ...room,
        availableQuantity: Number(room.availableQuantity),
        roomSubtotal: Number(room.roomSubtotal),
        extraAdultFeePerNight: Number(room.extraAdultFeePerNight),
        extraChildFeePerNight: Number(room.extraChildFeePerNight),
        images: (room.images || []).map((image) => ({
            ...image,
            image_url: mediaUrl(image.image_url),
        })),
    };
}

async function requestApi(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'include',
        ...(body === undefined
            ? {}
            : {
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
              }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
        const error = new Error(
            result.errorMsg || result.message || 'Không thể tải dữ liệu.',
        );
        error.status = response.status;
        error.errorCode = result.errorCode;
        error.errorsDetail = result.errors || result.errorsDetail || {};
        throw error;
    }
    return result.data;
}

export default function AccommodationDetailPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLoggedInUser } = useAuth();

    const hotelIdParam = searchParams.get('accommodationId') || '';
    const checkinParam = searchParams.get('checkin') || '';
    const checkoutParam = searchParams.get('checkout') || '';
    const roomsParam = searchParams.get('rooms');
    const validAccommodationId = /^[1-9]\d*$/.test(hotelIdParam);
    const requestedRoomsCount = roomsParam === null ? 1 : Number(roomsParam);
    const isStaySearchValid = Boolean(
        isValidDateString(checkinParam) &&
        isValidDateString(checkoutParam) &&
        checkoutParam > checkinParam &&
        Number.isInteger(requestedRoomsCount) &&
        requestedRoomsCount > 0 &&
        requestedRoomsCount <= 8,
    );
    const appliedCheckin = isStaySearchValid ? checkinParam : '';
    const appliedCheckout = isStaySearchValid ? checkoutParam : '';
    const appliedRoomsCount = isStaySearchValid ? requestedRoomsCount : 1;
    const stayKey = `${hotelIdParam}|${appliedCheckin}|${appliedCheckout}`;

    const [hotel, setHotel] = useState(null);
    const [detailLoading, setDetailLoading] = useState(true);
    const [detailError, setDetailError] = useState('');
    const [detailRetryKey, setDetailRetryKey] = useState(0);
    const [allRoomTypes, setAllRoomTypes] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [bookingData, setBookingData] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [previewMessages, setPreviewMessages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [galleryModal, setGalleryModal] = useState({
        isOpen: false,
        title: '',
        images: [],
        initialIndex: 0,
    });

    const selectedItemsRef = useRef([]);
    const draftRef = useRef({ key: null, value: undefined });
    const activeStayRef = useRef(stayKey);
    const previewRequestRef = useRef(0);
    const savingRef = useRef(false);
    const mountedRef = useRef(true);
    const loginRequestedRef = useRef(false);
    const previousUserRef = useRef(currentLoggedInUser);
    activeStayRef.current = stayKey;

    const detailReady =
        !detailLoading && String(hotel?.id) === hotelIdParam && !detailError;
    const busy = previewLoading || isSaving;
    const mutationsDisabled = busy || Boolean(previewError);
    const nightsCount = isStaySearchValid
        ? Math.round(
              (Date.parse(`${appliedCheckout}T00:00:00Z`) -
                  Date.parse(`${appliedCheckin}T00:00:00Z`)) /
                  86400000,
          )
        : 0;

    function makeDraft(items) {
        return {
            accommodationId: Number(hotelIdParam),
            checkinDate: appliedCheckin,
            checkoutDate: appliedCheckout,
            selectedRooms: items.map((item, index) => ({
                roomId: `room-${hotelIdParam}-${item.roomTypeId}-${index + 1}`,
                roomTypeId: Number(item.roomTypeId),
                adults: Number(item.adults),
                children: Number(item.children),
            })),
        };
    }

    function storeDraft(draft) {
        try {
            sessionStorage.setItem(
                STORAGE_STAY_SELECTION_KEY,
                JSON.stringify(draft),
            );
        } catch (error) {
            console.warn('[AccommodationDetailPage.storage]', error);
        }
    }

    function clearSavedDraft() {
        try {
            sessionStorage.removeItem(STORAGE_STAY_SELECTION_KEY);
        } catch (error) {
            console.warn('[AccommodationDetailPage.storage]', error);
        }
    }

    function readSavedDraft() {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_STAY_SELECTION_KEY) || 'null',
            );
            if (!saved) return undefined;
            // Hỗ trợ cả dữ liệu sessionStorage của component cũ.
            const id = saved.accommodationId ?? saved.hotelId;
            const checkin = saved.checkinDate ?? saved.checkin;
            const checkout = saved.checkoutDate ?? saved.checkout;
            const rooms = saved.selectedRooms ?? saved.rooms;
            if (
                String(id) !== hotelIdParam ||
                checkin !== appliedCheckin ||
                checkout !== appliedCheckout ||
                !Array.isArray(rooms)
            ) {
                clearSavedDraft();
                return undefined;
            }
            return makeDraft(rooms);
        } catch (error) {
            clearSavedDraft();
            return undefined;
        }
    }

    async function loadPreview(draft) {
        if (!detailReady || !isStaySearchValid) return;
        const requestId = ++previewRequestRef.current;
        const requestStay = stayKey;
        setPreviewLoading(true);
        setPreviewError('');
        setPreviewMessages([]);
        setBookingData(null);

        try {
            const body = {
                accommodationId: Number(hotelIdParam),
                checkinDate: appliedCheckin,
                checkoutDate: appliedCheckout,
                rooms: appliedRoomsCount,
            };
            if (draft !== undefined) body.draftBooking = draft;
            const data = await requestApi(
                '/booking/booking-preview',
                body,
            );
            if (
                !mountedRef.current ||
                requestId !== previewRequestRef.current ||
                activeStayRef.current !== requestStay
            )
                return;
            if (!Array.isArray(data?.allRoomTypes))
                throw new Error('Response preview thiếu allRoomTypes.');
            const roomTypes = data.allRoomTypes.map(normalizeRoomType);
            const quotedBooking = data.bookingData ?? null;
            if (quotedBooking && !Array.isArray(quotedBooking.selectedRooms))
                throw new Error('Response preview thiếu selectedRooms.');
            const items = (quotedBooking?.selectedRooms || []).map((item) => ({
                ...item,
                roomName:
                    roomTypes.find((room) => room.id === item.roomTypeId)
                        ?.name || 'Hạng phòng',
            }));
            setAllRoomTypes(roomTypes);
            setBookingData(quotedBooking);
            setAvailability(data.availability ?? null);
            setSelectedItems(items);
            selectedItemsRef.current = items;
            setPreviewMessages(
                [
                    ...(data.removedRoomTypes || []).map(
                        (item) => item.message,
                    ),
                    ...(data.selectionIssues || []).map((item) => item.message),
                ].filter(Boolean),
            );

            // Draft rỗng có chủ đích vẫn phải lưu để không khôi phục PENDING cũ.
            // Lần mở đầu chưa có lựa chọn thì cho phép API khôi phục DB sau đăng nhập.
            if (draft !== undefined || quotedBooking !== null) {
                const canonicalDraft = makeDraft(items);
                draftRef.current = { key: requestStay, value: canonicalDraft };
                storeDraft(canonicalDraft);
            }
            return data;
        } catch (error) {
            if (
                mountedRef.current &&
                requestId === previewRequestRef.current &&
                activeStayRef.current === requestStay
            ) {
                setPreviewError(
                    error.message || 'Không thể cập nhật phòng và giá.',
                );
            }
        } finally {
            if (mountedRef.current && requestId === previewRequestRef.current)
                setPreviewLoading(false);
        }
    }

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            previewRequestRef.current += 1;
        };
    }, []);

    // Chi tiết tải trước. Đổi ngày/rooms không tải lại thông tin tổng quan.
    useEffect(() => {
        let ignore = false;
        previewRequestRef.current += 1;
        setHotel(null);
        setDetailLoading(true);
        setDetailError('');
        setBookingData(null);
        setAllRoomTypes([]);
        setSelectedItems([]);
        selectedItemsRef.current = [];
        setGalleryModal((previous) => ({ ...previous, isOpen: false }));
        async function loadDetail() {
            try {
                if (!validAccommodationId)
                    throw new Error('Không tìm thấy cơ sở lưu trú.');
                const data = await requestApi(
                    `/accommodations/detail/${encodeURIComponent(hotelIdParam)}`,
                );
                const accommodation = data?.accommodationData;
                if (!accommodation || String(accommodation.id) !== hotelIdParam)
                    throw new Error('Không tìm thấy cơ sở lưu trú.');
                if (!ignore) setHotel(normalizeAccommodation(accommodation));
            } catch (error) {
                if (!ignore)
                    setDetailError(
                        error.status === 404
                            ? 'Không tìm thấy cơ sở lưu trú.'
                            : error.message,
                    );
            } finally {
                if (!ignore) setDetailLoading(false);
            }
        }
        loadDetail();
        return () => {
            ignore = true;
        };
    }, [hotelIdParam, detailRetryKey]);

    // location.key đổi cả khi submit/navigate lại cùng URL.
    useEffect(() => {
        if (!detailReady) return;
        setSaveError('');
        if (!isStaySearchValid) {
            previewRequestRef.current += 1;
            setSelectedItems([]);
            selectedItemsRef.current = [];
            setBookingData(null);
            setAllRoomTypes([]);
            setPreviewLoading(false);
            setPreviewError('');
            return;
        }
        if (draftRef.current.key !== stayKey) {
            const changedStay = draftRef.current.key !== null;
            const draft = changedStay ? makeDraft([]) : readSavedDraft();
            if (changedStay) {
                setAllRoomTypes([]);
                setAvailability(null);
                setSelectedItems([]);
                selectedItemsRef.current = [];
                clearSavedDraft();
            }
            draftRef.current = { key: stayKey, value: draft };
        }
        loadPreview(draftRef.current.value);
        return () => {
            previewRequestRef.current += 1;
        };
    }, [
        detailReady,
        hotelIdParam,
        appliedCheckin,
        appliedCheckout,
        appliedRoomsCount,
        isStaySearchValid,
        location.key,
    ]);

    // LoginModal hiện có cập nhật AuthContext. Theo dõi thành công tại trang cha.
    useEffect(() => {
        const previous = previousUserRef.current;
        previousUserRef.current = currentLoggedInUser;
        if (
            currentLoggedInUser &&
            (loginRequestedRef.current ||
                !previous ||
                previous.id !== currentLoggedInUser.id)
        ) {
            loginRequestedRef.current = false;
            setIsLoginModalOpen(false);
            navigate(`${location.pathname}${location.search}`, {
                replace: true,
                state: { ...location.state, previewAfterLogin: Date.now() },
            });
        }
    }, [currentLoggedInUser]);

    function handleSearchStay({ checkin, checkout, rooms }) {
        if (savingRef.current) return;
        if (checkin !== appliedCheckin || checkout !== appliedCheckout) {
            previewRequestRef.current += 1;
            setAllRoomTypes([]);
            setAvailability(null);
            setSelectedItems([]);
            selectedItemsRef.current = [];
            setBookingData(null);
            clearSavedDraft();
            draftRef.current = {
                key: `${hotelIdParam}|${checkin}|${checkout}`,
                value: {
                    accommodationId: Number(hotelIdParam),
                    checkinDate: checkin,
                    checkoutDate: checkout,
                    selectedRooms: [],
                },
            };
        }
        const params = new URLSearchParams(searchParams);
        params.set('accommodationId', hotelIdParam);
        params.set('checkin', checkin);
        params.set('checkout', checkout);
        params.set('rooms', String(rooms));
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function applySelection(nextItems) {
        if (mutationsDisabled) return;
        setSaveError('');
        const draft = makeDraft(nextItems);
        const items = nextItems.map((item, index) => ({
            ...item,
            roomId: draft.selectedRooms[index].roomId,
        }));
        selectedItemsRef.current = items;
        setSelectedItems(items);
        draftRef.current = { key: stayKey, value: draft };
        storeDraft(draft);
        loadPreview(draft);
    }

    function handleChangeQuantity(room, newQuantity) {
        if (mutationsDisabled) return;
        const current = selectedItemsRef.current;
        const selectedForType = current.filter(
            (item) => item.roomTypeId === room.id,
        );
        if (
            !Number.isInteger(newQuantity) ||
            newQuantity < 0 ||
            newQuantity > room.availableQuantity
        )
            return;
        if (newQuantity === selectedForType.length) return;
        if (newQuantity > selectedForType.length) {
            const additions = Array.from(
                { length: newQuantity - selectedForType.length },
                () => ({
                    roomTypeId: room.id,
                    roomName: room.name,
                    adults: 1,
                    children: 0,
                    maxAdults: room.maxAdults,
                    maxChildren: room.maxChildren,
                    maxOccupancy: room.maxOccupancy,
                }),
            );
            applySelection([...current, ...additions]);
        } else {
            const idsToRemove = new Set(
                selectedForType.slice(newQuantity).map((item) => item.roomId),
            );
            applySelection(
                current.filter((item) => !idsToRemove.has(item.roomId)),
            );
        }
    }

    function handleRemoveRoom(roomId) {
        applySelection(
            selectedItemsRef.current.filter((item) => item.roomId !== roomId),
        );
    }

    function handleUpdateGuests(roomId, field, value) {
        if (mutationsDisabled || !['adults', 'children'].includes(field))
            return;
        const items = selectedItemsRef.current.map((item) =>
            item.roomId === roomId ? { ...item, [field]: Number(value) } : item,
        );
        applySelection(items);
    }

    async function handleProceedBooking() {
        if (
            savingRef.current ||
            previewLoading ||
            previewError ||
            !bookingData ||
            selectedItemsRef.current.length === 0
        )
            return;
        if (!currentLoggedInUser) {
            loginRequestedRef.current = true;
            setIsLoginModalOpen(true);
            return;
        }
        savingRef.current = true;
        setIsSaving(true);
        setSaveError('');
        const requestStay = stayKey;
        const draft = makeDraft(selectedItemsRef.current);
        try {
            const data = await requestApi(
                '/booking/save-pending-booking',
                draft,
            );
            if (!mountedRef.current || activeStayRef.current !== requestStay)
                return;
            if (!data?.bookingId)
                throw new Error('Response lưu booking thiếu bookingId.');
            clearSavedDraft();
            navigate(
                `/checkout?bookingId=${encodeURIComponent(data.bookingId)}`,
            );
        } catch (error) {
            if (!mountedRef.current || activeStayRef.current !== requestStay)
                return;
            if (error.status === 401) {
                loginRequestedRef.current = true;
                setIsLoginModalOpen(true);
            } else if (error.status === 409) {
                await loadPreview(draft);
                if (mountedRef.current && activeStayRef.current === requestStay)
                    setSaveError(error.message);
            } else {
                setSaveError(
                    error.message ||
                        'Không thể lưu đặt phòng. Vui lòng thử lại.',
                );
            }
        } finally {
            savingRef.current = false;
            if (mountedRef.current) setIsSaving(false);
        }
    }

    const handleOpenGallery = (title, images, initialIndex = 0) => {
        if (images.length)
            setGalleryModal({ isOpen: true, title, images, initialIndex });
    };
    const handleCloseGallery = () =>
        setGalleryModal((previous) => ({ ...previous, isOpen: false }));

    if (!detailReady) {
        return (
            <main
                className="container-7xl"
                style={{ padding: '3rem 1rem', textAlign: 'center' }}
            >
                {detailLoading ? (
                    <p role="status">Đang tải thông tin cơ sở lưu trú...</p>
                ) : (
                    <div role="alert">
                        <h1>
                            {detailError || 'Không tìm thấy cơ sở lưu trú.'}
                        </h1>
                        {validAccommodationId && (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() =>
                                    setDetailRetryKey((value) => value + 1)
                                }
                            >
                                Thử lại
                            </button>
                        )}
                        <p>
                            <Link to="/search-accommodations">
                                Về trang tìm kiếm
                            </Link>
                        </p>
                    </div>
                )}
            </main>
        );
    }
    const hotelImages = hotel.images;

    return (
        <div className="hotel-detail-page">
            {/* 1. Hotel Breadcrumbs & Header Information */}
            <div className="container-7xl" style={{ paddingTop: '1.5rem' }}>
                <nav
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '1rem',
                    }}
                >
                    <Link to="/" style={{ color: 'inherit' }}>
                        Trang chủ
                    </Link>
                    <span>/</span>
                    <Link
                        to="/search-accommodations"
                        style={{ color: 'inherit' }}
                    >
                        Chỗ nghỉ
                    </Link>
                    <span>/</span>
                    <span
                        style={{ color: 'var(--color-navy)', fontWeight: 700 }}
                    >
                        {hotel.name}
                    </span>
                </nav>

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                            }}
                        >
                            <span
                                className="property-badge property-badge--hotel"
                                style={{ position: 'static' }}
                            >
                                {hotel.propertyType}
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'var(--color-sunshine)',
                                }}
                            >
                                {Array.from({ length: hotel.starRating }).map(
                                    (_, i) => (
                                        <Star
                                            key={i}
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                fill: 'var(--color-sunshine)',
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: 'var(--color-slate)',
                                }}
                            >
                                {hotel.starRating > 0
                                    ? `${hotel.starRating} sao`
                                    : 'Chưa xếp hạng sao'}
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: '1.875rem',
                                fontWeight: 800,
                                color: 'var(--color-navy)',
                            }}
                        >
                            {hotel.name}
                        </h1>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.875rem',
                                color: 'var(--color-slate)',
                                marginTop: '6px',
                            }}
                        >
                            <MapPin
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    color: 'var(--color-sunshine)',
                                    flexShrink: 0,
                                }}
                            />
                            <span>{hotel.address}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Hotel Image Gallery Section with EXACTLY "Xem thêm" Button */}
            <section
                className="container-7xl"
                style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
            >
                <div className="hotel-gallery-grid-box">
                    <div className="hotel-gallery-grid">
                        {/* Main Featured Photo */}
                        <div
                            className="hotel-gallery-featured-cell hotel-gallery-cell"
                            onClick={() =>
                                handleOpenGallery(hotel.name, hotelImages, 0)
                            }
                        >
                            {hotelImages[0] ? (
                                <img
                                    src={hotelImages[0]}
                                    alt={hotel.name}
                                    className="hotel-gallery-cell-img"
                                />
                            ) : (
                                <div
                                    style={{
                                        minHeight: '240px',
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                >
                                    Chưa có hình ảnh
                                </div>
                            )}
                        </div>

                        {/* Supporting Photos */}
                        {hotelImages.slice(1, 5).map((img, idx) => (
                            <div
                                key={idx}
                                className="hotel-gallery-cell"
                                onClick={() =>
                                    handleOpenGallery(
                                        hotel.name,
                                        hotelImages,
                                        idx + 1,
                                    )
                                }
                            >
                                <img
                                    src={img}
                                    alt={`${hotel.name} - Ảnh ${idx + 2}`}
                                    className="hotel-gallery-cell-img"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ))}
                    </div>

                    {/* REQUIRED BUTTON LABELED EXACTLY "Xem thêm" */}
                    <button
                        type="button"
                        onClick={() =>
                            handleOpenGallery(hotel.name, hotelImages, 0)
                        }
                        className="hotel-gallery-view-more-btn"
                    >
                        <Eye
                            style={{
                                width: '16px',
                                height: '16px',
                                color: 'var(--color-sunshine)',
                            }}
                        />
                        <span>Xem thêm</span>
                    </button>
                </div>
            </section>

            {/* 3. Property Overview Section (Overview, Amenities, Location/Attractions, Policies) */}
            <AccommodationOverview accommodation={hotel} />

            {/* 4. Stay Search Controls Section (Placed directly after Property Overview) */}
            <section className="container-7xl stay-search-section">
                <fieldset
                    disabled={isSaving}
                    style={{ border: 0, padding: 0, margin: 0 }}
                >
                    <AccommodationStayDatesSearchForm
                        initialCheckin={appliedCheckin}
                        initialCheckout={appliedCheckout}
                        initialRooms={appliedRoomsCount}
                        onSearchStay={handleSearchStay}
                    />
                </fieldset>
            </section>

            {/* 5. Room Types Section & Booking Summary: Only shown if stay search is complete and valid in URL */}
            {!isStaySearchValid ? (
                /* Prompt message when URL contains incomplete or missing stay parameters */
                <section
                    className="container-7xl"
                    style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
                >
                    <div className="stay-search-prompt-card">
                        <div className="stay-search-prompt-icon">
                            <Calendar
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    color: 'var(--color-sunshine)',
                                }}
                            />
                        </div>
                        <div className="stay-search-prompt-text">
                            <h3 className="stay-search-prompt-title">
                                Vui lòng chọn ngày lưu trú và số lượng phòng cần
                                tìm
                            </h3>
                            <p className="stay-search-prompt-desc">
                                Để xem danh sách phòng còn trống, giá ưu đãi và
                                các chính sách phụ thu theo số lượng khách, quý
                                khách vui lòng chọn{' '}
                                <strong>Ngày nhận phòng</strong>,{' '}
                                <strong>Ngày trả phòng</strong>,{' '}
                                <strong>Số phòng cần tìm</strong> ở thanh tìm
                                kiếm phía trên rồi bấm nút{' '}
                                <strong>"Tìm phòng"</strong>.
                            </p>
                        </div>
                    </div>
                </section>
            ) : (
                /* Room Types List and Sticky Booking Summary */
                <main
                    className="container-7xl"
                    style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}
                >
                    <div className="detail-layout-grid">
                        {/* Left Area: Available Room Types List */}
                        <section className="detail-rooms-col">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        color: 'var(--color-navy)',
                                    }}
                                >
                                    Các Loại Phòng Có Thể Đặt
                                </h2>
                                <p
                                    style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--color-slate)',
                                        marginTop: '4px',
                                    }}
                                >
                                    Kỳ nghỉ:{' '}
                                    <strong>
                                        {formatDateVN(appliedCheckin)} –{' '}
                                        {formatDateVN(appliedCheckout)} (
                                        {nightsCount} đêm)
                                    </strong>{' '}
                                    · Số phòng cần tìm:{' '}
                                    <strong>{appliedRoomsCount} phòng</strong>.
                                </p>
                            </div>

                            {previewLoading && (
                                <p role="status">
                                    Đang kiểm tra phòng trống và tính giá...
                                </p>
                            )}
                            {previewError && (
                                <div role="alert">
                                    <p>{previewError}</p>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() =>
                                            loadPreview(draftRef.current.value)
                                        }
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}
                            {availability?.message && !previewLoading && (
                                <p
                                    role="status"
                                    style={{
                                        padding: '12px',
                                        background: '#FFF7ED',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {availability.message}
                                </p>
                            )}
                            {previewMessages.length > 0 && (
                                <div
                                    role="status"
                                    style={{
                                        padding: '12px',
                                        background: '#FFF7ED',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {previewMessages.map((message, index) => (
                                        <p key={index}>{message}</p>
                                    ))}
                                </div>
                            )}

                            {/* API trả toàn bộ hạng phòng đang active, kể cả hạng hết phòng. */}
                            {!previewLoading &&
                            !previewError &&
                            allRoomTypes.length === 0 ? (
                                <div className="hotel-rooms-empty-state">
                                    <AlertCircle
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            color: 'var(--color-sunshine)',
                                            marginBottom: '8px',
                                        }}
                                    />
                                    <h3
                                        style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: 'var(--color-navy)',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        Chưa có hạng phòng đang mở bán
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--color-slate)',
                                            maxWidth: '480px',
                                            margin: '0 auto',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Quý khách vui lòng liên hệ cơ sở lưu trú
                                        hoặc thử tìm ngày khác.
                                    </p>
                                </div>
                            ) : (
                                /* Room Type Cards List */
                                allRoomTypes.map((room) => {
                                    const selectedForThisType =
                                        selectedItems.filter(
                                            (item) =>
                                                item.roomTypeId === room.id,
                                        );
                                    return (
                                        <RoomTypeDetailCard
                                            key={room.id}
                                            room={room}
                                            disabled={mutationsDisabled}
                                            checkin={appliedCheckin}
                                            checkout={appliedCheckout}
                                            nights={nightsCount}
                                            selectedRooms={selectedForThisType}
                                            onChangeQuantity={
                                                handleChangeQuantity
                                            }
                                            onUpdateGuests={handleUpdateGuests}
                                            onRemoveRoom={handleRemoveRoom}
                                            onOpenGallery={handleOpenGallery}
                                        />
                                    );
                                })
                            )}
                        </section>

                        {/* Right Area: Sticky Booking Summary Panel */}
                        <aside className="detail-booking-sidebar-col">
                            <div
                                className="booking-summary-panel"
                                aria-busy={busy}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        paddingBottom: '12px',
                                        borderBottom:
                                            '1px solid var(--color-border)',
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: 800,
                                        }}
                                    >
                                        Tóm Tắt Đặt Phòng
                                    </h3>
                                    <span style={{ fontSize: '12px' }}>
                                        {selectedItems.length} phòng đã chọn
                                    </span>
                                </div>
                                {bookingData?.bookingId && (
                                    <p style={{ fontSize: '12px' }}>
                                        Booking chờ thanh toán:{' '}
                                        <strong>
                                            #{bookingData.bookingId}
                                        </strong>
                                    </p>
                                )}
                                {previewLoading && (
                                    <p role="status">
                                        Đang kiểm tra phòng trống và cập nhật
                                        giá...
                                    </p>
                                )}
                                {saveError && (
                                    <p
                                        role="alert"
                                        style={{ color: '#B91C1C' }}
                                    >
                                        {saveError}
                                    </p>
                                )}
                                {selectedItems.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '2rem 1rem',
                                            textAlign: 'center',
                                            backgroundColor:
                                                'var(--color-ivory)',
                                            borderRadius: 'var(--radius-lg)',
                                        }}
                                    >
                                        <p>Chưa có phòng nào được chọn.</p>
                                        <p style={{ fontSize: '12px' }}>
                                            Chọn phòng từ các hạng bên trái.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="selected-rooms-list">
                                        {selectedItems.map((item, index) => {
                                            const typeIndex = selectedItems
                                                .slice(0, index + 1)
                                                .filter(
                                                    (room) =>
                                                        room.roomTypeId ===
                                                        item.roomTypeId,
                                                ).length;
                                            const extraAdults = Math.max(
                                                0,
                                                item.adults -
                                                    item.includedAdults,
                                            );
                                            const extraChildren = Math.max(
                                                0,
                                                item.children -
                                                    item.includedChildren,
                                            );
                                            const adultBreakdown = (
                                                item.nightlyRates || []
                                            ).map((rate) => ({
                                                label: formatDateVN(
                                                    rate.stayDate,
                                                ),
                                                calculationStr: `${formatVND(item.extraAdultFeePerNight)}/người × ${extraAdults} người`,
                                            }));
                                            const childBreakdown = (
                                                item.nightlyRates || []
                                            ).map((rate) => ({
                                                label: formatDateVN(
                                                    rate.stayDate,
                                                ),
                                                calculationStr: `${formatVND(item.extraChildFeePerNight)}/trẻ em × ${extraChildren} trẻ em`,
                                            }));
                                            return (
                                                <div
                                                    key={item.roomId}
                                                    className="selected-room-row"
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            gap: '8px',
                                                        }}
                                                    >
                                                        <h4 className="selected-room-title">
                                                            {item.roomName} -
                                                            Phòng {typeIndex}
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                mutationsDisabled
                                                            }
                                                            onClick={() =>
                                                                handleRemoveRoom(
                                                                    item.roomId,
                                                                )
                                                            }
                                                            className="selected-room-remove-btn"
                                                            aria-label={`Bỏ ${item.roomName} - Phòng ${typeIndex}`}
                                                        >
                                                            <X
                                                                style={{
                                                                    width: '16px',
                                                                    height: '16px',
                                                                }}
                                                            />
                                                        </button>
                                                    </div>
                                                    <div className="selected-room-guests-static">
                                                        {item.adults} người lớn,{' '}
                                                        {item.children} trẻ em
                                                    </div>
                                                    {bookingData ? (
                                                        <div className="selected-room-pricing-box">
                                                            <div className="selected-room-price-line selected-room-price-line--total">
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        gap: '6px',
                                                                    }}
                                                                >
                                                                    <span>
                                                                        Tiền
                                                                        phòng{' '}
                                                                        {
                                                                            nightsCount
                                                                        }{' '}
                                                                        đêm:
                                                                    </span>
                                                                    <RoomTypePriceBreakdownTooltip
                                                                        title="Chi tiết tiền phòng"
                                                                        nightlyRates={
                                                                            item.nightlyRates
                                                                        }
                                                                        totalLabel="Tổng tiền phòng"
                                                                        totalAmount={
                                                                            item.roomSubtotal
                                                                        }
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {formatVND(
                                                                        item.roomSubtotal,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="selected-room-price-line">
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <span>
                                                                        Phụ thu
                                                                        người
                                                                        lớn:
                                                                    </span>
                                                                    <RoomTypePriceBreakdownTooltip
                                                                        title="Chi tiết phụ thu người lớn"
                                                                        items={
                                                                            adultBreakdown
                                                                        }
                                                                        emptyNotice={
                                                                            extraAdults ===
                                                                            0
                                                                                ? 'Số người lớn nằm trong tiêu chuẩn đã bao gồm.'
                                                                                : undefined
                                                                        }
                                                                        totalLabel="Tổng phụ thu người lớn"
                                                                        totalAmount={
                                                                            item.extraAdultTotal
                                                                        }
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {formatVND(
                                                                        item.extraAdultTotal,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="selected-room-price-line">
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <span>
                                                                        Phụ thu
                                                                        trẻ em:
                                                                    </span>
                                                                    <RoomTypePriceBreakdownTooltip
                                                                        title="Chi tiết phụ thu trẻ em"
                                                                        items={
                                                                            childBreakdown
                                                                        }
                                                                        emptyNotice={
                                                                            extraChildren ===
                                                                            0
                                                                                ? 'Số trẻ em nằm trong tiêu chuẩn đã bao gồm.'
                                                                                : undefined
                                                                        }
                                                                        totalLabel="Tổng phụ thu trẻ em"
                                                                        totalAmount={
                                                                            item.extraChildTotal
                                                                        }
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {formatVND(
                                                                        item.extraChildTotal,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {/* <div className="selected-room-price-line">
                                                                <span>
                                                                    Giảm giá
                                                                    phòng:
                                                                </span>
                                                                <span>
                                                                    -
                                                                    {formatVND(
                                                                        item.discountAmount,
                                                                    )}
                                                                </span>
                                                            </div> */}
                                                            <div className="selected-room-price-line selected-room-price-line--total">
                                                                <span>
                                                                    Tổng phòng:
                                                                </span>
                                                                <strong>
                                                                    {formatVND(
                                                                        item.totalAmount,
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    '12px',
                                                            }}
                                                        >
                                                            Chưa có báo giá mới
                                                            nhất.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {bookingData && (
                                    <div
                                        style={{
                                            borderTop:
                                                '1px solid var(--color-border)',
                                            paddingTop: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            fontSize: '12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span>
                                                Tiền phòng ({nightsCount} đêm):
                                            </span>
                                            <strong>
                                                {formatVND(
                                                    bookingData.roomsSubtotal,
                                                )}
                                            </strong>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span>Phụ thu khách:</span>
                                            <strong>
                                                {formatVND(
                                                    bookingData.extraGuestTotal,
                                                )}
                                            </strong>
                                        </div>
                                        {/* <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span>Giảm giá hạng phòng:</span>
                                            <strong>
                                                -
                                                {formatVND(
                                                    bookingData.roomDiscountTotal,
                                                )}
                                            </strong>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span>Giảm giá booking:</span>
                                            <strong>
                                                -
                                                {formatVND(
                                                    bookingData.discountAmount,
                                                )}
                                            </strong>
                                        </div> */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span>Thuế:</span>
                                            <strong>
                                                {formatVND(
                                                    bookingData.taxAmount,
                                                )}
                                            </strong>
                                        </div>
                                        {bookingData.serviceFee != null && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <span>Phí dịch vụ:</span>
                                                <strong>
                                                    {formatVND(
                                                        bookingData.serviceFee,
                                                    )}
                                                </strong>
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                borderTop:
                                                    '1px solid var(--color-border)',
                                                paddingTop: '8px',
                                            }}
                                        >
                                            <strong>Tổng cộng:</strong>
                                            <strong
                                                className="tabular-nums"
                                                style={{ fontSize: '1.25rem' }}
                                            >
                                                {formatVND(
                                                    bookingData.totalAmount,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleProceedBooking}
                                    disabled={
                                        busy ||
                                        Boolean(previewError) ||
                                        !bookingData ||
                                        selectedItems.length === 0
                                    }
                                    className="btn-primary btn-primary--full"
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-lg)',
                                    }}
                                >
                                    <Sparkles
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                        }}
                                    />
                                    <span>
                                        {isSaving
                                            ? 'Đang lưu đặt phòng...'
                                            : currentLoggedInUser
                                              ? 'Đặt phòng'
                                              : 'Đăng nhập để đặt phòng'}
                                    </span>
                                </button>
                            </div>
                        </aside>
                    </div>
                </main>
            )}

            {/* Functional Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                returnUrl={location.pathname + location.search}
            />

            {/* Shared Reusable Image Gallery Modal */}
            <ImageGalleryModal
                isOpen={galleryModal.isOpen}
                onClose={handleCloseGallery}
                title={galleryModal.title}
                images={galleryModal.images}
                initialIndex={galleryModal.initialIndex}
            />
        </div>
    );
}
