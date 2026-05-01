import React, { useState } from "react";
import {
  Share,
  Heart,
  Star,
  Wifi,
  Tv,
  UtensilsCrossed,
  Briefcase,
  Gem,
  Flag,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../components/Header";

export default function PropertyDetailPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Date selection state (using numbers for simplicity in this simulated calendar)
  const [startDate, setStartDate] = useState(15);
  const [endDate, setEndDate] = useState(17);

  const gallery = [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  ];

  const rooms = [
    {
      id: "P.100",
      name: "Phòng thường P.100",
      type: "Thường",
      price: 520000,
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      features: "1 giường đôi · View phố",
    },
    {
      id: "P.200",
      name: "Phòng thường P.200",
      type: "Thường",
      price: 550000,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      features: "1 giường đôi · Ban công",
    },
    {
      id: "P.300",
      name: "Phòng thường P.300",
      type: "Thường",
      price: 530000,
      image: "https://images.unsplash.com/photo-1505693322210-9b4c97432b47?auto=format&fit=crop&w=800&q=80",
      features: "1 giường đôi · Yên tĩnh",
    },
    {
      id: "P.400",
      name: "Phòng VIP P.400",
      type: "VIP",
      price: 1250000,
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      features: "Giường King · View hồ Tây · Bồn tắm",
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleDateClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (day < startDate) {
      setStartDate(day);
    } else if (day > startDate) {
      setEndDate(day);
    }
  };

  const nights = endDate && startDate ? endDate - startDate : 0;

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-[1120px] mx-auto px-6 md:px-12 py-6">
        {/* TITLE */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Căn hộ Phoenix - 2 phút đến Hồ Tây
            </h1>
            <p className="text-sm underline font-semibold">Tây Hồ, Hà Nội, Việt Nam</p>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <button className="flex items-center gap-2 underline hover:bg-gray-50 px-2 py-1 rounded-md transition">
              <Share size={16} />
              Chia sẻ
            </button>
            <button className="flex items-center gap-2 underline hover:bg-gray-50 px-2 py-1 rounded-md transition">
              <Heart size={16} />
              Lưu
            </button>
          </div>
        </div>

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden h-[420px]">
          <img
            src={gallery[0]}
            alt=""
            className="col-span-2 row-span-2 w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
          />
          {gallery.slice(1).map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
            />
          ))}
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-3 gap-12 mt-8">
          {/* LEFT */}
          <div className="col-span-2 space-y-8">
            {/* BASIC INFO */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-1">
                Toàn bộ căn hộ dịch vụ tại Quận Tây Hồ
              </h2>
              <p className="text-sm text-gray-600">
                Chủ nhà: WECO STAY · 4 loại phòng có sẵn
              </p>
            </div>

            {/* HOST */}
            <div className="border-b py-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Chủ nhà: WECO STAY Cheongnyangni
                </h3>
                <p className="text-xs text-gray-500">
                  Superhost · 11 tháng kinh nghiệm đón tiếp khách
                </p>
              </div>
            </div>

            {/* FEATURES */}
            <div className="border-b py-6 space-y-6">
              <div className="flex gap-4">
                <Star size={20} className="mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Được khách đánh giá cao</h4>
                  <p className="text-xs text-gray-500">100% khách gần đây đã đánh giá 5 sao.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Gem size={20} className="mt-1 text-rose-500" />
                <div>
                  <h4 className="font-bold text-sm">Chỗ ở tuyệt vời</h4>
                  <p className="text-xs text-gray-500">Một trong những chỗ ở được yêu thích nhất trên HaviStay.</p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="py-6 border-b">
              <p className="text-sm leading-7 text-gray-700">
                Phoenix Apartment tọa lạc tại trung tâm khu vực Hồ Tây sầm uất. Căn hộ mang phong cách hiện đại,
                đầy đủ tiện nghi và chỉ cách mặt hồ vài bước chân. Đây là lựa chọn hoàn hảo cho kỳ nghỉ của bạn...
              </p>
              <button className="mt-4 text-sm font-bold underline">Hiển thị thêm</button>
            </div>

            {/* ROOM SELECTION SECTION */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-6">Chọn phòng của bạn</h2>
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`flex gap-4 p-4 border rounded-xl cursor-pointer transition-all ${selectedRoom?.id === room.id
                      ? "border-black bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <div className="relative w-32 h-24 flex-shrink-0">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button className="absolute top-1 right-1 bg-white/80 p-1 rounded-full shadow hover:bg-white transition">
                        <Eye size={14} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{room.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{room.features}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatPrice(room.price)}</p>
                          <p className="text-[10px] text-gray-400">/đêm</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${room.type === 'VIP' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                          }`}>
                          {room.type}
                        </span>
                        {selectedRoom?.id === room.id && (
                          <span className="text-rose-500 text-xs font-bold flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> Đã chọn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AMENITIES */}
            <div className="py-8 border-b">
              <h2 className="text-xl font-bold mb-6">
                Nơi này có những gì cho bạn
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm">
                <div className="flex items-center gap-3"><Wifi size={18} /> Wi-fi</div>
                <div className="flex items-center gap-3"><Briefcase size={18} /> Không gian riêng để làm việc</div>
                <div className="flex items-center gap-3"><UtensilsCrossed size={18} /> Nhà bếp</div>
                <div className="flex items-center gap-3"><Tv size={18} /> TV với truyền hình cáp tiêu chuẩn</div>
              </div>

              <button className="mt-8 px-6 py-2.5 border border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                Hiển thị tất cả 30 tiện nghi
              </button>
            </div>

            {/* CALENDAR SECTION */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-4">Chọn ngày đặt phòng</h2>
              <p className="text-sm text-gray-500 mb-4">
                {startDate && endDate
                  ? `${nights} đêm tại Tây Hồ`
                  : "Chọn ngày nhận phòng và trả phòng"}
              </p>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Tháng 5 năm 2026</h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight size={20} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-4">
                  <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                  {[...Array(14)].map((_, i) => <div key={i} className="py-3 text-gray-300">{i + 20}</div>)}
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const isSelected = endDate && day >= startDate && day <= endDate;
                    const isStart = day === startDate;
                    const isEnd = day === endDate;
                    const isInBetween = endDate && day > startDate && day < endDate;

                    return (
                      <div
                        key={i}
                        onClick={() => handleDateClick(day)}
                        className={`py-3 cursor-pointer relative transition flex items-center justify-center ${isSelected ? "bg-rose-500" : "hover:bg-rose-500 rounded-full"
                          } ${isStart ? "rounded-l-full bg-rose-500 text-white" : ""} ${isEnd ? "rounded-r-full bg-rose-500 text-white" : ""
                          } ${isInBetween ? "bg-gray-100" : ""}`}
                      >
                        <span className="relative z-10">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    className="text-sm font-bold underline"
                  >
                    Xóa ngày
                  </button>
                </div>
              </div>
            </div>

            {/* REVIEWS */}
            <div className="py-8 border-b">
              <h2 className="text-xl font-bold mb-6">
                ★ 4,76 · 146 đánh giá
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-sm mb-1">Thị Phương Anh</h3>
                  <p className="text-xs text-gray-500 mb-2">tháng 3 năm 2026</p>
                  <p className="text-sm leading-6 text-gray-700">
                    Đây là một chỗ ở rất tuyệt vời, mình chắc chắn sẽ recommend cho bạn bè...
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Akerke</h3>
                  <p className="text-xs text-gray-500 mb-2">3 tuần trước</p>
                  <p className="text-sm leading-6 text-gray-700">
                    Nhìn chung, đó là một nơi tuyệt vời so với chi phí...
                  </p>
                </div>
              </div>
              <button className="mt-8 px-6 py-2.5 border border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                Hiển thị tất cả 146 đánh giá
              </button>
            </div>
          </div>

          {/* RIGHT BOOKING */}
          <div className="relative">
            <div className="sticky top-24 space-y-4">
              <div className="border border-gray-200 rounded-xl p-6 shadow-xl bg-white">
                <div className="mb-6">
                  {selectedRoom ? (
                    <div>
                      <p className="text-xl font-bold">{formatPrice(selectedRoom.price)} <span className="text-sm font-normal text-gray-500">/ đêm</span></p>
                      <p className="text-xs text-rose-500 font-bold mt-1">Đang chọn: {selectedRoom.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Vui lòng chọn phòng để xem giá</p>
                  )}
                </div>

                {/* Date Box */}
                <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-gray-400 hover:bg-gray-50 cursor-pointer">
                      <p className="text-[10px] font-bold uppercase">Nhận phòng</p>
                      <p className="text-sm">{startDate ? `${startDate}/5/2026` : "Thêm ngày"}</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-[10px] font-bold uppercase">Trả phòng</p>
                      <p className="text-sm">{endDate ? `${endDate}/5/2026` : "Thêm ngày"}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-400 p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-[10px] font-bold uppercase">Khách</p>
                    <p className="text-sm">1 khách</p>
                  </div>
                </div>

                <button
                  disabled={!selectedRoom || !endDate}
                  className={`w-full py-3 rounded-xl text-base font-bold transition shadow-lg ${selectedRoom && endDate
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  {selectedRoom ? (endDate ? "Đặt phòng" : "Chọn ngày trả phòng") : "Vui lòng chọn phòng"}
                </button>

                <p className="text-center text-gray-500 mt-4 text-[11px] font-medium">
                  Bạn vẫn chưa bị trừ tiền
                </p>

                {selectedRoom && endDate && (
                  <div className="mt-6 space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="underline">{formatPrice(selectedRoom.price)} x {nights} đêm</span>
                      <span>{formatPrice(selectedRoom.price * nights)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="underline">Phí dịch vụ HaviStay</span>
                      <span>₫0</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100 mt-3">
                      <span>Tổng tiền</span>
                      <span>{formatPrice(selectedRoom.price * nights)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Report */}
              <button className="w-full flex items-center justify-center gap-3 underline text-gray-500 text-xs py-2 hover:bg-gray-50 rounded-lg transition">
                <Flag size={14} />
                Báo cáo chỗ ở này
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}