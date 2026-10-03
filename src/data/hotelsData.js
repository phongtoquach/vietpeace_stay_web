/**
 * VinaStay Hospitality Group - Hotel & Accommodation Data (JavaScript)
 * Real-world commercial structure ready for future ExpressJS + SQL Server backend.
 */

export const HERO_SLIDES = [
  {
    id: 1,
    headline: "Khám Phá Kỳ Nghỉ Đẳng Cấp Khắp Việt Nam",
    description: "Hệ thống 25+ khách sạn, resort ven biển và homestay sinh thái do Tập đoàn VinaStay trực tiếp sở hữu và vận hành.",
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
  
  // Specific accommodations owned by VinaStay Group
  { id: 101, locationId: 1, type: 'accommodation', name: 'VinaStay Saigon Riverside Hotel', locationName: 'Quận 1, TP. Hồ Chí Minh' },
  { id: 102, locationId: 3, type: 'accommodation', name: 'VinaStay Hạ Long Heritage Resort', locationName: 'Bán đảo Tuần Châu, Hạ Long' },
  { id: 103, locationId: 51, type: 'accommodation', name: 'VinaStay Tri Tôn Palm Homestay', locationName: 'Tri Tôn, An Giang' },
  { id: 104, locationId: 4, type: 'accommodation', name: 'VinaStay Đà Nẵng Ocean Luxury Resort', locationName: 'Ngũ Hành Sơn, Đà Nẵng' },
  { id: 105, locationId: 2, type: 'accommodation', name: 'VinaStay Hà Nội Boutique Hotel', locationName: 'Hoàn Kiếm, Hà Nội' },
  { id: 106, locationId: 52, type: 'accommodation', name: 'VinaStay Châu Đốc Riverside Hotel', locationName: 'Châu Đốc, An Giang' }
];

export const HOTELS = [
  {
    id: 101,
    name: 'VinaStay Saigon Riverside Hotel',
    propertyType: 'HOTEL',
    starRating: 5,
    score: 9.4,
    reviewsCount: 1280,
    locationId: 1,
    locationName: 'Quận 1, TP. Hồ Chí Minh',
    address: '15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    description: 'Khách sạn đẳng cấp 5 sao quốc tế hướng trực diện sông Sài Gòn, liền kề phố đi bộ Nguyễn Huệ. Sở hữu hồ bơi chân mây tầng 25, spa chăm sóc sức khỏe và nhà hàng buffet ẩm thực đa quốc gia.',
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
    amenities: ['breakfast', 'pool', 'parking', 'wifi', 'fitness', 'spa'],
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
      { name: 'Bến Bạch Đằng & Waterbus', distance: '200 m' },
      { name: 'Phố đi bộ Nguyễn Huệ', distance: '350 m' },
      { name: 'Nhà hát Thành phố', distance: '600 m' },
      { name: 'Chợ Bến Thành', distance: '1.1 km' },
      { name: 'Nhà thờ Đức Bà', distance: '1.3 km' },
      { name: 'Sân bay Quốc tế Tân Sơn Nhất', distance: '7.5 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
    name: 'VinaStay Hạ Long Heritage Resort',
    propertyType: 'RESORT',
    starRating: 5,
    score: 9.6,
    reviewsCount: 856,
    locationId: 3,
    locationName: 'Hạ Long, Quảng Ninh',
    address: 'Bán Đảo Tuần Châu, TP. Hạ Long, Tỉnh Quảng Ninh',
    description: 'Khu nghỉ dưỡng sang trọng giữa lòng di sản thiên nhiên thế giới Vịnh Hạ Long. Các căn biệt thự mặt biển biệt lập, bãi cát trắng mịn riêng tư cùng dịch vụ du thuyền ngắm hoàng hôn.',
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
    amenities: ['breakfast', 'pool', 'parking', 'wifi', 'spa'],
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
      { name: 'Bãi tắm biển Tuần Châu', distance: '250 m' },
      { name: 'Cảng tàu khách quốc tế Tuần Châu', distance: '800 m' },
      { name: 'Công viên Sun World Hạ Long', distance: '8.5 km' },
      { name: 'Bảo tàng Quảng Ninh', distance: '14 km' },
      { name: 'Sân bay Quốc tế Vân Đồn', distance: '48 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
    name: 'VinaStay Tri Tôn Palm Homestay',
    propertyType: 'HOMESTAY',
    starRating: 4,
    score: 9.2,
    reviewsCount: 420,
    locationId: 51,
    locationName: 'Tri Tôn, An Giang',
    address: 'Ấp Tô Hạ, Xã Núi Tô, Huyện Tri Tôn, Tỉnh An Giang',
    description: 'Mô hình homestay sinh thái giữa cánh đồng cây thốt nốt và dãy Phụng Hoàng Sơn kỳ vĩ. Bungalow gỗ mộc mạc bên hồ sen, trải nghiệm hái rau sạch và thưởng thức thốt nốt ngọt thanh bản địa.',
    image: '/assets/images/homestay-triton.jpg',
    images: [
      '/assets/images/homestay-triton.jpg',
      '/assets/images/homestay-mekong.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 850000,
    weekendPrice: 1050000,
    holidayPrice: 1350000,
    amenities: ['breakfast', 'parking', 'wifi'],
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
      { name: 'Cây thốt nốt trái tim Tri Tôn', distance: '600 m' },
      { name: 'Hồ Soài So & Suối Vàng', distance: '2.2 km' },
      { name: 'Khu di tích Đồi Tức Dụp', distance: '5 km' },
      { name: 'Chùa Xà Tón (Chùa Khmer)', distance: '3.5 km' },
      { name: 'Chợ huyện Tri Tôn', distance: '4 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
    name: 'VinaStay Đà Nẵng Ocean Luxury Resort',
    propertyType: 'RESORT',
    starRating: 5,
    score: 9.5,
    reviewsCount: 1940,
    locationId: 4,
    locationName: 'Ngũ Hành Sơn, Đà Nẵng',
    address: 'Đường Võ Nguyên Giáp, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
    description: 'Tọa lạc ngay mặt tiền bãi biển Mỹ Khê tuyệt đẹp. Khu phức hợp nghỉ dưỡng với 3 hồ bơi lớn, khu vui chơi trẻ em Kid\'s Club, sân tennis và nhà hàng hải sản tươi sống bên bờ sóng.',
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
    amenities: ['breakfast', 'pool', 'parking', 'wifi', 'spa', 'fitness'],
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
      { name: 'Bãi biển Mỹ Khê', distance: '100 m' },
      { name: 'Danh thắng Ngũ Hành Sơn', distance: '2.5 km' },
      { name: 'Cầu Rồng & Cầu Tình Yêu', distance: '4.2 km' },
      { name: 'Chợ Hàn Đà Nẵng', distance: '5 km' },
      { name: 'Sân bay Quốc tế Đà Nẵng', distance: '6.8 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
    name: 'VinaStay Hà Nội Boutique Hotel',
    propertyType: 'HOTEL',
    starRating: 4,
    score: 9.1,
    reviewsCount: 675,
    locationId: 2,
    locationName: 'Hoàn Kiếm, Hà Nội',
    address: '28 Phố Lý Thường Kiệt, Quận Hoàn Kiếm, TP. Hà Nội',
    description: 'Khách sạn phong cách Indochine hoài niệm ngay trung tâm phố cổ thủ đô. Chỉ vài bước chân tới Hồ Hoàn Kiếm, Nhà Hát Lớn và các địa điểm văn hóa ẩm thực truyền thống danh tiếng.',
    image: '/assets/images/hotel-hanoi.jpg',
    images: [
      '/assets/images/hotel-hanoi.jpg',
      '/assets/images/room-deluxe.jpg',
      '/assets/images/room-suite.jpg'
    ],
    price: 1450000,
    weekendPrice: 1750000,
    holidayPrice: 2150000,
    amenities: ['breakfast', 'parking', 'wifi'],
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
      { name: 'Nhà Hát Lớn Hà Nội', distance: '400 m' },
      { name: 'Hồ Hoàn Kiếm (Hồ Gươm)', distance: '650 m' },
      { name: 'Phố Cổ Hà Nội (36 Phố Phường)', distance: '900 m' },
      { name: 'Văn Miếu - Quốc Tử Giám', distance: '2.8 km' },
      { name: 'Sân bay Quốc tế Nội Bài', distance: '26 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
    name: 'VinaStay Châu Đốc Riverside Hotel',
    propertyType: 'HOTEL',
    starRating: 4,
    score: 8.9,
    reviewsCount: 380,
    locationId: 52,
    locationName: 'Châu Đốc, An Giang',
    address: 'Đường Lê Lợi, Phường Châu Phú B, TP. Châu Đốc, Tỉnh An Giang',
    description: 'Tọa lạc bên ngã ba sông Hậu thơ mộng, thuận tiện hành hương Miếu Bà Chúa Xứ Núi Sam và khám phá rừng tràm Trà Sư. Phòng ốc trang nhã, hồ bơi nhìn ra bến tàu du lịch.',
    image: '/assets/images/homestay-mekong.jpg',
    images: [
      '/assets/images/homestay-mekong.jpg',
      '/assets/images/hotel-saigon.jpg',
      '/assets/images/room-deluxe.jpg'
    ],
    price: 950000,
    weekendPrice: 1150000,
    holidayPrice: 1450000,
    amenities: ['breakfast', 'pool', 'parking', 'wifi'],
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
      { name: 'Bến tàu du lịch Sông Hậu', distance: '300 m' },
      { name: 'Chợ nổi Châu Đốc', distance: '850 m' },
      { name: 'Miếu Bà Chúa Xứ Núi Sam', distance: '4.5 km' },
      { name: 'Làng Chăm Châu Phong', distance: '1.2 km' },
      { name: 'Rừng tràm Trà Sư', distance: '25 km' }
    ],
    propertyInfo: {
      checkIn: 'Từ 14:00 (Check-in: from 14:00)',
      checkOut: 'Trước 12:00 (Check-out: before 12:00)',
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
];

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
