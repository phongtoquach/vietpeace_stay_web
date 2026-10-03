/**
 * VinaStay Hospitality Group - Utility & Pricing Functions (JavaScript)
 */

export function formatVND(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace('VND', '₫');
}

export function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function calculateNights(checkinStr, checkoutStr) {
  if (!checkinStr || !checkoutStr) return 1;
  const d1 = new Date(checkinStr);
  const d2 = new Date(checkoutStr);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export function isWeekendNight(dateObj) {
  const day = dateObj.getDay(); // 5 is Friday, 6 is Saturday
  return day === 5 || day === 6;
}

export function isSpecialHoliday(dateObj) {
  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  if ((d === 30 && m === 4) || (d === 1 && m === 5)) return true; // 30/4 & 1/5
  if (d === 2 && m === 9) return true; // 2/9
  if (d === 1 && m === 1) return true; // 1/1
  if (d >= 24 && d <= 25 && m === 12) return true; // Christmas
  return false;
}

export function getStayNights(checkinStr, checkoutStr) {
  const nights = [];
  const start = new Date(checkinStr);
  const end = new Date(checkoutStr);
  let cur = new Date(start);

  while (cur < end) {
    nights.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return nights;
}

export function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getStorage(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error('Storage Read Error', e);
    return fallback;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage Write Error', e);
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Storage Remove Error', e);
  }
}

/**
 * Calculate Pricing for Stay with Date-based pricing, extra guest fees, and promotions.
 */
export function calculateStayPricing(items, checkin, checkout) {
  const nights = calculateNights(checkin, checkout);
  const stayNights = getStayNights(checkin, checkout);

  let roomSubtotal = 0;
  let extraGuestsSubtotal = 0;

  const calculatedItems = (items || []).map(item => {
    let itemBaseTotal = 0;
    stayNights.forEach(nightDate => {
      if (isSpecialHoliday(nightDate)) {
        itemBaseTotal += (item.holidayPrice || item.basePrice || 1500000);
      } else if (isWeekendNight(nightDate)) {
        itemBaseTotal += (item.weekendPrice || item.basePrice || 1500000);
      } else {
        itemBaseTotal += (item.basePrice || 1500000);
      }
    });

    const extraAdults = Math.max(0, (item.adults || 2) - (item.includedAdults || 2));
    const extraChildren = Math.max(0, (item.children || 0) - (item.includedChildren || 1));
    const extraFeePerNight = (extraAdults * (item.extraAdultFee || 300000)) + (extraChildren * (item.extraChildFee || 150000));
    const itemExtraTotal = extraFeePerNight * nights;

    roomSubtotal += itemBaseTotal;
    extraGuestsSubtotal += itemExtraTotal;

    return {
      ...item,
      roomStayPrice: itemBaseTotal,
      extraFeeTotal: itemExtraTotal,
      extraAdults,
      extraChildren
    };
  });

  const subtotal = roomSubtotal + extraGuestsSubtotal;

  // Promotions with Priority Resolution:
  // Priority 1: Early Booking (>= 14 days ahead: 15% off)
  // Priority 2: Long Stay (>= 3 nights: 10% off)
  const today = new Date();
  const checkinDate = new Date(checkin);
  const daysInAdvance = Math.ceil((checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let eligiblePromotion = null;
  let discountAmount = 0;

  if (daysInAdvance >= 14) {
    eligiblePromotion = {
      id: 'EARLY_BIRD',
      name: 'Ưu đãi đặt sớm (Early Booking)',
      discountPercent: 15,
      priority: 1
    };
  } else if (nights >= 3) {
    eligiblePromotion = {
      id: 'LONG_STAY',
      name: 'Ưu đãi lưu trú dài ngày (Long Stay)',
      discountPercent: 10,
      priority: 2
    };
  }

  if (eligiblePromotion && calculatedItems.length > 0) {
    discountAmount = Math.round(subtotal * (eligiblePromotion.discountPercent / 100));
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  return {
    nights,
    items: calculatedItems,
    roomSubtotal,
    extraGuestsSubtotal,
    subtotal,
    eligiblePromotion,
    discountAmount,
    totalAmount
  };
}
