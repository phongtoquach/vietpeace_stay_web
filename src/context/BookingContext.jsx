import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage, removeStorage, calculateStayPricing } from '../utils/bookingUtils.js';

const BookingContext = createContext();

const STORAGE_BOOKINGS_KEY = 'vietpeacestay_bookings';
const STORAGE_ACTIVE_BOOKING_KEY = 'vietpeacestay_active_booking_id';
const STORAGE_TEMP_SELECTION_KEY = 'vietpeacestay_pending_selection';

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    const existing = getStorage(STORAGE_BOOKINGS_KEY, null);
    if (existing && existing.length > 0) return existing;

    const initial = [
      {
        id: 1001,
        bookingCode: 'VNS-20261020-001',
        userId: 101,
        userFullName: 'Nguyễn Văn An',
        accommodationId: 101,
        accommodationName: 'VinaStay Saigon Riverside Hotel',
        address: '15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        checkinDate: '2026-10-20',
        checkoutDate: '2026-10-23',
        nights: 3,
        numberOfRooms: 2,
        items: [
          { roomTypeId: 1, roomName: 'Deluxe King Hướng Sông', adults: 2, children: 1, roomStayPrice: 4500000, extraFeeTotal: 450000 },
          { roomTypeId: 1, roomName: 'Deluxe King Hướng Sông', adults: 2, children: 0, roomStayPrice: 4500000, extraFeeTotal: 0 }
        ],
        roomSubtotal: 9000000,
        extraGuestsSubtotal: 450000,
        subtotal: 9450000,
        discountAmount: 1417500,
        totalAmount: 8032500,
        promotionName: 'Ưu đãi đặt sớm (Early Booking) -15%',
        status: 'PAID',
        paidAt: Date.now() - 86400000 * 2,
        paymentMethod: 'CREDIT_CARD',
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id: 1002,
        bookingCode: 'VNS-20260815-089',
        userId: 101,
        userFullName: 'Nguyễn Văn An',
        accommodationId: 102,
        accommodationName: 'VinaStay Hạ Long Heritage Resort',
        address: 'Bán Đảo Tuần Châu, TP. Hạ Long, Tỉnh Quảng Ninh',
        checkinDate: '2026-08-15',
        checkoutDate: '2026-08-18',
        nights: 3,
        numberOfRooms: 1,
        items: [
          { roomTypeId: 201, roomName: 'Ocean View Deluxe Villa', adults: 2, children: 1, roomStayPrice: 7800000, extraFeeTotal: 0 }
        ],
        roomSubtotal: 7800000,
        extraGuestsSubtotal: 0,
        subtotal: 7800000,
        discountAmount: 780000,
        totalAmount: 7020000,
        promotionName: 'Ưu đãi lưu trú dài ngày (Long Stay) -10%',
        status: 'COMPLETED',
        paidAt: Date.now() - 86400000 * 45,
        paymentMethod: 'VNPAY_QR',
        createdAt: Date.now() - 86400000 * 45
      }
    ];
    setStorage(STORAGE_BOOKINGS_KEY, initial);
    return initial;
  });

  // Save bookings to localStorage whenever changed
  useEffect(() => {
    setStorage(STORAGE_BOOKINGS_KEY, bookings);
  }, [bookings]);

  // Check if there is an active PENDING booking for a specific accommodation
  const getActivePendingBooking = (hotelId = null) => {
    const now = Date.now();
    return bookings.find(b => 
      b.status === 'PENDING' &&
      b.expiresAt > now &&
      (!hotelId || String(b.accommodationId) === String(hotelId))
    );
  };

  // Create or Update PENDING booking
  const createOrUpdatePendingBooking = ({ hotel, checkin, checkout, items, currentUser }) => {
    const now = Date.now();
    const pricing = calculateStayPricing(items, checkin, checkout);
    const existingPending = getActivePendingBooking(hotel.id);

    // 15 minutes reservation hold
    const expiresAt = now + 15 * 60 * 1000;

    let targetBooking;

    if (existingPending) {
      targetBooking = {
        ...existingPending,
        items,
        numberOfRooms: items.length,
        checkinDate: checkin,
        checkoutDate: checkout,
        nights: pricing.nights,
        roomSubtotal: pricing.roomSubtotal,
        extraGuestsSubtotal: pricing.extraGuestsSubtotal,
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        totalAmount: pricing.totalAmount,
        promotionName: pricing.eligiblePromotion ? pricing.eligiblePromotion.name : null,
        promotionId: pricing.eligiblePromotion ? pricing.eligiblePromotion.id : null,
        updatedAt: now
      };
      setBookings(prev => prev.map(b => b.id === targetBooking.id ? targetBooking : b));
    } else {
      const newBookingId = Math.floor(Math.random() * 9000) + 1000;
      const datePart = (checkin || '20261020').replace(/-/g, '');
      const bookingCode = `VNS-${datePart}-${String(newBookingId).slice(-3)}`;

      targetBooking = {
        id: newBookingId,
        bookingCode,
        userId: currentUser?.id || 101,
        userFullName: currentUser?.fullName || 'Khách hàng',
        userEmail: currentUser?.email || '',
        userPhone: currentUser?.phone || '',
        accommodationId: hotel.id,
        accommodationName: hotel.name,
        address: hotel.address,
        checkinDate: checkin,
        checkoutDate: checkout,
        nights: pricing.nights,
        numberOfRooms: items.length,
        items,
        roomSubtotal: pricing.roomSubtotal,
        extraGuestsSubtotal: pricing.extraGuestsSubtotal,
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        totalAmount: pricing.totalAmount,
        promotionName: pricing.eligiblePromotion ? pricing.eligiblePromotion.name : null,
        promotionId: pricing.eligiblePromotion ? pricing.eligiblePromotion.id : null,
        status: 'PENDING',
        expiresAt,
        createdAt: now
      };
      setBookings(prev => [targetBooking, ...prev]);
    }

    setStorage(STORAGE_ACTIVE_BOOKING_KEY, targetBooking.id);
    return targetBooking;
  };

  // Mark booking as PAID
  const markBookingPaid = (bookingId, paymentMethod = 'CREDIT_CARD') => {
    setBookings(prev => prev.map(b => {
      if (b.id === Number(bookingId) || String(b.id) === String(bookingId)) {
        return {
          ...b,
          status: 'PAID',
          paidAt: Date.now(),
          paymentMethod,
          transactionId: 'TXN-' + Date.now()
        };
      }
      return b;
    }));
    removeStorage(STORAGE_TEMP_SELECTION_KEY);
  };

  // Mark booking as EXPIRED
  const markBookingExpired = (bookingId) => {
    setBookings(prev => prev.map(b => {
      if (b.id === Number(bookingId) || String(b.id) === String(bookingId)) {
        return { ...b, status: 'EXPIRED' };
      }
      return b;
    }));
  };

  // Cancel booking
  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => {
      if (b.id === Number(bookingId) || String(b.id) === String(bookingId) || b.bookingCode === bookingId) {
        return {
          ...b,
          status: 'CANCELLED',
          cancelledAt: Date.now(),
          refundStatus: 'REFUNDED_100_PERCENT'
        };
      }
      return b;
    }));
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      getActivePendingBooking,
      createOrUpdatePendingBooking,
      markBookingPaid,
      markBookingExpired,
      cancelBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
