import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Eye, Coffee, Wifi, Car, Waves, Check, Utensils } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

//const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');

// Response mẫu chưa có tên tiện nghi; ưu tiên tên từ API khi được bổ sung.
const AMENITY_LABELS = {
    restaurant: 'Nhà hàng',
    breakfast_service: 'Dịch vụ bữa sáng',
    outdoor_pool: 'Hồ bơi ngoài trời',
    indoor_pool: 'Hồ bơi trong nhà',
    on_site_parking: 'Bãi đỗ xe',
    wifi: 'Wi-Fi',
    children_playground: 'Khu vui chơi trẻ em',
    garden: 'Sân vườn',
    front_desk_24h: 'Lễ tân 24 giờ',
    luggage_storage: 'Giữ hành lý',
    laundry_service: 'Dịch vụ giặt ủi',
    spa: 'Spa',
};

function mediaUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
    return `${import.meta.env.VITE_BACKEND_APP_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

export function getAccommodationImages(accommodation) {
    return [...(accommodation.images || [])]
        .filter((image) => image.image_url)
        .sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)))
        .map((image) => ({ ...image, image_url: mediaUrl(image.image_url) }));
}

export function getAmenityLabel(amenity) {
    return (
        amenity.amenity_name ||
        amenity.name ||
        AMENITY_LABELS[amenity.code] ||
        amenity.code?.replace(/_/g, ' ') ||
        `Tiện nghi #${amenity.amenity_id ?? amenity.id}`
    );
}

function AmenityPill({ amenity }) {
    const icons = {
        breakfast: Coffee,
        restaurant: Utensils,
        wifi: Wifi,
        parking: Car,
        pool: Waves,
    };
    const Icon = icons[amenity.icon_key] || Check;
    const chargeable = amenity.is_chargeable === true || amenity.is_chargeable === 1;
    const note = amenity.accommodation_note || amenity.note || '';

    return (
        <span
            className="hotel-amenity-pill"
            title={[note, chargeable ? 'Có tính phí' : ''].filter(Boolean).join(' · ')}
        >
            <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
            {getAmenityLabel(amenity)}
            {chargeable ? ' (có phí)' : ''}
        </span>
    );
}

