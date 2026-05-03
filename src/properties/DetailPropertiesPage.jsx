import React, { useState, useEffect } from "react";
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
  Users,
  Bed,
  Bath
} from "lucide-react";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../config/config";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Date selection state (simulated)
  const [startDate, setStartDate] = useState(15);
  const [endDate, setEndDate] = useState(17);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const propRes = await fetch(`${API_URL}/properties/${id}`);
        if (!propRes.ok) throw new Error("Property not found");
        const propData = await propRes.json();
        setProperty(propData);

        const roomsRes = await fetch(`${API_URL}/rooms/property/${id}`);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
          if (roomsData.length > 0) {
            setSelectedRoom(roomsData[0]);
          }
        }

        // Check wishlist status
        const userData = localStorage.getItem("user");
        if (userData) {
          const wishRes = await fetch(`${API_URL}/wishlists/status/${id}`, {
            credentials: "include",
          });
          if (wishRes.ok) {
            const wishData = await wishRes.json();
            setIsWishlisted(wishData.isWishlisted);
          }
        }

        // Fetch reviews
        const reviewRes = await fetch(`${API_URL}/reviews/property/${id}`);
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  const toggleWishlist = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlists/toggle/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.isWishlisted);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

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

  const handleBooking = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    if (!selectedRoom || !startDate || !endDate) return;

    setIsBooking(true);
    try {
      // 1. Create Booking
      const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: `2026-05-${startDate.toString().padStart(2, '0')}`,
          checkOut: `2026-05-${endDate.toString().padStart(2, '0')}`,
          guestsCount: 1, // Default for now
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || "Lỗi tạo đơn đặt phòng");

      // 2. Create VNPAY URL
      const paymentRes = await fetch(`${API_URL}/payments/create-vnpay-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingId: bookingData.id,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.message || "Lỗi tạo link thanh toán");

      // 3. Redirect to VNPAY
      window.location.href = paymentData.url;
    } catch (error) {
      alert(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  const nights = endDate && startDate ? endDate - startDate : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center antialiased">
        <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Đang tải thông tin...</p>
      </div>
    );
  }

  // Fallback mock data
  const mockGallery = [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-[1120px] mx-auto px-6 md:px-12 py-6">
        {/* TITLE */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {property?.title || "Căn hộ Phoenix - 2 phút đến Hồ Tây"}
            </h1>
            <p className="text-sm underline font-semibold">
              {property?.location ? `${property.location}, ${property.country}` : "Tây Hồ, Hà Nội, Việt Nam"}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <button className="flex items-center gap-2 underline hover:bg-gray-50 px-2 py-1 rounded-md transition">
              <Share size={16} /> Chia sẻ
            </button>
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-2 underline hover:bg-gray-50 px-2 py-1 rounded-md transition ${isWishlisted ? "text-rose-500" : ""}`}
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? "Đã lưu" : "Lưu"}
            </button>
          </div>
        </div>

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden h-[420px]">
          <img
            src={(property?.images && property.images[0]) || mockGallery[0]}
            alt=""
            className="col-span-2 row-span-2 w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
          />
          {property?.images && property.images.length > 1 ? (
            property.images.slice(1, 5).map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
            ))
          ) : (
            mockGallery.slice(1).map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
            ))
          )}
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* BASIC INFO */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-1">
                {property?.title ? `Toàn bộ chỗ nghỉ tại ${property.location}` : "Toàn bộ căn hộ dịch vụ tại Quận Tây Hồ"}
              </h2>
              <p className="text-sm text-gray-600">
                Chủ nhà: {property?.host?.name || "WECO STAY"} · {rooms.length > 0 ? `${rooms.length} loại phòng` : "4 loại phòng có sẵn"}
              </p>
            </div>

            {/* HOST */}
            <div className="border-b py-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {property?.host?.avatar ? (
                  <img src={property.host.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (property?.host?.name?.charAt(0) || "W")
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Chủ nhà: {property?.host?.name || "WECO STAY Cheongnyangni"}
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
              <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                {property?.description || "Phoenix Apartment tọa lạc tại trung tâm khu vực Hồ Tây sầm uất. Căn hộ mang phong cách hiện đại, đầy đủ tiện nghi và chỉ cách mặt hồ vài bước chân. Đây là lựa chọn hoàn hảo cho kỳ nghỉ của bạn..."}
              </p>
              {!property?.description && <button className="mt-4 text-sm font-bold underline">Hiển thị thêm</button>}
            </div>

            {/* ROOM SELECTION SECTION */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-6">Chọn phòng của bạn</h2>
              <div className="grid grid-cols-1 gap-4">
                {rooms.length > 0 ? rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`flex gap-4 p-4 border rounded-xl cursor-pointer transition-all ${selectedRoom?.id === room.id ? "border-black bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <div className="relative w-32 h-24 flex-shrink-0">
                      <img src={room.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"} alt={room.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{room.name}</h3>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight">
                            <span className="flex items-center gap-1"><Users size={12} /> {room.guests}</span>
                            <span className="flex items-center gap-1"><Bed size={12} /> {room.beds}</span>
                            <span className="flex items-center gap-1"><Bath size={12} /> {room.bathrooms}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-rose-500">{formatPrice(room.pricePerNight)}</p>
                          <p className="text-[10px] text-gray-400">/đêm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl">
                      <div className="w-32 h-24 bg-gray-100 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                        <div className="w-1/4 h-3 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AMENITIES */}
            <div className="py-8 border-b">
              <h2 className="text-xl font-bold mb-6">Nơi này có những gì cho bạn</h2>
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
                {startDate && endDate ? `${nights} đêm tại ${property?.location || "Tây Hồ"}` : "Chọn ngày nhận phòng và trả phòng"}
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
                    return (
                      <div key={i} onClick={() => handleDateClick(day)} className={`py-3 cursor-pointer relative transition flex items-center justify-center ${isSelected ? "bg-rose-500 text-white rounded-full" : "hover:bg-rose-500 hover:text-white rounded-full"}`}>
                        <span className="relative z-10">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REVIEWS */}
            <div className="py-8 border-b">
              <div className="flex items-center gap-2 mb-6">
                <Star size={20} fill="currentColor" />
                <h2 className="text-xl font-bold">
                  {reviews.length > 0
                    ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} · ${reviews.length} đánh giá`
                    : "Chưa có đánh giá"}
                </h2>
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Chưa có đánh giá nào cho chỗ nghỉ này. Hãy là người đầu tiên trải nghiệm!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-rose-500 font-bold text-sm">{review.user?.name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{review.user?.name}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-rose-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>

                      <p className="text-sm leading-6 text-gray-700 line-clamp-3">{review.comment}</p>

                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.slice(0, 3).map((img, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reviews.length > 6 && (
                <button className="mt-8 px-6 py-2.5 border border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition">
                  Hiển thị tất cả {reviews.length} đánh giá
                </button>
              )}
            </div>
          </div>

          {/* RIGHT BOOKING CARD */}
          <div className="relative">
            <div className="sticky top-24 space-y-4">
              <div className="border border-gray-200 rounded-xl p-6 shadow-xl bg-white">
                <div className="mb-6">
                  {selectedRoom ? (
                    <div>
                      <p className="text-xl font-bold">{formatPrice(selectedRoom.pricePerNight)} <span className="text-sm font-normal text-gray-500">/ đêm</span></p>
                      <p className="text-xs text-rose-500 font-bold mt-1">Đang chọn: {selectedRoom.name}</p>
                    </div>
                  ) : <p className="text-sm text-gray-500 italic">Vui lòng chọn phòng để xem giá</p>}
                </div>

                <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-gray-400">
                      <p className="text-[10px] font-bold uppercase">Nhận phòng</p>
                      <p className="text-sm">{startDate ? `${startDate}/5/2026` : "Thêm ngày"}</p>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase">Trả phòng</p>
                      <p className="text-sm">{endDate ? `${endDate}/5/2026` : "Thêm ngày"}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-400 p-3">
                    <p className="text-[10px] font-bold uppercase">Khách</p>
                    <p className="text-sm">1 khách</p>
                  </div>
                </div>

                <button
                  disabled={!selectedRoom || !endDate || isBooking}
                  onClick={handleBooking}
                  className={`w-full py-3 rounded-xl text-base font-bold transition shadow-lg flex items-center justify-center gap-2 ${selectedRoom && endDate ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-90" : "bg-gray-200 text-gray-400"}`}
                >
                  {isBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    selectedRoom ? (endDate ? "Đặt phòng" : "Chọn ngày") : "Chọn phòng"
                  )}
                </button>

                {selectedRoom && endDate && (
                  <div className="mt-6 space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="underline">{formatPrice(selectedRoom.pricePerNight)} x {nights} đêm</span>
                      <span>{formatPrice(selectedRoom.pricePerNight * nights)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100 mt-3">
                      <span>Tổng tiền</span>
                      <span>{formatPrice(selectedRoom.pricePerNight * nights + (selectedRoom.cleaningFee || 0))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}