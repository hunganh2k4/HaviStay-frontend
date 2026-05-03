import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Upload,
  MapPin,
  Info,
  X,
  Globe,
  ChevronRight,
  Settings
} from "lucide-react";
import API_URL from "../config/config";
import Header from "../components/Header";

export default function EditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("Việt Nam");
  const [address, setAddress] = useState("");

  // Existing images (URLs)
  const [existingImages, setExistingImages] = useState([]);

  // New images (Files)
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const fetchProperty = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(userData);
      if (user.role !== "HOST" && user.role !== "ADMIN") {
        navigate("/become-a-host");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/properties/${id}`);
        if (!response.ok) {
          throw new Error("Không thể tải thông tin chỗ nghỉ.");
        }

        const data = await response.json();

        // Check ownership
        if (data.hostId !== user.id && user.role !== "HOST") {
          throw new Error("Bạn không có quyền chỉnh sửa chỗ nghỉ này.");
        }

        setTitle(data.title);
        setDescription(data.description);
        setLocation(data.location);
        setCountry(data.country);
        setAddress(data.address);
        setExistingImages(data.images || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 10) {
      setError("Bạn chỉ có thể có tối đa 10 ảnh.");
      return;
    }

    const newFilesList = [...newImages, ...files];
    setNewImages(newFilesList);

    const newPreviewsList = files.map(file => URL.createObjectURL(file));
    setNewPreviews([...newPreviews, ...newPreviewsList]);
    setError("");
  };

  const removeExistingImage = (index) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
  };

  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);

    const updatedPreviews = [...newPreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setNewPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      setError("Vui lòng có ít nhất 1 ảnh cho chỗ nghỉ của bạn.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("country", country);
      formData.append("address", address);

      // Append existing image URLs
      existingImages.forEach(image => {
        formData.append("images", image);
      });

      // Append new image files
      newImages.forEach(image => {
        formData.append("images", image);
      });

      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật chỗ nghỉ. Vui lòng thử lại.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/host/properties");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center antialiased">
        <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Đang tải thông tin...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white antialiased">
        <div className="text-center animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Cập nhật thành công!</h2>
          <p className="text-gray-500 font-medium">Chỗ nghỉ của bạn đã được lưu thay đổi.</p>
          <div className="mt-10 flex items-center justify-center gap-2 text-rose-500 font-bold text-sm">
            <span>Đang chuyển hướng</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-2xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group"
          >
            <div className="p-2 group-hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-bold">Quay lại</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full">
            <Settings size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chỉnh sửa</span>
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Chỉnh sửa chỗ nghỉ</h1>
          <p className="text-gray-500 text-sm">Cập nhật thông tin chi tiết về không gian của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Basic Info */}
          <section className="space-y-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">01. Thông tin cơ bản</h2>
            <div className="space-y-5">
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-500">Tên chỗ nghỉ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Căn hộ cao cấp view biển Mỹ Khê"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-500">Mô tả chi tiết</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả về không gian, tiện ích và điều gì khiến chỗ nghỉ của bạn đặc biệt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section: Location */}
          <section className="space-y-6 pt-6 border-t border-gray-50">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">02. Vị trí</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-500">Quốc gia</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-gray-800"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-500">Thành phố / Tỉnh</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đà Nẵng"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="md:col-span-2 group">
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-rose-500">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                />
              </div>
            </div>
          </section>

          {/* Section: Images */}
          <section className="space-y-6 pt-6 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">03. Hình ảnh</h2>
              <span className="text-[10px] font-bold text-gray-400">{existingImages.length + newImages.length}/10 ảnh</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Existing Images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-50 shadow-sm">
                  <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="p-2 bg-white text-rose-500 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* New Previews */}
              {newPreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-blue-50 shadow-sm">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full shadow-sm">MỚI</div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="p-2 bg-white text-rose-500 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {(existingImages.length + newImages.length) < 10 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 hover:bg-white hover:border-rose-200 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative">
                  <div className="flex flex-col items-center transition-transform group-hover:-translate-y-1">
                    <Upload className="text-gray-400 group-hover:text-rose-500 mb-2 transition-colors" size={20} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter group-hover:text-rose-500">Tải ảnh lên</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-bold animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Info size={14} />
                {error}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 max-w-[200px]">Cập nhật thông tin sẽ thay đổi chi tiết hiển thị cho khách hàng.</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-4 bg-black hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center gap-3 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">Đang lưu...</span>
                </div>
              ) : (
                <>
                  <span className="text-sm">Lưu thay đổi</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
