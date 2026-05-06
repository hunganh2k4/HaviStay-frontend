import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  ChevronRight,
  Search,
  Inbox,
  Star,
  X,
  Receipt,
  Download,
  Info
} from "lucide-react";
import Header from "../components/Header";
import ReviewModal from "../components/ReviewModal";
import API_URL from "../config/config";

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  useEffect(() => {
    fetchMyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeleteReview = async (e, reviewId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Không thể xóa đánh giá.");

      fetchMyTrips(); // Refresh
    } catch (err) {
      alert(err.message);
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
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
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

        {bookings.filter(b => ["CONFIRMED", "COMPLETED"].includes(b.status)).length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Khi bạn đặt chỗ và thanh toán thành công, các chuyến đi của bạn sẽ xuất hiện tại đây.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-100 active:scale-95">
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings
              .filter(b => ["CONFIRMED", "COMPLETED"].includes(b.status))
              .map(booking => (
                <div
                  key={booking.id}
                  className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col sm:flex-row h-full"
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookingForInvoice(booking);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-[10px] font-bold text-emerald-600 transition-colors"
                      >
                        <Receipt size={14} />
                        Xem chi tiết
                      </button>
                    </div>

                    {booking.status === "CONFIRMED" && (
                      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingForReview(booking);
                          }}
                          className={`flex-1 py-2.5 border text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${booking.isReviewed
                            ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            : "bg-white border-rose-500 text-rose-500 hover:bg-rose-50"
                            }`}
                        >
                          <Star size={14} fill={booking.isReviewed ? "currentColor" : "none"} />
                          {booking.isReviewed ? "Sửa đánh giá" : "Viết đánh giá"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/properties/${booking.room.propertyId}`);
                          }}
                          className="px-4 py-2.5 bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                          title="Xem lại chỗ nghỉ"
                        >
                          <Info size={16} />
                        </button>

                        {booking.isReviewed && (
                          <button
                            onClick={(e) => handleDeleteReview(e, booking.reviewId)}
                            className="px-4 py-2.5 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Xóa đánh giá"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* INVOICE MODAL */}
      {selectedBookingForInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 print-area">
            {/* Header - HIDDEN ON PRINT */}
            <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white no-print">
              <button
                onClick={() => setSelectedBookingForInvoice(null)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Receipt size={24} />
                <h2 className="text-xl font-bold">Hóa đơn thanh toán</h2>
              </div>
              <p className="text-emerald-50 text-xs font-medium opacity-80">Mã đặt phòng: #{selectedBookingForInvoice.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
              {/* Header for PRINT only */}
              <div className="hidden print:block mb-10 pb-6 border-b-2 border-gray-100">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-black text-emerald-600 mb-1">HAVISTAY</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hóa đơn điện tử</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">Mã đơn: #{selectedBookingForInvoice.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400">{new Date().toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-lg mb-1">{selectedBookingForInvoice.room?.property?.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-500" />
                  {selectedBookingForInvoice.room?.property?.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nhận phòng</p>
                  <p className="text-sm font-bold">{new Date(selectedBookingForInvoice.checkIn).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Trả phòng</p>
                  <p className="text-sm font-bold">{new Date(selectedBookingForInvoice.checkOut).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Loại phòng</p>
                  <p className="text-sm font-bold">{selectedBookingForInvoice.room?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Thời gian</p>
                  <p className="text-sm font-bold">{selectedBookingForInvoice.nights} đêm</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiết chi phí</h4>

                {/* Room charge */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tiền phòng ({new Intl.NumberFormat("vi-VN").format(selectedBookingForInvoice.room?.pricePerNight)} ₫ x {selectedBookingForInvoice.nights} đêm)</span>
                  <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(selectedBookingForInvoice.room?.pricePerNight * selectedBookingForInvoice.nights)} ₫</span>
                </div>

                {/* Services */}
                {selectedBookingForInvoice.bookingServices?.map((bs, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{bs.propertyService?.name} (x{bs.quantity})</span>
                    <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(bs.priceAtBooking * bs.quantity)} ₫</span>
                  </div>
                ))}

                {/* Fees */}
                {selectedBookingForInvoice.room?.cleaningFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Phí vệ sinh</span>
                    <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(selectedBookingForInvoice.room.cleaningFee)} ₫</span>
                  </div>
                )}
                {selectedBookingForInvoice.room?.serviceFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Phí dịch vụ HaviStay</span>
                    <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(selectedBookingForInvoice.room.serviceFee)} ₫</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng thanh toán</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {new Intl.NumberFormat("vi-VN").format(selectedBookingForInvoice.totalPrice)} ₫
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-right mt-1">Đã bao gồm VAT và phí dịch vụ</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 flex gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <Download size={18} />
                Tải hóa đơn (PDF)
              </button>
              <button
                onClick={() => setSelectedBookingForInvoice(null)}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSuccess={() => {
            // Optional: refresh trips or show success toast
            setSelectedBookingForReview(null);
            fetchMyTrips();
          }}
        />
      )}
    </div>
  );
}
