import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Star, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  iconSize: [35, 51],
  iconAnchor: [17, 51],
  popupAnchor: [1, -44],
  className: "marker-highlighted",
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function PropertiesByLocationPage() {
  const { location: locationParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allProperties, setAllProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Resolve search context: prefer query params over URL param
  const qLocation = searchParams.get("location") || locationParam || "";
  const qCheckIn = searchParams.get("checkIn") || "";
  const qCheckOut = searchParams.get("checkOut") || "";
  const qGuests = parseInt(searchParams.get("guests") || "1", 10);

  // Display label
  const displayLocation = qLocation || "Tất cả";

  // Build subtitle
  const searchSummary = [
    qCheckIn && `Nhận: ${qCheckIn}`,
    qCheckOut && `Trả: ${qCheckOut}`,
    qGuests > 1 && `${qGuests} khách`,
  ].filter(Boolean).join("  ·  ");

  // States for Pagination, Highlighting, and Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const itemsPerPage = 10;

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  // Use string states to allow clearing input fields freely
  const [priceMinInput, setPriceMinInput] = useState("0");
  const [priceMaxInput, setPriceMaxInput] = useState("10000000");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [activeFilter, setActiveFilter] = useState(null); // 'price' or 'type'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Build backend search URL
        const params = new URLSearchParams();
        if (qLocation) params.set("location", qLocation);
        if (qCheckIn) params.set("checkIn", qCheckIn);
        if (qCheckOut) params.set("checkOut", qCheckOut);
        if (qGuests > 1) params.set("guests", String(qGuests));

        const response = await fetch(`${API_URL}/properties/search?${params.toString()}`);
        const data = await response.json();
        setAllProperties(Array.isArray(data) ? data : []);

        const userData = localStorage.getItem("user");
        if (userData) {
          const wishResponse = await fetch(`${API_URL}/wishlists/my-wishlist`, { credentials: "include" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, locationParam]);

  // Frontend price/type filters on top of backend results
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      // Price Match
      const price = p.rooms?.[0]?.pricePerNight || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      if (!matchesPrice) return false;

      // Type Match
      if (selectedType !== "Tất cả") {
        const matchesType = p.title?.toLowerCase().includes(selectedType.toLowerCase());
        if (!matchesType) return false;
      }

      return true;
    });
  }, [allProperties, priceRange, selectedType]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, selectedType]);


  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

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

  // Count active filters for badge
  const activeFilterCount = [
    priceRange.min > 0 || priceRange.max < 10000000,
    selectedType !== "Tất cả",
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setPriceRange({ min: 0, max: 10000000 });
    setPriceMinInput("0");
    setPriceMaxInput("10000000");
    setSelectedType("Tất cả");
    setActiveFilter(null);
  };

  const mapCenter = useMemo(() => {
    const firstWithCoords = filteredProperties.find(p => p.latitude && p.longitude);
    if (firstWithCoords) return [firstWithCoords.latitude, firstWithCoords.longitude];

    const locLower = qLocation?.toLowerCase();
    if (locLower?.includes("hà nội")) return [21.0285, 105.8542];
    if (locLower?.includes("hồ chí minh") || locLower?.includes("hcm")) return [10.7765, 106.7009];
    if (locLower?.includes("khánh hòa") || locLower?.includes("nha trang")) return [12.2388, 109.1967];

    return [14.0583, 108.2772];
  }, [filteredProperties, qLocation]);

  const propertyTypes = ["Tất cả", "Căn hộ", "Homestay", "Villa", "Khách sạn", "Studio", "Nhà nghỉ", "Resort"];

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased flex flex-col h-screen overflow-hidden">
      <Header />

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-white z-[1001] sticky top-[80px] shadow-sm overflow-visible">
        <div className="flex items-center gap-4 overflow-visible relative">
          <button className="relative flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition shrink-0">
            <Filter size={16} /> Bộ lọc
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold transition shrink-0"
            >
              <X size={12} /> Xóa lọc
            </button>
          )}
          <div className="h-6 w-px bg-gray-200 mx-1 shrink-0"></div>

          {/* Price Filter Button */}
          <div className="relative">
            <button
              onClick={() => setActiveFilter(activeFilter === "price" ? null : "price")}
              className={`px-4 py-2 border rounded-full text-sm font-medium transition whitespace-nowrap ${priceRange.max < 10000000 || priceRange.min > 0 ? "border-black bg-gray-50" : "hover:border-gray-900"}`}
            >
              Mức giá {(priceRange.max < 10000000 || priceRange.min > 0) && "•"}
            </button>
            {activeFilter === "price" && (
              <div className="absolute top-12 left-0 w-80 bg-white border rounded-2xl shadow-2xl p-6 z-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Mức giá</h4>
                  <button onClick={() => setActiveFilter(null)}><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 border rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Tối thiểu (₫)</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={priceMinInput}
                        onChange={(e) => setPriceMinInput(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(priceMinInput, 10);
                          if (!isNaN(val)) setPriceRange(prev => ({ ...prev, min: val }));
                          else setPriceMinInput(String(priceRange.min));
                        }}
                        className="w-full text-sm font-semibold outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="flex-1 p-2 border rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Tối đa (₫)</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={priceMaxInput}
                        onChange={(e) => setPriceMaxInput(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(priceMaxInput, 10);
                          if (!isNaN(val)) setPriceRange(prev => ({ ...prev, max: val }));
                          else setPriceMaxInput(String(priceRange.max));
                        }}
                        className="w-full text-sm font-semibold outline-none"
                        placeholder="10000000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPriceRange({ min: 0, max: 10000000 });
                        setPriceMinInput("0");
                        setPriceMaxInput("10000000");
                      }}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-bold"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type Filter Button */}
          <div className="relative">
            <button
              onClick={() => setActiveFilter(activeFilter === "type" ? null : "type")}
              className={`px-4 py-2 border rounded-full text-sm font-medium transition whitespace-nowrap ${selectedType !== "Tất cả" ? "border-black bg-gray-50" : "hover:border-gray-900"}`}
            >
              Loại chỗ ở {selectedType !== "Tất cả" && `(${selectedType})`}
            </button>
            {activeFilter === "type" && (
              <div className="absolute top-12 left-0 w-64 bg-white border rounded-2xl shadow-2xl p-4 z-50">
                <div className="grid grid-cols-1 gap-1">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setActiveFilter(null);
                      }}
                      className={`text-left px-4 py-2 rounded-lg text-sm transition ${selectedType === type ? "bg-gray-100 font-bold" : "hover:bg-gray-50"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500">
          {filteredProperties.length} kết quả tại {displayLocation}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: List */}
        <div className="w-full lg:w-[60%] overflow-y-auto px-6 py-6 scroll-smooth bg-white">
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-bold">
            <button onClick={() => navigate("/")} className="hover:text-rose-500 transition">Trang chủ</button>
            <span>/</span>
            <span className="text-gray-900">{displayLocation}</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">
            Chỗ ở tại {displayLocation}
          </h1>
          {searchSummary && (
            <p className="text-sm text-gray-500 mb-6">{searchSummary}</p>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm mt-4">Đang tìm kiếm...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-xl font-bold">Không tìm thấy kết quả phù hợp</h2>
              <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc chọn khu vực khác.</p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Right: Map */}
        <div className="hidden lg:block lg:w-[40%] relative z-0 border-l">
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
            {filteredProperties.map((p) => {
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
