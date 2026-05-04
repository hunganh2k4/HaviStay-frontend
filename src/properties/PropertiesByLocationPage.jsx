import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Star, Map as MapIcon, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import API_URL from "../config/config";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet icon issues
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

let HighlightedIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [35, 51], // Larger
  iconAnchor: [17, 51],
  popupAnchor: [1, -44],
  className: "marker-highlighted",
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map centering
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function PropertiesByLocationPage() {
  const { location } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // New States for Pagination and Highlighting
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);
        const data = await response.json();
        const filtered = data.filter(p => p.location?.toLowerCase().includes(location?.toLowerCase()));
        setProperties(filtered);

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
    fetchData();
  }, [location]);

  // Pagination Logic
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return properties.slice(startIndex, startIndex + itemsPerPage);
  }, [properties, currentPage]);

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

  const mapCenter = useMemo(() => {
    const firstWithCoords = properties.find(p => p.latitude && p.longitude);
    if (firstWithCoords) return [firstWithCoords.latitude, firstWithCoords.longitude];

    const locLower = location?.toLowerCase();
    if (locLower?.includes("hà nội")) return [21.0285, 105.8542];
    if (locLower?.includes("hồ chí minh") || locLower?.includes("hcm")) return [10.7765, 106.7009];
    if (locLower?.includes("khánh hòa") || locLower?.includes("nha trang")) return [12.2388, 109.1967];

    return [14.0583, 108.2772];
  }, [properties, location]);

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased flex flex-col h-screen">
      <Header />

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-white z-10 sticky top-[80px] shadow-sm">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            <Filter size={16} /> Bộ lọc
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <button className="px-4 py-2 border rounded-full text-sm font-medium hover:border-gray-900 transition whitespace-nowrap">Mức giá</button>
          <button className="px-4 py-2 border rounded-full text-sm font-medium hover:border-gray-900 transition whitespace-nowrap">Loại chỗ ở</button>
          <button className="px-4 py-2 border rounded-full text-sm font-medium hover:border-gray-900 transition whitespace-nowrap">Tiện nghi</button>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, properties.length)} của {properties.length} kết quả
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: List (60% width) */}
        <div className="w-full lg:w-[60%] overflow-y-auto px-6 py-6 scroll-smooth bg-white">
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-bold">
            <button onClick={() => navigate("/")} className="hover:text-rose-500 transition">Trang chủ</button>
            <span>/</span>
            <span className="text-gray-900">{location}</span>
          </div>

          <h1 className="text-2xl font-bold mb-8">
            Chỗ ở tại {location}
          </h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-xl font-bold">Không tìm thấy chỗ ở nào</h2>
              <p className="text-gray-500 mt-2">Vui lòng thử lại với khu vực khác.</p>
            </div>
          ) : (
            <>
              {/* Strictly 2 columns on medium+ screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10 pb-10">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-300"
                    onClick={() => navigate(`/properties/${item.id}`)}
                    onMouseEnter={() => setHoveredPropertyId(item.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md">
                      <img
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <button
                        onClick={(e) => toggleWishlist(e, item.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${wishlistIds.has(item.id)
                            ? "bg-rose-500 text-white"
                            : "bg-white/80 text-gray-600 hover:text-rose-500"
                          }`}
                      >
                        <Heart size={18} fill={wishlistIds.has(item.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-rose-600 transition-colors">{item.title}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-current text-gray-900" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-1">{item.address}</p>
                      <div className="pt-1">
                        <span className="text-base font-bold">₫{item.rooms?.[0]?.pricePerNight?.toLocaleString() || "---"}</span>
                        <span className="text-gray-500 text-sm font-normal"> / đêm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-10 border-t border-gray-100">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition ${currentPage === i + 1 ? "bg-black text-white" : "hover:bg-gray-100"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <div className="pb-20 text-center text-xs text-gray-500">
                Hiển thị {properties.length} kết quả tại {location}
              </div>
            </>
          )}
        </div>

        {/* Right: Map (40% width) */}
        <div className="hidden lg:block lg:w-[40%] relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <ChangeView center={mapCenter} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((p) => {
              const isHovered = hoveredPropertyId === p.id;
              return p.latitude && p.longitude && (
                <Marker
                  key={p.id}
                  position={[p.latitude, p.longitude]}
                  icon={isHovered ? HighlightedIcon : DefaultIcon}
                  zIndexOffset={isHovered ? 1000 : 0}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px] cursor-pointer" onClick={() => navigate(`/properties/${p.id}`)}>
                      <img src={p.images?.[0]} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                      <h4 className="font-bold text-sm line-clamp-1">{p.title}</h4>
                      <p className="text-rose-500 font-bold text-xs mt-1">₫{p.rooms?.[0]?.pricePerNight?.toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
