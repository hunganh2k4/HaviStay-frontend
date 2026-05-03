import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Star,
  Settings,
  Trash2,
  Edit3,
  ExternalLink,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react";
import API_URL from "../config/config";
import Header from "../components/Header";

export default function ManagePropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProperties = async () => {
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
        const response = await fetch(`${API_URL}/properties/my-properties`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách chỗ nghỉ.");
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProperties();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chỗ nghỉ này? Thao tác này không thể hoàn tác.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa chỗ nghỉ.");
      }

      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRequestVerification = async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}/request-verification`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể gửi yêu cầu duyệt.");
      }

      setProperties(properties.map(p => p.id === id ? { ...p, verificationStatus: 'PENDING', reviewNote: null } : p));
      alert("Đã gửi yêu cầu kiểm duyệt thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý chỗ nghỉ</h1>
            <p className="text-gray-500 text-sm mt-1">Danh sách các bất động sản bạn đang vận hành trên HaviStay.</p>
          </div>

          <button
            onClick={() => navigate("/host/properties/create")}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-100 active:scale-95"
          >
            <Plus size={20} />
            <span className="text-sm">Tạo chỗ nghỉ mới</span>
          </button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm font-medium tracking-wide">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center">
            <p className="text-rose-600 font-bold mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-2.5 bg-white border border-rose-200 text-rose-500 font-bold rounded-xl hover:bg-rose-50 transition-colors text-sm shadow-sm"
            >
              Thử lại
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gray-50 rounded-[40px] p-24 text-center border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-white shadow-sm text-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Plus size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có chỗ nghỉ nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-10 text-sm leading-relaxed">
              Bắt đầu hành trình host của bạn bằng cách thêm chỗ nghỉ đầu tiên để khách hàng có thể tìm thấy.
            </p>
            <button
              onClick={() => navigate("/host/properties/create")}
              className="px-10 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95"
            >
              Tạo chỗ nghỉ đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header (Optional for list view but good for structure) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-5">Thông tin chỗ nghỉ</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-center">Hiệu suất</div>
              <div className="col-span-3 text-right">Thao tác</div>
            </div>

            {properties.map((property) => (
              <div
                key={property.id}
                className="group bg-white border border-gray-100 rounded-3xl p-4 md:p-5 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 hover:shadow-xl hover:shadow-gray-100/50 hover:border-rose-100 transition-all duration-300"
              >
                {/* Info Section */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="relative w-24 h-24 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={property.images && property.images.length > 0
                        ? property.images[0]
                        : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs gap-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="truncate">{property.location}, {property.country}</span>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="col-span-2 flex flex-col justify-center items-center gap-2">
                  {!property.verificationStatus && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      📝 Bản Nháp
                    </span>
                  )}
                  {property.verificationStatus === 'PENDING' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600">
                      ⏳ Chờ duyệt
                    </span>
                  )}
                  {property.verificationStatus === 'REJECTED' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600">
                        ❌ Bị từ chối
                      </span>
                      {property.reviewNote && (
                        <span className="text-[9px] text-red-500 text-center max-w-[120px] truncate" title={property.reviewNote}>
                          {property.reviewNote}
                        </span>
                      )}
                    </div>
                  )}
                  {property.verificationStatus === 'APPROVED' && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${property.isPublished
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-400"
                      }`}>
                      {property.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                      {property.isPublished ? "Hiển thị" : "Đã ẩn"}
                    </span>
                  )}

                  {(!property.verificationStatus || property.verificationStatus === 'REJECTED') && (
                    <button
                      onClick={() => handleRequestVerification(property.id)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
                    >
                      Gửi duyệt
                    </button>
                  )}
                </div>

                {/* Performance Section */}
                <div className="col-span-2 flex flex-col md:items-center gap-1">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star size={14} className="text-rose-500 fill-rose-500" />
                    <span>{property.reviews?.length > 0 ? (property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length).toFixed(1) : "5.0"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {property.rooms?.length || 0} phòng • {property.reviews?.length || 0} đánh giá
                  </span>
                </div>

                {/* Actions Section */}
                <div className="col-span-3 flex items-center justify-end gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    title="Xem chi tiết"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/host/properties/${property.id}/edit`)}
                    className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/host/properties/${property.id}/rooms`)}
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                  >
                    <Settings size={14} />
                    <span>Phòng</span>
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
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
