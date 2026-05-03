import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, Upload, Phone, CreditCard, Image as ImageIcon, Building2, User, FileText, Camera } from "lucide-react";
import { apiCall } from "../utils/api";

export default function BecomeHostPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);

  // Common fields
  const [verificationType, setVerificationType] = useState("PERSONAL");
  const [phone, setPhone] = useState("");

  // PERSONAL fields
  const [fullName, setFullName] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [cccdFrontImage, setCccdFrontImage] = useState(null);
  const [cccdBackImage, setCccdBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  // BUSINESS fields
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [representativeCCCD, setRepresentativeCCCD] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);

  const [previewUrls, setPreviewUrls] = useState({
    cccdFrontImage: null,
    cccdBackImage: null,
    selfieImage: null,
    businessLicense: null,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role === "HOST") {
      navigate("/");
    }
  }, [navigate]);

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'cccdFrontImage') setCccdFrontImage(file);
      if (field === 'cccdBackImage') setCccdBackImage(file);
      if (field === 'selfieImage') setSelfieImage(file);
      if (field === 'businessLicense') setBusinessLicense(file);

      setPreviewUrls((prev) => ({
        ...prev,
        [field]: URL.createObjectURL(file),
      }));
    }
  };

  const handleBecomeHost = async () => {
      if (!isAgreed) {
        setError("Bạn cần đồng ý với các quy định để tiếp tục.");
        return;
      }

      // Validate PERSONAL
      if (verificationType === "PERSONAL") {
        if (
          !fullName ||
          !cccdNumber ||
          !cccdFrontImage ||
          !cccdBackImage ||
          !selfieImage
        ) {
          setError("Vui lòng điền đầy đủ thông tin cá nhân và tải lên đủ ảnh.");
          return;
        }
      }

      // Validate BUSINESS
      if (verificationType === "BUSINESS") {
        if (
          !companyName ||
          !taxCode ||
          !legalRepresentative ||
          !representativeCCCD ||
          !businessLicense
        ) {
          setError("Vui lòng điền đầy đủ thông tin doanh nghiệp và giấy phép.");
          return;
        }
      }

      setIsLoading(true);
      setError("");

      try {
        const formData = new FormData();

        // Common
        formData.append("verificationType", verificationType);

        if (phone) {
          formData.append("phone", phone);
        }

        // PERSONAL
        if (verificationType === "PERSONAL") {
          formData.append("fullName", fullName);
          formData.append("cccdNumber", cccdNumber);
          formData.append("cccdFrontImage", cccdFrontImage);
          formData.append("cccdBackImage", cccdBackImage);
          formData.append("selfieImage", selfieImage);
        }

        // BUSINESS
        if (verificationType === "BUSINESS") {
          formData.append("companyName", companyName);
          formData.append("taxCode", taxCode);
          formData.append("legalRepresentative", legalRepresentative);
          formData.append("representativeCCCD", representativeCCCD);
          formData.append("businessLicense", businessLicense);
        }

        // Dùng apiCall trực tiếp vì FormData không được JSON.stringify
        const response = await apiCall("/users/become-host", {
          method: "PATCH",
          body: formData,

          // Quan trọng: bỏ Content-Type mặc định
          headers: {},
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể thực hiện yêu cầu");
        }

        setSuccess(true);
      } catch (err) {
        setError(err.message || "Không thể gửi yêu cầu");
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

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Gửi yêu cầu thành công!</h2>
          <p className="text-gray-600 text-sm">
            Hồ sơ xác minh của bạn đã được gửi. Quản trị viên sẽ xem xét và phản hồi trong thời gian sớm nhất.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full py-3 mt-6 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-gray-100 py-12">
      <div className="absolute inset-0 z-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 opacity-30 blur-[3px] scale-105 pointer-events-none">
        {destinations.map((dest, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden h-[400px] shadow-lg">
            <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[600px] mx-4 bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
        <div className="p-4 flex items-center border-b border-gray-50">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="ml-2 font-bold text-gray-800">Trở thành chủ nhà</span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 truncate">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Tài khoản</span>
              <p className="text-xs font-semibold truncate">{user?.name || "Người dùng"}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 truncate">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Email</span>
              <p className="text-xs font-semibold truncate">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-rose-500 pl-3">Loại hình đăng ký</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setVerificationType("PERSONAL")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  verificationType === "PERSONAL" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <User size={24} />
                <span className="font-bold text-sm">Cá nhân</span>
              </button>
              <button 
                onClick={() => setVerificationType("BUSINESS")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  verificationType === "BUSINESS" ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <Building2 size={24} />
                <span className="font-bold text-sm">Doanh nghiệp</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-l-4 border-rose-500 pl-3">Thông tin chi tiết</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1">Số điện thoại liên hệ (Tuỳ chọn)</label>
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

            {verificationType === "PERSONAL" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Họ và tên</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ và tên trên CCCD" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Số CCCD / Passport</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" value={cccdNumber} onChange={(e) => setCccdNumber(e.target.value)} placeholder="Nhập mã số định danh (12 số)" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UploadZone id="front" label="Mặt trước CCCD" icon={<FileText size={20}/>} previewUrl={previewUrls.cccdFrontImage} onChange={(e) => handleImageChange(e, 'cccdFrontImage')} />
                  <UploadZone id="back" label="Mặt sau CCCD" icon={<FileText size={20}/>} previewUrl={previewUrls.cccdBackImage} onChange={(e) => handleImageChange(e, 'cccdBackImage')} />
                  <UploadZone id="selfie" label="Ảnh Selfie cùng CCCD" icon={<Camera size={20}/>} previewUrl={previewUrls.selfieImage} onChange={(e) => handleImageChange(e, 'selfieImage')} className="md:col-span-2" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Tên doanh nghiệp</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Tên công ty/khách sạn" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 ml-1">Mã số thuế</label>
                  <input type="text" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="Mã số thuế doanh nghiệp" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 ml-1">Người đại diện</label>
                    <input type="text" value={legalRepresentative} onChange={(e) => setLegalRepresentative(e.target.value)} placeholder="Họ tên người đại diện" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 ml-1">CCCD người đại diện</label>
                    <input type="text" value={representativeCCCD} onChange={(e) => setRepresentativeCCCD(e.target.value)} placeholder="12 số" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                </div>

                <UploadZone id="license" label="Giấy phép kinh doanh" icon={<FileText size={20}/>} previewUrl={previewUrls.businessLicense} onChange={(e) => handleImageChange(e, 'businessLicense')} />
              </>
            )}
          </div>

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
                "Xác nhận và Gửi yêu cầu"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for uploading image
function UploadZone({ id, label, icon, previewUrl, onChange, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-gray-600 ml-1">{label}</label>
      <div 
        onClick={() => document.getElementById(`upload-${id}`).click()}
        className={`relative h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
          previewUrl ? "border-rose-500 bg-rose-50/30" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {previewUrl ? (
          <div className="relative w-full h-full p-1">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <ImageIcon className="text-white" size={24} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            {icon || <Upload className="mb-2" size={24} />}
            <span className="text-[10px] font-medium text-gray-500 mt-2">Tải ảnh lên</span>
          </div>
        )}
        <input 
          id={`upload-${id}`}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
