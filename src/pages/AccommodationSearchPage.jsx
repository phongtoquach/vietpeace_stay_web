import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';

//import HotelSearchForm from '../components/HotelSearchForm.jsx';
import AccommodationSearchForm from '../components/AccommodationSearchForm';

//import HotelCard from '../components/HotelCard.jsx';
import AccommodationCard from '../components/AccommodationCard';

import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import { formatDateVN, formatVND } from '../utils/bookingUtils.js';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

// Đổi giá trị này để thay số accommodation mỗi trang. 0 = không phân trang.
const PAGE_SIZE = 3;
//const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MIN_BOUND = 0;
const MAX_BOUND = 5000000;
const STEP = 200000;

// Accommodation types configuration and ID mapping
const ACCOMMODATION_TYPES = [
    { id: '1', key: 'HOTEL', label: 'Khách sạn (Hotel)' },
    { id: '2', key: 'RESORT', label: 'Khu nghỉ dưỡng (Resort)' },
    { id: '3', key: 'HOMESTAY', label: 'Homestay sinh thái' },
];

// Star ratings configuration in descending order (5 to 1)
const STAR_RATINGS_CONFIG = [
    { rating: 5, label: '5 sao cao cấp' },
    { rating: 4, label: '4 sao tiêu chuẩn' },
    { rating: 3, label: '3 sao' },
    { rating: 2, label: '2 sao' },
    { rating: 1, label: '1 sao' },
];

// Amenities configuration with canonical numeric IDs
const AMENITIES_CONFIG = [
    { id: 1, code: 'restaurant', label: 'Nhà hàng' },
    { id: 6, code: 'breakfast_service', label: 'Dịch vụ bữa sáng' },
    { id: 11, code: 'outdoor_pool', label: 'Hồ bơi ngoài trời' },
    { id: 68, code: 'on_site_parking', label: 'Bãi đỗ xe ô tô' },
    { id: 185, code: 'wifi', label: 'Wi-Fi' },
    { id: 17, code: 'spa', label: 'Spa' },
    { id: 24, code: 'children_playground', label: 'Khu vui chơi trẻ em' },
    { id: 36, code: 'garden', label: 'Sân vườn' },
    { id: 50, code: 'front_desk_24h', label: 'Lễ tân 24 giờ' },
    { id: 51, code: 'luggage_storage', label: 'Giữ hành lý' },
    { id: 54, code: 'laundry_service', label: 'Dịch vụ giặt ủi' },
];

// Dùng để đánh dấu checkbox; validation request nằm trong buildSearchBody().
function readSelectedIds(raw) {
    return raw
        ? [
              ...new Set(
                  raw
                      .split(',')
                      .map(Number)
                      .filter((n) => Number.isInteger(n) && n > 0),
              ),
          ]
        : [];
}

// Chỉ gửi filter thật sự có trên URL. Không tự áp giá mặc định của slider.
export function buildSearchBody(params) {
    const body = {
        sort: params.get('sort') || 'default',
        page: 1,
        pageSize: PAGE_SIZE,
    };

    // Tương thích URL cũ; API dùng tên sort mới.
    if (body.sort === 'featured') body.sort = 'default';
    if (body.sort === 'rating_desc') body.sort = 'star_rating_desc';

    const numericFields = {
        accommodationId: 'accommodationId',
        locationId: 'locationId',
        rooms: 'rooms',
        minPrice: 'priceFrom',
        maxPrice: 'priceTo',
        page: 'page',
    };

    for (const [urlKey, bodyKey] of Object.entries(numericFields)) {
        const raw = params.get(urlKey);
        if (raw === null || raw.trim() === '') continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) {
            throw new Error(`Tham số ${urlKey} không phải số hợp lệ.`);
        }
        body[bodyKey] = value;
    }

    for (const key of ['accommodationTypeIds', 'starRatings', 'amenityIds']) {
        const raw = params.get(key);
        if (!raw) continue;
        const tokens = raw.split(',').map((token) => token.trim());
        if (tokens.some((token) => !/^[1-9]\d*$/.test(token) || !Number.isSafeInteger(Number(token)))) {
            throw new Error(`Tham số ${key} phải là danh sách ID số nguyên dương.`);
        }
        body[key] = [...new Set(tokens.map(Number))];
    }

    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    if (checkin) body.checkinDate = checkin;
    if (checkout) body.checkoutDate = checkout;

    return body;
}

