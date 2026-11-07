/**
 * VietPeace Stay Hospitality Group - Hotel & Accommodation Data (JavaScript)
 * Real-world commercial structure ready for future ExpressJS + SQL Server backend.
 */

export const HERO_SLIDES = [
  {
    id: 1,
    headline: "Khám Phá Kỳ Nghỉ Đẳng Cấp Khắp Việt Nam",
    description: "Hệ thống 25+ khách sạn, resort ven biển và homestay sinh thái do Tập đoàn VietPeace Stay trực tiếp sở hữu và vận hành.",
    badge: "Ưu Đãi Trực Tiếp Từ Tập Đoàn",
    cta: "Khám Phá Chỗ Nghỉ",
    link: "/search",
    image: "/assets/images/hero.jpg",
  },
  {
    id: 2,
    headline: "Hòa Mình Cùng Sóng Biển & Vịnh Di Sản",
    description: "Trải nghiệm khu nghỉ dưỡng 5 sao biệt lập tại Vịnh Hạ Long, biển Mỹ Khê Đà Nẵng và đảo ngọc Phú Quốc.",
    badge: "Resort Ven Biển 5 Sao",
    cta: "Khám Phá Resort",
    link: "/search?propertyType=RESORT",
    image: "/assets/images/resort-halong.jpg",
  },
  {
    id: 3,
    headline: "Sang Trọng Giữa Trái Tim Đô Thị Sôi Động",
    description: "Phòng nghỉ tinh tế và tầm nhìn panorama đắt giá bên bờ sông Sài Gòn và khu phố cổ thủ đô Hà Nội.",
    badge: "Khách Sạn Thành Phố",
    cta: "Tìm Khách Sạn",
    link: "/search?propertyType=HOTEL",
    image: "/assets/images/hotel-saigon.jpg",
  },
  {
    id: 4,
    headline: "Tìm Lại Bình Yên Giữa Cánh Đồng Thốt Nốt",
    description: "Bungalow mộc mạc bên hồ sen và rặng núi Thất Sơn huyền bí tại Tri Tôn và Châu Đốc, An Giang.",
    badge: "Homestay Sinh Thái",
    cta: "Khám Phá Homestay",
    link: "/search?locationId=5",
    image: "/assets/images/homestay-mekong.jpg",
  }
];

export const AUTOCOMPLETE_OPTIONS = [
  { id: 1, type: 'destination', name: 'Hồ Chí Minh', parent: 'Việt Nam' },
  { id: 2, type: 'destination', name: 'Hà Nội', parent: 'Việt Nam' },
  { id: 3, type: 'destination', name: 'Hạ Long', parent: 'Quảng Ninh, Việt Nam' },
  { id: 4, type: 'destination', name: 'Đà Nẵng', parent: 'Việt Nam' },
  { id: 5, type: 'destination', name: 'An Giang', parent: 'Đồng Bằng Sông Cửu Long' },
  { id: 51, parentId: 5, type: 'destination', name: 'Tri Tôn', parent: 'An Giang, Việt Nam' },
  { id: 52, parentId: 5, type: 'destination', name: 'Châu Đốc', parent: 'An Giang, Việt Nam' },
  { id: 53, parentId: 5, type: 'destination', name: 'Long Xuyên', parent: 'An Giang, Việt Nam' },
  
  // Specific accommodations owned by VietPeace Stay Group
  { id: 101, locationId: 1, type: 'accommodation', name: 'VietPeace Stay Saigon Riverside Hotel', locationName: 'Quận 1, TP. Hồ Chí Minh' },
  { id: 102, locationId: 3, type: 'accommodation', name: 'VietPeace Stay Hạ Long Heritage Resort', locationName: 'Bán đảo Tuần Châu, Hạ Long' },
  { id: 103, locationId: 51, type: 'accommodation', name: 'VietPeace Stay Tri Tôn Palm Homestay', locationName: 'Tri Tôn, An Giang' },
  { id: 104, locationId: 4, type: 'accommodation', name: 'VietPeace Stay Đà Nẵng Ocean Luxury Resort', locationName: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 105, locationId: 2, type: 'accommodation', name: 'VietPeace Stay Hà Nội Boutique Hotel', locationName: 'Hoàn Kiếm, Hà Nội' },
  { id: 106, locationId: 52, type: 'accommodation', name: 'VietPeace Stay Châu Đốc Riverside Hotel', locationName: 'Châu Đốc, An Giang' }
];

