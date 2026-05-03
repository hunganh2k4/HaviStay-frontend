import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Bed,
  Bath,
  Users,
  Settings,
  Upload,
  X,
} from "lucide-react";
import API_URL from "../config/config";
import Header from "../components/Header";

export default function ManageRoomsPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Room Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("STANDARD");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [cleaningFee, setCleaningFee] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [guests, setGuests] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [beds, setBeds] = useState("");
  const [bathrooms, setBathrooms] = useState("");

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
      // 1. Fetch Property info to verify ownership and display title
      const propResponse = await fetch(`${API_URL}/properties/${propertyId}`);
      if (!propResponse.ok) throw new Error("Không thể tải thông tin chỗ nghỉ.");
      const propData = await propResponse.json();

      if (propData.hostId !== user.id && user.role !== "HOST") {
        throw new Error("Bạn không có quyền quản lý phòng của chỗ nghỉ này.");
      }
      setProperty(propData);

      // 2. Fetch Rooms for this property
      const roomsResponse = await fetch(`${API_URL}/rooms/property/${propertyId}`);
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
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
      alert("Tối đa 5 ảnh cho mỗi phòng.");
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
    setEditingRoomId(null);
    setName("");
    setType("STANDARD");
    setDescription("");
    setPricePerNight("");
    setCleaningFee("");
    setServiceFee("");
    setGuests("");
    setBedrooms("");
    setBeds("");
    setBathrooms("");
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

  const openEditForm = (room) => {
    resetForm();
    setEditingRoomId(room.id);
    setName(room.name);
    setType(room.type);
    setDescription(room.description || "");
    setPricePerNight(room.pricePerNight);
    setCleaningFee(room.cleaningFee || "");
    setServiceFee(room.serviceFee || "");
    setGuests(room.guests);
    setBedrooms(room.bedrooms);
    setBeds(room.beds);
    setBathrooms(room.bathrooms);
    setExistingImages(room.images || []);
    setIsFormOpen(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa phòng.");
      }

      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 ảnh.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (!editingRoomId) formData.append("propertyId", propertyId);
      formData.append("name", name);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("pricePerNight", pricePerNight);
      formData.append("guests", guests);
      formData.append("bedrooms", bedrooms);
      formData.append("beds", beds);
      formData.append("bathrooms", bathrooms);

      if (cleaningFee) formData.append("cleaningFee", cleaningFee);
      if (serviceFee) formData.append("serviceFee", serviceFee);

      existingImages.forEach(img => formData.append("images", img));
      newImages.forEach(img => formData.append("images", img));

      const url = editingRoomId ? `${API_URL}/rooms/${editingRoomId}` : `${API_URL}/rooms`;
      const method = editingRoomId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi lưu phòng.");

      await fetchData(); // re-fetch to get updated list
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
        <p className="text-gray-400 text-sm font-medium tracking-wide">Đang tải thông tin phòng...</p>
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

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/host/properties")} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group">
            <div className="p-2 group-hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={18} /></div>
            <span className="text-sm font-bold">Quay lại danh sách</span>
          </button>
        </div>

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý Phòng</h1>
            <p className="text-gray-500 text-sm">Cho chỗ nghỉ: <strong className="text-gray-900">{property?.title}</strong></p>
          </div>

          {!isFormOpen && (
            <button onClick={openAddForm} className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-100 active:scale-95">
              <Plus size={20} /> <span className="text-sm">Thêm phòng mới</span>
            </button>
          )}
        </div>

        {isFormOpen ? (
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
              <h2 className="text-xl font-bold">{editingRoomId ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</h2>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Tên phòng</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Phòng Deluxe Hướng Biển" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none transition-all text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Loại phòng</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none transition-all text-gray-800 appearance-none font-medium cursor-pointer">
                    <option value="STANDARD">Standard (Tiêu chuẩn)</option>
                    <option value="DELUXE">Deluxe (Cao cấp)</option>
                    <option value="VIP">VIP</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Mô tả chi tiết</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Đặc điểm nổi bật của phòng..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none transition-all text-gray-800 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Khách tối đa</label>
                  <input type="number" required min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Số phòng ngủ</label>
                  <input type="number" required min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Số giường</label>
                  <input type="number" required min="1" value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Số phòng tắm</label>
                  <input type="number" required min="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Giá mỗi đêm (VND)</label>
                  <input type="number" required min="0" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Phí dọn dẹp (VND)</label>
                  <input type="number" min="0" value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)} placeholder="0" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Phí dịch vụ (VND)</label>
                  <input type="number" min="0" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} placeholder="0" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-rose-500/30 outline-none text-gray-800" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-gray-700 ml-1">Hình ảnh phòng ({existingImages.length + newImages.length}/5)</label>
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
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-rose-300 bg-gray-50 hover:bg-rose-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="text-gray-400 mb-2" size={20} />
                      <span className="text-[10px] font-bold text-gray-500">Tải ảnh lên</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button type="submit" disabled={isSubmitting} className={`px-8 py-3.5 bg-black hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg active:scale-95 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}>
                  {isSubmitting ? "Đang lưu..." : "Lưu Phòng"}
                </button>
              </div>
            </form>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có phòng nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Hãy thiết lập các phòng để khách có thể xem và đặt chỗ.</p>
            <button onClick={openAddForm} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95">
              Tạo phòng đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img src={room.images?.[0] || "https://images.unsplash.com/photo-1522771731478-44eb10e5c776?w=800"} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-900 tracking-wider">
                    {room.type}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{room.name}</h3>
                  <div className="flex gap-4 text-xs text-gray-500 font-medium mb-4">
                    <span className="flex items-center gap-1"><Users size={14} className="text-gray-400" /> {room.guests} Khách</span>
                    <span className="flex items-center gap-1"><Bed size={14} className="text-gray-400" /> {room.beds} Giường</span>
                    <span className="flex items-center gap-1"><Bath size={14} className="text-gray-400" /> {room.bathrooms} Phòng tắm</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Giá mỗi đêm</p>
                      <p className="font-bold text-rose-500">{Number(room.pricePerNight).toLocaleString()} ₫</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditForm(room)} className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black flex items-center justify-center transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="w-9 h-9 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
