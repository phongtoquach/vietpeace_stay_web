import React from 'react';
import {
  Wifi,
  Waves,
  Utensils,
  Car,
  Clock,
  Bell,
  Wind,
  Dumbbell,
  Sparkles,
  Bus,
  Baby,
  Shirt,
  MapPin,
  Compass,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  CigaretteOff,
  Users,
  FileText,
  Info
} from 'lucide-react';

// Amenity Icon and Label Mapping
const AMENITY_METADATA = {
  'Free Wi-Fi': { icon: Wifi, label: 'Free Wi-Fi', desc: 'Tốc độ cao trong phòng & toàn khuôn viên' },
  'Swimming pool': { icon: Waves, label: 'Hồ bơi ngoài trời', desc: 'Khăn tắm & ghế tắm nắng miễn phí' },
  'Restaurant': { icon: Utensils, label: 'Nhà hàng & Bar', desc: 'Phục vụ bữa sáng, gọi món & đồ uống' },
  'Free parking': { icon: Car, label: 'Bãi đỗ xe miễn phí', desc: 'Có nhân viên an ninh trực 24/7' },
  '24-hour front desk': { icon: Clock, label: 'Lễ tân 24/7', desc: 'Hỗ trợ check-in, gửi đồ & tour du lịch' },
  'Room service': { icon: Bell, label: 'Dịch vụ phòng', desc: 'Phục vụ ẩm thực tận phòng chu đáo' },
  'Air conditioning': { icon: Wind, label: 'Điều hòa không khí', desc: 'Hệ thống điều hòa lọc không khí hai chiều' },
  'Fitness center': { icon: Dumbbell, label: 'Phòng gym thể hình', desc: 'Trang thiết bị tập luyện hiện đại' },
  'Spa': { icon: Sparkles, label: 'Spa & Chăm sóc sức khỏe', desc: 'Massage trị liệu & xông hơi thư giãn' },
  'Airport shuttle': { icon: Bus, label: 'Xe đưa đón sân bay', desc: 'Đưa đón an toàn theo lịch hẹn' },
  'Children\'s play area': { icon: Baby, label: 'Khu vui chơi trẻ em', desc: 'Không gian an toàn, thân thiện' },
  'Car rental': { icon: Car, label: 'Dịch vụ thuê xe', desc: 'Thuê xe tự lái hoặc có tài xế' },
  'Laundry service': { icon: Shirt, label: 'Dịch vụ giặt ủi', desc: 'Giặt sấy lấy nhanh trong ngày' }
};