export default function AccommodationSearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Search parameters from URL (single source of truth)
    const locationId = searchParams.get('locationId') || '';
    const accommodationId = searchParams.get('accommodationId') || '';
    const checkin = searchParams.get('checkin') || '';
    const checkout = searchParams.get('checkout') || '';
    const rooms = searchParams.get('rooms') || '1';
    const adults = searchParams.get('adults') || '';
    const childrenCount = searchParams.get('children') || '';

    // Read and validate page parameter
    const rawPage = searchParams.get('page');
    const parsedPage = parseInt(rawPage, 10);
    const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const selectedTypeIds = readSelectedIds(searchParams.get('accommodationTypeIds')).map(String);
    const selectedRatings = readSelectedIds(searchParams.get('starRatings'));
    const selectedAmenityIds = readSelectedIds(searchParams.get('amenityIds'));

    // Committed price values from URL (fallback to slider boundaries)
    const committedMinPrice = useMemo(() => {
        const raw = searchParams.get('minPrice');
        if (raw && !isNaN(Number(raw))) {
            return Math.max(MIN_BOUND, Math.min(MAX_BOUND, Number(raw)));
        }
        return MIN_BOUND;
    }, [searchParams]);

    const committedMaxPrice = useMemo(() => {
        const raw = searchParams.get('maxPrice');
        if (raw && !isNaN(Number(raw))) {
            return Math.max(MIN_BOUND, Math.min(MAX_BOUND, Number(raw)));
        }
        return MAX_BOUND;
    }, [searchParams]);

    const sortBy = useMemo(() => {
        const value = searchParams.get('sort') || 'default';
        if (value === 'featured') return 'default';
        if (value === 'rating_desc') return 'star_rating_desc';
        return value;
    }, [searchParams]);

    // Local draft states for two-handle price slider during dragging
    const [draftMinPrice, setDraftMinPrice] = useState(committedMinPrice);
    const [draftMaxPrice, setDraftMaxPrice] = useState(committedMaxPrice);
    const [activeThumb, setActiveThumb] = useState('min');

    const draftMinRef = useRef(draftMinPrice);
    const draftMaxRef = useRef(draftMaxPrice);
    const isDraggingRef = useRef(false);
    const activeThumbRef = useRef(activeThumb);
    const keyboardTimerRef = useRef(null);
    const sliderTrackRef = useRef(null);

    // Synchronize draft values with committed URL values on direct access, refresh, and Back/Forward
    useEffect(() => {
        setDraftMinPrice(committedMinPrice);
        setDraftMaxPrice(committedMaxPrice);
        draftMinRef.current = committedMinPrice;
        draftMaxRef.current = committedMaxPrice;
    }, [committedMinPrice, committedMaxPrice]);

    useEffect(() => {
        activeThumbRef.current = activeThumb;
    }, [activeThumb]);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryKey, setRetryKey] = useState(0);
    const [displayedHotels, setDisplayedHotels] = useState([]);
    const [resultPagination, setResultPagination] = useState({
        enabled: PAGE_SIZE > 0,
        page: 1,
        pageSize: PAGE_SIZE,
        total: 0,
        totalPages: 0,
    });

    // Chạy khi pathname/query/hash thay đổi, kể cả lần mở trang đầu tiên.
    // Cleanup chỉ ngăn response cũ ghi đè response mới; không dùng AbortController.
    useEffect(() => {
        let ignoreResponse = false;

        async function loadAccommodations() {
            setIsLoading(true);
            setErrorMessage('');
            setDisplayedHotels([]);
            setResultPagination({
                enabled: PAGE_SIZE > 0,
                page: 1,
                pageSize: PAGE_SIZE,
                total: 0,
                totalPages: 0,
            });
            setGalleryModal((previous) => ({ ...previous, isOpen: false }));

            try {
                const body = buildSearchBody(new URLSearchParams(location.search));
                const response = await fetch(`${API_BASE_URL}/accommodations/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    credentials: "include"
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    const detail = Object.values(result.errors || {}).flat().join(' ');
                    throw new Error(detail || result.message || 'Không thể tải kết quả tìm kiếm.');
                }
                if (!Array.isArray(result.data?.items) || !result.data?.pagination) {
                    throw new Error('Dữ liệu kết quả tìm kiếm không đúng định dạng.');
                }
                if (ignoreResponse) return;

                setDisplayedHotels(result.data.items);
                setResultPagination(result.data.pagination);
            } catch (error) {
                if (ignoreResponse) return;
                console.error('[AccommodationSearchPage.search]', error);
                setErrorMessage(error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
            } finally {
                if (!ignoreResponse) setIsLoading(false);
            }
        }

        loadAccommodations();
        return () => {
            ignoreResponse = true;
        };
    }, [location.pathname, location.search, retryKey]);

    useEffect(() => {
        return () => clearTimeout(keyboardTimerRef.current);
    }, []);

    // Helper to commit the price range in ONE React Router navigation and scroll to top
    const commitPriceRange = (newMin, newMax) => {
        if (newMin === committedMinPrice && newMax === committedMaxPrice) {
            return;
        }
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('minPrice', String(newMin));
        nextParams.set('maxPrice', String(newMax));
        nextParams.set('page', '1');
        setSearchParams(nextParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Global pointer release & cancel listeners for smooth drag-release outside the slider
    useEffect(() => {
        const handleGlobalRelease = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                commitPriceRange(draftMinRef.current, draftMaxRef.current);
            }
        };

        const handleGlobalCancel = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                // Revert to committed URL values on cancelled gesture
                setDraftMinPrice(committedMinPrice);
                setDraftMaxPrice(committedMaxPrice);
                draftMinRef.current = committedMinPrice;
                draftMaxRef.current = committedMaxPrice;
            }
        };

        window.addEventListener('pointerup', handleGlobalRelease);
        window.addEventListener('pointercancel', handleGlobalCancel);
        return () => {
            window.removeEventListener('pointerup', handleGlobalRelease);
            window.removeEventListener('pointercancel', handleGlobalCancel);
        };
    }, [committedMinPrice, committedMaxPrice, searchParams]);

    // Keyboard navigation helpers for slider handles
    const handleSliderKeyDown = () => {
        if (keyboardTimerRef.current) {
            clearTimeout(keyboardTimerRef.current);
        }
    };

    const handleSliderKeyUp = () => {
        if (keyboardTimerRef.current) {
            clearTimeout(keyboardTimerRef.current);
        }
        keyboardTimerRef.current = setTimeout(() => {
            commitPriceRange(draftMinRef.current, draftMaxRef.current);
        }, 300);
    };

    const handleSliderBlur = () => {
        if (keyboardTimerRef.current) {
            clearTimeout(keyboardTimerRef.current);
        }
        commitPriceRange(draftMinRef.current, draftMaxRef.current);
    };

    // Track click & drag interaction handler
    const handleTrackPointerDown = (e) => {
        if (isLoading || !sliderTrackRef.current) return;
        const rect = sliderTrackRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const rawVal = MIN_BOUND + percentage * (MAX_BOUND - MIN_BOUND);
        const steppedVal = Math.round((rawVal - MIN_BOUND) / STEP) * STEP + MIN_BOUND;
        const clampedVal = Math.max(MIN_BOUND, Math.min(MAX_BOUND, steppedVal));

        e.currentTarget.setPointerCapture(e.pointerId);
        const distToMin = Math.abs(clampedVal - draftMinRef.current);
        const distToMax = Math.abs(clampedVal - draftMaxRef.current);

        isDraggingRef.current = true;

        if (distToMin < distToMax) {
            setActiveThumb('min');
            activeThumbRef.current = 'min';
            const nextMin = Math.min(clampedVal, draftMaxRef.current);
            setDraftMinPrice(nextMin);
            draftMinRef.current = nextMin;
        } else if (distToMax < distToMin) {
            setActiveThumb('max');
            activeThumbRef.current = 'max';
            const nextMax = Math.max(clampedVal, draftMinRef.current);
            setDraftMaxPrice(nextMax);
            draftMaxRef.current = nextMax;
        } else {
            // Equidistant or overlapping
            if (clampedVal < draftMinRef.current) {
                setActiveThumb('min');
                activeThumbRef.current = 'min';
                setDraftMinPrice(clampedVal);
                draftMinRef.current = clampedVal;
            } else {
                setActiveThumb('max');
                activeThumbRef.current = 'max';
                setDraftMaxPrice(clampedVal);
                draftMaxRef.current = clampedVal;
            }
        }
    };

    const handleTrackPointerMove = (e) => {
        if (!isDraggingRef.current || !sliderTrackRef.current) return;
        const rect = sliderTrackRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const rawVal = MIN_BOUND + percentage * (MAX_BOUND - MIN_BOUND);
        const steppedVal = Math.round((rawVal - MIN_BOUND) / STEP) * STEP + MIN_BOUND;
        const clampedVal = Math.max(MIN_BOUND, Math.min(MAX_BOUND, steppedVal));

        if (activeThumbRef.current === 'min') {
            const nextMin = Math.min(clampedVal, draftMaxRef.current);
            setDraftMinPrice(nextMin);
            draftMinRef.current = nextMin;
        } else {
            const nextMax = Math.max(clampedVal, draftMinRef.current);
            setDraftMaxPrice(nextMax);
            draftMaxRef.current = nextMax;
        }
    };

    // Helper to update URL search parameters while preserving all other query parameters
    const updateFilterParam = (type, value) => {
        const nextParams = new URLSearchParams(searchParams);
        // Reset pagination to page 1 on any filter or sort change
        nextParams.set('page', '1');

        if (type === 'accommodationTypeIds') {
            nextParams.delete('propertyType'); // Clean legacy param
            if (value && value.length > 0) {
                nextParams.set('accommodationTypeIds', value.join(','));
            } else {
                nextParams.delete('accommodationTypeIds');
            }
        } else if (type === 'starRatings') {
            if (value && value.length > 0) {
                nextParams.set('starRatings', value.join(','));
            } else {
                nextParams.delete('starRatings');
            }
        } else if (type === 'amenityIds') {
            nextParams.delete('amenities'); // Remove obsolete code-based param
            if (value && value.length > 0) {
                nextParams.set('amenityIds', value.join(','));
            } else {
                nextParams.delete('amenityIds');
            }
        } else if (type === 'sort') {
            if (value && value !== 'default') {
                nextParams.set('sort', value);
            } else {
                nextParams.delete('sort');
            }
        }

        setSearchParams(nextParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset all sidebar filters in URL
    const handleResetFilters = () => {
        if (isLoading) return;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('accommodationTypeIds');
        nextParams.delete('propertyType');
        nextParams.delete('starRatings');
        nextParams.delete('amenityIds');
        nextParams.delete('amenities');
        nextParams.delete('minPrice');
        nextParams.delete('maxPrice');
        nextParams.delete('sort');
        nextParams.set('page', '1');
        setSearchParams(nextParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleType = (typeId) => {
        if (isLoading) return;
        const nextTypes = selectedTypeIds.includes(typeId)
            ? selectedTypeIds.filter((id) => id !== typeId)
            : [...selectedTypeIds, typeId];
        updateFilterParam('accommodationTypeIds', nextTypes);
    };

    const handleToggleRating = (rating) => {
        if (isLoading) return;
        const numRating = Number(rating);
        const nextRatings = selectedRatings.includes(numRating)
            ? selectedRatings.filter((r) => r !== numRating)
            : [...selectedRatings, numRating];
        const unique = Array.from(new Set(nextRatings)).sort((a, b) => b - a);
        updateFilterParam('starRatings', unique);
    };

    const handleToggleAmenity = (amenityId) => {
        if (isLoading) return;
        const numId = Number(amenityId);
        const nextIds = selectedAmenityIds.includes(numId)
            ? selectedAmenityIds.filter((id) => id !== numId)
            : [...selectedAmenityIds, numId];
        const unique = Array.from(new Set(nextIds)).sort((a, b) => a - b);
        updateFilterParam('amenityIds', unique);
    };

    const handleSortChange = (newSort) => {
        if (isLoading) return;
        updateFilterParam('sort', newSort);
    };

    // Image Gallery Modal State
    const [galleryModal, setGalleryModal] = useState({
        isOpen: false,
        title: '',
        images: [],
        initialIndex: 0,
    });

    const handleOpenGallery = (title, images, initialIndex = 0) => {
        setGalleryModal({
            isOpen: true,
            title,
            images,
            initialIndex,
        });
    };

    const handleCloseGallery = () => {
        setGalleryModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Tiêu đề lấy từ kết quả thật, không dùng dữ liệu hotel/location mẫu.
    let locationTitle = 'Tất cả điểm đến';
    if (accommodationId) {
        locationTitle = displayedHotels[0]?.accommodation_name || 'Cơ sở lưu trú đã chọn';
    } else if (locationId) {
        locationTitle =
            displayedHotels.find((item) => String(item.location_id) === locationId)?.location_name ||
            'Điểm đến đã chọn';
    }

    const totalCount = Number(resultPagination.total) || 0;
    const totalPages = Number(resultPagination.totalPages) || 0;
    // API đã phân trang. Không slice hoặc filter lại danh sách ở frontend.
    const paginatedHotels = displayedHotels;

    const getPageUrl = (targetPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(targetPage));
        return `${location.pathname}?${params.toString()}${location.hash}`;
    };

    // Generate numbered pagination items with ellipsis support
    const getPaginationItems = (total, current) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const paginationItems = getPaginationItems(totalPages, currentPage);

    // Calculate percentage positions for two-handle slider track
    const minPercent = Math.max(
        0,
        Math.min(100, ((draftMinPrice - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100),
    );
    const maxPercent = Math.max(
        0,
        Math.min(100, ((draftMaxPrice - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100),
    );

    return (
        <div className="search-page">
            {/* 1. Reusable Hotel Search Form Header */}
            <section
                style={{
                    backgroundColor: 'var(--color-white)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '1.5rem 0',
                    boxShadow: 'var(--shadow-xs)',
                }}
            >
                <div className="container-7xl">
                    <AccommodationSearchForm />
                </div>
            </section>

            {/* 2. Search Criteria Summary Bar */}
            <div className="search-criteria-bar">
                <div className="container-7xl criteria-flex-container">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 500,
                            flexWrap: 'wrap',
                        }}
                    >
                        <span
                            style={{
                                color: 'var(--color-sunshine)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontSize: '11px',
                            }}
                        >
                            Kết quả tìm kiếm:
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-white)', fontSize: '1rem' }}>
                            {locationTitle}
                        </span>
                        <span style={{ color: '#94A3B8' }}>·</span>
                        <span>
                            {checkin && checkout
                                ? `${formatDateVN(checkin)} – ${formatDateVN(checkout)}`
                                : 'Chưa chọn đủ ngày lưu trú'}
                        </span>
                        {checkin && checkout && <span>· {rooms} phòng</span>}
                        {adults && (
                            <span>
                                · {adults} người lớn
                                {Number(childrenCount) > 0 ? `, ${childrenCount} trẻ em` : ''}
                            </span>
                        )}
                    </div>
                    <div style={{ color: '#CBD5E1', fontSize: '12px' }} className="tabular-nums">
                        {isLoading ? (
                            'Đang tìm kiếm...'
                        ) : errorMessage ? (
                            'Chưa tải được kết quả'
                        ) : (
                            <>
                                Tìm thấy <strong>{totalCount}</strong> cơ sở phù hợp
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Main Search Results Layout */}
            <main className="container-7xl">
                <div className="search-layout-grid">
                    {/* Left Sidebar: Filters */}
                    <aside className="search-sidebar-col">
                        <div className="search-sidebar">
                            <div className="sidebar-filter-header">
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: 700,
                                        color: 'var(--color-navy)',
                                    }}
                                >
                                    <Filter
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            color: 'var(--color-sunshine)',
                                        }}
                                    />
                                    <span>Bộ Lọc Tìm Kiếm</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    disabled={isLoading}
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'var(--color-slate)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.5 : 1,
                                    }}
                                >
                                    <RotateCcw style={{ width: '12px', height: '12px' }} />
                                    <span>Đặt lại</span>
                                </button>
                            </div>

                            {/* Filter 1: Accommodation Type (accommodationTypeIds) */}
                            <div className="sidebar-filter-section">
                                <h3 className="filter-title">Loại hình chỗ nghỉ</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {ACCOMMODATION_TYPES.map((type) => (
                                        <label key={type.id} className="filter-checkbox-row">
                                            <input
                                                type="checkbox"
                                                checked={selectedTypeIds.includes(type.id)}
                                                onChange={() => handleToggleType(type.id)}
                                                disabled={isLoading}
                                                className="filter-checkbox"
                                            />
                                            <span>{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filter 2: Star Rating (5, 4, 3, 2, 1 in descending order) */}
                            <div className="sidebar-filter-section">
                                <h3 className="filter-title">Hạng sao</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {STAR_RATINGS_CONFIG.map((item) => (
                                        <label key={item.rating} className="filter-checkbox-row">
                                            <input
                                                type="checkbox"
                                                value={item.rating}
                                                checked={selectedRatings.includes(item.rating)}
                                                onChange={() => handleToggleRating(item.rating)}
                                                disabled={isLoading}
                                                className="filter-checkbox"
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filter 3: Price Range Slider (Two handles on one track) */}
                            <div className="sidebar-filter-section">
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <h3 className="filter-title" style={{ marginBottom: 0 }}>
                                        Khoảng giá mỗi đêm
                                    </h3>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: 'var(--color-navy)',
                                        }}
                                        className="tabular-nums"
                                    >
                                        {formatVND(draftMinPrice)} – {formatVND(draftMaxPrice)}
                                    </span>
                                </div>

                                {/* Two-handle slider container */}
                                <div
                                    className="dual-range-slider"
                                    ref={sliderTrackRef}
                                    onPointerDown={handleTrackPointerDown}
                                    onPointerMove={handleTrackPointerMove}
                                >
                                    <div className="dual-range-track-bg" />
                                    <div
                                        className="dual-range-track-highlight"
                                        style={{
                                            left: `${minPercent}%`,
                                            width: `${Math.max(0, maxPercent - minPercent)}%`,
                                        }}
                                    />
                                    {/* Lower handle input (minPrice) */}
                                    <input
                                        type="range"
                                        min={MIN_BOUND}
                                        max={MAX_BOUND}
                                        step={STEP}
                                        value={draftMinPrice}
                                        disabled={isLoading}
                                        aria-label="Giá mỗi đêm tối thiểu"
                                        style={{
                                            zIndex:
                                                activeThumb === 'min'
                                                    ? 5
                                                    : draftMinPrice > MAX_BOUND - 2 * STEP
                                                      ? 5
                                                      : 3,
                                        }}
                                        className="dual-range-input dual-range-input--min"
                                        onFocus={() => setActiveThumb('min')}
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            setActiveThumb('min');
                                            activeThumbRef.current = 'min';
                                            isDraggingRef.current = true;
                                        }}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), draftMaxRef.current);
                                            setDraftMinPrice(val);
                                            draftMinRef.current = val;
                                        }}
                                        onKeyDown={handleSliderKeyDown}
                                        onKeyUp={handleSliderKeyUp}
                                        onBlur={handleSliderBlur}
                                    />
                                    {/* Upper handle input (maxPrice) */}
                                    <input
                                        type="range"
                                        min={MIN_BOUND}
                                        max={MAX_BOUND}
                                        step={STEP}
                                        value={draftMaxPrice}
                                        disabled={isLoading}
                                        aria-label="Giá mỗi đêm tối đa"
                                        style={{
                                            zIndex:
                                                activeThumb === 'max'
                                                    ? 5
                                                    : draftMaxPrice < MIN_BOUND + 2 * STEP
                                                      ? 5
                                                      : 4,
                                        }}
                                        className="dual-range-input dual-range-input--max"
                                        onFocus={() => setActiveThumb('max')}
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            setActiveThumb('max');
                                            activeThumbRef.current = 'max';
                                            isDraggingRef.current = true;
                                        }}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), draftMinRef.current);
                                            setDraftMaxPrice(val);
                                            draftMaxRef.current = val;
                                        }}
                                        onKeyDown={handleSliderKeyDown}
                                        onKeyUp={handleSliderKeyUp}
                                        onBlur={handleSliderBlur}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '11px',
                                        color: 'var(--color-slate)',
                                        marginTop: '6px',
                                    }}
                                    className="tabular-nums"
                                >
                                    <span>{formatVND(MIN_BOUND)}</span>
                                    <span>{formatVND(MAX_BOUND)}</span>
                                </div>
                            </div>

                            {/* Filter 4: Amenities using actual numeric IDs */}
                            <div className="sidebar-filter-section" style={{ borderBottom: 'none' }}>
                                <h3 className="filter-title">Tiện ích dịch vụ</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {AMENITIES_CONFIG.map((amenity) => (
                                        <label key={amenity.id} className="filter-checkbox-row">
                                            <input
                                                type="checkbox"
                                                value={amenity.id}
                                                checked={selectedAmenityIds.includes(amenity.id)}
                                                onChange={() => handleToggleAmenity(amenity.id)}
                                                disabled={isLoading}
                                                className="filter-checkbox"
                                            />
                                            <span>{amenity.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Area: Listing Cards & Sorting */}
                    <section
                        className="search-results-col"
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                    >
                        {/* Sort & Count Header */}
                        <div
                            style={{
                                backgroundColor: 'var(--color-white)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                padding: '14px 20px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                boxShadow: 'var(--shadow-xs)',
                            }}
                        >
                            <span
                                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)' }}
                            >
                                Hiển thị <strong>{displayedHotels.length}</strong> /{' '}
                                <strong>{totalCount}</strong> kết quả phù hợp
                            </span>

                            <div className="sort-select-box">
                                <SlidersHorizontal
                                    style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }}
                                />
                                <span>Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    disabled={isLoading}
                                    className="sort-select-input"
                                    style={{
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.6 : 1,
                                    }}
                                >
                                    <option value="default">Mới nhất</option>
                                    <option value="price_asc">Giá: Thấp đến Cao</option>
                                    <option value="price_desc">Giá: Cao đến Thấp</option>
                                    <option value="star_rating_desc">Hạng sao: Cao đến Thấp</option>
                                    <option value="star_rating_asc">Hạng sao: Thấp đến Cao</option>
                                </select>
                            </div>
                        </div>

                        {/* Hotel Cards List Area with Loading Overlay */}
                        <div className="search-results-list-container" aria-busy={isLoading}>
                            {isLoading && (
                                <div
                                    className="search-loading-overlay"
                                    role="status"
                                    aria-live="polite"
                                    aria-label="Đang tải kết quả tìm kiếm"
                                >
                                    <div className="search-loading-spinner" />
                                    <span className="search-loading-text">Đang cập nhật kết quả...</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div style={{ minHeight: '220px' }} />
                            ) : errorMessage ? (
                                <div
                                    role="alert"
                                    style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        backgroundColor: 'var(--color-white)',
                                        borderRadius: 'var(--radius-lg)',
                                    }}
                                >
                                    <p style={{ marginBottom: '16px', color: '#B91C1C' }}>{errorMessage}</p>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setRetryKey((value) => value + 1)}
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : totalCount === 0 ? (
                                <div
                                    style={{
                                        backgroundColor: 'var(--color-white)',
                                        borderRadius: 'var(--radius-xl)',
                                        border: '1px dashed var(--color-border)',
                                        padding: '3rem',
                                        textAlign: 'center',
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: 'var(--color-navy)',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        Không tìm thấy chỗ nghỉ phù hợp
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--color-slate)',
                                            maxWidth: '28rem',
                                            margin: '0 auto 16px',
                                        }}
                                    >
                                        Quý khách vui lòng thử bỏ bớt bộ lọc hoặc chọn mức giá cao hơn để tìm
                                        kiếm thêm cơ sở.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        disabled={isLoading}
                                        className="btn-primary"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            ) : paginatedHotels.length === 0 ? (
                                <div
                                    style={{
                                        backgroundColor: 'var(--color-white)',
                                        borderRadius: 'var(--radius-xl)',
                                        border: '1px dashed var(--color-border)',
                                        padding: '3rem',
                                        textAlign: 'center',
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: 'var(--color-navy)',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        Trang này không có kết quả
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--color-slate)',
                                            maxWidth: '28rem',
                                            margin: '0 auto 16px',
                                        }}
                                    >
                                        Vui lòng quay lại trang đầu tiên để xem danh sách chỗ nghỉ.
                                    </p>
                                    <Link
                                        to={getPageUrl(1)}
                                        className="btn-primary"
                                        style={{ display: 'inline-block' }}
                                    >
                                        Về trang 1
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {paginatedHotels.map((hotel) => (
                                        <AccommodationCard
                                            key={hotel.id}
                                            accommodation={hotel}
                                            onOpenGallery={handleOpenGallery}
                                            searchCriteria={{
                                                checkin,
                                                checkout,
                                                rooms,
                                                adults,
                                                children: childrenCount,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination Interface: Numbered page links below the accommodation list */}
                        {!isLoading && !errorMessage && resultPagination.enabled && totalPages > 1 && (
                            <nav aria-label="Phân trang kết quả tìm kiếm" className="search-pagination-nav">
                                <div className="search-pagination-container">
                                    {currentPage > 1 && (
                                        <Link
                                            to={isLoading ? '#' : getPageUrl(currentPage - 1)}
                                            onClick={(e) => {
                                                if (isLoading) {
                                                    e.preventDefault();
                                                } else {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            aria-disabled={isLoading ? 'true' : undefined}
                                            tabIndex={isLoading ? -1 : undefined}
                                            className={`search-pagination-link search-pagination-arrow ${isLoading ? 'disabled' : ''}`}
                                            aria-label="Trang trước"
                                        >
                                            ‹
                                        </Link>
                                    )}

                                    {paginationItems.map((item, idx) => {
                                        if (item === '...') {
                                            return (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="search-pagination-ellipsis"
                                                    aria-hidden="true"
                                                >
                                                    …
                                                </span>
                                            );
                                        }
                                        const isCurrent = item === currentPage;
                                        return (
                                            <Link
                                                key={item}
                                                to={isLoading ? '#' : getPageUrl(item)}
                                                onClick={(e) => {
                                                    if (isLoading) {
                                                        e.preventDefault();
                                                    } else {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                }}
                                                aria-current={isCurrent ? 'page' : undefined}
                                                aria-disabled={isLoading ? 'true' : undefined}
                                                tabIndex={isLoading ? -1 : undefined}
                                                className={`search-pagination-link ${isCurrent ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
                                            >
                                                {item}
                                            </Link>
                                        );
                                    })}

                                    {currentPage < totalPages && (
                                        <Link
                                            to={isLoading ? '#' : getPageUrl(currentPage + 1)}
                                            onClick={(e) => {
                                                if (isLoading) {
                                                    e.preventDefault();
                                                } else {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            aria-disabled={isLoading ? 'true' : undefined}
                                            tabIndex={isLoading ? -1 : undefined}
                                            className={`search-pagination-link search-pagination-arrow ${isLoading ? 'disabled' : ''}`}
                                            aria-label="Trang sau"
                                        >
                                            ›
                                        </Link>
                                    )}
                                </div>
                            </nav>
                        )}

                        {/* Page-Specific Scoped CSS */}
                        <style>{`
              .dual-range-slider {
                position: relative;
                width: 100%;
                height: 28px;
                display: flex;
                align-items: center;
                user-select: none;
                touch-action: none;
              }
              .dual-range-track-bg {
                position: absolute;
                left: 0;
                right: 0;
                height: 6px;
                background-color: #E2E8F0;
                border-radius: 3px;
                pointer-events: none;
              }
              .dual-range-track-highlight {
                position: absolute;
                height: 6px;
                background-color: var(--color-sunshine);
                border-radius: 3px;
                pointer-events: none;
                transition: left 50ms ease, width 50ms ease;
              }
              .dual-range-input {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                background: transparent;
                pointer-events: none;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
              }
              .dual-range-input::-webkit-slider-thumb {
                pointer-events: auto;
                appearance: none;
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: var(--color-white);
                border: 2px solid var(--color-sunshine);
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
                cursor: grab;
                transition: transform 100ms ease, box-shadow 100ms ease;
              }
              .dual-range-input::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              }
              .dual-range-input::-webkit-slider-thumb:active {
                cursor: grabbing;
                transform: scale(1.2);
                background-color: var(--color-sunshine);
              }
              .dual-range-input::-moz-range-thumb {
                pointer-events: auto;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: var(--color-white);
                border: 2px solid var(--color-sunshine);
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
                cursor: grab;
                transition: transform 100ms ease;
              }
              .dual-range-input::-moz-range-thumb:active {
                cursor: grabbing;
                background-color: var(--color-sunshine);
                transform: scale(1.2);
              }
              .dual-range-input::-webkit-slider-runnable-track {
                background: transparent;
                border: none;
              }
              .dual-range-input::-moz-range-track {
                background: transparent;
                border: none;
              }
              .search-results-list-container {
                position: relative;
                min-height: 200px;
              }
              .search-loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.72);
                backdrop-filter: blur(2px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding-top: 4.5rem;
                z-index: 25;
                border-radius: var(--radius-xl);
                animation: fadeInOverlay 150ms ease;
              }
              .search-loading-spinner {
                width: 38px;
                height: 38px;
                border: 3px solid rgba(245, 184, 46, 0.25);
                border-top-color: var(--color-sunshine);
                border-radius: 50%;
                animation: spin 0.75s linear infinite;
                margin-bottom: 0.75rem;
              }
              .search-loading-text {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--color-navy);
                letter-spacing: 0.01em;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes fadeInOverlay {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .search-pagination-nav {
                margin-top: 1.5rem;
                padding-top: 0.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .search-pagination-container {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: center;
                background-color: var(--color-white);
                padding: 8px 12px;
                border-radius: var(--radius-xl);
                border: 1px solid var(--color-border);
                box-shadow: var(--shadow-xs);
              }
              .search-pagination-link {
                min-width: 38px;
                height: 38px;
                padding: 0 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--color-navy);
                background-color: var(--color-white);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                text-decoration: none;
                transition: all 150ms ease;
                user-select: none;
              }
              .search-pagination-link:hover {
                background-color: rgba(245, 184, 46, 0.15);
                border-color: var(--color-sunshine);
                color: var(--color-navy);
              }
              .search-pagination-link.active,
              .search-pagination-link[aria-current="page"] {
                background-color: var(--color-navy);
                border-color: var(--color-navy);
                color: var(--color-white);
                font-weight: 700;
                box-shadow: var(--shadow-sm);
                cursor: default;
              }
              .search-pagination-link.active:hover,
              .search-pagination-link[aria-current="page"]:hover {
                background-color: var(--color-navy);
                border-color: var(--color-navy);
                color: var(--color-white);
              }
              .search-pagination-link.disabled,
              .search-pagination-link[aria-disabled="true"] {
                opacity: 0.5;
                pointer-events: none;
                cursor: not-allowed;
              }
              .search-pagination-arrow {
                font-size: 1.125rem;
                line-height: 1;
              }
              .search-pagination-ellipsis {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 28px;
                height: 38px;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--color-slate);
                user-select: none;
                cursor: default;
              }
              @media (max-width: 640px) {
                .search-pagination-container {
                  gap: 4px;
                  padding: 6px 8px;
                  width: 100%;
                }
                .search-pagination-link {
                  min-width: 34px;
                  height: 34px;
                  padding: 0 8px;
                  font-size: 0.8125rem;
                }
                .search-pagination-ellipsis {
                  min-width: 20px;
                  height: 34px;
                }
              }
            `}</style>
                    </section>
                </div>
            </main>

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
