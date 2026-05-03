import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, MapPin, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWishlist = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlists/my-wishlist`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Không thể tải danh sách yêu thích.");

      const data = await response.json();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (e, propertyId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/wishlists/toggle/${propertyId}`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setWishlist(wishlist.filter(item => item.id !== propertyId));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Danh sách yêu thích</h1>
          <p className="text-gray-500 text-sm font-medium">Những nơi lưu trú bạn đã lưu để xem lại sau</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Danh sách trống</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Hãy lưu lại những chỗ nghỉ bạn yêu thích bằng cách nhấn vào biểu tượng trái tim.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-100 active:scale-95">
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(property => (
              <div
                key={property.id}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <button
                    onClick={(e) => removeFromWishlist(e, property.id)}
                    className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base text-gray-900 line-clamp-1 flex-1 mr-2">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm font-bold">
                      <Star size={14} className="text-black fill-current" />
                      <span>{property.reviews?.length > 0 ? (property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length).toFixed(1) : "---"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-4">
                    <MapPin size={12} className="text-rose-500" />
                    {property.location}
                  </p>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Giá từ</p>
                      <p className="font-bold text-rose-500">
                        {property.rooms?.[0]?.pricePerNight ?
                          new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(property.rooms[0].pricePerNight)
                          : "---"}
                        <span className="text-[10px] text-gray-400 font-normal ml-1">/ đêm</span>
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
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
