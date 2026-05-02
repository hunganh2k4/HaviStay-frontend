import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, Upload, Phone, CreditCard, Image as ImageIcon } from "lucide-react";
import API_URL from "../config/config";

export default function BecomeHostPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);

  // New fields
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [cccdImage, setCccdImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role === "HOST") {
      // Already a host
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCccdImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBecomeHost = async () => {
    if (!phone || !cccdNumber || !cccdImage) {
      setError("Vui lòng điền đầy đủ thông tin: Số điện thoại, CCCD và ảnh CCCD.");
      return;
    }

    if (!isAgreed) {
      setError("Bạn cần đồng ý với các quy định để tiếp tục.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("cccdNumber", cccdNumber);
      formData.append("cccdImage", cccdImage);

      const response = await fetch(`${API_URL}/users/become-host`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể thực hiện yêu cầu");
      }

      // Update local storage user data with new token
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const destinations = [
    { name: "TORONTO", img: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?q=80&w=400&h=600&auto=format&fit=crop" },
    { name: "PARIS", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=600&auto=format&fit=crop" },
    { name: "CIUDAD DE MÉXICO", img: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400&h=600&auto=format&fit=crop" },
    { name: "MEDELLÍN", img: "https://images.unsplash.com/photo-1595180050854-52d37f1e6833?q=80&w=400&h=600&auto=format&fit=crop" },
    { name: "MIAMI", img: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?q=80&w=400&h=600&auto=format&fit=crop" },
    { name: "PERTH", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&h=600&auto=format&fit=crop" },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-100 py-12">
      {/* Background Cards */}
      <div className="absolute inset-0 z-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 opacity-30 blur-[3px] scale-105 pointer-events-none">
        {destinations.map((dest, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden h-[400px] shadow-lg">
            <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Foreground Modal - COMPACT VERSION */}
      <div className="relative z-10 w-full max-w-[480px] mx-4 bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 flex items-center border-b border-gray-50">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="ml-2 font-bold text-gray-800">Trở thành chủ nhà</span>
        </div>

        {/* Content */}
        <div className="p-8 space-y-5">
          {/* User Info (Read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Ngày sinh</span>
              <p className="text-xs font-semibold">04 / 07 / 2004</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 truncate">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Email</span>
              <p className="text-xs font-semibold truncate">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-rose-500 pl-3">Thông tin định danh</h3>
            
            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* CCCD Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1">Số CCCD / Passport</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Nhập mã số định danh"
                  value={cccdNumber}
                  onChange={(e) => setCccdNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* CCCD Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1">Ảnh mặt trước CCCD</label>
              <div 
                onClick={() => document.getElementById('cccd-upload').click()}
                className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  previewUrl ? "border-rose-500 bg-rose-50/30" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-2">
                    <img src={previewUrl} alt="CCCD Preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                      <ImageIcon className="text-white" size={24} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <span className="text-[11px] font-medium text-gray-500">Tải lên ảnh định danh</span>
                  </>
                )}
                <input 
                  id="cccd-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <button 
                onClick={() => setIsAgreed(!isAgreed)}
                className={`mt-0.5 w-5 h-5 min-w-[20px] rounded border-2 flex items-center justify-center transition-all ${
                  isAgreed ? "bg-black border-black" : "border-gray-300 bg-white"
                }`}
              >
                {isAgreed && <Check size={12} className="text-white" />}
              </button>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Tôi đồng ý cung cấp thông tin định danh và tuân thủ <Link to="/terms" className="text-blue-600 font-bold">Chính sách Host</Link> của HaviStay.
              </p>
            </div>
          </div>

          {error && <p className="text-[11px] text-rose-500 font-bold bg-rose-50 p-2 rounded-lg text-center">{error}</p>}

          <button
            onClick={handleBecomeHost}
            disabled={isLoading}
            className={`w-full py-3.5 bg-[#222222] hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            ) : (
                "Xác nhận và Hoàn tất"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
