import React, { useState, useEffect, useCallback } from "react";
import { Eye, X, CheckCircle, XCircle, MapPin } from "lucide-react";
import { apiCall } from "../utils/api";

export default function VerifyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? `/admin/properties` : `/admin/properties?verificationStatus=${filter}`;
      const res = await apiCall(url);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleVerify = async (id, status, note = "") => {
    setActionLoading(id);
    try {
      await apiCall(`/admin/properties/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: note }),
      });
      setProperties((prev) =>
        prev.map((p) => p.id === id ? { ...p, verificationStatus: status, isPublished: status === "APPROVED", reviewNote: note } : p)
      );
      if (selected?.id === id) {
        setSelected((s) => ({ ...s, verificationStatus: status, isPublished: status === "APPROVED", reviewNote: note }));
        if (status === "REJECTED") {
          setShowRejectReason(false);
          setRejectNote("");
        }
      }
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý Properties</h2>
        <p className="text-gray-500 text-sm mt-1">Duyệt và quản lý các bất động sản</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[{ v: "PENDING", label: "⏳ Chờ duyệt" }, { v: "APPROVED", label: "✅ Đã duyệt" }, { v: "REJECTED", label: "❌ Bị từ chối" }, { v: "all", label: "📋 Tất cả" }].map(({ v, label }) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === v ? "bg-slate-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 text-lg">Không có property nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={p.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${p.verificationStatus === 'APPROVED' ? "bg-green-500 text-white" : p.verificationStatus === 'REJECTED' ? "bg-red-500 text-white" : "bg-amber-400 text-white"}`}>
                  {p.verificationStatus === 'APPROVED' ? "✓ Đã duyệt" : p.verificationStatus === 'REJECTED' ? "❌ Bị từ chối" : "⏳ Pending"}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{p.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {p.location}, {p.country}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <img src={p.host?.avatar || `https://ui-avatars.com/api/?name=${p.host?.name}`} className="w-6 h-6 rounded-full" alt="" />
                  <span className="text-xs text-gray-500">{p.host?.name}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setSelected(p)}
                    className="w-full flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition">
                    <Eye size={14} /> Xem xét
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setShowRejectReason(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-lg">Chi tiết Property</h3>
              <button onClick={() => { setSelected(null); setShowRejectReason(false); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {selected.images?.[0] && (
                <img src={selected.images[0]} alt="" className="w-full h-48 object-cover rounded-xl" />
              )}
              <h4 className="font-bold text-xl">{selected.title}</h4>
              <p className="text-sm text-gray-500">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Địa điểm</p>
                  <p className="font-semibold mt-0.5">{selected.location}, {selected.country}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Phòng</p>
                  <p className="font-semibold mt-0.5">{selected.rooms?.length || 0} phòng</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Host</p>
                  <p className="font-semibold mt-0.5">{selected.host?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</p>
                  <p className={`font-bold mt-0.5 ${selected.verificationStatus === 'APPROVED' ? "text-green-600" : selected.verificationStatus === 'REJECTED' ? "text-red-600" : "text-amber-600"}`}>
                    {selected.verificationStatus === 'APPROVED' ? "Đã duyệt" : selected.verificationStatus === 'REJECTED' ? "Bị từ chối" : "Chờ duyệt"}
                  </p>
                </div>
              </div>

              {selected.reviewNote && selected.verificationStatus === 'REJECTED' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                  <p className="font-bold mb-1">Lý do từ chối:</p>
                  <p>{selected.reviewNote}</p>
                </div>
              )}

              {selected.verificationStatus === 'PENDING' && (
                showRejectReason ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                    <p className="text-sm font-bold text-gray-700">Lý do từ chối (bắt buộc)</p>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Property này không đạt yêu cầu vì..."
                      className="w-full p-3 border rounded-xl text-sm outline-none focus:border-red-500 resize-none h-24"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowRejectReason(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm">Hủy</button>
                      <button 
                        onClick={() => handleVerify(selected.id, "REJECTED", rejectNote)}
                        disabled={actionLoading === selected.id || !rejectNote.trim()}
                        className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                      >
                        {actionLoading === selected.id ? "Đang xử lý..." : "Xác nhận từ chối"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowRejectReason(true)}
                      className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Từ chối
                    </button>
                    <button
                      onClick={() => handleVerify(selected.id, "APPROVED")}
                      disabled={actionLoading === selected.id}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === selected.id ? "Đang xử lý..." : <><CheckCircle size={18} /> Duyệt & Publish</>}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
