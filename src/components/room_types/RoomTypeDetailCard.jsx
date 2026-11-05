import React from 'react';
import {
    Eye,
    Bed,
    Maximize2,
    Users,
    Check,
    Sparkles,
    X,
    Coffee,
    Waves,
    Bath,
    Utensils,
    Wifi,
} from 'lucide-react';
import { formatVND } from '../../utils/bookingUtils.js';
import RoomTypePriceBreakdownTooltip from './RoomTypePriceBreakdownTooltip';

const getRoomAmenityIcon = (amenityText) => {
    if (!amenityText)
        return <Sparkles style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
    const lower = String(amenityText).toLowerCase();

    if (lower.includes('tắm') || lower.includes('sen') || lower.includes('jacuzzi')) {
        return <Bath style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
    }
    if (
        lower.includes('cà phê') ||
        lower.includes('minibar') ||
        lower.includes('trà') ||
        lower.includes('cocktail')
    ) {
        return <Coffee style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />;
    }
    if (lower.includes('bếp') || lower.includes('bàn ăn') || lower.includes('ăn')) {
        return <Utensils style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
    }
    if (lower.includes('bơi') || lower.includes('biển') || lower.includes('hồ bơi')) {
        return <Waves style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
    }
    if (
        lower.includes('hướng') ||
        lower.includes('view') ||
        lower.includes('ban công') ||
        lower.includes('cảnh') ||
        lower.includes('nhìn') ||
        lower.includes('hiên')
    ) {
        return <Eye style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />;
    }
    if (lower.includes('wifi') || lower.includes('mạng')) {
        return <Wifi style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
    }
    if (
        lower.includes('lounge') ||
        lower.includes('vip') ||
        lower.includes('đặc quyền') ||
        lower.includes('phòng khách')
    ) {
        return <Sparkles style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />;
    }
    return <Check style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} />;
};

