import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider.jsx';
import HotelSearchForm from '../components/HotelSearchForm.jsx';
import HotelCard from '../components/HotelCard.jsx';
import ImageGalleryModal from '../components/ImageGalleryModal.jsx';
import { HOTELS, POPULAR_DESTINATIONS } from '../data/hotelsData.js';
import { ShieldCheck, Tag, Clock, Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
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

  // Top 3 featured hotels for homepage
  const featuredHotels = HOTELS.slice(0, 3);

  return (
    <div className="home-page">
      {/* 1. Editable Hero Slider Carousel */}
      <section className="home-hero-wrap">
        <HeroSlider />

        {/* 2. Overlapping Reusable Hotel Search Box */}
        <div className="home-search-overlap">
          <HotelSearchForm />
        </div>
      </section>

      {/* 3. Three Accommodation Categories (HOTEL, RESORT, HOMESTAY) */}
      <section className="container-7xl home-section">
        <div className="home-section-header">
          <span className="home-section-badge">
            Mô hình lưu trú đa dạng
          </span>
          <h2 className="home-section-title">
            Hệ Sinh Thái Nghỉ Dưỡng Trực Thuộc VinaStay
          </h2>
          <p className="home-section-subtitle">
            Mọi cơ sở lưu trú đều thuộc sở hữu trực tiếp của Tập đoàn VinaStay, cam kết tiêu chuẩn dịch vụ đồng nhất và chất lượng quản lý cao cấp.
          </p>
        </div>

        <div className="category-grid">
          {/* Category 1: Hotels */}
          <Link
            to="/search?propertyType=HOTEL"
            className="category-card"
          >
            <div className="category-card-thumb">
              <img
                src="/assets/images/hotel-saigon.jpg"
                alt="Khách Sạn Thành Phố"
                className="category-card-img"
                referrerPolicy="no-referrer"
              />
              <span className="property-badge property-badge--hotel">
                HOTEL
              </span>
            </div>
            <div className="category-card-body">
              <div>
                <h3 className="category-card-title">
                  Khách Sạn Trung Tâm Thành Phố
                </h3>
                <p className="category-card-desc">
                  Vị trí đắc địa tại trung tâm các thành phố lớn như TP.HCM, Hà Nội, Đà Nẵng. Hoàn hảo cho chuyến công tác và du lịch hiện đại.
                </p>
              </div>
              <div className="category-card-footer">
                <span>Khám phá khách sạn</span>
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </Link>

          {/* Category 2: Resorts */}
          <Link
            to="/search?propertyType=RESORT"
            className="category-card"
          >
            <div className="category-card-thumb">
              <img
                src="/assets/images/resort-halong.jpg"
                alt="Khu Nghỉ Dưỡng Ven Biển"
                className="category-card-img"
                referrerPolicy="no-referrer"
              />
              <span className="property-badge property-badge--resort">
                RESORT
              </span>
            </div>
            <div className="category-card-body">
              <div>
                <h3 className="category-card-title">
                  Khu Nghỉ Dưỡng Ven Biển & Di Sản
                </h3>
                <p className="category-card-desc">
                  Tọa lạc bên kỳ quan thiên nhiên Hạ Long và bờ biển Đà Nẵng với hồ bơi vô cực, bãi biển riêng và spa tiêu chuẩn 5 sao.
                </p>
              </div>
              <div className="category-card-footer">
                <span>Khám phá resort</span>
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </Link>

          {/* Category 3: Homestay */}
          <Link
            to="/search?propertyType=HOMESTAY"
            className="category-card"
          >
            <div className="category-card-thumb">
              <img
                src="/assets/images/homestay-mekong.jpg"
                alt="Homestay Sinh Thái Bản Địa"
                className="category-card-img"
                referrerPolicy="no-referrer"
              />
              <span className="property-badge property-badge--homestay">
                HOMESTAY
              </span>
            </div>
            <div className="category-card-body">
              <div>
                <h3 className="category-card-title">
                  Homestay Sinh Thái Bản Địa
                </h3>
                <p className="category-card-desc">
                  Trải nghiệm văn hóa mộc mạc và phong cảnh hữu tình tại Tri Tôn, Châu Đốc (An Giang) với kiến trúc gỗ thuần tự nhiên.
                </p>
              </div>
              <div className="category-card-footer">
                <span>Khám phá homestay</span>
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Featured Accommodations Section */}
      <section className="featured-section home-section">
        <div className="container-7xl">
          <div className="featured-header-row">
            <div>
              <span className="home-section-badge">
                Chỗ nghỉ nổi bật
              </span>
              <h2 className="home-section-title">
                Lựa Chọn Được Khách Hàng Yêu Thích
              </h2>
              <p className="home-section-subtitle">
                Nhấp vào ảnh đại diện của khách sạn để xem toàn bộ thư viện ảnh chất lượng cao.
              </p>
            </div>
            <Link
              to="/search"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-navy)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <span>Xem tất cả chỗ nghỉ</span>
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>

          <div className="featured-cards-stack">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onOpenGallery={handleOpenGallery}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Destinations */}
      <section className="container-7xl home-section">
        <div className="home-section-header">
          <span className="home-section-badge">
            Mạng lưới điểm đến
          </span>
          <h2 className="home-section-title">
            Khám Phá Các Tỉnh Thành Nổi Bật
          </h2>
          <p className="home-section-subtitle">
            Hệ thống cơ sở của VinaStay hiện diện tại những trung tâm du lịch hàng đầu Việt Nam.
          </p>
        </div>

        <div className="destinations-grid">
          {POPULAR_DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              to={`/search?locationId=${dest.id}`}
              className="destination-card"
            >
              <div className="destination-card-thumb">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="destination-card-img"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="destination-card-content">
                <h3 className="destination-card-name">
                  {dest.name}
                </h3>
                <p className="destination-card-subtitle">{dest.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Corporate Direct Booking Advantages */}
      <section className="corporate-section home-section">
        <div className="container-7xl">
          <div className="corporate-grid">
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sunshine)', display: 'block', marginBottom: '8px' }}>
                Quyền lợi đặt phòng trực tiếp
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '16px' }}>
                Vì Sao Bạn Nên Đặt Phòng Tại VinaStay Group?
              </h2>
              <p style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Tập đoàn trực tiếp sở hữu và quản lý từng khách sạn, bảo đảm quyền lợi tối đa cho khách hàng không qua bất kỳ đại lý trung gian nào.
              </p>

              <div className="corporate-perks-stack">
                <div className="corporate-perk-item">
                  <div className="corporate-perk-icon-wrap">
                    <Tag style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-white)' }}>Chính Sách Ưu Đãi Đặt Sớm (Early Booking)</h3>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Giảm ngay 15% tổng tiền phòng khi đặt phòng trước 14 ngày.</p>
                  </div>
                </div>

                <div className="corporate-perk-item">
                  <div className="corporate-perk-icon-wrap">
                    <Clock style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-white)' }}>Ưu Đãi Lưu Trú Dài Ngày (Long Stay)</h3>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Giảm 10% cho kỳ nghỉ từ 3 đêm trở lên tại mọi chi nhánh.</p>
                  </div>
                </div>

                <div className="corporate-perk-item">
                  <div className="corporate-perk-icon-wrap">
                    <ShieldCheck style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-white)' }}>Khóa Giữ Phòng 15 Phút An Toàn</h3>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Hệ thống tạm khóa kho phòng trong 15 phút để bạn thanh toán an tâm.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="corporate-metric-grid">
              <div className="corporate-metric-box">
                <div className="corporate-metric-number tabular-nums">25+</div>
                <div className="corporate-metric-label">Khách sạn & Resort</div>
              </div>
              <div className="corporate-metric-box">
                <div className="corporate-metric-number tabular-nums">100k+</div>
                <div className="corporate-metric-label">Khách hàng mỗi năm</div>
              </div>
              <div className="corporate-metric-box">
                <div className="corporate-metric-number tabular-nums">98.5%</div>
                <div className="corporate-metric-label">Đánh giá hài lòng</div>
              </div>
              <div className="corporate-metric-box">
                <div className="corporate-metric-number tabular-nums">100%</div>
                <div className="corporate-metric-label">Sở hữu trực tiếp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Image Gallery Modal */}
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
