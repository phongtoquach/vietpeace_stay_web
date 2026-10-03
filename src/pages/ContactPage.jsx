import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function ContactPage() {
  const { showToast } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    showToast('Tin nhắn của quý khách đã được gửi! CSKH sẽ phản hồi trong 30 phút.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FFF9ED] py-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#F5B82E] bg-[#FFF1C2]/60 px-3 py-1 rounded-full inline-block mb-2">
            Trung tâm trợ giúp 24/7
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#233B53] tracking-tight">
            Liên Hệ Với VinaStay Group
          </h1>
          <p className="text-sm sm:text-base text-[#667085] mt-2">
            Đội ngũ tư vấn viên luôn sẵn sàng giải đáp thắc mắc và hỗ trợ đặt phòng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Contact Information */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#233B53] pb-2 border-b border-[#E5E7EB]">
                Trụ Sở Chính TP.HCM
              </h2>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#667085]">
                <MapPin className="w-4 h-4 text-[#F5B82E] shrink-0 mt-0.5" />
                <span>Tòa nhà VinaStay Tower, 15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#667085]">
                <Phone className="w-4 h-4 text-[#F5B82E] shrink-0" />
                <span>1900 6868 · 028 3822 9999</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#667085]">
                <Mail className="w-4 h-4 text-[#F5B82E] shrink-0" />
                <span>reservation@vinastaygroup.vn</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#233B53] pb-2 border-b border-[#E5E7EB]">
                Chi Nhánh Phía Bắc
              </h2>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#667085]">
                <MapPin className="w-4 h-4 text-[#F5B82E] shrink-0 mt-0.5" />
                <span>28 Phố Lý Thường Kiệt, Quận Hoàn Kiếm, TP. Hà Nội</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#667085]">
                <Phone className="w-4 h-4 text-[#F5B82E] shrink-0" />
                <span>024 3936 8888</span>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#233B53] mb-4 pb-2 border-b border-[#E5E7EB]">
              Gửi Yêu Cầu Hỗ Trợ Trực Tuyến
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#667085] block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full bg-[#FFF9ED] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#233B53]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#667085] block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[#FFF9ED] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#233B53]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#667085] block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full bg-[#FFF9ED] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#233B53]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#667085] block mb-1">Nội dung yêu cầu</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Quý khách cần hỗ trợ đặt phòng, điều chỉnh ngày, dịch vụ xe đưa đón..."
                  className="w-full bg-[#FFF9ED] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#233B53]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F5B82E] hover:bg-[#E5A81E] text-[#233B53] font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#233B53]" />
                <span>Gửi Tin Nhắn</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
