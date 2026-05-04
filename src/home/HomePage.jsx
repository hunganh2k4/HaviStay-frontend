import React, { useState, useEffect, useMemo } from "react";
import "../index.css";
import { Heart, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";
import { useNavigate } from "react-router-dom";

/* =========================
   MAIN APP
========================= */
export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
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

  // Group properties by location
  const groupedProperties = useMemo(() => {
    return properties.reduce((acc, property) => {
      const location = property.location || "Khác";
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(property);
      return acc;
    }, {});
  }, [properties]);

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

  const toggleExpand = (location) => {
    setExpandedSections(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  };

  const Section = ({ title, items, locationKey }) => {
    const isExpanded = expandedSections[locationKey];
    // Initially show 7 items (original logic), then show all if expanded
    const displayItems = isExpanded ? items : items.slice(0, 7);
    const hasMore = items.length > 7;

    return (
      <section className="px-6 md:px-12 py-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl md:text-2xl font-bold whitespace-nowrap">{title}</h2>
          {hasMore && (
            <button
              onClick={() => navigate(`/search/${locationKey}`)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              title="Xem tất cả"
            >
              <ChevronRight
                size={20}
              />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="w-full min-w-0 cursor-pointer group"
              onClick={() => navigate(`/properties/${item.id}`)}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                <img
                  src={item.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <button
                  onClick={(e) => toggleWishlist(e, item.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow hover:scale-110 transition-all ${wishlistIds.has(item.id)
                    ? "bg-rose-500 text-white"
                    : "bg-white/90 text-gray-400 hover:text-rose-500"
                    }`}
                >
                  <Heart size={14} fill={wishlistIds.has(item.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-xs line-clamp-2">{item.title}</h3>
                <p className="text-gray-500 text-[11px] line-clamp-2">
                  ₫{item.rooms?.[0]?.pricePerNight?.toLocaleString() || "---"} / đêm
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased">
      <Header />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold">Chưa có chỗ ở nào</h2>
          <p className="text-gray-500 mt-2">Hãy quay lại sau để khám phá thêm những địa điểm mới nhé.</p>
        </div>
      ) : (
        <div className="pb-10">
          {Object.keys(groupedProperties).sort().map(location => (
            <Section
              key={location}
              title={location}
              locationKey={location}
              items={groupedProperties[location]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
