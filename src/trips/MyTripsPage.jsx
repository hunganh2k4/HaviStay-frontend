import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  ChevronRight,
  Search,
  Inbox
} from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTrips();
  }, [navigate]);

  const fetchMyTrips = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Không thể tải danh sách chuyến đi.");

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-700";
      case "PENDING": return "bg-amber-100 text-amber-700";
      case "CANCELLED": return "bg-rose-100 text-rose-700";
      case "COMPLETED": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED": return "Đã xác nhận";
      case "PENDING": return "Chờ thanh toán";
      case "CANCELLED": return "Đã hủy";
      case "COMPLETED": return "Đã hoàn thành";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium">Đang tải chuyến đi của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Chuyến đi</h1>
            <p className="text-gray-500 text-sm font-medium">Quản lý các chuyến đi và đơn đặt phòng của bạn</p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Tìm kiếm chuyến đi..." className="bg-transparent border-none outline-none text-sm w-48" />
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Khi bạn đặt chỗ, các chuyến đi của bạn sẽ xuất hiện tại đây.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-100 active:scale-95">
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col sm:flex-row h-full cursor-pointer"
                onClick={() => navigate(`/properties/${booking.room.propertyId}`)}
              >
                {/* Image Section */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={booking.room?.images?.[0] || booking.room?.property?.images?.[0] || "https://images.unsplash.com/photo-1522771731478-44eb10e5c776?w=800"}
                    alt={booking.room?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{booking.room?.property?.title}</h3>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mb-4">
                      <MapPin size={14} className="text-rose-500" />
                      {booking.room?.property?.location}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày đi</p>
                          <p className="text-xs font-bold">{new Date(booking.checkIn).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Số đêm</p>
                          <p className="text-xs font-bold">{booking.nights} đêm</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tổng thanh toán</p>
                      <p className="font-bold text-rose-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(booking.totalPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500">
                      <CreditCard size={14} />
                      {booking.status === "CONFIRMED" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
