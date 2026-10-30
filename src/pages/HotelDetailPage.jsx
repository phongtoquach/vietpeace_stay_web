import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import HotelStaySearchForm from '../components/HotelStaySearchForm.jsx';
import RoomTypeCard from '../components/RoomTypeCard.jsx';
import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import PropertyOverview from '../components/PropertyOverview.jsx';
import LoginModal from '../components/LoginModal.jsx';
import { HOTELS } from '../data/hotelsData.js';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { calculateStayPricing, formatVND, formatDateVN, formatCountdown, getStayNights, isSpecialHoliday, isWeekendNight } from '../utils/bookingUtils.js';
import { MapPin, Star, Eye, Calendar, Sparkles, X, Clock, AlertCircle } from 'lucide-react';

const STORAGE_STAY_SELECTION_KEY = 'vinastay_stay_selection';

export default function HotelDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const { getActivePendingBooking, createOrUpdatePendingBooking } = useBooking();

  // Read URL search parameters
  const hotelIdParam = searchParams.get('hotelId') || '101';
  const checkinParam = searchParams.get('checkin');
  const checkoutParam = searchParams.get('checkout');
  const roomsParam = searchParams.get('rooms');

  // Validate stay parameters from URL
  const isValidDateString = (str) => {
    if (!str || typeof str !== 'string') return false;
    const parts = str.split('-');
    if (parts.length !== 3) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  };

  const hasValidCheckin = isValidDateString(checkinParam);
  const hasValidCheckout = isValidDateString(checkoutParam);
  const requestedRoomsCount = roomsParam ? parseInt(roomsParam, 10) : 0;
  const hasValidRooms = requestedRoomsCount >= 1 && requestedRoomsCount <= 8;

  const isStaySearchValid = Boolean(
    hasValidCheckin &&
    hasValidCheckout &&
    hasValidRooms &&
    new Date(checkoutParam) > new Date(checkinParam)
  );

  // Active applied stay parameters (only used if valid)
  const appliedCheckin = isStaySearchValid ? checkinParam : '';
  const appliedCheckout = isStaySearchValid ? checkoutParam : '';
  const appliedRoomsCount = isStaySearchValid ? requestedRoomsCount : 1;

  // Find hotel from mock data
  const hotel = HOTELS.find(h => String(h.id) === String(hotelIdParam)) || HOTELS[0];

  // Gallery Modal State
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    title: '',
    images: [],
    initialIndex: 0
  });

  // Login Modal State for unauthenticated users
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Selected Room Items (Each selected room is an individual object with clientId)
  const [selectedItems, setSelectedItems] = useState([]);

  // Pending booking countdown timer
  const [pendingBooking, setPendingBooking] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Track last loaded stay to detect date changes and prevent stale selections
  const prevStayRef = useRef({
    hotelId: hotelIdParam,
    checkin: appliedCheckin,
    checkout: appliedCheckout
  });

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

  // Restore or reset selection based on URL stay parameters
  useEffect(() => {
    if (!isStaySearchValid) {
      setSelectedItems([]);
      return;
    }

    const prevStay = prevStayRef.current;
    const datesChanged = prevStay.checkin !== appliedCheckin || prevStay.checkout !== appliedCheckout || prevStay.hotelId !== hotelIdParam;

    if (datesChanged) {
      // Clear stale selection if dates or hotel changed
      setSelectedItems([]);
      try {
        sessionStorage.removeItem(STORAGE_STAY_SELECTION_KEY);
      } catch (e) {
        // ignore
      }
      prevStayRef.current = {
        hotelId: hotelIdParam,
        checkin: appliedCheckin,
        checkout: appliedCheckout
      };
    } else {
      // Try restoring from sessionStorage
      try {
        const saved = sessionStorage.getItem(STORAGE_STAY_SELECTION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            String(parsed.hotelId) === String(hotel.id) &&
            parsed.checkin === appliedCheckin &&
            parsed.checkout === appliedCheckout &&
            Array.isArray(parsed.rooms) &&
            parsed.rooms.length > 0
          ) {
            setSelectedItems(parsed.rooms);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [hotelIdParam, appliedCheckin, appliedCheckout, isStaySearchValid, hotel.id]);

  // Sync selected items to sessionStorage
  useEffect(() => {
    if (!isStaySearchValid) return;

    try {
      if (selectedItems.length > 0) {
        sessionStorage.setItem(STORAGE_STAY_SELECTION_KEY, JSON.stringify({
          hotelId: String(hotel.id),
          checkin: appliedCheckin,
          checkout: appliedCheckout,
          rooms: selectedItems
        }));
      } else {
        sessionStorage.removeItem(STORAGE_STAY_SELECTION_KEY);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedItems, isStaySearchValid, hotel.id, appliedCheckin, appliedCheckout]);

  // Restore active PENDING booking if exists
  useEffect(() => {
    const existing = getActivePendingBooking(hotel.id);
    if (existing) {
      setPendingBooking(existing);
      if (selectedItems.length === 0 && existing.items && isStaySearchValid) {
        setSelectedItems(existing.items);
      }
    }
  }, [hotel.id, isStaySearchValid]);

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

  // Handler when user submits the Stay Search form
  const handleSearchStay = ({ checkin, checkout, rooms }) => {
    // If dates changed from previous applied stay, clear existing selections immediately
    if (checkin !== appliedCheckin || checkout !== appliedCheckout) {
      setSelectedItems([]);
      try {
        sessionStorage.removeItem(STORAGE_STAY_SELECTION_KEY);
      } catch (e) {
        // ignore
      }
    }

    // Build new query parameters preserving existing unrelated parameters
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('hotelId', hotelIdParam);
    nextParams.set('checkin', checkin);
    nextParams.set('checkout', checkout);
    nextParams.set('rooms', String(rooms));

    navigate(`/hotel-detail?${nextParams.toString()}`);
    showToast('Đã cập nhật ngày lưu trú & số phòng tìm kiếm!', 'success');
  };

  // Handler for changing quantity of a room type via button or dropdown
  const handleChangeQuantity = (room, newQty) => {
    const currentForType = selectedItems.filter(item => item.roomTypeId === room.id);
    const currentQty = currentForType.length;

    if (newQty > room.availableRooms) {
      showToast(`Loại phòng "${room.name}" chỉ còn trống ${room.availableRooms} phòng!`, 'error');
      return;
    }

    if (newQty === currentQty) return;

    if (newQty > currentQty) {
      // Adding new rooms: each newly added room defaults to 1 adult and 0 children
      const countToAdd = newQty - currentQty;
      const newRooms = Array.from({ length: countToAdd }).map(() => ({
        clientId: `room-${room.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
        adults: 1, // REQUIRED: Defaults to 1 adult
        children: 0, // REQUIRED: Defaults to 0 children
      }));

      setSelectedItems(prev => [...prev, ...newRooms]);
      showToast(`Đã chọn ${newQty} phòng "${room.name}"`, 'success');
    } else {
      // Reducing rooms: remove the last (currentQty - newQty) rooms of this room type
      const countToRemove = currentQty - newQty;
      const idsToRemove = currentForType.slice(-countToRemove).map(r => r.clientId);

      setSelectedItems(prev => prev.filter(item => !idsToRemove.includes(item.clientId)));
      if (newQty === 0) {
        showToast(`Đã bỏ chọn loại phòng "${room.name}"`, 'info');
      } else {
        showToast(`Đã giảm xuống ${newQty} phòng "${room.name}"`, 'info');
      }
    }
  };

  // Remove room item by unique clientId
  const handleRemoveRoomByClientId = (clientId) => {
    setSelectedItems(prev => prev.filter(item => item.clientId !== clientId));
    showToast('Đã bỏ bớt 1 phòng', 'info');
  };

  // Update guests for a specific physical room by clientId
  const handleUpdateGuests = (clientId, field, value) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.clientId !== clientId) return item;
      const updated = { ...item, [field]: Number(value) };
      if (updated.adults + updated.children > item.maxOccupancy) {
        showToast(`Phòng này tối đa ${item.maxOccupancy} khách. Vui lòng chọn thêm phòng nếu cần!`, 'error');
        return item;
      }
      return updated;
    }));
  };

  // Pricing calculations for current stay and selections
  const pricing = isStaySearchValid
    ? calculateStayPricing(selectedItems, appliedCheckin, appliedCheckout)
    : { nights: 0, subtotal: 0, extraGuestsSubtotal: 0, discountAmount: 0, totalAmount: 0, eligiblePromotion: null };

  // Filter room types based on requested room count
  const availableRoomTypes = isStaySearchValid
    ? (hotel.rooms || []).filter(room => room.availableRooms >= appliedRoomsCount)
    : [];

  // Submit booking
  const handleProceedBooking = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 phòng!', 'error');
      return;
    }

    try {
      const booking = createOrUpdatePendingBooking({
        hotel,
        checkin: appliedCheckin,
        checkout: appliedCheckout,
        items: selectedItems,
        currentUser
      });

      if (booking && booking.id) {
        showToast('Đã khởi tạo giữ chỗ 15 phút an toàn!', 'success');
        navigate(`/checkout?bookingId=${booking.id}`);
      } else {
        showToast('Không thể tạo đơn đặt phòng. Vui lòng thử lại.', 'error');
      }
    } catch (err) {
      console.error('Lỗi khởi tạo đặt phòng:', err);
      showToast('Đã có lỗi xảy ra khi tạo đơn đặt phòng. Vui lòng thử lại.', 'error');
    }
  };

  const hotelImages = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image];

  return (
    <div className="hotel-detail-page">
      
      {/* 1. Hotel Breadcrumbs & Header Information */}
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

      {/* 2. Hotel Image Gallery Section with EXACTLY "Xem thêm" Button */}
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

      {/* 3. Property Overview Section (Overview, Amenities, Location/Attractions, Policies) */}
      <PropertyOverview hotel={hotel} />

      {/* 4. Stay Search Controls Section (Placed directly after Property Overview) */}
      <section className="container-7xl stay-search-section">
        <HotelStaySearchForm
          initialCheckin={appliedCheckin}
          initialCheckout={appliedCheckout}
          initialRooms={appliedRoomsCount}
          onSearchStay={handleSearchStay}
        />
      </section>

      {/* 5. Room Types Section & Booking Summary: Only shown if stay search is complete and valid in URL */}
      {!isStaySearchValid ? (
        /* Prompt message when URL contains incomplete or missing stay parameters */
        <section className="container-7xl" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="stay-search-prompt-card">
            <div className="stay-search-prompt-icon">
              <Calendar style={{ width: '28px', height: '28px', color: 'var(--color-sunshine)' }} />
            </div>
            <div className="stay-search-prompt-text">
              <h3 className="stay-search-prompt-title">
                Vui lòng chọn ngày lưu trú và số lượng phòng cần tìm
              </h3>
              <p className="stay-search-prompt-desc">
                Để xem danh sách phòng còn trống, giá ưu đãi và các chính sách phụ thu theo số lượng khách, quý khách vui lòng chọn <strong>Ngày nhận phòng</strong>, <strong>Ngày trả phòng</strong>, <strong>Số phòng cần tìm</strong> ở thanh tìm kiếm phía trên rồi bấm nút <strong>"Tìm phòng"</strong>.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* Room Types List and Sticky Booking Summary */
        <main className="container-7xl" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
          <div className="detail-layout-grid">
            
            {/* Left Area: Available Room Types List */}
            <section className="detail-rooms-col">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Các Loại Phòng Có Thể Đặt
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', marginTop: '4px' }}>
                  Kỳ nghỉ: <strong>{formatDateVN(appliedCheckin)} – {formatDateVN(appliedCheckout)} ({pricing.nights} đêm)</strong> · Số phòng cần tìm: <strong>{appliedRoomsCount} phòng</strong>.
                </p>
              </div>

              {/* Check if any room type satisfies the requested room count */}
              {availableRoomTypes.length === 0 ? (
                <div className="hotel-rooms-empty-state">
                  <AlertCircle style={{ width: '36px', height: '36px', color: 'var(--color-sunshine)', marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
                    Không có loại phòng nào còn đủ {appliedRoomsCount} phòng trống
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                    Trong khoảng thời gian từ {formatDateVN(appliedCheckin)} đến {formatDateVN(appliedCheckout)}, cơ sở lưu trú này không còn loại phòng nào đủ {appliedRoomsCount} phòng trống liên tục. Quý khách vui lòng thử giảm số lượng phòng cần tìm hoặc chọn ngày khác.
                  </p>
                </div>
              ) : (
                /* Room Type Cards List */
                availableRoomTypes.map((room) => {
                  const selectedForThisType = selectedItems.filter(item => item.roomTypeId === room.id);
                  return (
                    <RoomTypeCard
                      key={room.id}
                      room={room}
                      selectedRooms={selectedForThisType}
                      onChangeQuantity={handleChangeQuantity}
                      onUpdateGuests={handleUpdateGuests}
                      onRemoveRoom={handleRemoveRoomByClientId}
                      onOpenGallery={handleOpenGallery}
                    />
                  );
                })
              )}
            </section>

            {/* Right Area: Sticky Booking Summary Panel */}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                    {selectedItems.map((item, idx) => {
                      // Sequence per room type, e.g. "Deluxe King Hướng Sông - Phòng 1"
                      const typeIndex = selectedItems.slice(0, idx + 1).filter(r => r.roomTypeId === item.roomTypeId).length;

                      // Single room stay pricing calculation
                      const nights = pricing.nights > 0 ? pricing.nights : 1;
                      const stayNights = (appliedCheckin && appliedCheckout) ? getStayNights(appliedCheckin, appliedCheckout) : [];

                      const nightlyRates = stayNights.map(nightDate => {
                        if (isSpecialHoliday(nightDate)) {
                          return item.holidayPrice || item.basePrice || 1500000;
                        } else if (isWeekendNight(nightDate)) {
                          return item.weekendPrice || item.basePrice || 1500000;
                        }
                        return item.basePrice || 1500000;
                      });

                      const roomStayPrice = nightlyRates.length > 0 
                        ? nightlyRates.reduce((sum, r) => sum + r, 0)
                        : (item.basePrice || 1500000) * nights;

                      const allSameRate = nightlyRates.length > 0 && nightlyRates.every(r => r === nightlyRates[0]);
                      const avgNightlyRate = nights > 0 ? (roomStayPrice / nights) : (item.basePrice || 1500000);
                      const displayNightlyRate = allSameRate ? (nightlyRates[0] || item.basePrice || 1500000) : avgNightlyRate;

                      // Extra guest charges for this specific room
                      const extraAdults = Math.max(0, (item.adults || 1) - (item.includedAdults || 2));
                      const extraChildren = Math.max(0, (item.children || 0) - (item.includedChildren || 1));
                      const extraFeePerNight = (extraAdults * (item.extraAdultFee || 300000)) + (extraChildren * (item.extraChildFee || 150000));
                      const roomExtraTotal = extraFeePerNight * nights;

                      return (
                        <div key={item.clientId || idx} className="selected-room-row">
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <h4 className="selected-room-title">
                              {item.roomName} - Phòng {typeIndex}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveRoomByClientId(item.clientId)}
                              className="selected-room-remove-btn"
                              title="Bỏ phòng này"
                              aria-label={`Bỏ ${item.roomName} - Phòng ${typeIndex}`}
                            >
                              <X style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>

                          {/* Static guest information: e.g. “2 người lớn, 1 trẻ em” or “1 người lớn, 0 trẻ em” */}
                          <div className="selected-room-guests-static">
                            {item.adults} người lớn, {item.children} trẻ em
                          </div>

                          {/* Pricing Details for this single room */}
                          <div className="selected-room-pricing-box">
                            <div className="selected-room-price-line">
                              <span>{allSameRate ? 'Giá phòng/đêm:' : 'Giá phòng trung bình/đêm:'}</span>
                              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                                {formatVND(displayNightlyRate)}
                              </span>
                            </div>
                            <div className="selected-room-price-line selected-room-price-line--total">
                              <span>Tiền phòng {nights} đêm:</span>
                              <span className="tabular-nums" style={{ color: 'var(--color-navy)' }}>
                                {formatVND(roomStayPrice)}
                              </span>
                            </div>
                            {roomExtraTotal > 0 && (
                              <div className="selected-room-price-line" style={{ color: '#B45309', fontSize: '10.5px' }}>
                                <span>Phụ thu thêm khách ({nights} đêm):</span>
                                <span className="tabular-nums">+{formatVND(roomExtraTotal)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

                {/* CTA Action: Depends on Auth Status */}
                {currentUser ? (
                  <button
                    type="button"
                    onClick={handleProceedBooking}
                    disabled={selectedItems.length === 0}
                    className="btn-primary btn-primary--full"
                    style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}
                  >
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                    <span>Đặt phòng</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    disabled={selectedItems.length === 0}
                    className="btn-primary btn-primary--full"
                    style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}
                  >
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                    <span>Đăng nhập để đặt phòng</span>
                  </button>
                )}

              </div>
            </aside>

          </div>
        </main>
      )}

      {/* Functional Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        returnUrl={window.location.pathname + window.location.search}
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
