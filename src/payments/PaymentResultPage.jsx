import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Home, Calendar, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSuccess = searchParams.get("success") === "true";
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (bookingId) {
      fetch(`${API_URL}/bookings/${bookingId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setBooking(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-[40px] p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
          {isSuccess ? (
            <div className="animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={64} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold mb-3">Thanh toán thành công!</h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Cảm ơn bạn đã tin tưởng HaviStay. Đơn đặt phòng của bạn đã được xác nhận thành công.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle size={64} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold mb-3">Thanh toán thất bại</h1>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </p>
            </div>
          )}

          {booking && (
            <div className="border-t border-b border-gray-100 py-8 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Mã đặt phòng</span>
                <span className="text-sm font-bold font-mono">{booking.id.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Chỗ nghỉ</span>
                <span className="text-sm font-bold">{booking.room?.property?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Phòng</span>
                <span className="text-sm font-bold">{booking.room?.name}</span>
              </div>
              <div className="flex justify-between items-center text-rose-500">
                <span className="text-sm font-semibold">Tổng số tiền</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(booking.totalPrice)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
            >
              <Home size={18} />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate(isSuccess ? "/trips" : `/properties/${booking?.room?.propertyId}`)}
              className={`flex items-center justify-center gap-2 px-6 py-4 text-white font-bold rounded-2xl transition-all shadow-lg ${
                isSuccess ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-black hover:bg-gray-800 shadow-gray-200"
              }`}
            >
              {isSuccess ? (
                <>
                  <Calendar size={18} />
                  Xem chuyến đi
                </>
              ) : (
                <>
                  <span>Thử lại</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