export default function AccommodationCard({ accommodation, hotel, onOpenGallery, searchCriteria = {} }) {
    console.log("[AccommodationCard] Vừa vào hàm component AccommodationCard ! Data của accommodation : ");
    console.log(accommodation);

    // Giữ hỗ trợ prop hotel nếu bên gọi vẫn dùng tên prop cũ.
    //const item = accommodation ?? hotel;
    const item = accommodation;
    const images = getAccommodationImages(item);
    const cover = images[0];
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [item.id, cover?.image_url]);

    const galleryImages = images.map((image) => image.image_url);
    const queryParams = new URLSearchParams();
    // Giữ route chi tiết hiện có trong component gốc.
    queryParams.set('hotelId', String(item.id));
    for (const key of ['checkin', 'checkout', 'rooms', 'adults', 'children']) {
        const value = searchCriteria[key];
        if (value !== undefined && value !== null && value !== '') {
            queryParams.set(key, String(value));
        }
    }
    const detailUrl = `/hotel-detail?${queryParams.toString()}`;

    const type = String(item.accommodation_type_code || '').toLowerCase();
    const badgeClass =
        {
            hotel: 'property-badge--hotel',
            resort: 'property-badge--resort',
            homestay: 'property-badge--homestay',
        }[type] || 'property-badge--hotel';
    const stars = Math.max(0, Math.min(5, Number(item.star_rating) || 0));
    const address = [
        ...new Set(
            [
                item.address_line,
                item.loc_ward_fullname || item.ward_name,
                item.loc_province_fullname || item.province_name,
            ].filter(Boolean),
        ),
    ].join(', ');
    const hasPrice =
        item.min_base_price !== null &&
        item.min_base_price !== undefined &&
        Number.isFinite(Number(item.min_base_price));
    const availableRooms =
        item.available_rooms === null || item.available_rooms === undefined
            ? null
            : Number(item.available_rooms);
    const unavailable = item.is_available === false;
    const requestedRooms = Number(searchCriteria.rooms) || 1;

    const openGallery = () => {
        if (galleryImages.length > 0) {
            onOpenGallery?.(item.accommodation_name, galleryImages, 0);
        }
    };

    return (
        <article className="hotel-card">
            <div
                className="hotel-card-thumb-container"
                onClick={openGallery}
                title={images.length ? 'Nhấn để xem ảnh cơ sở lưu trú' : 'Chưa có hình ảnh'}
                role={images.length ? 'button' : undefined}
                tabIndex={images.length ? 0 : undefined}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openGallery();
                    }
                }}
            >
                {cover && !imageFailed ? (
                    <img
                        src={cover.image_url}
                        alt={cover.alt_text || item.accommodation_name}
                        className="hotel-card-thumb-image"
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div
                        className="hotel-card-thumb-image"
                        style={{
                            minHeight: '200px',
                            display: 'grid',
                            placeItems: 'center',
                            background: '#E2E8F0',
                            color: '#475569',
                        }}
                    >
                        {imageFailed ? 'Không tải được hình ảnh' : 'Chưa có hình ảnh'}
                    </div>
                )}

                <div className={`property-badge ${badgeClass}`}>
                    {item.accommodation_type_name || type}
                    {stars > 0 ? ` · ${stars} SAO` : ''}
                </div>

                {images.length > 0 && (
                    <div className="thumb-photos-pill">
                        <Eye style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />
                        <span>Xem {images.length} ảnh</span>
                    </div>
                )}
            </div>

            <div className="hotel-card-content">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {stars > 0 ? (
                            <div
                                aria-label={`Hạng ${stars} sao`}
                                style={{ display: 'flex', color: 'var(--color-sunshine)' }}
                            >
                                {Array.from({ length: stars }, (_, index) => (
                                    <Star
                                        key={index}
                                        aria-hidden="true"
                                        style={{ width: '14px', height: '14px', fill: 'currentColor' }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                Chưa xếp hạng sao
                            </span>
                        )}
                        {item.location_name && (
                            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                · {item.location_name}
                            </span>
                        )}
                    </div>

                    <Link to={detailUrl} className="hotel-card-name">
                        {item.accommodation_name}
                    </Link>

                    {address && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: 'var(--color-slate)',
                                marginBottom: '12px',
                            }}
                        >
                            <MapPin style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                            <span>{address}</span>
                        </div>
                    )}

                    <p
                        className="line-clamp-2"
                        style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-slate)',
                            lineHeight: 1.6,
                            marginBottom: '14px',
                        }}
                    >
                        {item.short_description}
                    </p>

                    <div className="hotel-amenity-pill-list">
                        {(item.amenities || []).map((amenity) => (
                            <AmenityPill
                                key={amenity.amenity_id ?? amenity.code}
                                amenity={amenity}
                            />
                        ))}
                    </div>
                </div>

                <div className="hotel-card-bottom-row">
                    <div
                        role="status"
                        style={{ fontSize: '13px', color: unavailable ? '#B91C1C' : 'var(--color-slate)' }}
                    >
                        {item.is_available === null || item.is_available === undefined
                            ? 'Chọn ngày để kiểm tra phòng trống.'
                            : unavailable
                              ? availableRooms === 0
                                  ? 'Không còn phòng trống trong khoảng ngày bạn chọn.'
                                  : `Chỉ còn ${availableRooms} phòng, không đủ ${requestedRooms} phòng theo yêu cầu.`
                              : `Còn ${availableRooms} phòng cho kỳ lưu trú đã chọn.`}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        {hasPrice ? (
                            <>
                                <div style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                                    Giá cơ bản/phòng/đêm từ
                                </div>
                                <div
                                    className="tabular-nums"
                                    style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 800,
                                        color: 'var(--color-navy)',
                                    }}
                                >
                                    {formatVND(Number(item.min_base_price))}
                                </div>
                            </>
                        ) : (
                            <div
                                style={{ fontSize: '12px', color: 'var(--color-slate)', marginBottom: '8px' }}
                            >
                                Chưa có giá phòng khả dụng
                            </div>
                        )}
                        <Link to={detailUrl} className="hotel-view-btn">
                            {unavailable
                                ? 'Đổi ngày / Xem chi tiết'
                                : item.is_available == null
                                  ? 'Xem chi tiết'
                                  : 'Xem phòng'}
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
