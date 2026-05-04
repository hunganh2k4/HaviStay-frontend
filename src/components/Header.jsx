import React, { useState, useEffect, useRef } from "react";
import { Search, Globe, Menu, ChevronLeft, ChevronRight, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/config";

const LOCATION_SUGGESTIONS = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Khánh Hòa",
  "Hội An", "Phú Quốc", "Đà Lạt", "Huế", "Vũng Tàu", "Hạ Long", "Sapa",
];

function MiniCalendar({ value, onChange, minDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(value?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() || today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Convert Sunday-first to Monday-first
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const MONTHS = ["Th.1", "Th.2", "Th.3", "Th.4", "Th.5", "Th.6", "Th.7", "Th.8", "Th.9", "Th.10", "Th.11", "Th.12"];

  return (
    <div className="w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={16} /></button>
        <span className="text-sm font-bold">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 text-center mb-2">
        {DAYS.map(d => <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-1">
        {[...Array(startOffset)].map((_, i) => <div key={`e-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isSelected = value && date.toDateString() === value.toDateString();
          const isPast = minDate ? date < minDate : date < today;
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onChange(date)}
              className={`w-8 h-8 text-sm rounded-full mx-auto transition ${isSelected ? "bg-black text-white" :
                  isPast ? "text-gray-300 cursor-not-allowed" :
                    "hover:bg-gray-100"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [activeField, setActiveField] = useState(null); // 'location' | 'checkin' | 'checkout' | 'guests'
  const [locationInput, setLocationInput] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [suggestions, setSuggestions] = useState([]);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const user = localStorage.getItem("user");
      if (!user) return;
      try {
        const response = await fetch(`${API_URL}/chat/unread-count`, { credentials: "include" });
        if (response.ok) setUnreadCount(await response.json());
      } catch (err) { }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (locationInput.trim().length > 0) {
      const filtered = LOCATION_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(locationInput.toLowerCase())
      );
      setSuggestions(filtered.length > 0 ? filtered : LOCATION_SUGGESTIONS.slice(0, 5));
    } else {
      setSuggestions(LOCATION_SUGGESTIONS.slice(0, 6));
    }
  }, [locationInput]);

  const formatDate = (date) => {
    if (!date) return null;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (locationInput.trim()) params.set("location", locationInput.trim());
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0]);
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0]);
    if (guests > 0) params.set("guests", String(guests));
    navigate(`/search?${params.toString()}`);
    setActiveField(null);
  };

  const hasSearchInput = locationInput || checkIn || guests > 1;

  return (
    <header className={`sticky top-0 z-[1100] bg-white transition-all duration-300 border-b ${isScrolled ? "py-1 shadow-md border-gray-100" : "py-0 border-gray-50"} antialiased`}>
      {/* Top Row */}
      <div className="flex items-center justify-between px-6 md:px-12 py-3 transition-all duration-300">
        {/* Logo */}
        <div onClick={() => navigate("/")} className="text-2xl font-bold text-rose-500 tracking-tight cursor-pointer shrink-0">
          HaviStay
        </div>

        {/* Center: Nav or Compact Search */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md flex justify-center">
            {/* Nav Links */}
            <nav className={`flex items-center gap-8 text-sm font-semibold text-gray-500 transition-all duration-300 ${isScrolled ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"}`}>
              <div className="text-black border-b-2 border-black pb-1 cursor-pointer">Nơi lưu trú</div>
              <div className="hover:text-black cursor-pointer transition">Trải nghiệm</div>
              <div className="hover:text-black cursor-pointer transition">Dịch vụ</div>
            </nav>

            {/* Compact Search Bar */}
            <div
              onClick={() => { setActiveField("location"); }}
              className={`flex border rounded-full shadow-sm px-4 py-1.5 items-center gap-3 hover:shadow-md transition-all duration-300 cursor-pointer ${isScrolled ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"}`}
            >
              <span className="text-sm font-semibold">{locationInput || "Địa điểm bất kỳ"}</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm font-semibold">{checkIn ? formatDate(checkIn) : "Nhận phòng"}</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-500">{guests > 1 ? `${guests} khách` : "Thêm khách"}</span>
              <button onClick={(e) => { e.stopPropagation(); handleSearch(); }} className="bg-rose-500 text-white p-1.5 rounded-full">
                <Search size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            onClick={() => {
              const userData = localStorage.getItem("user");
              if (userData) {
                const user = JSON.parse(userData);
                if (user.role === "HOST" || user.role === "ADMIN") navigate("/host/properties");
                else navigate("/become-a-host");
              } else navigate("/login");
            }}
            className="hidden md:block text-sm font-semibold hover:bg-gray-50 px-3 py-2 rounded-full cursor-pointer transition"
          >
            {localStorage.getItem("user") && (JSON.parse(localStorage.getItem("user")).role === "HOST" || JSON.parse(localStorage.getItem("user")).role === "ADMIN") ? "Quản lý chỗ nghỉ" : "Trở thành host"}
          </span>

          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:shadow-md transition">
            <Globe size={16} />
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 border border-gray-200 pl-3 pr-2 py-1.5 rounded-full hover:shadow-md transition bg-white">
              <Menu size={16} />
              {localStorage.getItem("user") ? (
                <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase overflow-hidden">
                  {JSON.parse(localStorage.getItem("user")).avatar ? (
                    <img src={JSON.parse(localStorage.getItem("user")).avatar} alt="" className="w-full h-full object-cover" />
                  ) : JSON.parse(localStorage.getItem("user")).name.charAt(0)}
                </div>
              ) : <div className="w-7 h-7 bg-gray-500 rounded-full"></div>}
            </button>

            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-2">
              {!localStorage.getItem("user") ? (
                <>
                  <div onClick={() => navigate("/login")} className="px-4 py-3 hover:bg-gray-50 cursor-pointer font-semibold text-sm">Đăng nhập</div>
                  <div onClick={() => navigate("/register")} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-600">Đăng ký</div>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold truncate">{JSON.parse(localStorage.getItem("user")).name}</p>
                    <p className="text-xs text-gray-500 truncate">{JSON.parse(localStorage.getItem("user")).email}</p>
                  </div>
                  <div onClick={() => navigate("/trips")} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold">Chuyến đi</div>
                  {(JSON.parse(localStorage.getItem("user")).role === "HOST" || JSON.parse(localStorage.getItem("user")).role === "ADMIN") && (
                    <>
                      <div onClick={() => navigate("/host/properties")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-bold text-rose-500">Quản lý chỗ nghỉ</div>
                      <div onClick={() => navigate("/host/earnings")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700">Thống kê thu nhập</div>
                    </>
                  )}
                  <div onClick={() => navigate("/messages")} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span>Tin nhắn</span>
                    {unreadCount > 0 && <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                  </div>
                  <div onClick={() => navigate("/wishlist")} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold border-b border-gray-100 mb-1">Danh sách yêu thích</div>
                  <div
                    onClick={async () => {
                      try { await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); } catch { }
                      finally { localStorage.removeItem("user"); window.location.reload(); }
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-rose-500 font-semibold"
                  >
                    Đăng xuất
                  </div>
                </>
              )}
              <div className="px-4 py-3 border-t border-gray-100 mt-1 hover:bg-gray-50 cursor-pointer text-sm">Trung tâm trợ giúp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Search Bar Row */}
      <div className={`px-6 md:px-12 pb-4 transition-all duration-300 origin-top ${isScrolled ? "h-0 opacity-0 pointer-events-none -translate-y-4" : "h-auto opacity-100 translate-y-0"}`}>
        <div ref={searchRef} className="relative max-w-3xl mx-auto">
          <div className={`bg-white border rounded-full shadow-md hover:shadow-lg transition flex items-center overflow-visible ${activeField ? "ring-2 ring-gray-200 shadow-xl" : ""}`}>
            {/* Location */}
            <div
              onClick={() => setActiveField("location")}
              className={`flex-1 px-6 py-3 cursor-pointer rounded-full transition ${activeField === "location" ? "bg-white shadow-md" : "hover:bg-gray-100"}`}
            >
              <p className="font-bold text-[11px] uppercase tracking-wider">Địa điểm</p>
              <input
                value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); setActiveField("location"); }}
                onFocus={() => setActiveField("location")}
                placeholder="Tìm kiếm điểm đến"
                className="w-full text-sm text-gray-600 bg-transparent outline-none placeholder-gray-400 mt-0.5"
              />
            </div>

            <div className="w-px h-8 bg-gray-200 shrink-0"></div>

            {/* Check-in */}
            <div
              onClick={() => setActiveField("checkin")}
              className={`flex-1 px-6 py-3 cursor-pointer rounded-full transition ${activeField === "checkin" ? "bg-white shadow-md" : "hover:bg-gray-100"}`}
            >
              <p className="font-bold text-[11px] uppercase tracking-wider">Nhận phòng</p>
              <p className={`text-sm mt-0.5 ${checkIn ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {checkIn ? checkIn.toLocaleDateString("vi-VN") : "Thêm ngày"}
              </p>
            </div>

            <div className="w-px h-8 bg-gray-200 shrink-0"></div>

            {/* Check-out */}
            <div
              onClick={() => setActiveField("checkout")}
              className={`flex-1 px-6 py-3 cursor-pointer rounded-full transition ${activeField === "checkout" ? "bg-white shadow-md" : "hover:bg-gray-100"}`}
            >
              <p className="font-bold text-[11px] uppercase tracking-wider">Trả phòng</p>
              <p className={`text-sm mt-0.5 ${checkOut ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {checkOut ? checkOut.toLocaleDateString("vi-VN") : "Thêm ngày"}
              </p>
            </div>

            <div className="w-px h-8 bg-gray-200 shrink-0"></div>

            {/* Guests */}
            <div
              onClick={() => setActiveField("guests")}
              className={`flex-1 px-6 py-3 cursor-pointer rounded-full transition ${activeField === "guests" ? "bg-white shadow-md" : "hover:bg-gray-100"}`}
            >
              <p className="font-bold text-[11px] uppercase tracking-wider">Khách</p>
              <p className={`text-sm mt-0.5 ${guests > 0 ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {guests > 0 ? `${guests} khách` : "Thêm khách"}
              </p>
            </div>

            <button
              onClick={handleSearch}
              className={`m-2 flex items-center gap-2 text-white rounded-full px-4 py-2.5 font-bold text-sm transition shrink-0 ${hasSearchInput ? "bg-rose-500 hover:bg-rose-600 pr-5" : "bg-rose-500 hover:bg-rose-600 w-10 justify-center"}`}
            >
              <Search size={16} />
              {hasSearchInput && <span>Tìm</span>}
            </button>
          </div>

          {/* Dropdowns */}
          {activeField === "location" && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[1200]">
              <p className="text-xs font-bold uppercase text-gray-500 mb-3">Gợi ý địa điểm</p>
              <div className="space-y-1">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setLocationInput(s); setActiveField("checkin"); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition flex items-center gap-3"
                  >
                    <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base">📍</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeField === "checkin" && (
            <div className="absolute top-full mt-2 left-1/4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-[1200]">
              <p className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2"><Calendar size={12} /> Chọn ngày nhận phòng</p>
              <MiniCalendar
                value={checkIn}
                onChange={(d) => { setCheckIn(d); setActiveField("checkout"); }}
                minDate={new Date()}
              />
            </div>
          )}

          {activeField === "checkout" && (
            <div className="absolute top-full mt-2 left-2/4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-[1200]">
              <p className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2"><Calendar size={12} /> Chọn ngày trả phòng</p>
              <MiniCalendar
                value={checkOut}
                onChange={(d) => { setCheckOut(d); setActiveField("guests"); }}
                minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
              />
            </div>
          )}

          {activeField === "guests" && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-[1200]">
              <p className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><Users size={12} /> Số lượng khách</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Khách</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-600 transition font-bold disabled:opacity-30"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-base">{guests}</span>
                  <button
                    onClick={() => setGuests(g => Math.min(20, g + 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-600 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full mt-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition"
              >
                Tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
