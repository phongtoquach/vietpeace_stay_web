import React, { useState, useEffect } from 'react';
import {
    Wifi,
    Waves,
    Utensils,
    UtensilsCrossed,
    Droplets,
    BookOpen,
    Armchair,
    Luggage,
    Bike,
    Car,
    Wind,
    Dumbbell,
    Sparkles,
    Bus,
    Shirt,
    Baby,
    Clock,
    Bell,
    Coffee,
    MapPin,
    Calendar,
    CheckCircle2,
    ShieldCheck,
    FileText,
    Info,
    Phone,
    Mail,
    X,
    Star,
} from 'lucide-react';

/**
 * Amenity icon mapping supporting both icon_key values and standard amenity names
 */
const getAmenityIcon = (iconKey) => {
    if (!iconKey) return Sparkles;
    const key = String(iconKey).toLowerCase().trim();

    switch (key) {
        case 'kitchen':
        case 'bep':
            return UtensilsCrossed;
        case 'dining':
        case 'an_uong':
            return Utensils;
        case 'drinking_water':
        case 'nuoc_uong':
        case 'water':
            return Droplets;
        case 'books':
        case 'sach':
        case 'library':
            return BookOpen;
        case 'lounge':
        case 'living_room':
        case 'sofa':
            return Armchair;
        case 'luggage':
        case 'hanh_ly':
            return Luggage;
        case 'motorbike':
        case 'xe_may':
        case 'bike':
            return Bike;
        case 'wifi':
        case 'free wi-fi':
        case 'free_wifi':
            return Wifi;
        case 'pool':
        case 'swimming pool':
        case 'swimming_pool':
            return Waves;
        case 'parking':
        case 'free parking':
        case 'free_parking':
            return Car;
        case 'restaurant':
        case 'breakfast':
            return Utensils;
        case 'coffee':
            return Coffee;
        case 'air_conditioning':
        case 'air conditioning':
        case 'ac':
            return Wind;
        case 'fitness':
        case 'fitness center':
        case 'fitness_center':
        case 'gym':
            return Dumbbell;
        case 'spa':
            return Sparkles;
        case 'airport_shuttle':
        case 'airport shuttle':
        case 'shuttle':
            return Bus;
        case 'children':
        case 'play_area':
        case "children's play area":
            return Baby;
        case 'car_rental':
        case 'car rental':
            return Car;
        case 'laundry':
        case 'laundry_service':
        case 'laundry service':
            return Shirt;
        case 'front_desk':
        case '24-hour front desk':
            return Clock;
        case 'room_service':
        case 'room service':
            return Bell;
        case 'bbq':
            return UtensilsCrossed;
        case 'fishing':
        case 'boat':
            return Waves;
        default:
            return Sparkles;
    }
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002').replace(/\/$/, '');

const BACKEND_APP_BASE_URL = import.meta.env.VITE_BACKEND_APP_BASE_URL;

/**
 * Normalizes relative or absolute image URLs
 */
const resolveMediaUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    // Full URLs or data URIs
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed;
    }

    // Absolute paths starting with slash
    if (trimmed.startsWith('/')) {
        return `${BACKEND_APP_BASE_URL}${trimmed}`;
    }

    // Relative path without leading slash
    return `${BACKEND_APP_BASE_URL}/${trimmed}`;
};

/**
 * Extracts image URL from an attraction item across various schema conventions
 */
const extractAttractionImageUrl = (place) => {
    if (!place || typeof place !== 'object') return null;

    let val =
        place.image_url ||
        place.imageUrl ||
        place.image ||
        place.photo_url ||
        place.photoUrl ||
        place.photo ||
        place.thumbnail_url ||
        place.thumbnailUrl ||
        place.thumbnail ||
        place.img ||
        place.pic ||
        place.picture ||
        place.avatar ||
        place.src;

    // Support array of images/photos
    if (!val && Array.isArray(place.images) && place.images.length > 0) {
        val = place.images[0];
    }
    if (!val && Array.isArray(place.photos) && place.photos.length > 0) {
        val = place.photos[0];
    }

    // Handle nested object structure (e.g., { url: '...' })
    if (val && typeof val === 'object') {
        val = val.url || val.src || val.path || val.file_url || val.fileUrl || val.thumbnail || val.thumb;
    }

    // URL fallback if it looks like an image
    if (
        !val &&
        typeof place.url === 'string' &&
        (/\.(jpg|jpeg|png|webp|gif|avif|svg)/i.test(place.url) ||
            place.url.includes('/image') ||
            place.url.includes('/upload'))
    ) {
        val = place.url;
    }

    if (typeof val === 'string') {
        return resolveMediaUrl(val);
    }

    return null;
};

