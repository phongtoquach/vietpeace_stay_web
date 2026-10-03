import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF9ED] py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-12 shadow-sm space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#233B53]">
            Chính Sách Bảo Mật Thông Tin
          </h1>

          <div className="space-y-5 text-sm text-[#667085] leading-relaxed">
            <p>Tập đoàn Khách sạn & Nghỉ dưỡng VinaStay ("VinaStay Group") cam kết bảo vệ sự riêng tư và bảo mật tuyệt đối các thông tin cá nhân của khách hàng khi sử dụng nền tảng đặt phòng trực tuyến của tập đoàn theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</p>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">1. Mục đích thu thập dữ liệu</h2>
              <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc: xác nhận đơn đặt phòng, gửi mã xác nhận qua email/tin nhắn SMS, xuất hóa đơn tài chính VAT và thông báo thủ tục nhận phòng theo quy định pháp lý.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">2. Bảo mật thông tin thanh toán</h2>
              <p>Mọi giao dịch thanh toán trực tuyến qua thẻ tín dụng quốc tế hoặc cổng thanh toán nội địa đều được mã hóa theo tiêu chuẩn <strong>PCI-DSS Cấp độ 1</strong> và kết nối an toàn 256-bit SSL. Hệ thống của VinaStay không lưu trữ số CVV/CVC của khách hàng trên máy chủ.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">3. Quyền của khách hàng</h2>
              <p>Khách hàng có toàn quyền tra cứu, cập nhật thông tin cá nhân hoặc yêu cầu xóa tài khoản khỏi hệ thống bất kỳ lúc nào bằng cách gửi yêu cầu tới email: <strong>privacy@vinastaygroup.vn</strong>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
