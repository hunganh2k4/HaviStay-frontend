import React from "react";
import {
  Share,
  Heart,
  Star,
  Wifi,
  Car,
  Tv,
  UtensilsCrossed,
  Briefcase,
  Gem,
  Flag,
} from "lucide-react";
import Header from "../components/Header";

export default function PropertyDetailPage() {
  const gallery = [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased">
      <Header />

      {/* MAIN */}

      {/* MAIN */}
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
          <div className="col-span-2">
            {/* BASIC INFO */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-1">
                Phòng riêng tại căn hộ cho thuê tại Quận Tây Hồ
              </h2>

              <p className="text-sm text-gray-600">
                2 khách · 1 phòng ngủ · 1 giường · 1 phòng tắm riêng
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
                  <h4 className="font-bold text-sm">
                    Được khách đánh giá cao
                  </h4>
                  <p className="text-xs text-gray-500">
                    100% khách gần đây đã đánh giá 5 sao.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Briefcase size={20} className="mt-1" />
                <div>
                  <h4 className="font-bold text-sm">
                    Tự nhận phòng
                  </h4>
                  <p className="text-xs text-gray-500">
                    Tự nhận phòng bằng khóa thông minh.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Car size={20} className="mt-1" />
                <div>
                  <h4 className="font-bold text-sm">
                    Đỗ xe miễn phí
                  </h4>
                  <p className="text-xs text-gray-500">
                    Có chỗ đỗ xe miễn phí trong khuôn viên.
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="py-6 border-b">
              <div className="bg-gray-50 rounded-xl p-4 text-sm mb-6 border border-gray-100">
                Một số thông tin đã được dịch tự động.{" "}
                <span className="underline font-bold cursor-pointer">
                  Xem bản gốc
                </span>
              </div>

              <p className="text-sm leading-7 text-gray-700">
                WECO STAY CHEONGNYANGNI nằm trong một khu phố nơi quá
                khứ và hiện tại cùng tồn tại với sự quyến rũ. Từ Chợ
                Gyeongdong – một trong những chợ truyền thống lớn nhất
                Seoul – đến Starbucks Gyeongdong 1960...
              </p>

              <button className="mt-6 px-6 py-2.5 bg-white border border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                Hiển thị thêm
              </button>
            </div>

            {/* AMENITIES */}
            <div className="py-8 border-b">
              <h2 className="text-xl font-bold mb-6">
                Nơi này có những gì cho bạn
              </h2>

              <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm">
                <div className="flex items-center gap-3">
                  <Wifi size={18} /> Wi-fi
                </div>

                <div className="flex items-center gap-3">
                  <UtensilsCrossed size={18} /> Nhà bếp
                </div>

                <div className="flex items-center gap-3">
                  <Car size={18} /> Chỗ đỗ xe miễn phí
                </div>

                <div className="flex items-center gap-3">
                  <Tv size={18} /> TV
                </div>
              </div>

              <button className="mt-8 px-6 py-2.5 border border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                Hiển thị tất cả 30 tiện nghi
              </button>
            </div>

            {/* REVIEWS */}
            <div className="py-8">
              <h2 className="text-xl font-bold mb-6">
                ★ 4,76 · 146 đánh giá
              </h2>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-sm mb-1">
                    Thị Phương Anh
                  </h3>

                  <p className="text-xs text-gray-500 mb-2">
                    tháng 3 năm 2026
                  </p>

                  <p className="text-sm leading-6 text-gray-700">
                    Đây là một chỗ ở rất tuyệt vời, mình chắc chắn sẽ
                    recommend cho bạn bè...
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-1">
                    Akerke
                  </h3>

                  <p className="text-xs text-gray-500 mb-2">
                    3 tuần trước
                  </p>

                  <p className="text-sm leading-6 text-gray-700">
                    Nhìn chung, đó là một nơi tuyệt vời so với chi
                    phí...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BOOKING */}
          <div className="relative">
            <div className="sticky top-24 space-y-4">
              {/* Notice */}
              <div className="border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
                <Gem className="text-rose-500" size={20} />
                <p className="text-xs font-bold">
                  Hiếm khi còn chỗ! Chỗ ở này thường kín phòng
                </p>
              </div>

              {/* Booking Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-xl">
                <div className="mb-4">
                  <span className="text-gray-400 line-through text-lg">
                    ₫1.139.765
                  </span>

                  <span className="text-xl font-bold ml-2">
                    ₫1.039.765
                  </span>

                  <span className="text-xs"> cho 2 đêm</span>
                </div>

                {/* Date Box */}
                <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-gray-400">
                      <p className="text-[10px] font-bold">NHẬN PHÒNG</p>
                      <p className="text-sm">15/5/2026</p>
                    </div>

                    <div className="p-3">
                      <p className="text-[10px] font-bold">TRẢ PHÒNG</p>
                      <p className="text-sm">17/5/2026</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-400 p-3">
                    <p className="text-[10px] font-bold">KHÁCH</p>
                    <p className="text-sm">1 khách</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg text-center py-2.5 mb-4 text-[11px] text-gray-600 border border-gray-100">
                  Hủy miễn phí trước 14 tháng 5
                </div>

                <button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl text-base font-bold hover:opacity-95 transition shadow-lg">
                  Đặt phòng
                </button>

                <p className="text-center text-gray-500 mt-4 text-xs font-medium">
                  Bạn vẫn chưa bị trừ tiền
                </p>
              </div>

              {/* Report */}
              <button className="w-full flex items-center justify-center gap-3 underline text-gray-600">
                <Flag size={18} />
                Báo cáo nhà/phòng cho thuê này
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}