import React from 'react';
import { Eye, Bed, Maximize2, Users, Check, Sparkles } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

export default function RoomTypeCard({ room, onSelectRoom, onOpenGallery }) {
  const images = room.images && room.images.length > 0 ? room.images : [room.image];

  return (
    <article className="room-type-card">
      
      {/* Header Bar */}
      <div className="room-card-header">
        <h3 className="room-card-title">{room.name}</h3>
        <span className="room-availability-badge">
          ✓ Còn {room.availableRooms} phòng trống
        </span>
      </div>

      <div className="room-card-grid">
        
        {/* Room Thumbnail - REQUIRED FEATURE: Click room thumbnail to preview all images of that room type! */}
        <div 
          className="room-col-thumb room-card-thumb-box"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenGallery(room.name, images, 0);
          }}
          title="Nhấn để xem toàn bộ ảnh của loại phòng này"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenGallery(room.name, images, 0);
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

        {/* Pricing & CTA */}
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

          <button
            type="button"
            onClick={() => onSelectRoom(room)}
            className="btn-select-room"
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>Chọn phòng này</span>
          </button>
        </div>

      </div>

    </article>
  );
}
