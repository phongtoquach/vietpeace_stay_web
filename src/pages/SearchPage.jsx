import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import HotelSearchForm from '../components/HotelSearchForm.jsx';
import HotelCard from '../components/HotelCard.jsx';
import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import { HOTELS, AUTOCOMPLETE_OPTIONS } from '../data/hotelsData.js';
import { formatDateVN, formatVND } from '../utils/bookingUtils.js';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  // Search parameters
  const locationId = searchParams.get('locationId') || '';
  const accommodationId = searchParams.get('accommodationId') || '';
  const propertyTypeParam = searchParams.get('propertyType') || '';
  const checkin = searchParams.get('checkin') || '2026-10-20';
  const checkout = searchParams.get('checkout') || '2026-10-23';
  const rooms = searchParams.get('rooms') || '1';
  const adults = searchParams.get('adults') || '2';
  const childrenCount = searchParams.get('children') || '0';

  // State for sidebar filters
  const [selectedTypes, setSelectedTypes] = useState(propertyTypeParam ? [propertyTypeParam.toUpperCase()] : []);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sortBy, setSortBy] = useState('featured');

  // Image Gallery Modal State
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    title: '',
    images: [],
    initialIndex: 0
  });

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

  // Determine criteria title
  let locationTitle = 'Tất cả điểm đến';
  if (accommodationId) {
    const acc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'accommodation' && String(o.id) === String(accommodationId));
    if (acc) locationTitle = acc.name;
  } else if (locationId) {
    const loc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'destination' && String(o.id) === String(locationId));
    if (loc) locationTitle = loc.name;
  }

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    return HOTELS.filter((hotel) => {
      // 1. Accommodation ID match
      if (accommodationId && String(hotel.id) !== String(accommodationId)) {
        return false;
      }

      // 2. Location ID match (including hierarchy: An Giang ID 5 covers 5, 51, 52, 53)
      if (locationId && !accommodationId) {
        if (locationId === '5') {
          if (!['5', '51', '52', '53'].includes(String(hotel.locationId))) {
            return false;
          }
        } else if (String(hotel.locationId) !== String(locationId)) {
          return false;
        }
      }

      // 3. Property Type
      if (selectedTypes.length > 0 && !selectedTypes.includes(hotel.propertyType)) {
        return false;
      }

      // 4. Star Rating
      if (selectedRatings.length > 0 && !selectedRatings.includes(hotel.starRating)) {
        return false;
      }

      // 5. Price
      if (hotel.price > maxPrice) {
        return false;
      }

      // 6. Amenities
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(a => (hotel.amenities || []).includes(a));
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating_desc') return b.score - a.score;
      return 0; // default featured
    });
  }, [locationId, accommodationId, selectedTypes, selectedRatings, selectedAmenities, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedRatings([]);
    setSelectedAmenities([]);
    setMaxPrice(5000000);
    setSortBy('featured');
  };

  const handleToggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleRating = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="search-page">
      
      {/* 1. Reusable Hotel Search Form Header (Part 4.1 Requirement) */}
      <section style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 0', boxShadow: 'var(--shadow-xs)' }}>
        <div className="container-7xl">
          <HotelSearchForm />
        </div>
      </section>

      {/* 2. Search Criteria Summary Bar */}
      <div className="search-criteria-bar">
        <div className="container-7xl criteria-flex-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-sunshine)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Kết quả tìm kiếm:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-white)', fontSize: '1rem' }}>{locationTitle}</span>
            <span style={{ color: '#94A3B8' }}>·</span>
            <span>{formatDateVN(checkin)} – {formatDateVN(checkout)}</span>
            <span style={{ color: '#94A3B8' }}>·</span>
            <span>{rooms} phòng, {adults} người lớn{Number(childrenCount) > 0 ? `, ${childrenCount} trẻ em` : ''}</span>
          </div>
          <div style={{ color: '#CBD5E1', fontSize: '12px' }} className="tabular-nums">
            Tìm thấy <strong>{filteredHotels.length}</strong> cơ sở phù hợp
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  <Filter style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
                  <span>Bộ Lọc Tìm Kiếm</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <RotateCcw style={{ width: '12px', height: '12px' }} />
                  <span>Đặt lại</span>
                </button>
              </div>

              {/* Filter 1: Property Type */}
              <div className="sidebar-filter-section">
                <h3 className="filter-title">
                  Loại hình chỗ nghỉ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes('HOTEL')}
                      onChange={() => handleToggleType('HOTEL')}
                      className="filter-checkbox"
                    />
                    <span>Khách sạn (Hotel)</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes('RESORT')}
                      onChange={() => handleToggleType('RESORT')}
                      className="filter-checkbox"
                    />
                    <span>Khu nghỉ dưỡng (Resort)</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes('HOMESTAY')}
                      onChange={() => handleToggleType('HOMESTAY')}
                      className="filter-checkbox"
                    />
                    <span>Homestay sinh thái</span>
                  </label>
                </div>
              </div>

              {/* Filter 2: Star Rating */}
              <div className="sidebar-filter-section">
                <h3 className="filter-title">
                  Hạng sao
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(5)}
                      onChange={() => handleToggleRating(5)}
                      className="filter-checkbox"
                    />
                    <span>5 sao cao cấp</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(4)}
                      onChange={() => handleToggleRating(4)}
                      className="filter-checkbox"
                    />
                    <span>4 sao tiêu chuẩn</span>
                  </label>
                </div>
              </div>

              {/* Filter 3: Price Slider */}
              <div className="sidebar-filter-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 className="filter-title" style={{ marginBottom: 0 }}>
                    Giá mỗi đêm tối đa
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }} className="tabular-nums">
                    {formatVND(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="800000"
                  max="5000000"
                  step="200000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-sunshine)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-slate)', marginTop: '4px' }} className="tabular-nums">
                  <span>800.000 ₫</span>
                  <span>5.000.000 ₫</span>
                </div>
              </div>

              {/* Filter 4: Amenities */}
              <div className="sidebar-filter-section" style={{ borderBottom: 'none' }}>
                <h3 className="filter-title">
                  Tiện ích dịch vụ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes('breakfast')}
                      onChange={() => handleToggleAmenity('breakfast')}
                      className="filter-checkbox"
                    />
                    <span>Bao gồm bữa sáng</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes('pool')}
                      onChange={() => handleToggleAmenity('pool')}
                      className="filter-checkbox"
                    />
                    <span>Hồ bơi ngoài trời</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes('parking')}
                      onChange={() => handleToggleAmenity('parking')}
                      className="filter-checkbox"
                    />
                    <span>Bãi đỗ xe ô tô</span>
                  </label>
                  <label className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes('wifi')}
                      onChange={() => handleToggleAmenity('wifi')}
                      className="filter-checkbox"
                    />
                    <span>Wi-Fi miễn phí</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Area: Listing Cards & Sorting */}
          <section className="search-results-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Sort & Count Header */}
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '14px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                Hiển thị <strong>{filteredHotels.length}</strong> kết quả phù hợp
              </span>

              <div className="sort-select-box">
                <SlidersHorizontal style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }} />
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select-input"
                >
                  <option value="featured">Được đề xuất nhiều nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating_desc">Đánh giá sao cao nhất</option>
                </select>
              </div>
            </div>

            {/* Hotel Cards List */}
            {filteredHotels.length === 0 ? (
              <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)', padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
                  Không tìm thấy chỗ nghỉ phù hợp
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', maxWidth: '28rem', margin: '0 auto 16px' }}>
                  Quý khách vui lòng thử bỏ bớt bộ lọc hoặc chọn mức giá cao hơn để tìm kiếm thêm cơ sở.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-primary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onOpenGallery={handleOpenGallery}
                    searchCriteria={{ checkin, checkout, rooms, adults, children: childrenCount }}
                  />
                ))}
              </div>
            )}

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
