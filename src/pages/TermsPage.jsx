import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFF9ED] py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-12 shadow-sm space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#233B53]">
            Điều Khoản & Quy Định Đặt Phòng
          </h1>

          <div className="space-y-5 text-sm text-[#667085] leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">1. Quy định về tài khoản và đặt phòng</h2>
              <p>Mọi giao dịch đặt phòng trên website VinaStay Group yêu cầu khách hàng đăng ký hoặc đăng nhập tài khoản chính chủ. Thông tin định danh như họ tên, số điện thoại và email phải chính xác để phục vụ thủ tục đăng ký tạm trú theo quy định pháp luật Việt Nam.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">2. Quy trình giữ phòng (PENDING Booking)</h2>
              <p>Khi khách hàng nhấn nút "Đặt phòng", hệ thống sẽ tạo một đơn đặt phòng tạm giữ trạng thái PENDING có hiệu lực trong vòng <strong>15 phút</strong>. Trong thời gian này, số lượng phòng đã chọn sẽ được khóa trong kho phòng của khách sạn. Nếu quá 15 phút khách hàng chưa hoàn tất thanh toán, đơn sẽ tự động chuyển sang trạng thái <strong>HẾT HẠN (EXPIRED)</strong> và kho phòng được giải phóng cho khách hàng khác.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">3. Quy định về số lượng khách và phụ thu</h2>
              <p>Mỗi loại phòng có số lượng khách tiêu chuẩn đã bao gồm trong giá gốc (ví dụ: 2 người lớn + 1 trẻ em). Nếu số lượng khách thực tế vượt quá mức tiêu chuẩn nhưng không vượt quá sức chứa tối đa của phòng, hệ thống sẽ áp dụng mức phụ thu bổ sung tính theo đêm:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Phụ thu người lớn thêm (từ 12 tuổi): từ 200.000 ₫ đến 400.000 ₫/người/đêm.</li>
                <li>Phụ thu trẻ em thêm (từ 6 đến 11 tuổi): từ 100.000 ₫ đến 200.000 ₫/trẻ/đêm.</li>
                <li>Trẻ em dưới 6 tuổi: Miễn phí ngủ chung giường với bố mẹ.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#233B53] mb-2">4. Chính sách hủy phòng và hoàn tiền</h2>
              <p>Khách hàng được phép hủy đặt phòng miễn phí nếu thực hiện trước ít nhất <strong>48 giờ</strong> so với giờ nhận phòng tiêu chuẩn (14:00 ngày nhận phòng). Tiền phòng đã thanh toán sẽ được hoàn trả 100% về phương thức thanh toán ban đầu của quý khách.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
