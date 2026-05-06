import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Settings,
  X,
  Tag,
  Info,
  DollarSign,
  CheckCircle2,
  XCircle,
  Upload,
} from "lucide-react";
import API_URL from "../config/config";
import Header from "../components/Header";

export default function ManageServicesPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Service Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [propertyId, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userData);

    try {
      // 1. Fetch Property info
      const propResponse = await fetch(`${API_URL}/properties/${propertyId}`);
      if (!propResponse.ok) throw new Error("Không thể tải thông tin chỗ nghỉ.");
      const propData = await propResponse.json();

      if (propData.hostId !== user.id && user.role !== "HOST" && user.role !== "ADMIN") {
        throw new Error("Bạn không có quyền quản lý dịch vụ của chỗ nghỉ này.");
      }
      setProperty(propData);

      // 2. Fetch Services for this property
      const servicesResponse = await fetch(`${API_URL}/property-services/property/${propertyId}`);
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 5) {
      alert("Tối đa 5 ảnh cho mỗi dịch vụ.");
      return;
    }

    setNewImages([...newImages, ...files]);
    setNewPreviews([...newPreviews, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);

    const updatedPreviews = [...newPreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setNewPreviews(updatedPreviews);
  };

  const resetForm = () => {
    setEditingServiceId(null);
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(true);
    setExistingImages([]);
    setNewImages([]);
    newPreviews.forEach(p => URL.revokeObjectURL(p));
    setNewPreviews([]);
    setIsFormOpen(false);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (service) => {
    resetForm();
    setEditingServiceId(service.id);
    setName(service.name);
    setDescription(service.description || "");
    setPrice(service.price);
    setIsAvailable(service.isAvailable);
    setExistingImages(service.images || []);
    setIsFormOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;

    try {
      const response = await fetch(`${API_URL}/property-services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa dịch vụ.");
      }

      setServices(services.filter(s => s.id !== serviceId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("isAvailable", isAvailable);

      existingImages.forEach(img => formData.append("images", img));
      newImages.forEach(img => formData.append("images", img));

      const url = editingServiceId ? `${API_URL}/property-services/${editingServiceId}` : `${API_URL}/property-services`;
      const method = editingServiceId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi lưu dịch vụ.");

      await fetchData(); 
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center antialiased">
        <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Đang tải thông tin dịch vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center antialiased">
        <p className="text-rose-600 font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black font-medium">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/host/properties")} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group">
            <div className="p-2 group-hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={18} /></div>
            <span className="text-sm font-bold">Quay lại danh sách</span>
          </button>
        </div>

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý Dịch vụ kèm theo</h1>
            <p className="text-gray-500 text-sm">Cho chỗ nghỉ: <strong className="text-gray-900">{property?.title}</strong></p>
          </div>

          {!isFormOpen && (
            <button onClick={openAddForm} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95">
              <Plus size={20} /> <span className="text-sm">Thêm dịch vụ mới</span>
            </button>
          )}
        </div>

        {isFormOpen ? (
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                   <Tag size={20} />
                </div>
                <h2 className="text-xl font-bold">{editingServiceId ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
              </div>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 flex items-center gap-1.5">
                    <Info size={12} className="text-gray-400" /> Tên dịch vụ
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ví dụ: Buffet sáng, Tour thành phố, Hồ bơi..." 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500/30 outline-none transition-all text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-gray-400" /> Giá dịch vụ (VND)
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="0 = Miễn phí" 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500/30 outline-none transition-all text-gray-800 font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Mô tả ngắn gọn</label>
                <textarea 
                  rows={3} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Mô tả quyền lợi hoặc nội dung của dịch vụ này..." 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500/30 outline-none transition-all text-gray-800 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="isAvailable" 
                  checked={isAvailable} 
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Dịch vụ này hiện đang sẵn sàng để khách đặt
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-gray-700 ml-1">Hình ảnh dịch vụ ({existingImages.length + newImages.length}/5)</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(index)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={24} /></button>
                    </div>
                  ))}
                  {newPreviews.map((url, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-blue-100">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full">MỚI</div>
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={24} /></button>
                    </div>
                  ))}
                  {(existingImages.length + newImages.length) < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 bg-gray-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="text-gray-400 mb-2" size={20} />
                      <span className="text-[10px] font-bold text-gray-500">Tải ảnh lên</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Đang lưu..." : (editingServiceId ? "Cập nhật dịch vụ" : "Tạo dịch vụ")}
                </button>
              </div>
            </form>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Hãy thêm các dịch vụ bổ sung để tăng thêm thu nhập và trải nghiệm cho khách hàng.</p>
            <button onClick={openAddForm} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95">
              Thêm dịch vụ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col group relative">
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={service.images && service.images.length > 0 ? service.images[0] : "https://images.unsplash.com/photo-1540331547168-8b63109225b7?q=80&w=400"} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                      {service.isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                          <CheckCircle2 size={10} /> Sẵn sàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                          <XCircle size={10} /> Tạm dừng
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                      {service.description || "Không có mô tả cho dịch vụ này."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-lg">
                      {service.price > 0 ? `${service.price.toLocaleString()} ₫` : "Miễn phí"}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end gap-2">
                  <button onClick={() => openEditForm(service)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-all">
                    <Edit3 size={14} /> Chỉnh sửa
                  </button>
                  <button onClick={() => handleDeleteService(service.id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