/**
 * Extracts description from an attraction item
 */
const extractAttractionDescription = (place) => {
    if (!place || typeof place !== 'object') return null;
    const val =
        place.short_description ||
        place.shortDescription ||
        place.description ||
        place.desc ||
        place.summary ||
        place.detail ||
        place.details;
    return typeof val === 'string' && val.trim() !== '' ? val.trim() : null;
};

/**
 * Extracts travel or transport note from an attraction item
 */
const extractAttractionNote = (place) => {
    if (!place || typeof place !== 'object') return null;
    const val =
        place.accommodation_note ||
        place.note ||
        place.notes ||
        place.travel_note ||
        place.travelNote ||
        place.transport_note ||
        place.transportNote ||
        place.guide_note ||
        place.guideNote ||
        place.tip ||
        place.tips;
    return typeof val === 'string' && val.trim() !== '' ? val.trim() : null;
};

/**
 * AccommodationOverview component for VietPeace Stay hotel-detail page
 */
export default function AccommodationOverview({ hotel, accommodation, ...rest }) {
    // Support both accommodation or hotel props
    const acc = accommodation || hotel;
    if (!acc) return null;

    // State for image viewer modal of attractions
    const [selectedAttractionImage, setSelectedAttractionImage] = useState(null);

    // Close image viewer on Escape key
    useEffect(() => {
        if (!selectedAttractionImage) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedAttractionImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAttractionImage]);

    // Star rating null-safety
    const rawStarRating = acc.star_rating ?? acc.starRating;
    const starRatingNumber =
        typeof rawStarRating === 'number' && !isNaN(rawStarRating) && rawStarRating > 0
            ? Math.min(5, Math.floor(rawStarRating))
            : null;

    // 1. About the property: display ONLY accommodation.description
    const description = acc.description;

    // 2. Featured Amenities: render from accommodation.amenities
    // Support array of objects [{ amenity_id, name, icon_key, is_chargeable, description }] or strings
    const rawAmenities = acc.amenities || acc.featuredAmenitiesList || [];
    const normalizedAmenities = Array.isArray(rawAmenities)
        ? rawAmenities
              .map((item, idx) => {
                  if (typeof item === 'object' && item !== null) {
                      return {
                          key: item.amenity_id ?? item.id ?? `amenity-${idx}`,
                          name: item.name || item.label || '',
                          iconKey: item.icon_key || item.iconKey || '',
                          isChargeable: item.is_chargeable === true || item.isChargeable === true,
                          desc:
                              [item.description || item.desc, item.accommodation_note]
                                  .filter(Boolean)
                                  .join('\n') || null,
                      };
                  }
                  // Fallback for string items
                  return {
                      key: `str-amenity-${item}-${idx}`,
                      name: item,
                      iconKey: item,
                      isChargeable: false,
                      desc: null,
                  };
              })
              .filter((a) => Boolean(a.name && a.name.trim() !== ''))
        : [];

    // 3. Location & Destination Row
    const locationName = acc.location_name || acc.locationName || null;
    const address =
        acc.address ||
        [acc.address_line, acc.loc_ward_fullname, acc.loc_province_fullname].filter(Boolean).join(', ') ||
        null;

    // 4. Attractions list
    const rawAttractions =
        acc.attractions ||
        acc.nearby_attractions ||
        acc.nearbyAttractions ||
        acc.nearby_places ||
        acc.nearbyPlaces ||
        acc.places_nearby ||
        acc.placesNearby ||
        [];

    const normalizedAttractions = Array.isArray(rawAttractions)
        ? rawAttractions
              .map((place, idx) => {
                  if (typeof place === 'object' && place !== null) {
                      const name =
                          place.name || place.title || place.attraction_name || place.place_name || '';
                      const distance =
                          place.distance_meters != null
                              ? Number(place.distance_meters) < 1000
                                  ? `${Number(place.distance_meters)} m`
                                  : `${Number(place.distance_meters).toLocaleString('vi-VN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} m`
                              : place.distance || place.dist || '';
                      const imageUrl = extractAttractionImageUrl(place);
                      const shortDesc = extractAttractionDescription(place);
                      const note = extractAttractionNote(place);

                      return {
                          id: place.attraction_id ?? place.id ?? idx,
                          name: typeof name === 'string' ? name.trim() : String(name),
                          distance: typeof distance === 'string' ? distance.trim() : String(distance),
                          imageUrl,
                          shortDesc,
                          note,
                      };
                  }
                  return {
                      id: idx,
                      name: String(place).trim(),
                      distance: '',
                      imageUrl: null,
                      shortDesc: null,
                      note: null,
                  };
              })
              .filter((p) => Boolean(p.name))
        : [];

    // 5. Property Information: check_in_time, check_out_time, phone, email
    const checkInTime = acc.check_in_time || acc.checkInTime || acc.propertyInfo?.checkIn || null;
    const checkOutTime = acc.check_out_time || acc.checkOutTime || acc.propertyInfo?.checkOut || null;
    const phone = acc.phone || acc.phone_number || acc.phoneNumber || null;
    const email = acc.email || null;

    const infoItems = [];
    if (checkInTime && typeof checkInTime === 'string' && checkInTime.trim() !== '') {
        infoItems.push({
            label: 'Nhận phòng (Check-in)',
            value: checkInTime.trim(),
            icon: Clock,
        });
    }
    if (checkOutTime && typeof checkOutTime === 'string' && checkOutTime.trim() !== '') {
        infoItems.push({
            label: 'Trả phòng (Check-out)',
            value: checkOutTime.trim(),
            icon: Calendar,
        });
    }
    if (phone && typeof phone === 'string' && phone.trim() !== '') {
        infoItems.push({
            label: 'Số điện thoại',
            value: phone.trim(),
            icon: Phone,
        });
    }
    if (email && typeof email === 'string' && email.trim() !== '') {
        infoItems.push({
            label: 'Email',
            value: email.trim(),
            icon: Mail,
        });
    }

    // 6. Property Policies
    // Keep check_in_instructions, children_policy, pet_policy, smoking_policy.
    // Remove "Hủy phòng và thanh toán trước".
    // Add "Nội quy chỗ nghỉ" using accommodation.house_rules with preserved line breaks.
    const policies = [];

    const addPolicy = (title, content) => {
        if (content && typeof content === 'string' && content.trim() !== '') {
            policies.push({ title, content: content.trim() });
        }
    };

    const hasSpecificPolicyFields = Boolean(
        acc.check_in_instructions ||
        acc.checkInInstructions ||
        acc.children_policy ||
        acc.childrenPolicy ||
        acc.smoking_policy ||
        acc.smokingPolicy ||
        acc.pet_policy ||
        acc.petPolicy ||
        acc.house_rules ||
        acc.houseRules,
    );

    if (hasSpecificPolicyFields) {
        addPolicy(
            'Quy định nhận phòng (Check-in instructions)',
            acc.check_in_instructions || acc.checkInInstructions,
        );
        addPolicy('Chính sách trẻ em & Giường phụ', acc.children_policy || acc.childrenPolicy);
        addPolicy('Quy định hút thuốc', acc.smoking_policy || acc.smokingPolicy);
        addPolicy('Quy định thú cưng', acc.pet_policy || acc.petPolicy);
        addPolicy('Nội quy chỗ nghỉ', acc.house_rules || acc.houseRules);
    } else if (Array.isArray(acc.propertyPolicies)) {
        // Fallback to existing propertyPolicies, excluding "Hủy phòng & Thanh toán trước"
        acc.propertyPolicies.forEach((p) => {
            const titleLower = (p.title || '').toLowerCase();
            if (
                titleLower.includes('hủy') ||
                titleLower.includes('thanh toán') ||
                titleLower.includes('cancellation') ||
                titleLower.includes('prepayment')
            ) {
                return;
            }
            addPolicy(p.title, p.content);
        });
        // Add house_rules if present
        addPolicy('Nội quy chỗ nghỉ', acc.house_rules || acc.houseRules);
    }

    return (
        <section className="property-overview-section">
            <div className="container-7xl">
                <div className="property-overview-card">
                    {/* Main Section Header */}
                    <div className="property-overview-header">
                        <div className="property-overview-header-left">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span className="property-overview-badge">Thông Tin Chi Tiết</span>
                                {starRatingNumber && (
                                    <div
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                        aria-label={`${starRatingNumber} sao`}
                                    >
                                        {Array.from({ length: starRatingNumber }).map((_, i) => (
                                            <Star
                                                key={i}
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    fill: '#F59E0B',
                                                    color: '#F59E0B',
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <h2 className="property-overview-title">Accommodation Overview</h2>
                            <p className="property-overview-subtitle">
                                Tổng quan không gian nghỉ dưỡng, tiện ích nổi bật, vị trí thuận lợi và quy
                                định lưu trú tại <strong>{acc.name}</strong>.
                            </p>
                        </div>
                    </div>

                    {/* 1. About the Property (Display only accommodation.description, no highlights, no secondary description) */}
                    {description && typeof description === 'string' && description.trim() !== '' && (
                        <div className="property-overview-block">
                            <div className="property-overview-section-header">
                                <div className="property-overview-icon-pill">
                                    <Info style={{ width: '18px', height: '18px' }} />
                                </div>
                                <div>
                                    <h3 className="property-overview-heading">About the Property</h3>
                                    <span className="property-overview-heading-sub">
                                        Giới thiệu tổng quan và trải nghiệm lưu trú
                                    </span>
                                </div>
                            </div>

                            <div className="property-overview-about-body">
                                <p
                                    className="property-overview-description"
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {description}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="property-overview-divider" />

                    {/* 2-Column Grid: Featured Amenities & Services | Location & Nearby Places */}
                    <div className="property-overview-two-col">
                        {/* 2. Featured Amenities & Services */}
                        <div className="property-overview-subcard">
                            <div className="property-overview-section-header">
                                <div className="property-overview-icon-pill">
                                    <Sparkles style={{ width: '18px', height: '18px' }} />
                                </div>
                                <div>
                                    <h3 className="property-overview-heading">
                                        Featured Amenities & Services
                                    </h3>
                                    <span className="property-overview-heading-sub">
                                        Tiện nghi & Dịch vụ nổi bật
                                    </span>
                                </div>
                            </div>

                            {normalizedAmenities.length > 0 ? (
                                <div className="property-amenities-grid">
                                    {normalizedAmenities.map((amenity) => {
                                        const IconComp = getAmenityIcon(amenity.iconKey);
                                        return (
                                            <div key={amenity.key} className="property-amenity-card">
                                                <div className="property-amenity-icon-box">
                                                    <IconComp style={{ width: '18px', height: '18px' }} />
                                                </div>
                                                <div
                                                    className="property-amenity-content"
                                                    style={{ flex: 1, minWidth: 0 }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        <span className="property-amenity-name">
                                                            {amenity.name}
                                                        </span>
                                                        {amenity.isChargeable && (
                                                            <span
                                                                className="accommodation-chargeable-badge"
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    color: '#B45309',
                                                                    backgroundColor: '#FEF3C7',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                Có tính phí
                                                            </span>
                                                        )}
                                                    </div>
                                                    {amenity.desc && (
                                                        <span className="property-amenity-desc">
                                                            {amenity.desc}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        {/* 3 & 4. Location & Nearby Places */}
                        <div className="property-overview-subcard">
                            <div className="property-overview-section-header">
                                <div className="property-overview-icon-pill">
                                    <MapPin style={{ width: '18px', height: '18px' }} />
                                </div>
                                <div>
                                    <h3 className="property-overview-heading">Location & Nearby Places</h3>
                                    <span className="property-overview-heading-sub">
                                        Vị trí & Điểm đến lân cận
                                    </span>
                                </div>
                            </div>

                            {/* 3. Destination Row (Directly above the address) */}
                            {locationName &&
                                typeof locationName === 'string' &&
                                locationName.trim() !== '' && (
                                    <div
                                        className="accommodation-destination-box"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            padding: '12px',
                                            backgroundColor: 'var(--color-ivory)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        <div className="property-address-icon-wrap">
                                            <MapPin style={{ width: '18px', height: '18px' }} />
                                        </div>
                                        <div>
                                            <div className="property-address-label">Điểm đến</div>
                                            <div className="property-address-text">{locationName.trim()}</div>
                                        </div>
                                    </div>
                                )}

                            {/* Address Banner */}
                            {address && typeof address === 'string' && address.trim() !== '' && (
                                <div className="property-address-box">
                                    <div className="property-address-icon-wrap">
                                        <MapPin style={{ width: '18px', height: '18px' }} />
                                    </div>
                                    <div>
                                        <div className="property-address-label">Địa chỉ chỗ nghỉ</div>
                                        <div className="property-address-text">{address.trim()}</div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Địa Điểm Nổi Bật Gần Nhất */}
                            {normalizedAttractions.length > 0 && (
                                <div className="property-nearby-container">
                                    <h4 className="property-nearby-title">Địa Điểm Nổi Bật Gần Nhất</h4>
                                    <div className="property-nearby-list">
                                        {normalizedAttractions.map((place) => (
                                            <div
                                                key={place.id}
                                                className="property-nearby-row"
                                                style={{ alignItems: 'flex-start', gap: '12px' }}
                                            >
                                                {/* Thumbnail if attraction has image */}
                                                {place.imageUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAttractionImage({
                                                                url: place.imageUrl,
                                                                name: place.name,
                                                            })
                                                        }
                                                        title={`Xem ảnh ${place.name}`}
                                                        aria-label={`Xem ảnh ${place.name}`}
                                                        style={{
                                                            width: '56px',
                                                            height: '56px',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            flexShrink: 0,
                                                            border: '1px solid var(--color-border)',
                                                            padding: 0,
                                                            background: '#f8fafc',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <img
                                                            src={place.imageUrl}
                                                            alt={place.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                display: 'block',
                                                            }}
                                                            loading="lazy"
                                                        />
                                                    </button>
                                                )}

                                                {/* Name, short description, and travel note */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="property-nearby-name-wrap">
                                                        <span className="property-nearby-dot" />
                                                        <span
                                                            className="property-nearby-name"
                                                            style={{ fontWeight: 600 }}
                                                        >
                                                            {place.name}
                                                        </span>
                                                    </div>

                                                    {place.shortDesc && (
                                                        <div
                                                            style={{
                                                                fontSize: '13px',
                                                                color: 'var(--color-slate)',
                                                                marginTop: '3px',
                                                                paddingLeft: '14px',
                                                                lineHeight: 1.5,
                                                            }}
                                                        >
                                                            {place.shortDesc}
                                                        </div>
                                                    )}

                                                    {place.note && (
                                                        <div
                                                            style={{
                                                                fontSize: '12px',
                                                                color: '#0284c7',
                                                                marginTop: '3px',
                                                                paddingLeft: '14px',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {place.note}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Distance badge */}
                                                {place.distance && (
                                                    <span
                                                        className="property-nearby-distance"
                                                        style={{
                                                            marginLeft: '8px',
                                                            alignSelf: 'flex-start',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {place.distance}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="property-overview-divider" />

                    {/* 2-Column Grid: Property Information | Property Policies */}
                    <div className="property-overview-two-col">
                        {/* 5. Property Information */}
                        <div className="property-overview-subcard">
                            <div className="property-overview-section-header">
                                <div className="property-overview-icon-pill">
                                    <FileText style={{ width: '18px', height: '18px' }} />
                                </div>
                                <div>
                                    <h3 className="property-overview-heading">Property Information</h3>
                                    <span className="property-overview-heading-sub">
                                        Thời gian và thông tin chung
                                    </span>
                                </div>
                            </div>

                            {infoItems.length > 0 && (
                                <div className="property-info-list">
                                    {infoItems.map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={idx} className="property-info-row">
                                                <div className="property-info-row-left">
                                                    <div className="property-info-row-icon">
                                                        <ItemIcon style={{ width: '16px', height: '16px' }} />
                                                    </div>
                                                    <span className="property-info-row-label">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <span className="property-info-row-val">{item.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 6. Property Policies */}
                        <div className="property-overview-subcard">
                            <div className="property-overview-section-header">
                                <div className="property-overview-icon-pill">
                                    <ShieldCheck style={{ width: '18px', height: '18px' }} />
                                </div>
                                <div>
                                    <h3 className="property-overview-heading">Property Policies</h3>
                                    <span className="property-overview-heading-sub">
                                        Chính sách & Quy định lưu trú
                                    </span>
                                </div>
                            </div>

                            {policies.length > 0 && (
                                <div className="property-policies-list">
                                    {policies.map((policy, idx) => (
                                        <div key={idx} className="property-policy-item">
                                            <h5 className="property-policy-item-title">{policy.title}</h5>
                                            <p
                                                className="property-policy-item-content"
                                                style={{ whiteSpace: 'pre-line' }}
                                            >
                                                {policy.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal for Attractions */}
            {selectedAttractionImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedAttractionImage.name || 'Ảnh địa điểm nổi bật'}
                    onClick={() => setSelectedAttractionImage(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedAttractionImage(null)}
                            aria-label="Đóng xem ảnh"
                            style={{
                                position: 'absolute',
                                top: '-44px',
                                right: '0',
                                background: 'rgba(255, 255, 255, 0.25)',
                                border: 'none',
                                color: '#fff',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                        >
                            <X style={{ width: '20px', height: '20px' }} />
                        </button>
                        <img
                            src={selectedAttractionImage.url}
                            alt={selectedAttractionImage.name || 'Ảnh địa điểm'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                            }}
                        />
                        {selectedAttractionImage.name && (
                            <div
                                style={{
                                    color: '#fff',
                                    marginTop: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}
                            >
                                {selectedAttractionImage.name}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
