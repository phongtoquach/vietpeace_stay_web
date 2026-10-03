import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Eye, Coffee, Wifi, Car, Waves } from 'lucide-react';
import { formatVND } from '../utils/bookingUtils.js';

export default function HotelCard({ hotel, onOpenGallery, searchCriteria = {} }) {
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image];
  const queryParams = new URLSearchParams();
  queryParams.set('hotelId', hotel.id);
  if (searchCriteria.checkin) queryParams.set('checkin', searchCriteria.checkin);
  if (searchCriteria.checkout) queryParams.set('checkout', searchCriteria.checkout);
  if (searchCriteria.rooms) queryParams.set('rooms', searchCriteria.rooms);
  if (searchCriteria.adults) queryParams.set('adults', searchCriteria.adults);
  if (searchCriteria.children) queryParams.set('children', searchCriteria.children);

  const detailUrl = `/hotel-detail?${queryParams.toString()}`;

  const renderAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'breakfast':
        return (
          <span key="breakfast" className="hotel-amenity-pill">
            <Coffee style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} /> Bữa sáng
          </span>
        );
      case 'pool':
        return (
          <span key="pool" className="hotel-amenity-pill">
            <Waves style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} /> Hồ bơi
          </span>
        );
      case 'parking':
        return (
          <span key="parking" className="hotel-amenity-pill">
            <Car style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} /> Bãi đỗ xe
          </span>
        );
      case 'wifi':
        return (
          <span key="wifi" className="hotel-amenity-pill">
            <Wifi style={{ width: '14px', height: '14px', color: 'var(--color-navy)' }} /> Wi-Fi miễn phí
          </span>
        );
      default:
        return null;
    }
  };

  const propertyBadgeClass = {
    HOTEL: 'property-badge--hotel',
    RESORT: 'property-badge--resort',
    HOMESTAY: 'property-badge--homestay',
  }[hotel.propertyType] || 'property-badge--hotel';

  return (
    <article className="hotel-card">
      
      {/* Thumbnail Area - REQUIRED: Click thumbnail to open gallery modal! */}
      <div 
        className="hotel-card-thumb-container"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenGallery(hotel.name, images, 0);
        }}
        title="Nhấn để xem toàn bộ ảnh của khách sạn này"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenGallery(hotel.name, images, 0);
          }
        }}
      >
        <img
          src={hotel.image}
          alt={hotel.name}
          className="hotel-card-thumb-image"
          referrerPolicy="no-referrer"
        />

        {/* Property Type Badge */}
        <div className={`property-badge ${propertyBadgeClass}`}>
          {hotel.propertyType} · {hotel.starRating} SAO
        </div>

        {/* Photos Count & Click to Preview Overlay */}
        <div className="thumb-photos-pill">
          <Eye style={{ width: '14px', height: '14px', color: 'var(--color-sunshine)' }} />
          <span>Xem {images.length} ảnh</span>
        </div>
      </div>

      {/* Hotel Details Body */}
      <div className="hotel-card-content">
        <div>
          {/* Header Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-sunshine)' }}>
              {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
                <Star key={i} style={{ width: '14px', height: '14px', fill: 'var(--color-sunshine)' }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>·</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)' }}>{hotel.locationName}</span>
          </div>

          {/* Hotel Title - Navigates to Hotel Detail */}
          <Link
            to={detailUrl}
            className="hotel-card-name"
          >
            {hotel.name}
          </Link>

          {/* Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-slate)', marginBottom: '12px' }}>
            <MapPin style={{ width: '14px', height: '14px', color: 'var(--color-slate)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hotel.address}</span>
          </div>

          {/* Short Description */}
          <p className="line-clamp-2" style={{ fontSize: '0.875rem', color: 'var(--color-slate)', lineHeight: 1.6, marginBottom: '14px' }}>
            {hotel.description}
          </p>

          {/* Key Amenities */}
          <div className="hotel-amenity-pill-list">
            {hotel.amenities && hotel.amenities.map((a) => renderAmenityIcon(a))}
          </div>
        </div>

        {/* Footer Area with Score & Pricing */}
        <div className="hotel-card-bottom-row">
          {/* Score Badge */}
          <div className="hotel-score-card">
            <div className="hotel-score-value tabular-nums">
              {hotel.score || '9.4'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}>Xuất sắc</div>
              <div style={{ fontSize: '11px', color: 'var(--color-slate)' }}>{hotel.reviewsCount || 1200} đánh giá</div>
            </div>
          </div>

          {/* Price & CTA Button */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)' }}>Giá mỗi đêm từ</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
              {formatVND(hotel.price)}
            </div>
            <Link
              to={detailUrl}
              className="hotel-view-btn"
            >
              Xem phòng
            </Link>
          </div>
        </div>

      </div>

    </article>
  );
}
