import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, LogOut, Calendar, Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tìm chỗ nghỉ', path: '/search' },
    { label: 'Về tập đoàn', path: '/about' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <header className="site-header">
      <div className="container-7xl header-inner">
        
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="brand-link">
          <div className="brand-logo-icon">
            V
          </div>
          <div className="brand-text">
            VietPeace <span>Stay</span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="main-navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path === '/search' && location.pathname.startsWith('/search')) ||
              (link.path === '/about' && location.pathname === '/about');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-item-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
                {isActive && (
                  <span className="nav-item-indicator" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Account (Desktop) */}
        <div className="header-actions">
          {currentUser ? (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="user-menu-btn"
              >
                <div className="user-avatar">
                  {currentUser.fullName ? currentUser.fullName.split(' ').slice(-1)[0][0] : 'U'}
                </div>
                <span className="user-name">
                  {currentUser.fullName}
                </span>
                <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--color-slate)', transition: 'transform 150ms ease', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-header-subtitle">Tài khoản khách hàng</p>
                    <p className="dropdown-header-email">{currentUser.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="dropdown-link"
                  >
                    <User style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }} />
                    <span>Thông tin cá nhân</span>
                  </Link>
                  <Link
                    to="/bookings"
                    className="dropdown-link"
                  >
                    <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }} />
                    <span>Đặt phòng của tôi</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="dropdown-logout-btn"
                  >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                className="auth-btn-login"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="auth-btn-register"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="mobile-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-slate)' }}>
                  Đã đăng nhập: <strong style={{ color: 'var(--color-navy)' }}>{currentUser.fullName}</strong>
                </div>
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <User style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }} />
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/bookings"
                  className="mobile-nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-slate)' }} />
                  Đặt phòng của tôi
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="mobile-nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E11D48', textAlign: 'left', width: '100%' }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <Link
                  to="/login"
                  className="auth-btn-login"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="auth-btn-register"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
