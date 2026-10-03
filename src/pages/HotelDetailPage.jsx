import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import HotelSearchForm from '../components/HotelSearchForm.jsx';
import RoomTypeCard from '../components/RoomTypeCard.jsx';
import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import PropertyOverview from '../components/PropertyOverview.jsx';
import { HOTELS } from '../data/hotelsData.js';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { calculateStayPricing, formatVND, formatDateVN, formatCountdown } from '../utils/bookingUtils.js';
import { MapPin, Star, Eye, Calendar, Sparkles, X, Clock, AlertTriangle } from 'lucide-react';

export default function HotelDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const { getActivePendingBooking, createOrUpdatePendingBooking } = useBooking();

  const hotelIdParam = searchParams.get('hotelId') || '101';
  const checkin = searchParams.get('checkin') || '2026-10-20';
  const checkout = searchParams.get('checkout') || '2026-10-23';

  // Find hotel from mock data
  const hotel = HOTELS.find(h => String(h.id) === String(hotelIdParam)) || HOTELS[0];

  // Gallery Modal State
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    title: '',
    images: [],
    initialIndex: 0
  });

  // Selected Room Items (Each selected room is an individual object)
  const [selectedItems, setSelectedItems] = useState([]);

  // Pending booking countdown timer
  const [pendingBooking, setPendingBooking] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Open Gallery handler
  const handleOpenGallery = (title, images, initialIndex = 0) => {
    setGalleryModal({
      isOpen: true,
      title,
      images,
      initialIndex
    });
  };

  const handleCloseGallery = () => {
    setGalleryModal(prev => ({ ...prev, isOpen: false }));
  };

  // Restore active PENDING booking if exists
  useEffect(() => {
    const existing = getActivePendingBooking(hotel.id);
    if (existing) {
      setPendingBooking(existing);
      if (selectedItems.length === 0 && existing.items) {
        setSelectedItems(existing.items);
      }
    }
  }, [hotel.id]);

  // Handle countdown interval for pending booking
  useEffect(() => {
    if (!pendingBooking) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((pendingBooking.expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setPendingBooking(null);
        showToast('Đặt phòng trước đó đã hết hạn giữ chỗ.', 'info');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pendingBooking]);

  // Add room item
  const handleAddRoom = (room) => {
    // Inventory check
    const currentCount = selectedItems.filter(i => i.roomTypeId === room.id).length;
    if (currentCount >= room.availableRooms) {
      showToast(`Loại phòng "${room.name}" chỉ còn trống ${room.availableRooms} phòng!`, 'error');
      return;
    }

    const newItem = {
      bookingItemId: null,
      roomTypeId: room.id,
      roomName: room.name,
      basePrice: room.basePrice,
      weekendPrice: room.weekendPrice,
      holidayPrice: room.holidayPrice,
      includedAdults: room.includedAdults,
      includedChildren: room.includedChildren,
      maxAdults: room.maxAdults,
      maxChildren: room.maxChildren,
      maxOccupancy: room.maxOccupancy,
      extraAdultFee: room.extraAdultFee,
      extraChildFee: room.extraChildFee,
      adults: room.includedAdults,
      children: 0,
    };

    setSelectedItems(prev => [...prev, newItem]);
    showToast(`Đã thêm 1 phòng "${room.name}"`, 'success');
  };

  // Remove room item by index
  const handleRemoveRoom = (index) => {
    setSelectedItems(prev => prev.filter((_, idx) => idx !== index));
    showToast('Đã bỏ bớt 1 phòng', 'info');
  };

  // Update guests for a specific physical room
  const handleUpdateGuests = (index, field, value) => {
    setSelectedItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const updated = { ...item, [field]: Number(value) };
      if (updated.adults + updated.children > item.maxOccupancy) {
        showToast(`Phòng này tối đa ${item.maxOccupancy} khách. Vui lòng chọn thêm phòng nếu cần!`, 'error');
        return item;
      }
      return updated;
    }));
  };

  // Pricing calculations
  const pricing = calculateStayPricing(selectedItems, checkin, checkout);

  // Submit booking
  const handleProceedBooking = () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập hoặc đăng ký để tiếp tục đặt phòng.', 'error');
      navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 phòng!', 'error');
      return;
    }

    const booking = createOrUpdatePendingBooking({
      hotel,
      checkin,
      checkout,
      items: selectedItems,
      currentUser
    });

    showToast('Đã khởi tạo giữ chỗ 15 phút an toàn!', 'success');
    navigate(`/checkout?bookingId=${booking.id}`);
  };

  const hotelImages = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image];

  return (
    <div className="hotel-detail-page">
      
      {/* 5.1 Reusable Hotel Search Form near top */}
      <section style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 0', boxShadow: 'var(--shadow-xs)' }}>
        <div className="container-7xl">
          <HotelSearchForm />
        </div>
      </section>

      {/* Hotel Breadcrumbs & Header */}
      <div className="container-7xl" style={{ paddingTop: '1.5rem' }}>
        <nav style={{ fontSize: '12px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: 'inherit' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/search" style={{ color: 'inherit' }}>Chỗ nghỉ</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-navy)', fontWeight: 700 }}>{hotel.name}</span>
        </nav>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="property-badge property-badge--hotel" style={{ position: 'static' }}>
                {hotel.propertyType}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-sunshine)' }}>
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} style={{ width: '14px', height: '14px', fill: 'var(--color-sunshine)' }} />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>5 sao quốc tế</span>
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy)' }}>
              {hotel.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '6px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
              <span>{hotel.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Xuất sắc</div>
              <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>{hotel.reviewsCount} đánh giá xác thực</div>
            </div>
            <div className="hotel-score-value tabular-nums" style={{ width: '48px', height: '48px', fontSize: '1.125rem' }}>
              {hotel.score}
            </div>
          </div>
        </div>
      </div>

      {/* 5.2 Hotel Image Gallery Section with EXACTLY "Xem thêm" Button */}
      <section className="container-7xl" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <div className="hotel-gallery-grid-box">
          <div className="hotel-gallery-grid">
            
            {/* Main Featured Photo */}
            <div 
              className="hotel-gallery-featured-cell hotel-gallery-cell"
              onClick={() => handleOpenGallery(hotel.name, hotelImages, 0)}
            >
              <img
                src={hotelImages[0]}
                alt={hotel.name}
                className="hotel-gallery-cell-img"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Supporting Photos */}
            {hotelImages.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="hotel-gallery-cell"
                onClick={() => handleOpenGallery(hotel.name, hotelImages, idx + 1)}
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
            onClick={() => handleOpenGallery(hotel.name, hotelImages, 0)}
            className="hotel-gallery-view-more-btn"
          >
            <Eye style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
            <span>Xem thêm</span>
          </button>
        </div>
      </section>

      {/* Property Overview Section (Placed directly below Hotel Image Gallery) */}
      <PropertyOverview hotel={hotel} />

      {/* Main Room Selection & Booking Workflow Area */}
      <main className="container-7xl">
        <div className="detail-layout-grid">
          
          {/* Left Area: Available Room Types List (5.3) */}
          <section className="detail-rooms-col">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                Các Loại Phòng Có Thể Đặt
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>
                Kỳ nghỉ: <strong>{formatDateVN(checkin)} – {formatDateVN(checkout)} ({pricing.nights} đêm)</strong>. Nhấp vào ảnh phòng để xem thư viện ảnh của từng phòng.
              </p>
            </div>

            {/* Room Type Cards List */}
            {hotel.rooms && hotel.rooms.map((room) => (
              <RoomTypeCard
                key={room.id}
                room={room}
                onSelectRoom={handleAddRoom}
                onOpenGallery={handleOpenGallery}
              />
            ))}
          </section>

          {/* Right Area: Sticky Booking Summary Panel (5.4) */}
          <aside className="detail-booking-sidebar-col">
            <div className="booking-summary-panel">
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Tóm Tắt Đặt Phòng
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)' }}>
                  {selectedItems.length} phòng đã chọn
                </span>
              </div>

              {/* Pending Booking Hold Alert Banner */}
              {pendingBooking && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 241, 194, 0.8)', border: '1px solid rgba(245, 184, 46, 0.5)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}>
                    <Clock style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
                    <span>Đang có đơn chờ thanh toán</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                    Mã: <strong>{pendingBooking.bookingCode}</strong>. Quý khách có thể bổ sung phòng hoặc tiếp tục thanh toán.
                  </p>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#78350F' }} className="tabular-nums">
                    Thời gian giữ phòng còn: {formatCountdown(countdown)}
                  </div>
                </div>
              )}

              {/* Selected Rooms List */}
              {selectedItems.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Chưa có phòng nào được chọn.</p>
                  <p style={{ marginTop: '4px' }}>Vui lòng bấm "Chọn phòng" từ danh sách bên trái.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="selected-room-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-sunshine)' }}>
                            Phòng {idx + 1}
                          </span>
                          <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}>{item.roomName}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom(idx)}
                          style={{ padding: '4px', color: 'var(--color-slate)', cursor: 'pointer' }}
                          title="Bỏ phòng này"
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>

                      {/* Separate Adult & Child Selectors for EACH room */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '2px' }}>Người lớn</label>
                          <select
                            value={item.adults}
                            onChange={(e) => handleUpdateGuests(idx, 'adults', e.target.value)}
                            style={{ width: '100%', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '4px 8px', fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}
                          >
                            {Array.from({ length: item.maxAdults }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1} người lớn</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-slate)', display: 'block', marginBottom: '2px' }}>Trẻ em</label>
                          <select
                            value={item.children}
                            onChange={(e) => handleUpdateGuests(idx, 'children', e.target.value)}
                            style={{ width: '100%', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '4px 8px', fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}
                          >
                            {Array.from({ length: (item.maxChildren || 2) + 1 }).map((_, i) => (
                              <option key={i} value={i}>{i} trẻ em</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate)' }}>
                  <span>Tạm tính ({pricing.nights} đêm):</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">{formatVND(pricing.subtotal)}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-emerald-text)', fontWeight: 600, backgroundColor: 'var(--color-emerald-bg)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <span>{pricing.eligiblePromotion?.name} (-{pricing.eligiblePromotion?.discountPercent}%):</span>
                    <span className="tabular-nums">-{formatVND(pricing.discountAmount)}</span>
                  </div>
                )}

                <div style={{ paddingTop: '8px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Tổng cộng:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }} className="tabular-nums">
                    {formatVND(pricing.totalAmount)}
                  </span>
                </div>
              </div>

              {/* CTA Action */}
              <button
                type="button"
                onClick={handleProceedBooking}
                disabled={selectedItems.length === 0}
                className="btn-primary btn-primary--full"
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}
              >
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>{pendingBooking ? 'Cập nhật đặt phòng & Thanh toán' : 'Đặt phòng ngay'}</span>
              </button>

            </div>
          </aside>

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
