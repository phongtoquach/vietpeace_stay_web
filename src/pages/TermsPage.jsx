import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="terms-page">
      <style>{`
        .terms-page {
          min-height: 100vh;
          background-color: var(--color-ivory, #FFF9ED);
          padding-top: 3rem;
          padding-bottom: 6rem;
        }
        .terms-container {
          max-width: 52rem;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        @media (min-width: 640px) {
          .terms-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        .terms-card {
          background-color: #FFFFFF;
          border-radius: var(--radius-2xl, 1rem);
          border: 1px solid var(--color-border, #E5E7EB);
          padding: 2rem;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
        }
        @media (min-width: 640px) {
          .terms-card {
            padding: 3rem;
          }
        }
        .terms-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border, #E5E7EB);
        }
        .terms-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-sunshine, #B45309);
          background-color: rgba(254, 243, 199, 0.7);
          padding: 4px 12px;
          border-radius: var(--radius-full, 9999px);
          margin-bottom: 0.75rem;
        }
        .terms-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-navy, #233B53);
          line-height: 1.25;
          margin: 0;
        }
        @media (min-width: 640px) {
          .terms-title {
            font-size: 2.25rem;
          }
        }
        .terms-toc {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-xl, 0.75rem);
          padding: 1.25rem 1.5rem;
          margin-bottom: 2.5rem;
        }
        .terms-toc-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-navy, #233B53);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .terms-toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .terms-toc-link {
          font-size: 0.875rem;
          color: #0284C7;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s ease;
        }
        .terms-toc-link:hover {
          color: #0369A1;
          text-decoration: underline;
        }
        .terms-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          color: var(--color-slate, #475569);
          font-size: 0.9375rem;
          line-height: 1.7;
          word-break: break-word;
        }
        .terms-section {
          scroll-margin-top: 2rem;
        }
        .terms-section-heading {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-navy, #233B53);
          margin-top: 0;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .terms-section p {
          margin: 0 0 0.75rem 0;
        }
        .terms-list {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin: 0.5rem 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .terms-list li {
          padding-left: 0.25rem;
        }
      `}</style>

      <div className="terms-container">
        <div className="terms-card">
          <div className="terms-header">
            <div className="terms-badge">
              <FileText style={{ width: '14px', height: '14px' }} />
              <span>VietPeace Stay</span>
            </div>
            <h1 className="terms-title">
              Điều khoản và quy định đặt phòng
            </h1>
          </div>

          <nav className="terms-toc" aria-label="Mục lục điều khoản">
            <div className="terms-toc-title">
              <span>Mục lục nội dung</span>
            </div>
            <ul className="terms-toc-list">
              <li>
                <a href="#section-account" className="terms-toc-link">
                  <ChevronRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  <span>1. Quy định về tài khoản và đặt phòng</span>
                </a>
              </li>
              <li>
                <a href="#section-guests" className="terms-toc-link">
                  <ChevronRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                  <span>2. Quy định về số lượng khách và phụ thu</span>
                </a>
              </li>
            </ul>
          </nav>

          <div className="terms-content">
            <section id="section-account" className="terms-section">
              <h2 className="terms-section-heading">
                1. Quy định về tài khoản và đặt phòng
              </h2>
              <p>
                Mọi giao dịch đặt phòng trên website VinaStay Group yêu cầu khách hàng đăng ký hoặc đăng nhập tài khoản chính chủ. Thông tin định danh như họ tên, số điện thoại và email phải chính xác để phục vụ thủ tục đăng ký tạm trú theo quy định pháp luật Việt Nam.
              </p>
            </section>

            <section id="section-guests" className="terms-section">
              <h2 className="terms-section-heading">
                2. Quy định về số lượng khách và phụ thu
              </h2>
              <p>
                Mỗi loại phòng có số lượng khách tiêu chuẩn đã bao gồm trong giá gốc (ví dụ: 2 người lớn + 1 trẻ em). Nếu số lượng khách thực tế vượt quá mức tiêu chuẩn nhưng không vượt quá sức chứa tối đa của phòng, hệ thống sẽ áp dụng mức phụ thu bổ sung tính theo đêm:
              </p>
              <ul className="terms-list">
                <li>Phụ thu người lớn thêm (từ 12 tuổi): từ 200.000 ₫ đến 400.000 ₫/người/đêm.</li>
                <li>Phụ thu trẻ em thêm (từ 6 đến 11 tuổi): từ 100.000 ₫ đến 200.000 ₫/trẻ/đêm.</li>
                <li>Trẻ em dưới 6 tuổi: Miễn phí ngủ chung giường với bố mẹ.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
