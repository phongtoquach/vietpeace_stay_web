import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-ivory)', paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div className="container-4xl">
        
        {/* Hero Banner */}
        <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 2.5rem' }}>
          <span className="home-section-badge">
            Câu chuyện thương hiệu
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.025em' }}>
            Tôn Vinh Vẻ Đẹp & Lòng Hiếu Khách Việt Nam
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-slate)', marginTop: '12px', lineHeight: 1.6 }}>
            Tập đoàn Khách sạn & Nghỉ dưỡng VinaStay sở hữu và trực tiếp vận hành mạng lưới khách sạn, resort và homestay cao cấp trên khắp Việt Nam.
          </p>
        </div>

        {/* Feature Image */}
        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', marginBottom: '3rem', height: '22rem' }}>
          <img
            src="/assets/images/hero.jpg"
            alt="VinaStay Panorama"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Philosophy Card */}
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
            Mô Hình Sở Hữu & Vận Hành Trực Tiếp 100%
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', lineHeight: 1.6 }}>
            Khác biệt hoàn toàn với các trang web trung gian hay nền tảng đại lý ủy quyền, VinaStay Group là đơn vị <strong>chủ quản đầu tư, thiết kế và trực tiếp quản lý</strong> toàn bộ các cơ sở mang thương hiệu VinaStay.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate)', lineHeight: 1.6 }}>
            Chúng tôi loại bỏ các tầng trung gian để mang lại cho quý khách:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--color-navy)' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0, marginTop: '2px' }} />
              <span>Giá gốc tốt nhất từ tập đoàn, không phí hoa hồng ẩn.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--color-navy)' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0, marginTop: '2px' }} />
              <span>Tình trạng phòng cập nhật theo thời gian thực chính xác 100%.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--color-navy)' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0, marginTop: '2px' }} />
              <span>Chính sách khóa giữ phòng 15 phút an toàn tuyệt đối.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--color-navy)' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)', flexShrink: 0, marginTop: '2px' }} />
              <span>Tiêu chuẩn phục vụ 5 sao và chăm sóc khách hàng 24/7.</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/search"
            className="btn-primary"
            style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)' }}
          >
            Khám phá các điểm đến của VinaStay
          </Link>
        </div>

      </div>
    </div>
  );
}
