import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-7xl">
        <div className="footer-grid">
          
          {/* Col 1: Corporate Brand */}
          <div className="footer-col">
            <Link to="/" className="brand-link">
              <div className="brand-logo-icon">
                V
              </div>
              <div className="brand-text" style={{ color: 'var(--color-white)' }}>
                VinaStay <span>Group</span>
              </div>
            </Link>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Tập đoàn Khách sạn & Nghỉ dưỡng hàng đầu Việt Nam. Sở hữu và quản lý trực tiếp hơn 25 khách sạn thành phố, resort ven biển và homestay sinh thái trên toàn quốc.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--color-sunshine)' }} />
              <span>100% cơ sở thuộc sở hữu trực tiếp, không qua trung gian</span>
            </div>
          </div>

          {/* Col 2: Accommodations */}
          <div className="footer-col">
            <h3 className="footer-heading">
              Hệ Thống Nghỉ Dưỡng
            </h3>
            <ul className="footer-link-list">
              <li>
                <Link to="/search?propertyType=HOTEL" className="footer-link">
                  Khách Sạn Thành Phố (Hotel)
                </Link>
              </li>
              <li>
                <Link to="/search?propertyType=RESORT" className="footer-link">
                  Khu Nghỉ Dưỡng Ven Biển (Resort)
                </Link>
              </li>
              <li>
                <Link to="/search?propertyType=HOMESTAY" className="footer-link">
                  Homestay Sinh Thái Bản Địa
                </Link>
              </li>
              <li>
                <Link to="/search?locationId=1" className="footer-link">
                  Chi nhánh TP. Hồ Chí Minh
                </Link>
              </li>
              <li>
                <Link to="/search?locationId=3" className="footer-link">
                  Chi nhánh Hạ Long, Quảng Ninh
                </Link>
              </li>
              <li>
                <Link to="/search?locationId=5" className="footer-link">
                  Chi nhánh An Giang (Mekong)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="footer-col">
            <h3 className="footer-heading">
              Hỗ Trợ Khách Hàng
            </h3>
            <ul className="footer-link-list">
              <li>
                <Link to="/about" className="footer-link">
                  Về Tập Đoàn VinaStay
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="footer-link">
                  Tra Cứu Đặt Phòng Của Tôi
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  Điều Khoản & Quy Định Đặt Phòng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">
                  Chính Sách Bảo Mật Thông Tin
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Liên Hệ & Trung Tâm Trợ Giúp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Headquarter & Direct Booking */}
          <div className="footer-col">
            <h3 className="footer-heading">
              Tổng Đài Đặt Phòng 24/7
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: '#94A3B8' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Hotline Toàn Quốc (Miễn phí)</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-sunshine)' }} className="tabular-nums">1900 6868</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Email CSKH Doanh Nghiệp</span>
                <span style={{ color: 'var(--color-white)' }}>reservation@vinastaygroup.vn</span>
              </div>
              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(51, 65, 85, 0.6)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Trụ sở chính tập đoàn</span>
                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Tòa nhà VinaStay Tower, 15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="footer-bottom">
          <div>
            © 2026 VinaStay Hospitality Group. Tất cả các quyền được bảo lưu.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/terms" className="footer-link" style={{ fontSize: '0.75rem' }}>Điều khoản</Link>
            <Link to="/privacy" className="footer-link" style={{ fontSize: '0.75rem' }}>Bảo mật</Link>
            <Link to="/contact" className="footer-link" style={{ fontSize: '0.75rem' }}>Trợ giúp</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
