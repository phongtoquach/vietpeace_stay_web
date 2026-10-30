import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Bed, Search } from 'lucide-react';
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
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateToString = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function HotelStaySearchForm({
  initialCheckin = '',
  initialCheckout = '',
  initialRooms = 1,
  onSearchStay
}) {
  const { showToast } = useAuth();

  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [rooms, setRooms] = useState(initialRooms || 1);

  // Sync internal state when initial props change
  useEffect(() => {
    if (initialCheckin) setCheckin(initialCheckin);
    if (initialCheckout) setCheckout(initialCheckout);
    if (initialRooms) setRooms(Number(initialRooms));
  }, [initialCheckin, initialCheckout, initialRooms]);

  const handleCheckinChange = (date) => {
    if (!date) {
      setCheckin('');
      return;
    }
    const newCheckinStr = formatDateToString(date);
    setCheckin(newCheckinStr);

    const currentCheckoutDate = parseDateString(checkout);
    if (!currentCheckoutDate || currentCheckoutDate <= date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckout(formatDateToString(nextDay));
    }
  };

  const handleCheckoutChange = (date) => {
    if (!date) {
      setCheckout('');
      return;
    }
    const currentCheckinDate = parseDateString(checkin);
    if (currentCheckinDate && date <= currentCheckinDate) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng', 'error');
      return;
    }
    setCheckout(formatDateToString(date));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checkin) {
      showToast('Vui lòng chọn ngày nhận phòng', 'error');
      return;
    }

    if (!checkout) {
      showToast('Vui lòng chọn ngày trả phòng', 'error');
      return;
    }

    const checkinDate = parseDateString(checkin);
    const checkoutDate = parseDateString(checkout);

    if (!checkinDate || isNaN(checkinDate.getTime())) {
      showToast('Ngày nhận phòng không hợp lệ', 'error');
      return;
    }

    if (!checkoutDate || isNaN(checkoutDate.getTime())) {
      showToast('Ngày trả phòng không hợp lệ', 'error');
      return;
    }

    if (checkoutDate <= checkinDate) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm', 'error');
      return;
    }

    const roomsNum = parseInt(rooms, 10);
    if (isNaN(roomsNum) || roomsNum < 1 || roomsNum > 8) {
      showToast('Số lượng phòng cần tìm phải từ 1 đến 8 phòng', 'error');
      return;
    }

    if (onSearchStay) {
      onSearchStay({
        checkin,
        checkout,
        rooms: roomsNum
      });
    }
  };

  return (
    <div className="hotel-stay-search-card">
      <div className="hotel-stay-search-header">
        <h3 className="hotel-stay-search-title">Kiểm Tra Phòng Trống & Giá</h3>
        <p className="hotel-stay-search-subtitle">
          Chọn ngày lưu trú và số lượng phòng cần tìm để xem tình trạng phòng và mức giá chính xác
        </p>
      </div>

      <form onSubmit={handleSubmit} className="hotel-stay-search-grid">
        {/* Field 1: Check-in Date */}
        <div className="stay-search-col-date">
          <label className="stay-search-label">
            Ngày nhận phòng
          </label>
          <div className="stay-search-input-box">
            <Calendar style={{ width: '18px', height: '18px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
            <div className="datepicker-field-wrap">
              <DatePicker
                selected={parseDateString(checkin)}
                onChange={handleCheckinChange}
                dateFormat="dd/MM/yyyy"
                className="custom-datepicker-input"
                minDate={new Date('2026-01-01T00:00:00')}
                placeholderText="Chọn ngày nhận phòng"
              />
            </div>
          </div>
        </div>

        {/* Field 2: Check-out Date */}
        <div className="stay-search-col-date">
          <label className="stay-search-label">
            Ngày trả phòng
          </label>
          <div className="stay-search-input-box">
            <Calendar style={{ width: '18px', height: '18px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
            <div className="datepicker-field-wrap">
              <DatePicker
                selected={parseDateString(checkout)}
                onChange={handleCheckoutChange}
                dateFormat="dd/MM/yyyy"
                className="custom-datepicker-input"
                minDate={(() => {
                  const cIn = parseDateString(checkin);
                  if (cIn) {
                    const next = new Date(cIn);
                    next.setDate(next.getDate() + 1);
                    return next;
                  }
                  return new Date('2026-01-02T00:00:00');
                })()}
                placeholderText="Chọn ngày trả phòng"
              />
            </div>
          </div>
        </div>

        {/* Field 3: Number of Rooms Requested */}
        <div className="stay-search-col-rooms">
          <label className="stay-search-label">
            Số phòng cần tìm
          </label>
          <div className="stay-search-input-box">
            <Bed style={{ width: '18px', height: '18px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
            <select
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value, 10))}
              className="stay-search-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} phòng
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 4: Search Button */}
        <div className="stay-search-col-submit">
          <button
            type="submit"
            className="stay-search-submit-btn"
          >
            <Search style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>Tìm phòng</span>
          </button>
        </div>
      </form>
    </div>
  );
}