export default function RoomTypeDetailCard({
    room,
    disabled = false,
    checkin,
    checkout,
    nights,
    selectedRooms = [],
    onChangeQuantity,
    onUpdateGuests,
    onRemoveRoom,
    onOpenGallery,
}) {
    const images = (room.images || []).map((image) => image.image_url).filter(Boolean);
    const isSelected = selectedRooms.length > 0;
    const nightsCount = room.nightlyRates?.length ?? nights ?? 0;
    const totalBaseStayPrice = room.roomSubtotal;
    const soldOut = room.availableQuantity === 0;

    return (
        <article className={`room-type-card ${isSelected ? 'room-type-card--selected' : ''}`}>
            {/* Header Bar */}
            <div className="room-card-header">
                <h3 className="room-card-title">{room.name}</h3>
                <span className="room-availability-badge">
                    {soldOut ? 'Hết phòng' : `✓ Còn ${room.availableQuantity} phòng trống`}
                </span>
            </div>

            <div className="room-card-grid">
                {/* Room Thumbnail - Click room thumbnail to preview all images of that room type */}
                <div
                    className="room-col-thumb room-card-thumb-box"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onOpenGallery) onOpenGallery(room.name, images, 0);
                    }}
                    title="Nhấn để xem toàn bộ ảnh của loại phòng này"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (onOpenGallery) onOpenGallery(room.name, images, 0);
                        }
                    }}
                >
                    {images[0] ? (
                        <img src={images[0]} alt={room.name} className="room-card-thumb-img" />
                    ) : (
                        <div style={{ minHeight: '180px', display: 'grid', placeItems: 'center' }}>
                            Chưa có hình ảnh
                        </div>
                    )}

                    {/* Photo Count Overlay */}
                    <div className="room-thumb-counter">
                        <Eye style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />
                        <span>Xem {images.length} ảnh phòng</span>
                    </div>
                </div>

                {/* Room Specs & Details */}
                <div
                    className="room-col-specs"
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <div className="room-specs-2col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            <Maximize2
                                style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }}
                            />
                            <span>
                                Diện tích:{' '}
                                <strong>
                                    {room.areaSqm == null ? 'Chưa cập nhật' : `${room.areaSqm} m²`}
                                </strong>
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            <Bed style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
                            <span>
                                Giường: <strong>{room.bedDescription || 'Chưa cập nhật'}</strong>
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: 500,
                                gridColumn: 'span 2',
                            }}
                        >
                            <Users style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
                            <span>
                                Bao gồm:{' '}
                                <strong>
                                    {room.includedAdults} người lớn + {room.includedChildren} trẻ em
                                </strong>
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'var(--color-slate)',
                                gridColumn: 'span 2',
                                fontSize: '11px',
                            }}
                        >
                            Tối đa:{' '}
                            <strong>
                                {room.maxAdults} người lớn, {room.maxChildren} trẻ em (tổng tối đa{' '}
                                {room.maxOccupancy} khách)
                            </strong>
                        </div>
                    </div>

                    {/* Room Type Amenities Pills */}
                    {room.amenities && room.amenities.length > 0 && (
                        <div className="hotel-amenity-pill-list" style={{ marginBottom: 0 }}>
                            {room.amenities.map((amenity, idx) => (
                                <span
                                    key={amenity.amenity_id ?? idx}
                                    className="hotel-amenity-pill"
                                    title={amenity.room_note || amenity.description || undefined}
                                >
                                    {getRoomAmenityIcon(amenity.name || amenity.code)}
                                    <span>
                                        {amenity.name || amenity.code}
                                        {amenity.is_chargeable ? ' (có phí)' : ''}
                                    </span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Policies & Perks */}
                    <div className="room-policies-box">
                        {room.policies &&
                            room.policies.map((p, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--color-emerald-text)',
                                        fontWeight: 500,
                                    }}
                                >
                                    <Check
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            color: '#059669',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span>{p}</span>
                                </div>
                            ))}
                        <div
                            style={{
                                fontSize: '11px',
                                color: 'var(--color-slate)',
                                paddingTop: '4px',
                                borderTop: '1px solid #E2E8F0',
                                marginTop: '4px',
                            }}
                        >
                            Phụ thu thêm: người lớn +{formatVND(room.extraAdultFeePerNight)}/đêm, trẻ em +
                            {formatVND(room.extraChildFeePerNight)}/đêm
                        </div>
                    </div>
                </div>

                {/* Pricing & Selection Control: Displays total base room price for ONE room across the stay */}
                <div
                    className="room-col-pricing"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}
                >
                    <div style={{ textAlign: 'right', width: '100%', marginBottom: '12px' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '6px',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: 'var(--color-slate)',
                                }}
                            >
                                Tiền phòng {nightsCount} đêm:
                            </span>
                            <RoomTypePriceBreakdownTooltip
                                title="Chi tiết tiền phòng"
                                nightlyRates={room.nightlyRates}
                                totalLabel="Tổng tiền phòng"
                                totalAmount={totalBaseStayPrice}
                                ariaLabel={`Xem chi tiết tiền phòng ${room.name}`}
                            />
                        </div>
                        <div
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--color-navy)',
                                marginTop: '2px',
                            }}
                            className="tabular-nums"
                        >
                            {formatVND(totalBaseStayPrice)}
                        </div>
                        <span
                            style={{
                                fontSize: '11px',
                                color: 'var(--color-slate)',
                                display: 'block',
                                marginTop: '2px',
                            }}
                        >
                            (Giá cho 1 phòng)
                        </span>
                    </div>

                    {!isSelected ? (
                        /* Button revealed when no rooms of this type are selected */
                        <button
                            type="button"
                            onClick={() => onChangeQuantity && onChangeQuantity(room, 1)}
                            disabled={disabled || soldOut}
                            className="btn-select-room"
                        >
                            <Sparkles style={{ width: '16px', height: '16px' }} />
                            <span>{soldOut ? 'Hết phòng' : 'Chọn phòng'}</span>
                        </button>
                    ) : (
                        /* Quantity dropdown revealed when user clicks Chọn phòng or has selected rooms */
                        <div className="room-quantity-control">
                            <label className="room-quantity-label">Số lượng phòng:</label>
                            <select
                                value={selectedRooms.length}
                                onChange={(e) =>
                                    onChangeQuantity && onChangeQuantity(room, Number(e.target.value))
                                }
                                disabled={disabled || soldOut}
                                className="room-quantity-select"
                            >
                                <option value={0}>0 (Bỏ chọn)</option>
                                {Array.from({ length: room.availableQuantity }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} phòng
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Small Room Cards Section (Displayed inside room type card when quantity > 0) */}
            {isSelected && (
                <div className="room-selected-list-box">
                    <div className="room-selected-list-header">
                        <span className="room-selected-list-title">
                            Cấu hình khách cho {selectedRooms.length} phòng đã chọn:
                        </span>
                        <span className="room-selected-list-hint">
                            Mỗi phòng mặc định 1 người lớn, 0 trẻ em (tối đa {room.maxOccupancy} khách)
                        </span>
                    </div>

                    <div className="room-selected-items-grid">
                        {selectedRooms.map((item, idx) => (
                            <div key={item.roomId || idx} className="room-small-card">
                                <div className="room-small-card-header">
                                    <div className="room-small-card-title-group">
                                        <span className="room-small-card-number">Phòng {idx + 1}</span>
                                        <span className="room-small-card-type">{room.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveRoom && onRemoveRoom(item.roomId)}
                                        disabled={disabled}
                                        className="room-small-card-remove-btn"
                                        title="Bỏ chọn phòng này"
                                        aria-label={`Bỏ chọn phòng ${idx + 1}`}
                                    >
                                        <X style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>

                                <div className="room-small-card-guests">
                                    <div className="room-small-guest-group">
                                        <label className="room-small-guest-label">Người lớn</label>
                                        <select
                                            value={item.adults}
                                            onChange={(e) =>
                                                onUpdateGuests &&
                                                onUpdateGuests(item.roomId, 'adults', e.target.value)
                                            }
                                            disabled={disabled}
                                            className="room-small-guest-select"
                                        >
                                            {Array.from({ length: room.maxAdults }).map((_, i) => (
                                                <option
                                                    key={i + 1}
                                                    value={i + 1}
                                                    disabled={i + 1 + item.children > room.maxOccupancy}
                                                >
                                                    {i + 1} người lớn
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="room-small-guest-group">
                                        <label className="room-small-guest-label">Trẻ em</label>
                                        <select
                                            value={item.children}
                                            onChange={(e) =>
                                                onUpdateGuests &&
                                                onUpdateGuests(item.roomId, 'children', e.target.value)
                                            }
                                            disabled={disabled}
                                            className="room-small-guest-select"
                                        >
                                            {Array.from({ length: room.maxChildren + 1 }).map((_, i) => (
                                                <option
                                                    key={i}
                                                    value={i}
                                                    disabled={i + item.adults > room.maxOccupancy}
                                                >
                                                    {i} trẻ em
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
