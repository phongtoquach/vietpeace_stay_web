import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building, Calendar, Users, Plus, Minus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AUTOCOMPLETE_OPTIONS } from '../data/hotelsData.js';
import { useAuth } from '../context/AuthContext.jsx';

// Helpers for timezone-safe date conversion
const parseDateString = (str) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(str);
};

const formatDateToString = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function HotelSearchForm({ className = '' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAuth();

  // Initial values from URL search params or defaults
  const initialLocationId = searchParams.get('locationId') || '';
  const initialAccommodationId = searchParams.get('accommodationId') || '';
  const initialCheckin = searchParams.get('checkin') || '2026-10-20';
  const initialCheckout = searchParams.get('checkout') || '2026-10-23';
  const initialRooms = parseInt(searchParams.get('rooms') || '1', 10);
  const initialAdults = parseInt(searchParams.get('adults') || '2', 10);
  const initialChildren = parseInt(searchParams.get('children') || '0', 10);

  // Determine initial query string name
  let initialDestinationName = '';
  if (initialAccommodationId) {
    const acc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'accommodation' && String(o.id) === String(initialAccommodationId));
    if (acc) initialDestinationName = acc.name;
  } else if (initialLocationId) {
    const loc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'destination' && String(o.id) === String(initialLocationId));
    if (loc) initialDestinationName = loc.name;
  }

  const [destinationQuery, setDestinationQuery] = useState(initialDestinationName);
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState(initialAccommodationId);
  const [isOptionSelected, setIsOptionSelected] = useState(Boolean(initialLocationId || initialAccommodationId));

  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);
  const [childrenCount, setChildrenCount] = useState(initialChildren);

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);

  const autocompleteRef = useRef(null);
  const guestPopoverRef = useRef(null);

  // Sync state if URL params change externally
  useEffect(() => {
    const pLocId = searchParams.get('locationId') || '';
    const pAccId = searchParams.get('accommodationId') || '';
    if (pAccId) {
      const acc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'accommodation' && String(o.id) === String(pAccId));
      if (acc) {
        setDestinationQuery(acc.name);
        setSelectedAccommodationId(pAccId);
        setSelectedLocationId(acc.locationId || '');
        setIsOptionSelected(true);
      }
    } else if (pLocId) {
      const loc = AUTOCOMPLETE_OPTIONS.find(o => o.type === 'destination' && String(o.id) === String(pLocId));
      if (loc) {
        setDestinationQuery(loc.name);
        setSelectedLocationId(pLocId);
        setSelectedAccommodationId('');
        setIsOptionSelected(true);
      }
    }
    if (searchParams.get('checkin')) setCheckin(searchParams.get('checkin'));
    if (searchParams.get('checkout')) setCheckout(searchParams.get('checkout'));
    if (searchParams.get('rooms')) setRooms(parseInt(searchParams.get('rooms'), 10));
    if (searchParams.get('adults')) setAdults(parseInt(searchParams.get('adults'), 10));
    if (searchParams.get('children')) setChildrenCount(parseInt(searchParams.get('children'), 10));
  }, [searchParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setAutocompleteOpen(false);
      }
      if (guestPopoverRef.current && !guestPopoverRef.current.contains(event.target)) {
        setGuestPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete suggestions
  const filteredSuggestions = AUTOCOMPLETE_OPTIONS.filter((item) => {
    const q = destinationQuery.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) ||
      (item.parent && item.parent.toLowerCase().includes(q)) ||
      (item.locationName && item.locationName.toLowerCase().includes(q));
  });

  const destinations = filteredSuggestions.filter(i => i.type === 'destination');
  const accommodations = filteredSuggestions.filter(i => i.type === 'accommodation');

  const handleSelectOption = (item) => {
    setDestinationQuery(item.name);
    setIsOptionSelected(true);
    if (item.type === 'destination') {
      setSelectedLocationId(String(item.id));
      setSelectedAccommodationId('');
    } else {
      setSelectedAccommodationId(String(item.id));
      setSelectedLocationId(String(item.locationId || ''));
    }
    setAutocompleteOpen(false);
  };

  const handleCheckinDateChange = (date) => {
    if (!date) return;
    const newCheckinStr = formatDateToString(date);
    setCheckin(newCheckinStr);

    const currentCheckoutDate = parseDateString(checkout);
    if (!currentCheckoutDate || currentCheckoutDate <= date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckout(formatDateToString(nextDay));
    }
  };

  const handleCheckoutDateChange = (date) => {
    if (!date) return;
    const currentCheckinDate = parseDateString(checkin);
    if (currentCheckinDate && date <= currentCheckinDate) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng', 'error');
      return;
    }
    setCheckout(formatDateToString(date));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check autocomplete requirement: user must select a real option
    let finalLocId = selectedLocationId;
    let finalAccId = selectedAccommodationId;

    if (!isOptionSelected || (!finalLocId && !finalAccId)) {
      const matched = AUTOCOMPLETE_OPTIONS.find(item => item.name.toLowerCase() === destinationQuery.trim().toLowerCase());
      if (matched) {
        if (matched.type === 'destination') {
          finalLocId = String(matched.id);
          finalAccId = '';
        } else {
          finalAccId = String(matched.id);
          finalLocId = String(matched.locationId || '');
        }
      } else {
        showToast('Vui lòng chọn điểm đến hoặc khách sạn từ danh sách gợi ý!', 'error');
        setAutocompleteOpen(true);
        return;
      }
    }

    if (!checkin || !checkout) {
      showToast('Vui lòng chọn ngày nhận phòng và trả phòng', 'error');
      return;
    }

    if (new Date(checkout) <= new Date(checkin)) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng', 'error');
      return;
    }

    // Construct URL query params
    const params = new URLSearchParams();
    if (finalLocId) params.set('locationId', finalLocId);
    if (finalAccId) params.set('accommodationId', finalAccId);
    params.set('checkin', checkin);
    params.set('checkout', checkout);
    params.set('rooms', rooms);
    params.set('adults', adults);
    params.set('children', childrenCount);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className={`hotel-search-card ${className}`}>
      <form onSubmit={handleSubmit} className="hotel-search-form-grid">
        
        {/* Field 1: Destination / Hotel Autocomplete */}
        <div className="search-col-destination" style={{ position: 'relative' }} ref={autocompleteRef}>
          <label className="search-field-label">
            Điểm đến hoặc Chỗ nghỉ
          </label>
          <div 
            className="search-input-box"
            onClick={() => setAutocompleteOpen(true)}
          >
            <MapPin style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                setIsOptionSelected(false);
                setAutocompleteOpen(true);
              }}
              onFocus={() => setAutocompleteOpen(true)}
              placeholder="Hồ Chí Minh, Hạ Long, An Giang..."
              className="search-text-input"
              autoComplete="off"
            />
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {autocompleteOpen && (
            <div className="autocomplete-panel">
              {filteredSuggestions.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--color-slate)' }}>
                  Không tìm thấy điểm đến hoặc cơ sở phù hợp
                </div>
              ) : (
                <>
                  {destinations.length > 0 && (
                    <div>
                      <div className="autocomplete-group-title">
                        Điểm đến phổ biến
                      </div>
                      {destinations.map(item => (
                        <button
                          key={`dest-${item.id}`}
                          type="button"
                          onClick={() => handleSelectOption(item)}
                          className="autocomplete-item-btn"
                        >
                          <div className="autocomplete-item-icon" style={{ backgroundColor: '#F1F5F9', color: 'var(--color-navy)' }}>
                            <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
                          </div>
                          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                            <div className="autocomplete-item-title">{item.name}</div>
                            <div className="autocomplete-item-subtitle">{item.parent || 'Việt Nam'}</div>
                          </div>
                          <span className="autocomplete-tag" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                            Tỉnh / TP
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {accommodations.length > 0 && (
                    <div>
                      <div className="autocomplete-group-title">
                        Cơ sở lưu trú VinaStay
                      </div>
                      {accommodations.map(item => (
                        <button
                          key={`acc-${item.id}`}
                          type="button"
                          onClick={() => handleSelectOption(item)}
                          className="autocomplete-item-btn"
                        >
                          <div className="autocomplete-item-icon" style={{ backgroundColor: 'var(--color-sunshine-light)', color: 'var(--color-navy)' }}>
                            <Building style={{ width: '16px', height: '16px', color: 'var(--color-navy)' }} />
                          </div>
                          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                            <div className="autocomplete-item-title">{item.name}</div>
                            <div className="autocomplete-item-subtitle">{item.locationName}</div>
                          </div>
                          <span className="autocomplete-tag" style={{ backgroundColor: 'var(--color-sunshine-light)', color: 'var(--color-navy)' }}>
                            Trực thuộc
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Field 2: Check-in Date (React DatePicker) */}
        <div className="search-col-date">
          <label className="search-field-label">
            Nhận phòng
          </label>
          <div className="search-input-box">
            <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-slate)', flexShrink: 0 }} />
            <div className="datepicker-field-wrap">
              <DatePicker
                selected={parseDateString(checkin)}
                onChange={handleCheckinDateChange}
                dateFormat="dd/MM/yyyy"
                className="custom-datepicker-input"
                minDate={new Date('2026-01-01T00:00:00')}
                placeholderText="Chọn ngày"
              />
            </div>
          </div>
        </div>

        {/* Field 3: Check-out Date (React DatePicker) */}
        <div className="search-col-date">
          <label className="search-field-label">
            Trả phòng
          </label>
          <div className="search-input-box">
            <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-slate)', flexShrink: 0 }} />
            <div className="datepicker-field-wrap">
              <DatePicker
                selected={parseDateString(checkout)}
                onChange={handleCheckoutDateChange}
                dateFormat="dd/MM/yyyy"
                className="custom-datepicker-input"
                minDate={(() => {
                  const cIn = parseDateString(checkin);
                  if (cIn) {
                    const next = new Date(cIn);
                    next.setDate(next.getDate() + 1);
                    return next;
                  }
                  return new Date();
                })()}
                placeholderText="Chọn ngày"
              />
            </div>
          </div>
        </div>

        {/* Field 4: Guests & Rooms Popover */}
        <div className="search-col-guests" style={{ position: 'relative' }} ref={guestPopoverRef}>
          <label className="search-field-label">
            Số phòng & Số khách
          </label>
          <button
            type="button"
            onClick={() => setGuestPopoverOpen(!guestPopoverOpen)}
            className="search-input-box"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Users style={{ width: '16px', height: '16px', color: 'var(--color-slate)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rooms} phòng · {adults} lớn · {childrenCount} trẻ
              </span>
            </div>
          </button>

          {/* Guest Popover Dialog */}
          {guestPopoverOpen && (
            <div className="guest-popover-panel">
              {/* Counter 1: Rooms */}
              <div className="guest-counter-row">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Số phòng</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Số phòng cần đặt</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                    className="counter-btn"
                  >
                    <Minus style={{ width: '14px', height: '14px' }} />
                  </button>
                  <span style={{ width: '20px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-navy)' }} className="tabular-nums">{rooms}</span>
                  <button
                    type="button"
                    onClick={() => setRooms(Math.min(8, rooms + 1))}
                    disabled={rooms >= 8}
                    className="counter-btn"
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Counter 2: Adults */}
              <div className="guest-counter-row">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Người lớn</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Từ 12 tuổi trở lên</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="counter-btn"
                  >
                    <Minus style={{ width: '14px', height: '14px' }} />
                  </button>
                  <span style={{ width: '20px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-navy)' }} className="tabular-nums">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(16, adults + 1))}
                    disabled={adults >= 16}
                    className="counter-btn"
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Counter 3: Children */}
              <div className="guest-counter-row" style={{ borderBottom: 'none' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>Trẻ em</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate)' }}>Từ 0 - 11 tuổi</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    disabled={childrenCount <= 0}
                    className="counter-btn"
                  >
                    <Minus style={{ width: '14px', height: '14px' }} />
                  </button>
                  <span style={{ width: '20px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-navy)' }} className="tabular-nums">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.min(10, childrenCount + 1))}
                    disabled={childrenCount >= 10}
                    className="counter-btn"
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              <div style={{ paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setGuestPopoverOpen(false)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-navy)',
                    backgroundColor: 'var(--color-sunshine-light)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="search-col-submit">
          <button
            type="submit"
            className="search-btn-submit"
            aria-label="Tìm kiếm"
          >
            <Search style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          </button>
        </div>

      </form>
    </div>
  );
}
