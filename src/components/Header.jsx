import React, { useState, useEffect } from "react";
import { Search, Globe, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/config";

export default function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const user = localStorage.getItem("user");
      if (!user) return;

      try {
        const response = await fetch(`${API_URL}/chat/unread-count`, {
          credentials: "include",
        });
        if (response.ok) {
          const count = await response.json();
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 bg-white transition-all duration-300 border-b ${
        isScrolled ? "py-1 shadow-md border-gray-100" : "py-0 border-gray-50"
      } antialiased`}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between px-6 md:px-12 py-3 transition-all duration-300">
        {/* Logo */}
        <div 
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-rose-500 tracking-tight cursor-pointer"
        >
          HaviStay
        </div>

        {/* Navigation & Compact Search Transition */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md flex justify-center">
            {/* Middle Nav Links (Visible when NOT scrolled) */}
            <nav 
              className={`flex items-center gap-8 text-sm font-semibold text-gray-500 transition-all duration-300 ${
                isScrolled ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
              }`}
            >
              <div className="text-black border-b-2 border-black pb-1 cursor-pointer">
                Nơi lưu trú
              </div>
              <div className="hover:text-black cursor-pointer transition">
                Trải nghiệm
              </div>
              <div className="hover:text-black cursor-pointer transition">
                Dịch vụ
              </div>
            </nav>

            {/* Compact Search Bar (Visible when scrolled) */}
            <div 
              className={`flex border rounded-full shadow-sm px-4 py-1.5 items-center gap-4 hover:shadow-md transition-all duration-300 cursor-pointer ${
                isScrolled ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
              }`}
            >
              <span className="text-sm font-semibold">Địa điểm bất kỳ</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm font-semibold">Tuần bất kỳ</span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-500">Thêm khách</span>
              <button className="bg-rose-500 text-white p-1.5 rounded-full">
                <Search size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <span 
            onClick={() => {
              const userData = localStorage.getItem("user");
              if (userData) {
                const user = JSON.parse(userData);
                if (user.role === "HOST" || user.role === "ADMIN") {
                  navigate("/host/properties");
                } else {
                  navigate("/become-a-host");
                }
              } else {
                navigate("/login");
              }
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
                  ) : (
                    JSON.parse(localStorage.getItem("user")).name.charAt(0)
                  )}
                </div>
              ) : (
                <div className="w-7 h-7 bg-gray-500 rounded-full"></div>
              )}
            </button>

            {/* User Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-2">
              {!localStorage.getItem("user") ? (
                <>
                  <div 
                    onClick={() => navigate("/login")}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer font-semibold text-sm"
                  >
                    Đăng nhập
                  </div>
                  <div 
                    onClick={() => navigate("/register")}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
                  >
                    Đăng ký
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold truncate">{JSON.parse(localStorage.getItem("user")).name}</p>
                    <p className="text-xs text-gray-500 truncate">{JSON.parse(localStorage.getItem("user")).email}</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold">
                    Tin nhắn
                  </div>
                  <div 
                    onClick={() => navigate("/trips")}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold"
                  >
                    Chuyến đi
                  </div>
                  {(JSON.parse(localStorage.getItem("user")).role === "HOST" || JSON.parse(localStorage.getItem("user")).role === "ADMIN") && (
                    <div 
                      onClick={() => navigate("/host/properties")}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-bold text-rose-500"
                    >
                      Quản lý chỗ nghỉ
                    </div>
                  )}
                  <div 
                    onClick={() => navigate("/messages")}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold border-b border-gray-100 mb-1 flex items-center justify-between"
                  >
                    <span>Tin nhắn</span>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div 
                    onClick={() => navigate("/wishlist")}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold border-b border-gray-100 mb-1"
                  >
                    Danh sách yêu thích
                  </div>
                  <div 
                    onClick={async () => {
                      try {
                        await fetch(`${API_URL || "http://localhost:5000/api"}/auth/logout`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include", // Send cookies
                        });
                      } catch (err) {
                        console.error("Logout error:", err);
                      } finally {
                        localStorage.removeItem("user");
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-rose-500 font-semibold"
                  >
                    Đăng xuất
                  </div>
                </>
              )}
              <div className="px-4 py-3 border-t border-gray-100 mt-1 hover:bg-gray-50 cursor-pointer text-sm">
                Trung tâm trợ giúp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row (Large Search Bar - Visible when NOT scrolled) */}
      <div 
        className={`px-6 md:px-12 pb-4 transition-all duration-300 origin-top ${
          isScrolled ? "h-0 opacity-0 pointer-events-none -translate-y-4" : "h-auto opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition flex flex-col md:flex-row items-center overflow-hidden">
          <div className="flex-1 px-6 py-2.5 border-b md:border-b-0 md:border-r hover:bg-gray-100 cursor-pointer transition">
            <p className="font-bold text-[11px] uppercase tracking-wider">Địa điểm</p>
            <p className="text-gray-500 text-sm">Tìm kiếm điểm đến</p>
          </div>

          <div className="flex-1 px-6 py-2.5 border-b md:border-b-0 md:border-r hover:bg-gray-100 cursor-pointer transition">
            <p className="font-bold text-[11px] uppercase tracking-wider">Thời gian</p>
            <p className="text-gray-500 text-sm">Thêm ngày</p>
          </div>

          <div className="flex-1 px-6 py-2.5 hover:bg-gray-100 cursor-pointer transition">
            <p className="font-bold text-[11px] uppercase tracking-wider">Khách</p>
            <p className="text-gray-500 text-sm">Thêm khách</p>
          </div>

          <button className="m-1.5 bg-rose-500 hover:bg-rose-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
            <Search size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
