import React from 'react';
import { Eye, Bed, Maximize2, Users, Check, Sparkles, X } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

export default function RoomTypeCard({
  room,
  selectedRooms = [],
  onChangeQuantity,
  onUpdateGuests,
  onRemoveRoom,
  onOpenGallery
}) {
  const images = room.images && room.images.length > 0 ? room.images : [room.image];
  const isSelected = selectedRooms.length > 0;

  return (
    <article className={`room-type-card ${isSelected ? 'room-type-card--selected' : ''}`}>
      
      {/* Header Bar */}
      <div className="room-card-header">
        <h3 className="room-card-title">{room.name}</h3>
        <span className="room-availability-badge">
          ✓ Còn {room.availableRooms} phòng trống
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
          <img
            src={room.image}
            alt={room.name}
            className="room-card-thumb-img"
            referrerPolicy="no-referrer"
          />

          {/* Photo Count Overlay */}
          <div className="room-thumb-counter">
            <Eye style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />
            <span>Xem {images.length} ảnh phòng</span>
          </div>
        </div>

        {/* Room Specs & Details */}
        <div className="room-col-specs" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="room-specs-2col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <Maximize2 style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
              <span>Diện tích: <strong>{room.size}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <Bed style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
              <span>Giường: <strong>{room.bed}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, gridColumn: 'span 2' }}>
              <Users style={{ width: '14px', height: '14px', color: 'var(--color-slate)' }} />
              <span>Bao gồm: <strong>{room.includedAdults} người lớn + {room.includedChildren} trẻ em</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-slate)', gridColumn: 'span 2', fontSize: '11px' }}>
              Tối đa: <strong>{room.maxAdults} người lớn (tổng tối đa {room.maxOccupancy} khách)</strong>
            </div>
          </div>

          {/* Policies & Perks */}
          <div className="room-policies-box">
            {room.policies && room.policies.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-emerald-text)', fontWeight: 500 }}>
                <Check style={{ width: '14px', height: '14px', color: '#059669', flexShrink: 0 }} />
                <span>{p}</span>
              </div>
            ))}
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', paddingTop: '4px', borderTop: '1px solid #E2E8F0', marginTop: '4px' }}>
              Phụ thu thêm: người lớn +{formatVND(room.extraAdultFee)}/đêm, trẻ em +{formatVND(room.extraChildFee)}/đêm
            </div>
          </div>
        </div>

        {/* Pricing & Selection Control */}
        <div className="room-col-pricing" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'right', width: '100%', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-slate)', display: 'block' }}>Giá mỗi đêm từ</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
              {formatVND(room.basePrice)}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-slate)', display: 'block', marginTop: '2px' }}>
              (Cuối tuần: {formatVND(room.weekendPrice)})
            </span>
          </div>

          {!isSelected ? (
            /* Button revealed when no rooms of this type are selected */
            <button
              type="button"
              onClick={() => onChangeQuantity && onChangeQuantity(room, 1)}
              className="btn-select-room"
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
              <span>Chọn phòng</span>
            </button>
          ) : (
            /* Quantity dropdown revealed when user clicks Chọn phòng or has selected rooms */
            <div className="room-quantity-control">
              <label className="room-quantity-label">
                Số lượng phòng:
              </label>
              <select
                value={selectedRooms.length}
                onChange={(e) => onChangeQuantity && onChangeQuantity(room, Number(e.target.value))}
                className="room-quantity-select"
              >
                <option value={0}>0 (Bỏ chọn)</option>
                {Array.from({ length: room.availableRooms }).map((_, i) => (
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
              <div key={item.clientId || idx} className="room-small-card">
                <div className="room-small-card-header">
                  <div className="room-small-card-title-group">
                    <span className="room-small-card-number">Phòng {idx + 1}</span>
                    <span className="room-small-card-type">{room.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveRoom && onRemoveRoom(item.clientId)}
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
                      onChange={(e) => onUpdateGuests && onUpdateGuests(item.clientId, 'adults', e.target.value)}
                      className="room-small-guest-select"
                    >
                      {Array.from({ length: item.maxAdults || 3 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} người lớn
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="room-small-guest-group">
                    <label className="room-small-guest-label">Trẻ em</label>
                    <select
                      value={item.children}
                      onChange={(e) => onUpdateGuests && onUpdateGuests(item.clientId, 'children', e.target.value)}
                      className="room-small-guest-select"
                    >
                      {Array.from({ length: (item.maxChildren !== undefined ? item.maxChildren : 2) + 1 }).map((_, i) => (
                        <option key={i} value={i}>
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