export default function PropertyOverview({ hotel }) {
  if (!hotel) return null;

  // Fallback nearby places if not explicitly defined
  const nearbyPlaces = hotel.nearbyPlaces || [
    { name: 'Trung tâm thành phố (City Center)', distance: '1.5 km' },
    { name: 'Chợ địa phương (Local Market)', distance: '800 m' },
    { name: 'Bến xe / Ga tàu (Station)', distance: '2.5 km' },
    { name: 'Sân bay gần nhất (Airport)', distance: '8 km' }
  ];

  // Fallback highlights if not explicitly defined
  const highlights = hotel.overviewHighlights || [
    'Không gian nghỉ dưỡng sang trọng, tiện nghi cao cấp',
    'Vị trí thuận tiện kết nối các điểm du lịch & ẩm thực nổi tiếng',
    'Dịch vụ chuyên nghiệp với đội ngũ nhân viên tận tâm 24/7'
  ];

  // Fallback amenities list
  const amenitiesToShow = hotel.featuredAmenitiesList || [
    'Free Wi-Fi',
    'Swimming pool',
    'Restaurant',
    'Free parking',
    '24-hour front desk',
    'Room service',
    'Air conditioning',
    'Fitness center',
    'Spa',
    'Airport shuttle',
    'Children\'s play area',
    'Laundry service'
  ];

  // Property info items (Strictly omitting accommodation type, room count, and languages spoken)
  const infoItems = [
    {
      label: 'Nhận phòng (Check-in)',
      value: hotel.propertyInfo?.checkIn || 'Từ 14:00 (from 14:00)',
      icon: Clock
    },
    {
      label: 'Trả phòng (Check-out)',
      value: hotel.propertyInfo?.checkOut || 'Trước 12:00 (before 12:00)',
      icon: Calendar
    },
    {
      label: 'Thân thiện với gia đình',
      value: hotel.propertyInfo?.familyFriendly || 'Thân thiện với gia đình, chào đón trẻ em',
      icon: Users
    },
    {
      label: 'Quy định hút thuốc',
      value: hotel.propertyInfo?.smokingPolicy || 'Khu vực hút thuốc riêng biệt (Cấm hút thuốc trong phòng)',
      icon: CigaretteOff
    },
    {
      label: 'Quy định thú cưng',
      value: hotel.propertyInfo?.petPolicy || 'Không cho phép mang theo thú cưng',
      icon: ShieldCheck
    }
  ];

  // Property policies
  const policies = hotel.propertyPolicies || [
    {
      title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
      content: 'Thời gian nhận phòng bắt đầu từ 14:00 và trả phòng trước 12:00. Khách vui lòng xuất trình giấy tờ tùy thân có ảnh và thẻ thanh toán/tiền mặt để đặt cọc tại quầy lễ tân.'
    },
    {
      title: 'Chính sách trẻ em & Giường phụ',
      content: 'Trẻ em dưới 6 tuổi được miễn phí khi ngủ chung giường với người lớn. Trẻ từ 6 đến 11 tuổi phụ thu theo quy định. Giường phụ có thể được cung cấp theo yêu cầu.'
    },
    {
      title: 'Quy định hút thuốc & Thú cưng',
      content: 'Nghiêm cấm hút thuốc trong toàn bộ phòng nghỉ và các khu vực kín. Khách sạn có bố trí khu vực hút thuốc riêng biệt ngoài trời. Không mang theo thú cưng.'
    },
    {
      title: 'Chính sách hủy phòng & Thanh toán',
      content: 'Chính sách hủy phòng và đặt cọc có thể khác nhau tùy thuộc vào từng loại phòng đã chọn. Hầu hết các phòng tiêu chuẩn được miễn phí hủy trước 48 giờ.'
    }
  ];

  return (
    <section className="property-overview-section">
      <div className="container-7xl">
        <div className="property-overview-card">
          
          {/* Main Section Header */}
          <div className="property-overview-header">
            <div className="property-overview-header-left">
              <span className="property-overview-badge">
                Thông Tin Chi Tiết
              </span>
              <h2 className="property-overview-title">
                Property Overview
              </h2>
              <p className="property-overview-subtitle">
                Tổng quan không gian nghỉ dưỡng, tiện ích nổi bật, vị trí thuận lợi và quy định lưu trú tại <strong>{hotel.name}</strong>.
              </p>
            </div>
          </div>

          {/* 3.1 About the Property */}
          <div className="property-overview-block">
            <div className="property-overview-section-header">
              <div className="property-overview-icon-pill">
                <Info style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h3 className="property-overview-heading">About the Property</h3>
                <span className="property-overview-heading-sub">Giới thiệu tổng quan và trải nghiệm lưu trú</span>
              </div>
            </div>

            <div className="property-overview-about-body">
              <p className="property-overview-description">
                {hotel.description}
              </p>

              {/* Extended atmospheric context */}
              <p className="property-overview-description-secondary">
                Được thiết kế nhằm mang lại sự cân bằng hoàn hảo giữa phong cách kiến trúc tinh tế, tiện nghi nghỉ dưỡng đẳng cấp và sự thư thái trọn vẹn, chỗ nghỉ đáp ứng hoàn hảo nhu cầu của các cặp đôi, gia đình, nhóm bạn cũng như khách lưu trú công vụ dài ngày.
              </p>

              {/* Highlights bullets / badges */}
              <div className="property-overview-highlights-box">
                <h4 className="property-overview-highlights-title">
                  Điểm Nổi Bật Của Chỗ Nghỉ
                </h4>
                <div className="property-overview-highlights-grid">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="property-overview-highlight-item">
                      <CheckCircle2 className="property-overview-highlight-icon" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="property-overview-divider" />

          {/* 2-Column Grid: Featured Amenities & Services | Location & Nearby Places */}
          <div className="property-overview-two-col">
            
            {/* 4. Featured Amenities & Services */}
            <div className="property-overview-subcard">
              <div className="property-overview-section-header">
                <div className="property-overview-icon-pill">
                  <Sparkles style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="property-overview-heading">Featured Amenities & Services</h3>
                  <span className="property-overview-heading-sub">Tiện nghi & Dịch vụ nổi bật</span>
                </div>
              </div>

              <div className="property-amenities-grid">
                {amenitiesToShow.map((amenityKey, index) => {
                  const item = AMENITY_METADATA[amenityKey] || {
                    icon: CheckCircle2,
                    label: amenityKey,
                    desc: 'Dịch vụ tiêu chuẩn sẵn sàng phục vụ'
                  };
                  const IconComp = item.icon;
                  return (
                    <div key={index} className="property-amenity-card">
                      <div className="property-amenity-icon-box">
                        <IconComp style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div className="property-amenity-content">
                        <span className="property-amenity-name">{item.label}</span>
                        <span className="property-amenity-desc">{item.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Location & Nearby Places */}
            <div className="property-overview-subcard">
              <div className="property-overview-section-header">
                <div className="property-overview-icon-pill">
                  <Compass style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="property-overview-heading">Location & Nearby Places</h3>
                  <span className="property-overview-heading-sub">Vị trí & Điểm đến lân cận</span>
                </div>
              </div>

              {/* Address Banner */}
              <div className="property-address-box">
                <div className="property-address-icon-wrap">
                  <MapPin style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <div className="property-address-label">Địa chỉ chỗ nghỉ</div>
                  <div className="property-address-text">{hotel.address}</div>
                  <div className="property-area-tag">{hotel.locationName}</div>
                </div>
              </div>

              {/* Nearby Places List */}
              <div className="property-nearby-container">
                <h4 className="property-nearby-title">
                  Địa Điểm Nổi Bật Gần Nhất
                </h4>
                <div className="property-nearby-list">
                  {nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="property-nearby-row">
                      <div className="property-nearby-name-wrap">
                        <span className="property-nearby-dot" />
                        <span className="property-nearby-name">{place.name}</span>
                      </div>
                      <span className="property-nearby-distance">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="property-overview-divider" />

          {/* 2-Column Grid: Property Information | Property Policies */}
          <div className="property-overview-two-col">

            {/* 6. Property Information */}
            <div className="property-overview-subcard">
              <div className="property-overview-section-header">
                <div className="property-overview-icon-pill">
                  <FileText style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="property-overview-heading">Property Information</h3>
                  <span className="property-overview-heading-sub">Thời gian và thông tin chung</span>
                </div>
              </div>

              <div className="property-info-list">
                {infoItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="property-info-row">
                      <div className="property-info-row-left">
                        <div className="property-info-row-icon">
                          <ItemIcon style={{ width: '16px', height: '16px' }} />
                        </div>
                        <span className="property-info-row-label">{item.label}</span>
                      </div>
                      <span className="property-info-row-val">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. Property Policies */}
            <div className="property-overview-subcard">
              <div className="property-overview-section-header">
                <div className="property-overview-icon-pill">
                  <ShieldCheck style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="property-overview-heading">Property Policies</h3>
                  <span className="property-overview-heading-sub">Chính sách & Quy định lưu trú</span>
                </div>
              </div>

              <div className="property-policies-list">
                {policies.map((policy, idx) => (
                  <div key={idx} className="property-policy-item">
                    <h5 className="property-policy-item-title">
                      {policy.title}
                    </h5>
                    <p className="property-policy-item-content">
                      {policy.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