export const HOTELS = ((createAmenities) => [
  {
    id: 101,
    name: 'VietPeace Stay Saigon Riverside Hotel',
    propertyType: 'HOTEL',
    starRating: 5,
    score: 9.4,
    reviewsCount: 1280,
    locationId: 1,
    locationName: 'Quận 1, TP. Hồ Chí Minh',
    location_name: 'TP. Hồ Chí Minh',
    address: '15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    description: 'Khách sạn đẳng cấp 5 sao quốc tế hướng trực diện sông Sài Gòn, liền kề phố đi bộ Nguyễn Huệ. Sở hữu hồ bơi chân mây tầng 25, spa chăm sóc sức khỏe và nhà hàng buffet ẩm thực đa quốc gia.',
    phone: '028 3822 8888',
    email: 'saigon@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Thời gian nhận phòng từ 14:00 và trả phòng trước 12:00. Khi làm thủ tục nhận phòng, quý khách vui lòng xuất trình Căn cước công dân/Hộ chiếu có ảnh hợp lệ cùng mã xác nhận đặt phòng. Khách sạn yêu cầu khoản tiền đặt cọc bảo đảm là 1.000.000 VNĐ/phòng/đêm bằng tiền mặt hoặc ủy quyền qua thẻ tín dụng.',
    children_policy: 'Trẻ em dưới 6 tuổi: Miễn phí tiền phòng khi ngủ chung giường sẵn có với người lớn (tối đa 1 trẻ/phòng). Trẻ em từ 6 đến 11 tuổi: Phụ thu 200.000 VNĐ/đêm đã bao gồm bữa sáng buffet. Trẻ từ 12 tuổi trở lên được tính như người lớn. Giường phụ cung cấp theo yêu cầu với mức phụ thu quy định.',
    pet_policy: 'Để đảm bảo không gian yên tĩnh và tiêu chuẩn vệ sinh cao cấp cho mọi khách lưu trú, khách sạn không cho phép mang theo thú cưng hoặc vật nuôi dưới mọi hình thức.',
    smoking_policy: 'Khách sạn áp dụng chính sách 100% không hút thuốc trong tất cả các phòng nghỉ, hành lang và khu vực công cộng trong nhà. Khách có nhu cầu hút thuốc vui lòng sử dụng khu vực ngoài trời được chỉ định riêng tại tầng trệt.',
    house_rules: '1. Quý khách vui lòng không mang đồ ăn có mùi nồng (sầu riêng, mít, mắm) vào trong phòng nghỉ.\n2. Vui lòng giữ yên tĩnh chung sau 22:00 để tránh ảnh hưởng đến các phòng lân cận.\n3. Quý khách tự bảo quản tài sản có giá trị trong két sắt an toàn được trang bị tại phòng.\n4. Nghiêm cấm mọi hành vi tàng trữ vũ khí, chất cháy nổ hoặc các chất cấm theo pháp luật Việt Nam.',
    image: '/assets/images/hotel-saigon.jpg',
    images: [
      '/assets/images/hotel-saigon.jpg',
      '/assets/images/room-deluxe.jpg',
      '/assets/images/room-suite.jpg',
      '/assets/images/hero.jpg',
      '/assets/images/room-family.jpg'
    ],
    price: 1500000,
    weekendPrice: 1800000,
    holidayPrice: 2200000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Bữa sáng buffet quốc tế', icon_key: 'restaurant', is_chargeable: false, description: 'Phục vụ hàng ngày từ 06:00 - 10:00 tại nhà hàng Riverside' },
      { id: 2, amenity_id: 2, code: 'pool', name: 'Hồ bơi chân mây vô cực', icon_key: 'pool', is_chargeable: false, description: 'Hồ bơi tầng 25 hướng ngắm toàn cảnh sông Sài Gòn' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe có người phục vụ', icon_key: 'parking', is_chargeable: false, description: 'Bãi đỗ xe tầng hầm an toàn 24/7' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi tốc độ cao miễn phí', icon_key: 'wifi', is_chargeable: false, description: 'Phủ sóng toàn bộ phòng nghỉ và sảnh công cộng' },
      { id: 5, amenity_id: 5, code: 'fitness', name: 'Trung tâm thể hình hiện đại', icon_key: 'fitness', is_chargeable: false, description: 'Trang thiết bị Technogym tiên tiến mở cửa 24/7' },
      { id: 6, amenity_id: 6, code: 'spa', name: 'Spa trị liệu & Xông hơi', icon_key: 'spa', is_chargeable: true, description: 'Liệu trình massage thư giãn và xông hơi thảo dược' },
      { id: 7, amenity_id: 7, code: 'shuttle', name: 'Đưa đón sân bay Tân Sơn Nhất', icon_key: 'airport_shuttle', is_chargeable: true, description: 'Dịch vụ xe Limousine sang trọng đón tiễn sân bay' },
      { id: 8, amenity_id: 8, code: 'laundry', name: 'Dịch vụ giặt ủi nhanh', icon_key: 'laundry', is_chargeable: true, description: 'Giặt hấp và ủi quần áo lấy trong ngày' }
    ]),
    overviewHighlights: [
      'Vị trí đắc địa hướng trực diện sông Sài Gòn & phố đi bộ Nguyễn Huệ',
      'Hồ bơi chân mây tầng thượng với tầm nhìn toàn cảnh skyline thành phố',
      'Khu vực chăm sóc sức khỏe & Spa trị liệu cao cấp chuẩn 5 sao',
      'Nhà hàng buffet ẩm thực Á - Âu phục vụ bữa sáng thịnh soạn'
    ],
    featuredAmenitiesList: [
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
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Bến Bạch Đằng & Waterbus',
        distance: '200 m',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
        description: 'Công viên bờ sông thoáng đãng và ga tàu buýt đường thủy ngắm toàn cảnh trung tâm Sài Gòn.',
        note: 'Đi bộ khoảng 3 phút (200m) ngay đối diện cổng chính khách sạn.'
      },
      {
        id: 2,
        name: 'Phố đi bộ Nguyễn Huệ',
        distance: '350 m',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        description: 'Quảng trường đi bộ trung tâm sầm uất với các hoạt động biểu diễn nghệ thuật đường phố và ẩm thực đa dạng.',
        note: 'Đi bộ khoảng 5 phút (350m) dọc theo đường Tôn Đức Thắng.'
      },
      {
        id: 3,
        name: 'Nhà hát Thành phố',
        distance: '600 m',
        image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
        description: 'Công trình kiến trúc Gothic Pháp cổ kính, nơi diễn ra các chương trình biểu diễn nghệ thuật hàn lâm đặc sắc.',
        note: 'Đi bộ khoảng 8 phút hoặc đi taxi 3 phút (600m).'
      },
      {
        id: 4,
        name: 'Chợ Bến Thành',
        distance: '1.1 km',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        description: 'Biểu tượng lịch sử văn hóa lâu đời với hàng trăm gian hàng đặc sản, vải vóc và quà lưu niệm truyền thống.',
        note: 'Đi bộ khoảng 15 phút hoặc đi xe ô tô khoảng 5 phút (1.1 km).'
      },
      {
        id: 5,
        name: 'Nhà thờ Đức Bà',
        distance: '1.3 km',
        image: 'https://images.unsplash.com/photo-1596423735880-5f2a689b903e?auto=format&fit=crop&w=800&q=80',
        description: 'Kiến trúc Roman pha lẫn phong cách Gothic cổ điển tuyệt đẹp giữa quảng trường Công xã Paris.',
        note: 'Đi ô tô hoặc taxi khoảng 6 phút (1.3 km).'
      },
      {
        id: 6,
        name: 'Sân bay Quốc tế Tân Sơn Nhất',
        distance: '7.5 km',
        image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
        description: 'Cảng hàng không quốc tế nhộn nhịp nhất Việt Nam kết nối mọi đường bay trong nước và toàn cầu.',
        note: 'Di chuyển bằng taxi hoặc ô tô khoảng 25 - 35 phút (7.5 km) tùy tình trạng giao thông.'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '028 3822 8888',
      email: 'saigon@vinastay.vn',
      familyFriendly: 'Thân thiện với gia đình, chào đón trẻ em mọi lứa tuổi',
      smokingPolicy: 'Khu vực hút thuốc riêng biệt (Nghiêm cấm hút thuốc trong tất cả phòng nghỉ)',
      petPolicy: 'Không cho phép mang theo thú cưng để đảm bảo tiện nghi chung'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Thời gian nhận phòng từ 14:00 và trả phòng trước 12:00. Khi nhận phòng, khách cần xuất trình giấy tờ tùy thân có ảnh hợp lệ (CCCD/Hộ chiếu) và thẻ thanh toán hoặc tiền mặt để đặt cọc bảo đảm.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Trẻ em dưới 6 tuổi được miễn phí tiền phòng khi ngủ chung giường với người lớn. Trẻ em từ 6 đến 11 tuổi phụ thu theo quy định. Giường phụ được cung cấp theo yêu cầu (tùy tình trạng phòng sẵn có).'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Khách sạn áp dụng chính sách không hút thuốc trong tất cả các phòng và khu vực công cộng trong nhà. Khách hút thuốc vui lòng sử dụng khu vực ngoài trời được chỉ định. Thú cưng không được phép mang vào khách sạn.'
      },
      {
        title: 'Hủy phòng & Thanh toán trước',
        content: 'Chính sách hủy phòng và thanh toán trước có thể khác nhau tùy vào từng loại phòng và chương trình ưu đãi. Miễn phí hủy phòng trước 48 giờ đối với hầu hết các hạng phòng tiêu chuẩn.'
      }
    ],
    rooms: [
      {
        id: 1,
        name: 'Deluxe King Hướng Sông',
        size: '38 m²',
        bed: '1 giường King 2m',
        image: '/assets/images/room-deluxe.jpg',
        images: [
          '/assets/images/room-deluxe.jpg',
          '/assets/images/room-suite.jpg',
          '/assets/images/hotel-saigon.jpg'
        ],
        availableRooms: 6,
        basePrice: 1500000,
        weekendPrice: 1800000,
        holidayPrice: 2200000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        extraAdultFee: 300000,
        extraChildFee: 150000,
        amenities: ['Hướng sông Sài Gòn', 'Bồn tắm đứng & nằm', 'Minibar miễn phí', 'Máy pha cà phê'],
        policies: ['Bao gồm bữa sáng buffet hàng ngày', 'Miễn phí hủy phòng trước 48 giờ']
      },
      {
        id: 2,
        name: 'Deluxe Twin Ban Công Hướng Phố',
        size: '40 m²',
        bed: '2 giường đơn 1m4',
        image: '/assets/images/room-suite.jpg',
        images: [
          '/assets/images/room-suite.jpg',
          '/assets/images/room-deluxe.jpg',
          '/assets/images/hero.jpg'
        ],
        availableRooms: 5,
        basePrice: 1600000,
        weekendPrice: 1900000,
        holidayPrice: 2300000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        extraAdultFee: 300000,
        extraChildFee: 150000,
        amenities: ['Ban công riêng view phố', 'Phòng tắm vòi sen đôi', 'Bàn làm việc doanh nhân'],
        policies: ['Bao gồm bữa sáng buffet', 'Miễn phí hủy phòng trước 48 giờ']
      },
      {
        id: 3,
        name: 'Executive Suite Hướng Toàn Cảnh',
        size: '65 m²',
        bed: '1 Super King + Sofa Bed',
        image: '/assets/images/room-suite.jpg',
        images: [
          '/assets/images/room-suite.jpg',
          '/assets/images/hotel-saigon.jpg',
          '/assets/images/room-family.jpg'
        ],
        availableRooms: 3,
        basePrice: 2800000,
        weekendPrice: 3200000,
        holidayPrice: 3800000,
        includedAdults: 2,
        includedChildren: 2,
        maxAdults: 4,
        maxChildren: 2,
        maxOccupancy: 5,
        extraAdultFee: 400000,
        extraChildFee: 200000,
        amenities: ['Phòng khách riêng biệt', 'Đặc quyền Executive Lounge', 'Trà chiều & Cocktail tối'],
        policies: ['Bao gồm bữa sáng cao cấp', 'Check-out trễ tới 14:00 (tùy tình trạng phòng)']
      },
      {
        id: 4,
        name: 'Family Two-Bedroom Suite Gia Đình',
        size: '85 m²',
        bed: '1 King + 2 Giường đơn',
        image: '/assets/images/room-family.jpg',
        images: [
          '/assets/images/room-family.jpg',
          '/assets/images/room-deluxe.jpg',
          '/assets/images/hotel-saigon.jpg'
        ],
        availableRooms: 2,
        basePrice: 3900000,
        weekendPrice: 4500000,
        holidayPrice: 5200000,
        includedAdults: 4,
        includedChildren: 2,
        maxAdults: 6,
        maxChildren: 3,
        maxOccupancy: 7,
        extraAdultFee: 350000,
        extraChildFee: 180000,
        amenities: ['2 phòng ngủ riêng biệt', '2 phòng tắm lớn', 'Bàn ăn gia đình & bếp nhỏ'],
        policies: ['Bao gồm bữa sáng cho cả gia đình', 'Miễn phí hủy phòng trước 48 giờ']
      }
    ]
  },
  {
    id: 102,
    name: 'VietPeace Stay Hạ Long Heritage Resort',
    propertyType: 'RESORT',
    starRating: 5,
    score: 9.6,
    reviewsCount: 856,
    locationId: 3,
    locationName: 'Hạ Long, Quảng Ninh',
    location_name: 'Quảng Ninh',
    address: 'Bán Đảo Tuần Châu, TP. Hạ Long, Tỉnh Quảng Ninh',
    description: 'Khu nghỉ dưỡng sang trọng giữa lòng di sản thiên nhiên thế giới Vịnh Hạ Long. Các căn biệt thự mặt biển biệt lập, bãi cát trắng mịn riêng tư cùng dịch vụ du thuyền ngắm hoàng hôn.',
    phone: '0203 3844 688',
    email: 'halong@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Thủ tục nhận phòng bắt đầu từ 14:00 tại sảnh Lễ tân Tuần Châu Marina. Quý khách vui lòng xuất trình giấy tờ tùy thân (CCCD/Hộ chiếu) và thẻ thanh toán. Khu nghỉ dưỡng có dịch vụ hỗ trợ gửi hành lý và xe điện đưa đón về villa riêng.',
    children_policy: 'Miễn phí tối đa 2 trẻ em dưới 6 tuổi lưu trú cùng bố mẹ sử dụng giường hiện có trong villa. Trẻ em từ 6 - 11 tuổi phụ thu bữa sáng 250.000 VNĐ/trẻ/ngày. Nôi em bé được phục vụ miễn phí (vui lòng đặt trước khi đến do số lượng có hạn).',
    pet_policy: 'Khu nghỉ dưỡng không tiếp nhận thú cưng nhằm đảm bảo vệ sinh bãi biển riêng và cảnh quan sinh thái chung của khu bảo tồn vịnh.',
    smoking_policy: 'Tuyệt đối không hút thuốc bên trong các căn villa và khu vực chăm sóc sức khỏe Onsen. Quý khách có thể hút thuốc tại khu vực hiên ngoài trời hoặc ban công mở rộng.',
    house_rules: '1. Không tổ chức tiệc tùng gây ồn ào hoặc sử dụng loa kéo công suất lớn tại khu biệt thự sau 22:00.\n2. Trẻ em khi tắm tại hồ bơi riêng hoặc bãi biển bắt buộc phải có người lớn đi kèm và giám sát.\n3. Tuân thủ các hướng dẫn an toàn cứu hộ khi tham gia các hoạt động thể thao biển và du thuyền.\n4. Vui lòng bảo vệ cảnh quan tự nhiên, không vứt rác xuống biển hoặc bờ cát.',
    image: '/assets/images/resort-halong.jpg',
    images: [
      '/assets/images/resort-halong.jpg',
      '/assets/images/hero.jpg',
      '/assets/images/room-suite.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 2600000,
    weekendPrice: 3000000,
    holidayPrice: 3600000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Bữa sáng buffet vịnh biển', icon_key: 'restaurant', is_chargeable: false, description: 'Hơn 70 món Á - Âu phục vụ tại nhà hàng hướng biển' },
      { id: 2, amenity_id: 2, code: 'pool', name: 'Hồ bơi nước mặn tràn bờ', icon_key: 'pool', is_chargeable: false, description: 'Tầm nhìn trực diện vịnh di sản Hạ Long' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe khuôn viên resort', icon_key: 'parking', is_chargeable: false, description: 'Bãi xe riêng an ninh miễn phí cho khách lưu trú' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi phủ sóng toàn khu nghỉ', icon_key: 'wifi', is_chargeable: false, description: 'Kết nối internet tốc độ cao tại biệt thự và bãi biển' },
      { id: 5, amenity_id: 5, code: 'spa', name: 'Onsen & Thư giãn khoáng nóng', icon_key: 'spa', is_chargeable: true, description: 'Khu xông hơi đá muối Himalaya và bể ngâm khoáng Onsen' },
      { id: 6, amenity_id: 6, code: 'shuttle', name: 'Du thuyền ngắm hoàng hôn vịnh', icon_key: 'airport_shuttle', is_chargeable: false, description: 'Chuyến hải trình miễn phí ngắm hoàng hôn vịnh Hạ Long' },
      { id: 7, amenity_id: 7, code: 'play_area', name: 'Khu vui chơi trẻ em Kid\'s Club', icon_key: 'children', is_chargeable: false, description: 'Khu giải trí trong nhà và ngoài trời có người giám sát' },
      { id: 8, amenity_id: 8, code: 'laundry', name: 'Dịch vụ giặt là cao cấp', icon_key: 'laundry', is_chargeable: true, description: 'Giặt sấy và là hơi tiêu chuẩn resort' }
    ]),
    overviewHighlights: [
      'Quần thể biệt thự nghỉ dưỡng biệt lập hướng thẳng ra Vịnh Hạ Long',
      'Bãi tắm riêng bờ cát trắng mịn và bến du thuyền sang trọng',
      'Tổ hợp chăm sóc sức khỏe & Onsen khoáng nóng thư giãn',
      'Trải nghiệm du thuyền ngắm hoàng hôn vịnh di sản miễn phí'
    ],
    featuredAmenitiesList: [
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
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Bãi tắm biển Tuần Châu',
        distance: '250 m',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        description: 'Bãi biển cát trắng tự nhiên với làn nước trong xanh và hàng dừa mát rượi ven đảo ngọc Tuần Châu.',
        note: 'Đi bộ khoảng 4 phút (250m) từ khuôn viên resort.'
      },
      {
        id: 2,
        name: 'Cảng tàu khách quốc tế Tuần Châu',
        distance: '800 m',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        description: 'Cảng du thuyền nhân tạo lớn nhất Việt Nam, điểm khởi hành của các hải trình khám phá Vịnh Hạ Long kỳ vĩ.',
        note: 'Đi bộ khoảng 10 phút hoặc xe điện nội khu 3 phút (800m).'
      },
      {
        id: 3,
        name: 'Công viên Sun World Hạ Long',
        distance: '8.5 km',
        image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
        description: 'Quần thể vui chơi giải trí hàng đầu với cáp treo Nữ Hoàng vượt biển và công viên chủ đề rồng mạo hiểm.',
        note: 'Đi ô tô khoảng 12 phút (8.5 km) qua đường ven biển Bãi Cháy.'
      },
      {
        id: 4,
        name: 'Bảo tàng Quảng Ninh',
        distance: '14 km',
        image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
        description: 'Công trình kiến trúc than đá đen huyền bí độc đáo lưu giữ di sản thiên nhiên và văn hóa miền mỏ.',
        note: 'Đi taxi hoặc ô tô khoảng 20 phút (14 km).'
      },
      {
        id: 5,
        name: 'Sân bay Quốc tế Vân Đồn',
        distance: '48 km',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
        description: 'Cảng hàng không tư nhân đầu tiên của Việt Nam với thiết kế hiện đại đạt chuẩn quốc tế 5 sao.',
        note: 'Di chuyển bằng xe hơi cao tốc khoảng 45 phút (48 km).'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '0203 3844 688',
      email: 'halong@vinastay.vn',
      familyFriendly: 'Rất thích hợp cho gia đình có trẻ nhỏ và người cao tuổi',
      smokingPolicy: 'Khu vực hút thuốc riêng biệt (Không hút thuốc trong villa)',
      petPolicy: 'Không cho phép mang theo thú cưng'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Check-in từ 14:00 và Check-out trước 12:00. Yêu cầu đặt cọc bằng thẻ tín dụng hoặc tiền mặt khi làm thủ tục nhận phòng để bảo đảm các dịch vụ phát sinh.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Tối đa 2 trẻ em dưới 6 tuổi được miễn phí tiền phòng khi sử dụng giường có sẵn trong villa. Dịch vụ nôi em bé miễn phí (cần đặt trước).'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Khu nghỉ dưỡng quy định không hút thuốc trong phòng và khu vực sinh hoạt chung. Không tiếp nhận vật nuôi.'
      },
      {
        title: 'Hủy phòng & Đặt cọc',
        content: 'Chính sách hủy phòng miễn phí áp dụng trước 72 giờ so với ngày nhận phòng. Đặt phòng mùa cao điểm có thể áp dụng chính sách thanh toán sớm.'
      }
    ],
    rooms: [
      {
        id: 201,
        name: 'Ocean View Deluxe Villa',
        size: '50 m²',
        bed: '1 giường King 2m',
        image: '/assets/images/room-deluxe.jpg',
        images: ['/assets/images/room-deluxe.jpg', '/assets/images/resort-halong.jpg'],
        availableRooms: 8,
        basePrice: 2600000,
        weekendPrice: 3000000,
        holidayPrice: 3600000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        extraAdultFee: 350000,
        extraChildFee: 180000,
        amenities: ['Hiên phơi nắng riêng', 'Bồn tắm nhìn ra vịnh', 'Bữa sáng tại phòng'],
        policies: ['Bao gồm vé du thuyền ngắm vịnh', 'Miễn phí hủy trước 72 giờ']
      },
      {
        id: 202,
        name: 'Beachfront Private Pool Villa',
        size: '95 m²',
        bed: '1 King + 1 Daybed',
        image: '/assets/images/resort-danang.jpg',
        images: ['/assets/images/resort-danang.jpg', '/assets/images/resort-halong.jpg', '/assets/images/room-suite.jpg'],
        availableRooms: 3,
        basePrice: 4800000,
        weekendPrice: 5500000,
        holidayPrice: 6500000,
        includedAdults: 2,
        includedChildren: 2,
        maxAdults: 4,
        maxChildren: 2,
        maxOccupancy: 5,
        extraAdultFee: 450000,
        extraChildFee: 220000,
        amenities: ['Hồ bơi riêng biệt', 'Lối ra bãi biển trực tiếp', 'Quản gia riêng phục vụ'],
        policies: ['Bao gồm bữa sáng & Trà chiều', 'Đưa đón sân bay Vân Đồn miễn phí']
      }
    ]
  },
  {
    id: 103,
    name: 'VietPeace Stay Tri Tôn Palm Homestay',
    propertyType: 'HOMESTAY',
    starRating: 4,
    score: 9.2,
    reviewsCount: 420,
    locationId: 51,
    locationName: 'Tri Tôn, An Giang',
    location_name: 'An Giang',
    address: 'Ấp Tô Hạ, Xã Núi Tô, Huyện Tri Tôn, Tỉnh An Giang',
    description: 'Mô hình homestay sinh thái giữa cánh đồng cây thốt nốt và dãy Phụng Hoàng Sơn kỳ vĩ. Bungalow gỗ mộc mạc bên hồ sen, trải nghiệm hái rau sạch và thưởng thức thốt nốt ngọt thanh bản địa.',
    phone: '0296 3877 123',
    email: 'triton@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Nhận phòng từ 14:00 tại nhà cộng đồng trung tâm homestay. Homestay hỗ trợ đón khách tại bến xe Tri Tôn bằng xe máy hoặc ô tô nội bộ (vui lòng liên hệ trước 2 tiếng). Quý khách xuất trình CCCD hoặc hộ chiếu khi làm thủ tục.',
    children_policy: 'Chào đón trẻ em mọi độ tuổi. Trẻ dưới 6 tuổi được miễn phí hoàn toàn tiền phòng và ăn sáng nhẹ. Trẻ từ 6 - 11 tuổi phụ thu 100.000 VNĐ/đêm bao gồm bữa sáng bánh xèo và nước thốt nốt.',
    pet_policy: 'Homestay rất thân thiện và cho phép mang theo thú cưng nhỏ đã được tiêm phòng đầy đủ. Quý khách vui lòng thông báo trước với chủ nhà và giữ gìn vệ sinh chung trong khuôn viên sân vườn.',
    smoking_policy: 'Do bungalow và nhà sàn được dựng từ gỗ và tre nứa tự nhiên, nghiêm cấm hút thuốc bên trong phòng. Quý khách có thể hút thuốc tại khu vực sân nướng BBQ ngoài trời hoặc bên hiên ven hồ.',
    house_rules: '1. Tôn trọng nếp sống và phong tục tập quán thanh bình của đồng bào Khmer bản địa.\n2. Vui lòng tắt các thiết bị điện và máy điều hòa khi rời khỏi bungalow để tiết kiệm năng lượng xanh.\n3. Homestay khuyến khích không sử dụng đồ nhựa dùng một lần; có bình lọc nước sạch tại nhà cộng đồng.\n4. Giữ không gian thanh tịnh sau 22:00 để lắng nghe tiếng gió đồng và côn trùng đêm.',
    image: '/assets/images/homestay-triton.jpg',
    images: [
      '/assets/images/homestay-triton.jpg',
      '/assets/images/homestay-mekong.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 850000,
    weekendPrice: 1050000,
    holidayPrice: 1350000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Bữa sáng đặc sản miền Tây', icon_key: 'restaurant', is_chargeable: false, description: 'Bánh xèo rau rừng và thốt nốt ngọt thanh tự nhiên' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe sân vườn rộng rãi', icon_key: 'parking', is_chargeable: false, description: 'Chỗ đỗ xe ô tô và xe máy miễn phí an toàn' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi cáp quang miễn phí', icon_key: 'wifi', is_chargeable: false, description: 'Phủ sóng toàn bộ bungalow gỗ và khu sinh hoạt chung' },
      { id: 9, amenity_id: 9, code: 'bike', name: 'Xe đạp dạo đồng miễn phí', icon_key: 'motorbike', is_chargeable: false, description: 'Mượn xe đạp ngắm hoàng hôn cánh đồng thốt nốt' },
      { id: 10, amenity_id: 10, code: 'bbq', name: 'Bếp than nướng BBQ sân vườn', icon_key: 'kitchen', is_chargeable: true, description: 'Bếp nướng ngoài trời kèm than và dụng cụ tiệc nướng' },
      { id: 11, amenity_id: 11, code: 'fishing', name: 'Chòi câu cá thư giãn hồ sen', icon_key: 'dining', is_chargeable: false, description: 'Cần câu và mồi câu phục vụ khách thư giãn quanh hồ sen' }
    ]),
    overviewHighlights: [
      'Bungalow gỗ sinh thái mộc mạc bên rặng thốt nốt và cánh đồng lúa thơ mộng',
      'Hồ sen tự nhiên với chòi câu cá và võng thư giãn ngoài trời',
      'Thưởng thức các món ngon dân dã miệt vườn và nước thốt nốt tươi ngọt mát',
      'Mượn xe đạp miễn phí khám phá bản làng Khmer thanh bình'
    ],
    featuredAmenitiesList: [
      'Free Wi-Fi',
      'Restaurant',
      'Free parking',
      '24-hour front desk',
      'Room service',
      'Air conditioning',
      'Children\'s play area',
      'Laundry service'
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Cây thốt nốt trái tim Tri Tôn',
        distance: '600 m',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        description: 'Điểm check-in nổi tiếng với cụm cây thốt nốt tự nhiên uốn lượn hình trái tim lãng mạn giữa đồng lúa.',
        note: 'Đi bộ hoặc xe đạp khoảng 8 phút (600m).'
      },
      {
        id: 2,
        name: 'Hồ Soài So & Suối Vàng',
        distance: '2.2 km',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        description: 'Hồ nước ngọt tự nhiên dưới chân núi Phụng Hoàng Sơn với làn nước trong veo và không khí trong lành nguyên sơ.',
        note: 'Đi xe máy hoặc ô tô khoảng 6 phút (2.2 km).'
      },
      {
        id: 3,
        name: 'Khu di tích Đồi Tức Dụp',
        distance: '5 km',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        description: 'Ngọn đồi đá hoa cương huyền thoại với hệ thống hang động ngoạn mục ghi dấu lịch sử anh hùng vùng Thất Sơn.',
        note: 'Đi ô tô hoặc xe máy khoảng 10 phút (5 km).'
      },
      {
        id: 4,
        name: 'Chùa Xà Tón (Chùa Khmer)',
        distance: '3.5 km',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        description: 'Ngôi chùa cổ nhất của cộng đồng người Khmer tại Tri Tôn với lối kiến trúc Angkor mạ vàng lộng lẫy.',
        note: 'Đi xe máy hoặc taxi khoảng 7 phút (3.5 km).'
      },
      {
        id: 5,
        name: 'Chợ huyện Tri Tôn',
        distance: '4 km',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        description: 'Khu chợ sầm uất với nhiều món ngon đặc sản: cháo bò, bánh bò thốt nốt nướng và trái cây nhiệt đới tươi mới.',
        note: 'Đi xe máy hoặc ô tô khoảng 8 phút (4 km).'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '0296 3877 123',
      email: 'triton@vinastay.vn',
      familyFriendly: 'Không gian mở chan hòa thiên nhiên, lý tưởng cho gia đình',
      smokingPolicy: 'Khu vực hút thuốc sân vườn ngoài trời (Cấm hút thuốc trong bungalow gỗ)',
      petPolicy: 'Cho phép mang theo thú cưng nhỏ (vui lòng thông báo trước khi nhận phòng)'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Giờ nhận phòng từ 14:00 và trả phòng trước 12:00. Homestay có hỗ trợ nhận phòng sớm nếu phòng trống.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Trẻ em dưới 6 tuổi hoàn toàn miễn phí. Trẻ từ 6 - 11 tuổi phụ thu ăn sáng đặc sản miền Tây nhẹ nhàng.'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Vì bungalow làm từ vật liệu gỗ tự nhiên, vui lòng không hút thuốc bên trong phòng. Thú cưng thân thiện được chào đón trong khuôn viên sân vườn.'
      },
      {
        title: 'Hủy phòng & Đổi lịch',
        content: 'Miễn phí hủy phòng hoặc thay đổi lịch trình trước 24 giờ so với ngày nhận phòng.'
      }
    ],
    rooms: [
      {
        id: 301,
        name: 'Bungalow Gỗ Bên Hồ Sen',
        size: '32 m²',
        bed: '1 Giường đôi Queen 1m6',
        image: '/assets/images/homestay-mekong.jpg',
        images: ['/assets/images/homestay-mekong.jpg', '/assets/images/room-deluxe.jpg'],
        availableRooms: 5,
        basePrice: 850000,
        weekendPrice: 1050000,
        holidayPrice: 1350000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 1,
        maxOccupancy: 3,
        extraAdultFee: 200000,
        extraChildFee: 100000,
        amenities: ['Hiên câu cá riêng', 'Võng nằm hóng mát', 'Không gian cây xanh mát rượi'],
        policies: ['Bao gồm bữa sáng đặc sản miền Tây', 'Miễn phí mượn xe đạp dạo đồng']
      },
      {
        id: 302,
        name: 'Nhà Sàn Sinh Thái Gia Đình',
        size: '55 m²',
        bed: '2 Giường đôi 1m6',
        image: '/assets/images/homestay-triton.jpg',
        images: ['/assets/images/homestay-triton.jpg', '/assets/images/room-family.jpg'],
        availableRooms: 3,
        basePrice: 1400000,
        weekendPrice: 1700000,
        holidayPrice: 2100000,
        includedAdults: 4,
        includedChildren: 2,
        maxAdults: 5,
        maxChildren: 2,
        maxOccupancy: 6,
        extraAdultFee: 200000,
        extraChildFee: 100000,
        amenities: ['Kiến trúc gỗ Khmer truyền thống', 'Bếp nấu ăn dân dã', 'Sân nướng BBQ ngoài trời'],
        policies: ['Bao gồm bữa sáng bánh xèo & thốt nốt', 'Miễn phí hủy trước 24 giờ']
      }
    ]
  },
  {
    id: 104,
    name: 'VietPeace Stay Đà Nẵng Ocean Luxury Resort',
    propertyType: 'RESORT',
    starRating: 5,
    score: 9.5,
    reviewsCount: 1940,
    locationId: 4,
    locationName: 'Ngũ Hành Sơn, Đà Nẵng',
    location_name: 'Đà Nẵng',
    address: 'Đường Võ Nguyên Giáp, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    description: 'Tọa lạc ngay mặt tiền bãi biển Mỹ Khê tuyệt đẹp. Khu phức hợp nghỉ dưỡng với 3 hồ bơi lớn, khu vui chơi trẻ em Kid\'s Club, sân tennis và nhà hàng hải sản tươi sống bên bờ sóng.',
    phone: '0236 3959 999',
    email: 'danang@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Quầy lễ tân phục vụ 24/7 đón tiếp khách. Nhận phòng từ 14:00 và trả phòng trước 12:00. Quý khách xuất trình CCCD/Hộ chiếu hợp lệ cùng mã đặt phòng. Yêu cầu đặt cọc bảo đảm là 1.500.000 VNĐ/phòng.',
    children_policy: 'Miễn phí cho 2 trẻ em dưới 6 tuổi ngủ chung giường với phụ huynh. Trẻ em từ 6 đến 11 tuổi phụ thu ăn sáng buffet 220.000 VNĐ/trẻ. Trẻ từ 12 tuổi tính phí như người lớn. Có nôi em bé và câu lạc bộ trẻ em Kid\'s Club miễn phí.',
    pet_policy: 'Resort không nhận thú cưng để đảm bảo trải nghiệm an toàn, thư thái cho mọi gia đình và khách lưu trú trên bãi biển Mỹ Khê.',
    smoking_policy: 'Nghiêm cấm hút thuốc trong tất cả các phòng nghỉ và khu vực sảnh đóng. Quý khách có thể hút thuốc tại khu vực ngoài trời có biển chỉ dẫn riêng gần quầy bar bãi biển.',
    house_rules: '1. Vui lòng mặc trang phục bơi phù hợp khi sử dụng các hồ bơi của resort.\n2. Giữ trật tự chung sau 22:30 tại các hành lang và khu vực ban công phòng nghỉ.\n3. Không mang đồ uống có cồn bên ngoài vào khu vực nhà hàng và hồ bơi chính.\n4. Luôn để mắt đến trẻ nhỏ khi vui chơi tại khu vực bờ sóng biển và hồ bơi sâu.',
    image: '/assets/images/resort-danang.jpg',
    images: [
      '/assets/images/resort-danang.jpg',
      '/assets/images/hero.jpg',
      '/assets/images/room-suite.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 3200000,
    weekendPrice: 3700000,
    holidayPrice: 4400000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Buffet sáng quốc tế hơn 80 món', icon_key: 'restaurant', is_chargeable: false, description: 'Ẩm thực phong phú hải sản tươi ngon và món ăn Á - Âu' },
      { id: 2, amenity_id: 2, code: 'pool', name: 'Cụm 3 hồ bơi biển ngoài trời', icon_key: 'pool', is_chargeable: false, description: 'Gồm hồ bơi vô cực, hồ bơi gia đình và hồ tạo sóng nhỏ' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe thông minh có bảo vệ', icon_key: 'parking', is_chargeable: false, description: 'Chỗ đỗ xe rộng rãi thuận tiện cho xe gia đình và du lịch' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi băng thông cao không giới hạn', icon_key: 'wifi', is_chargeable: false, description: 'Tốc độ internet cực nhanh toàn bộ khuôn viên' },
      { id: 5, amenity_id: 5, code: 'fitness', name: 'Phòng gym hướng đại dương', icon_key: 'fitness', is_chargeable: false, description: 'Tập luyện với tầm nhìn bao quát toàn bộ bờ biển Mỹ Khê' },
      { id: 6, amenity_id: 6, code: 'spa', name: 'Maya Luxury Spa & Massage', icon_key: 'spa', is_chargeable: true, description: 'Trị liệu tinh dầu thiên nhiên và thư giãn toàn thân' },
      { id: 7, amenity_id: 7, code: 'shuttle', name: 'Xe đưa đón sân bay Đà Nẵng 2 chiều', icon_key: 'airport_shuttle', is_chargeable: false, description: 'Đón tiễn sân bay miễn phí cho khách đặt phòng resort' },
      { id: 12, amenity_id: 12, code: 'car_rental', name: 'Thuê xe ô tô tự lái & có tài', icon_key: 'car_rental', is_chargeable: true, description: 'Hỗ trợ đặt xe tham quan Hội An, Bà Nà Hills theo ngày' }
    ]),
    overviewHighlights: [
      'Tọa lạc ngay mặt tiền bãi biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh',
      'Hệ thống 3 hồ bơi ngoài trời bao gồm hồ bơi tràn bờ hướng đại dương',
      'Khu vui chơi trẻ em Kid\'s Club đa dạng hoạt động sáng tạo',
      'Nhà hàng hải sản tươi sống và quầy bar bãi biển sôi động'
    ],
    featuredAmenitiesList: [
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
      'Car rental',
      'Laundry service'
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Bãi biển Mỹ Khê',
        distance: '100 m',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        description: 'Top bãi biển quyến rũ nhất hành tinh với bãi cát thoai thoải, làn nước ấm áp quanh năm và hàng dừa biển thơ mộng.',
        note: 'Đi bộ chỉ 2 phút (100m) ngay trước sảnh resort.'
      },
      {
        id: 2,
        name: 'Danh thắng Ngũ Hành Sơn',
        distance: '2.5 km',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        description: 'Cụm 5 ngọn núi đá vôi kỳ vĩ gắn liền truyền thuyết ngũ hành, sở hữu chùa Linh Ứng và các hang động tâm linh kỳ bí.',
        note: 'Đi taxi hoặc ô tô khoảng 5 phút (2.5 km).'
      },
      {
        id: 3,
        name: 'Cầu Rồng & Cầu Tình Yêu',
        distance: '4.2 km',
        image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
        description: 'Cây cầu biểu tượng phun lửa và phun nước vào cuối tuần bên bờ sông Hàn lãng mạn cùng bến khóa tình yêu.',
        note: 'Đi ô tô khoảng 8 phút (4.2 km).'
      },
      {
        id: 4,
        name: 'Chợ Hàn Đà Nẵng',
        distance: '5 km',
        image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
        description: 'Trung tâm mua sắm đặc sản miền Trung sầm uất bậc nhất với mực một nắng, chả bò và các món bánh dân dã.',
        note: 'Đi taxi khoảng 10 phút (5 km).'
      },
      {
        id: 5,
        name: 'Sân bay Quốc tế Đà Nẵng',
        distance: '6.8 km',
        image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=800&q=80',
        description: 'Cảng hàng không quốc tế hiện đại nằm ngay trong lòng thành phố, thuận tiện đưa đón khách nhanh chóng.',
        note: 'Đi ô tô hoặc taxi resort đưa đón khoảng 15 phút (6.8 km).'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '0236 3959 999',
      email: 'danang@vinastay.vn',
      familyFriendly: 'Tuyệt vời cho gia đình, có câu lạc bộ trẻ em và hồ bơi nông',
      smokingPolicy: 'Khu vực hút thuốc ngoài trời riêng biệt (Cấm hút thuốc trong phòng)',
      petPolicy: 'Không cho phép mang theo thú cưng'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Nhận phòng từ 14:00 và trả phòng trước 12:00. Quầy lễ tân phục vụ 24/7. Yêu cầu đặt cọc bằng thẻ hoặc tiền mặt khi làm thủ tục.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Miễn phí cho tối đa 2 trẻ em dưới 6 tuổi ngủ cùng bố mẹ. Trẻ em từ 6 đến 11 tuổi phụ thu bữa sáng buffet.'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Chính sách phòng không hút thuốc 100%. Không cho phép mang theo thú cưng nhằm giữ gìn vệ sinh bãi biển và khu nghỉ.'
      },
      {
        title: 'Hủy phòng & Thanh toán',
        content: 'Hủy miễn phí trước 48 giờ so với ngày nhận phòng. Đưa đón sân bay Đà Nẵng hai chiều miễn phí theo lịch đặt.'
      }
    ],
    rooms: [
      {
        id: 401,
        name: 'Premier Ocean View Room',
        size: '45 m²',
        bed: '1 King 2m hoặc 2 Giường đơn',
        image: '/assets/images/room-deluxe.jpg',
        images: ['/assets/images/room-deluxe.jpg', '/assets/images/resort-danang.jpg'],
        availableRooms: 6,
        basePrice: 3200000,
        weekendPrice: 3700000,
        holidayPrice: 4400000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        extraAdultFee: 350000,
        extraChildFee: 180000,
        amenities: ['Tầm nhìn 180 độ biển Mỹ Khê', 'Bồn tắm đá cẩm thạch', 'Ban công rộng rãi'],
        policies: ['Bao gồm buffet sáng hơn 80 món', 'Miễn phí dịch vụ đưa đón sân bay Đà Nẵng']
      }
    ]
  },
  {
    id: 105,
    name: 'VietPeace Stay Hà Nội Boutique Hotel',
    propertyType: 'HOTEL',
    starRating: 4,
    score: 9.1,
    reviewsCount: 675,
    locationId: 2,
    locationName: 'Hoàn Kiếm, Hà Nội',
    location_name: 'Hà Nội',
    address: '28 Phố Lý Thường Kiệt, Quận Hoàn Kiếm, TP. Hà Nội',
    description: 'Khách sạn phong cách Indochine hoài niệm ngay trung tâm phố cổ thủ đô. Chỉ vài bước chân tới Hồ Hoàn Kiếm, Nhà Hát Lớn và các địa điểm văn hóa ẩm thực truyền thống danh tiếng.',
    phone: '024 3933 6688',
    email: 'hanoi@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Giờ nhận phòng từ 14:00 và trả phòng trước 12:00. Quý khách vui lòng xuất trình căn cước công dân hoặc hộ chiếu khi làm thủ tục tại sảnh lễ tân Indochine. Hỗ trợ nhận phòng sớm nếu phòng sẵn có.',
    children_policy: 'Trẻ em dưới 6 tuổi được ở miễn phí khi sử dụng giường có sẵn của bố mẹ (tối đa 1 trẻ/phòng). Trẻ từ 6 đến 11 tuổi phụ thu 150.000 VNĐ/đêm kèm bữa sáng. Giường phụ kê thêm theo yêu cầu phụ thu 350.000 VNĐ/đêm.',
    pet_policy: 'Khách sạn không cho phép mang theo thú cưng nhằm duy trì không gian nghỉ dưỡng thanh lịch và yên tĩnh giữa lòng phố cổ.',
    smoking_policy: 'Khách sạn áp dụng tiêu chuẩn không hút thuốc trong nhà 100%. Quý khách có thể hút thuốc tại ban công ngoài trời tại tầng thượng hoặc khu vực trước sảnh khách sạn.',
    house_rules: '1. Không gây ồn ào hoặc mở nhạc lớn sau 22:00 để giữ gìn sự yên tĩnh cho khu phố cổ.\n2. Vui lòng để giày dép đúng nơi quy định và giữ gìn các món đồ nội thất gỗ cổ điển của khách sạn.\n3. Không mang các chất dễ cháy nổ, đồ ăn có mùi khó chịu vào phòng nghỉ.\n4. Quý khách vui lòng gửi lại chìa khóa phòng tại quầy lễ tân khi ra ngoài tham quan phố cổ.',
    image: '/assets/images/hotel-hanoi.jpg',
    images: [
      '/assets/images/hotel-hanoi.jpg',
      '/assets/images/room-deluxe.jpg',
      '/assets/images/room-suite.jpg'
    ],
    price: 1450000,
    weekendPrice: 1750000,
    holidayPrice: 2150000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Bữa sáng phở bò gia truyền & Trà sen', icon_key: 'restaurant', is_chargeable: false, description: 'Phở bò Hà Nội trứ danh và trà ướp sen Tây Hồ thượng hạng' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe trung tâm có người trông', icon_key: 'parking', is_chargeable: false, description: 'Khu vực đỗ xe an toàn ngay trung tâm quận Hoàn Kiếm' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi cáp quang phủ sóng toàn bộ', icon_key: 'wifi', is_chargeable: false, description: 'Truy cập mạng internet tốc độ cao miễn phí' },
      { id: 7, amenity_id: 7, code: 'shuttle', name: 'Đưa đón sân bay Nội Bài', icon_key: 'airport_shuttle', is_chargeable: true, description: 'Xe riêng 4-7 chỗ đón tiễn sân bay Nội Bài tiện lợi' },
      { id: 8, amenity_id: 8, code: 'laundry', name: 'Dịch vụ giặt ủi lấy nhanh', icon_key: 'laundry', is_chargeable: true, description: 'Giặt sạch và ủi phẳng trang phục cho khách du lịch' },
      { id: 13, amenity_id: 13, code: 'coffee', name: 'Quầy cafe Tràng An Indochine', icon_key: 'coffee', is_chargeable: true, description: 'Cafe trứng đặc sản Hà Nội và các loại trà thanh lọc' }
    ]),
    overviewHighlights: [
      'Kiến trúc Indochine tinh tế, giao thoa giữa nét cổ điển Pháp và văn hóa Tràng An',
      'Vị trí vàng tại Hoàn Kiếm, đi bộ 5 phút tới Hồ Gươm và Nhà Hát Lớn',
      'Thưởng thức bữa sáng phở bò gia truyền và trà sen Tây Hồ trứ danh',
      'Không gian ấm cúng, nội thất gỗ lim cao cấp và dịch vụ chu đáo'
    ],
    featuredAmenitiesList: [
      'Free Wi-Fi',
      'Restaurant',
      'Free parking',
      '24-hour front desk',
      'Room service',
      'Air conditioning',
      'Airport shuttle',
      'Laundry service'
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Nhà Hát Lớn Hà Nội',
        distance: '400 m',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        description: 'Tuyệt tác kiến trúc thời Pháp thuộc lấy cảm hứng từ Nhà hát Opéra Garnier Paris hoa lệ.',
        note: 'Đi bộ thong dong khoảng 5 phút (400m).'
      },
      {
        id: 2,
        name: 'Hồ Hoàn Kiếm (Hồ Gươm)',
        distance: '650 m',
        image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
        description: 'Trái tim ngàn năm văn hiến của thủ đô với Tháp Rùa cổ kính, cầu Thê Húc đỏ son và đền Ngọc Sơn trầm mặc.',
        note: 'Đi bộ khoảng 7 phút hoặc đạp xe 3 phút (650m).'
      },
      {
        id: 3,
        name: 'Phố Cổ Hà Nội (36 Phố Phường)',
        distance: '900 m',
        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
        description: 'Khu phố cổ lưu giữ nét sinh hoạt truyền thống, hàng trăm quán ăn phố cổ và chợ đêm tấp nập.',
        note: 'Đi bộ khoảng 10 phút (900m) qua Hàng Bài và Đinh Tiên Hoàng.'
      },
      {
        id: 4,
        name: 'Văn Miếu - Quốc Tử Giám',
        distance: '2.8 km',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
        description: 'Trường đại học đầu tiên của Việt Nam với vườn bia tiến sĩ rùa đá và kiến trúc Khuê Văn Các cổ kính.',
        note: 'Đi taxi hoặc ô tô khoảng 8 phút (2.8 km).'
      },
      {
        id: 5,
        name: 'Sân bay Quốc tế Nội Bài',
        distance: '26 km',
        image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
        description: 'Cảng hàng không quốc tế chính của miền Bắc với các nhà ga rộng lớn kết nối giao thông tiện lợi.',
        note: 'Di chuyển bằng ô tô qua cầu Nhật Tân khoảng 35 - 45 phút (26 km).'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '024 3933 6688',
      email: 'hanoi@vinastay.vn',
      familyFriendly: 'Phù hợp cho cả gia đình, cặp đôi và khách công tác',
      smokingPolicy: 'Khu vực hút thuốc riêng tại ban công ngoài trời',
      petPolicy: 'Không cho phép mang theo thú cưng'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Check-in từ 14:00 và Check-out trước 12:00. Quý khách vui lòng xuất trình CMND/CCCD hoặc Hộ chiếu khi đến nhận phòng.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung với bố mẹ. Có hỗ trợ nôi em bé miễn phí khi có thông báo trước.'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Nghiêm cấm hút thuốc trong toàn bộ các phòng nghỉ. Không nhận thú cưng trong khách sạn.'
      },
      {
        title: 'Hủy phòng & Đặt chỗ',
        content: 'Chính sách linh hoạt: Miễn phí hủy phòng trước 48 giờ trước ngày nhận phòng.'
      }
    ],
    rooms: [
      {
        id: 501,
        name: 'Heritage Classic King',
        size: '34 m²',
        bed: '1 Giường King 1m8',
        image: '/assets/images/room-deluxe.jpg',
        images: ['/assets/images/room-deluxe.jpg', '/assets/images/hotel-hanoi.jpg'],
        availableRooms: 4,
        basePrice: 1450000,
        weekendPrice: 1750000,
        holidayPrice: 2150000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 1,
        maxOccupancy: 3,
        extraAdultFee: 280000,
        extraChildFee: 140000,
        amenities: ['Nội thất gỗ lim và mây đan', 'Cửa sổ kính lớn đón nắng', 'Trà sen Tây Hồ thơm ngát'],
        policies: ['Bao gồm bữa sáng phở bò gia truyền', 'Miễn phí hủy phòng trước 48 giờ']
      }
    ]
  },
  {
    id: 106,
    name: 'VietPeace Stay Châu Đốc Riverside Hotel',
    propertyType: 'HOTEL',
    starRating: 4,
    score: 8.9,
    reviewsCount: 380,
    locationId: 52,
    locationName: 'Châu Đốc, An Giang',
    location_name: 'An Giang',
    address: 'Đường Lê Lợi, Phường Châu Phú B, TP. Châu Đốc, Tỉnh An Giang',
    description: 'Tọa lạc bên ngã ba sông Hậu thơ mộng, thuận tiện hành hương Miếu Bà Chúa Xứ Núi Sam và khám phá rừng tràm Trà Sư. Phòng ốc trang nhã, hồ bơi nhìn ra bến tàu du lịch.',
    phone: '0296 3568 899',
    email: 'chaudoc@vinastay.vn',
    check_in_time: 'Từ 14:00',
    check_out_time: 'Trước 12:00',
    check_in_instructions: 'Giờ check-in từ 14:00 và check-out trước 12:00 trưa. Quý khách vui lòng xuất trình giấy tờ tùy thân hợp lệ khi đến nhận phòng. Khách sạn hỗ trợ giữ hành lý miễn phí nếu quý khách đến trước giờ nhận phòng.',
    children_policy: 'Trẻ em dưới 6 tuổi ngủ chung với bố mẹ được miễn phí tiền phòng hoàn toàn. Trẻ em từ 6 - 11 tuổi phụ thu 120.000 VNĐ/đêm bao gồm bữa sáng buffet bún cá Châu Đốc. Trẻ từ 12 tuổi tính như người lớn.',
    pet_policy: 'Không cho phép mang theo vật nuôi hoặc thú cưng vào khách sạn để đảm bảo vệ sinh và an ninh chung cho khách hành hương.',
    smoking_policy: 'Nghiêm cấm hút thuốc lá trong các phòng ngủ và khu vực nhà hàng. Quý khách có thể hút thuốc tại khu vực sân ngoài trời bên bờ sông Hậu.',
    house_rules: '1. Giữ gìn trật tự và sự thanh tịnh chung, đặc biệt vào buổi tối và sáng sớm khi các đoàn hành hương khởi hành.\n2. Vui lòng cẩn thận khi di chuyển gần khu vực bến tàu và bờ kè sông Hậu.\n3. Quý khách tự bảo quản tài sản có giá trị trong két an toàn hoặc gửi tại két lễ tân khách sạn.\n4. Không mang hoa tươi hoặc đồ cúng lễ lớn vào phòng ngủ nếu chưa được sự đồng ý của ban quản lý.',
    image: '/assets/images/homestay-mekong.jpg',
    images: [
      '/assets/images/homestay-mekong.jpg',
      '/assets/images/hotel-saigon.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 950000,
    weekendPrice: 1150000,
    holidayPrice: 1450000,
    amenities: createAmenities([
      { id: 1, amenity_id: 1, code: 'breakfast', name: 'Buffet sáng bún cá Châu Đốc', icon_key: 'restaurant', is_chargeable: false, description: 'Đặc sản bún cá nước lèo thơm ngon và món điểm tâm Nam Bộ' },
      { id: 2, amenity_id: 2, code: 'pool', name: 'Hồ bơi ngoài trời nhìn ra sông Hậu', icon_key: 'pool', is_chargeable: false, description: 'Thư giãn ngắm tàu thuyền xuôi ngược bên dòng sông' },
      { id: 3, amenity_id: 3, code: 'parking', name: 'Bãi đỗ xe du lịch an toàn', icon_key: 'parking', is_chargeable: false, description: 'Chỗ đỗ xe rộng rãi thuận tiện cho cả xe khách và xe gia đình' },
      { id: 4, amenity_id: 4, code: 'wifi', name: 'Wi-Fi miễn phí toàn khách sạn', icon_key: 'wifi', is_chargeable: false, description: 'Kết nối ổn định phục vụ làm việc và giải trí' },
      { id: 7, amenity_id: 7, code: 'shuttle', name: 'Xe điện tham quan Miếu Bà Chúa Xứ', icon_key: 'airport_shuttle', is_chargeable: true, description: 'Tuyến xe điện đưa đón hành hương cụm di tích Núi Sam' },
      { id: 14, amenity_id: 14, code: 'boat', name: 'Tàu du lịch tham quan làng cá bè', icon_key: 'dining', is_chargeable: true, description: 'Tour trải nghiệm đời sống sông nước và làng Chăm Châu Phong' }
    ]),
    overviewHighlights: [
      'Tọa lạc ngay bên bờ sông Hậu hiền hòa với tầm nhìn ngắm ghe thuyền nhộn nhịp',
      'Hồ bơi ngoài trời nhìn ra bến tàu du lịch và cầu Châu Đốc thơ mộng',
      'Vị trí thuận tiện hành hương Miếu Bà Chúa Xứ Núi Sam và rừng tràm Trà Sư',
      'Ẩm thực đặc sản miền Tây phong phú với bún cá Châu Đốc và lẩu mắm'
    ],
    featuredAmenitiesList: [
      'Free Wi-Fi',
      'Swimming pool',
      'Restaurant',
      'Free parking',
      '24-hour front desk',
      'Room service',
      'Air conditioning',
      'Airport shuttle',
      'Laundry service'
    ],
    nearbyPlaces: [
      {
        id: 1,
        name: 'Bến tàu du lịch Sông Hậu',
        distance: '300 m',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        description: 'Bến neo đậu thuyền và tàu cao tốc đi Phnom Penh (Campuchia) và tham quan các làng nổi cá bè trên sông.',
        note: 'Đi bộ 4 phút (300m) ngay cạnh khách sạn.'
      },
      {
        id: 2,
        name: 'Chợ nổi Châu Đốc',
        distance: '850 m',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        description: 'Chợ nổi giao thương sông nước độc đáo với hàng chục ghe thuyền chở trái cây tươi, rau củ và cá tươi.',
        note: 'Đi xuồng máy từ bến tàu khách sạn khoảng 5 phút (850m).'
      },
      {
        id: 3,
        name: 'Miếu Bà Chúa Xứ Núi Sam',
        distance: '4.5 km',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        description: 'Điểm đến hành hương tâm linh linh thiêng bậc nhất Tây Nam Bộ với kiến trúc tháp dạng hoa sen 3 tầng mái.',
        note: 'Đi xe ô tô hoặc xe điện khoảng 10 phút (4.5 km).'
      },
      {
        id: 4,
        name: 'Làng Chăm Châu Phong',
        distance: '1.2 km',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        description: 'Làng nghề dệt thổ cẩm Chăm truyền thống với nhà sàn gỗ đặc trưng và thánh đường Hồi giáo Mubarak uy nghiêm.',
        note: 'Đi phà qua sông Hậu và đi bộ khoảng 10 phút (1.2 km).'
      },
      {
        id: 5,
        name: 'Rừng tràm Trà Sư',
        distance: '25 km',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        description: 'Hệ sinh thái rừng ngập nước tuyệt đẹp với thảm bèo cám xanh ngắt trải dài và đàn chim trời ríu rít.',
        note: 'Đi ô tô hoặc taxi khoảng 35 phút (25 km).'
      }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
      phone: '0296 3568 899',
      email: 'chaudoc@vinastay.vn',
      familyFriendly: 'Thân thiện với gia đình đi du lịch hoặc hành hương lễ Bà',
      smokingPolicy: 'Khu vực hút thuốc ngoài trời (Cấm hút thuốc trong phòng)',
      petPolicy: 'Không cho phép mang theo thú cưng'
    },
    propertyPolicies: [
      {
        title: 'Nhận phòng & Trả phòng (Check-in / Check-out)',
        content: 'Nhận phòng từ 14:00 và trả phòng trước 12:00. Hỗ trợ gửi hành lý miễn phí tại quầy lễ tân nếu đến sớm.'
      },
      {
        title: 'Chính sách trẻ em & Giường phụ',
        content: 'Trẻ em dưới 6 tuổi ở chung giường bố mẹ miễn phí. Phụ thu ăn sáng tính cho trẻ từ 6 đến 11 tuổi.'
      },
      {
        title: 'Quy định hút thuốc & Thú cưng',
        content: 'Phòng không hút thuốc. Không mang theo thú cưng nhằm giữ vệ sinh và sự yên tĩnh chung.'
      },
      {
        title: 'Hủy phòng & Xe đưa đón',
        content: 'Miễn phí hủy phòng trước 24 giờ. Có hỗ trợ đặt xe điện đưa đón tham quan cụm di tích Núi Sam.'
      }
    ],
    rooms: [
      {
        id: 601,
        name: 'Mekong River Deluxe',
        size: '36 m²',
        bed: '1 King hoặc 2 Giường đơn',
        image: '/assets/images/room-deluxe.jpg',
        images: ['/assets/images/room-deluxe.jpg', '/assets/images/homestay-mekong.jpg'],
        availableRooms: 6,
        basePrice: 950000,
        weekendPrice: 1150000,
        holidayPrice: 1450000,
        includedAdults: 2,
        includedChildren: 1,
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        extraAdultFee: 250000,
        extraChildFee: 120000,
        amenities: ['Cửa sổ ngắm sông Hậu hiền hòa', 'Phòng tắm hiện đại', 'Trái cây miệt vườn tươi ngon'],
        policies: ['Bao gồm buffet sáng bún cá Châu Đốc', 'Hỗ trợ xe điện đưa đón Núi Sam']
      }
    ]
  }
])((list) => {
  const arr = [...list];
  arr.includes = function(searchElement, fromIndex) {
    if (Array.prototype.includes.call(this, searchElement, fromIndex)) return true;
    return this.some(item => item?.code === searchElement || item?.id === searchElement || item?.name === searchElement);
  };
  arr.map = function(callback, thisArg) {
    return Array.prototype.map.call(this, (item, idx, array) => {
      const cbStr = callback ? callback.toString() : '';
      if (callback && (callback.name === 'renderAmenityIcon' || cbStr.includes('renderAmenityIcon') || cbStr.includes('hotel-amenity-pill'))) {
        return callback.call(thisArg, item.code || item, idx, array);
      }
      return callback.call(thisArg, item, idx, array);
    });
  };
  return arr;
});

export const POPULAR_DESTINATIONS = [
  {
    id: 1,
    name: 'TP. Hồ Chí Minh',
    subtitle: '5 khách sạn & căn hộ cao cấp',
    image: '/assets/images/hotel-saigon.jpg',
  },
  {
    id: 3,
    name: 'Hạ Long (Quảng Ninh)',
    subtitle: '4 resort & khách sạn ven vịnh',
    image: '/assets/images/resort-halong.jpg',
  },
  {
    id: 4,
    name: 'Đà Nẵng',
    subtitle: '6 resort & khách sạn ven biển',
    image: '/assets/images/hero.jpg',
  },
  {
    id: 5,
    name: 'An Giang (Mekong Delta)',
    subtitle: 'Tri Tôn · Châu Đốc · Long Xuyên',
    image: '/assets/images/homestay-mekong.jpg',
  }
];
