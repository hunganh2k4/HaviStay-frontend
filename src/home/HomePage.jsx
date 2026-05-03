import React, { useState, useEffect } from "react";
import "../index.css";
import { Heart, ChevronRight, Star, ChevronLeft } from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";
import { useNavigate } from "react-router-dom";

/* =========================
   MOCK DATA
========================= */
const staysHanoi = [
  {
    title: "Nhà phố tại Quận Hoàn Kiếm",
    price: "₫3.060.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Nơi ở tại Quận Tây Hồ",
    price: "₫1.039.765 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Phòng tại Quận Hoàn Kiếm",
    price: "₫716.283 cho 2 đêm · ★ 4.8",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Căn hộ tại Ba Đình",
    price: "₫1.250.000 cho 2 đêm · ★ 4.9",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    badge: "Chủ nhà siêu cấp",
  },
  {
    title: "Nhà tại Tây Hồ",
    price: "₫1.850.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Studio tại Long Biên",
    price: "₫980.000 cho 2 đêm · ★ 4.7",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Penthouse tại Cầu Giấy",
    price: "₫2.800.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    badge: "Chủ nhà siêu cấp",
  },
];

const staysSeoul = [
  ...staysHanoi.map((item, index) => ({
    ...item,
    title: `Chỗ ở Seoul ${index + 1}`,
  })),
];

/* =========================
   MAIN APP
========================= */
export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);
        const data = await response.json();
        setProperties(data);

        const userData = localStorage.getItem("user");
        if (userData) {
          const wishResponse = await fetch(`${API_URL}/wishlists/my-wishlist`, {
            credentials: "include",
          });
          if (wishResponse.ok) {
            const wishData = await wishResponse.json();
            setWishlistIds(new Set(wishData.map(item => item.id)));
          }
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const toggleWishlist = async (e, propertyId) => {
    e.stopPropagation();
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlists/toggle/${propertyId}`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const newWishlistIds = new Set(wishlistIds);
        if (data.isWishlisted) {
          newWishlistIds.add(propertyId);
        } else {
          newWishlistIds.delete(propertyId);
        }
        setWishlistIds(newWishlistIds);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const Section = ({ title, items, isRealData = false }) => (
    <section className="px-6 md:px-12 py-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold whitespace-nowrap">{title}</h2>
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {items.slice(0, 7).map((item, index) => (
          <div 
            key={item.id || index} 
            className="w-full min-w-0 cursor-pointer group"
            onClick={() => isRealData && item.id && navigate(`/properties/${item.id}`)}
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img
                src={isRealData ? (item.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750") : item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-[10px] font-bold shadow">
                {isRealData ? "Xác thực" : item.badge}
              </span>
              <button 
                onClick={(e) => isRealData ? toggleWishlist(e, item.id) : null}
                className={`absolute top-2 right-2 p-1.5 rounded-full shadow hover:scale-110 transition-all ${
                  isRealData && wishlistIds.has(item.id) 
                    ? "bg-rose-500 text-white" 
                    : "bg-white/90 text-gray-400 hover:text-rose-500"
                }`}
              >
                <Heart size={14} fill={isRealData && wishlistIds.has(item.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="mt-2">
              <h3 className="font-semibold text-xs line-clamp-2">{item.title}</h3>
              <p className="text-gray-500 text-[11px] line-clamp-2">
                {isRealData 
                  ? `₫${item.rooms?.[0]?.pricePerNight?.toLocaleString() || "---"} / đêm` 
                  : item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased">
      <Header />

      {/* Real Properties Section */}
      {!isLoading && properties.length > 0 && (
        <Section 
          title="Nơi lưu trú nổi bật" 
          items={properties} 
          isRealData={true} 
        />
      )}

      <Section
        title="Nơi lưu trú được ưa chuộng tại Hà Nội"
        items={staysHanoi}
      />

      <Section
        title="Chỗ ở được yêu thích tại Seoul"
        items={staysSeoul}
      />
    </div>
  );
}
