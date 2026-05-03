import React, { useState, useEffect, useCallback } from "react";
import { Eye, X, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import { apiCall } from "../utils/api";

export default function VerifyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("false"); // "false" = chưa publish
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? `/admin/properties` : `/admin/properties?published=${filter}`;
      const res = await apiCall(url);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleToggle = async (id, current) => {
    setActionLoading(id);
    try {
      await apiCall(`/admin/properties/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      setProperties((prev) =>
        prev.map((p) => p.id === id ? { ...p, isPublished: !current } : p)
      );
      if (selected?.id === id) setSelected((s) => ({ ...s, isPublished: !current }));
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
        {[{ v: "false", label: "⏳ Chờ duyệt" }, { v: "true", label: "✅ Đã publish" }, { v: "all", label: "📋 Tất cả" }].map(({ v, label }) => (
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
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${p.isPublished ? "bg-green-500 text-white" : "bg-amber-400 text-white"}`}>
                  {p.isPublished ? "✓ Published" : "⏳ Pending"}
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
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition">
                    <Eye size={14} /> Chi tiết
                  </button>
                  <button
                    onClick={() => handleToggle(p.id, p.isPublished)}
                    disabled={actionLoading === p.id}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium transition ${p.isPublished ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-green-100 hover:bg-green-200 text-green-700"} disabled:opacity-50`}>
                    {actionLoading === p.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : p.isPublished ? (
                      <><ToggleRight size={14} /> Ẩn</>
                    ) : (
                      <><ToggleLeft size={14} /> Duyệt</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-lg">Chi tiết Property</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
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
                  <p className={`font-bold mt-0.5 ${selected.isPublished ? "text-green-600" : "text-amber-600"}`}>
                    {selected.isPublished ? "Đã publish" : "Chờ duyệt"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(selected.id, selected.isPublished)}
                disabled={actionLoading === selected.id}
                className={`w-full py-3 rounded-xl font-bold text-sm transition ${selected.isPublished ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-green-600 hover:bg-green-700 text-white"} disabled:opacity-50`}>
                {actionLoading === selected.id ? "Đang xử lý..." : selected.isPublished ? "Ẩn property này" : "✓ Duyệt & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
