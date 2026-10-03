import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ImageGalleryModal({ isOpen, onClose, images = [], title = 'Hình ảnh chỗ nghỉ', initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync initialIndex when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
    }
  }, [isOpen, initialIndex]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard navigation: Escape to close, ArrowLeft / ArrowRight to change slides
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  if (!isOpen) return null;

  const validImages = images && images.length > 0 ? images : ['/assets/images/hero.jpg'];
  const total = validImages.length;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div
      className="gallery-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Modal Container */}
      <div
        className="gallery-modal-dialog"
        onClick={(e) => e.stopPropagation()} // Prevent closing on inside clicks
      >
        {/* Header Bar */}
        <div className="gallery-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', paddingRight: '1rem' }}>
            <ImageIcon style={{ width: '20px', height: '20px', color: 'var(--color-sunshine)', flexShrink: 0 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {/* Counter */}
            <span className="gallery-modal-counter tabular-nums">
              {currentIndex + 1} / {total}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '6px', color: '#CBD5E1', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              aria-label="Đóng thư viện ảnh"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
        </div>

        {/* Main Image Viewport */}
        <div className="gallery-modal-viewport">
          <img
            src={validImages[currentIndex]}
            alt={`${title} - Ảnh ${currentIndex + 1}`}
            className="gallery-modal-hero-img"
            referrerPolicy="no-referrer"
          />

          {/* Prev/Next Navigation Controls */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="gallery-modal-nav-btn gallery-modal-nav--prev"
                aria-label="Ảnh trước"
              >
                <ChevronLeft style={{ width: '24px', height: '24px' }} />
              </button>

              <button
                type="button"
                onClick={nextImage}
                className="gallery-modal-nav-btn gallery-modal-nav--next"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight style={{ width: '24px', height: '24px' }} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {total > 1 && (
          <div className="gallery-modal-thumbnails">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`gallery-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
