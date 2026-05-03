import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Eye, X, User, Building2 } from "lucide-react";
import { apiCall } from "../utils/api";

export default function VerifyHostsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/admin/host-verifications?status=${filter}`);
      const data = await res.json();
      setVerifications(Array.isArray(data) ? data : []);
    } catch { setVerifications([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  const handleAction = async (id, status) => {
    setActionLoading(true);
    try {
      await apiCall(`/admin/host-verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });
      setSelected(null);
      setReviewNote("");
      fetchVerifications();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Xác minh Host</h2>
        <p className="text-gray-500 text-sm mt-1">Duyệt các yêu cầu trở thành host</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === s ? "bg-slate-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s === "PENDING" ? "⏳ Chờ duyệt" : s === "APPROVED" ? "✅ Đã duyệt" : "❌ Từ chối"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : verifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 text-lg">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {verifications.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${v.verificationType === "PERSONAL" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                {v.verificationType === "PERSONAL" ? <User size={22} /> : <Building2 size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800">{v.user?.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[v.status]}`}>{v.status}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{v.verificationType}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{v.user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">{v.fullName || v.companyName} · {new Date(v.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <button
                onClick={() => { setSelected(v); setReviewNote(""); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                <Eye size={16} /> Xem
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-lg">Chi tiết xác minh</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <img src={selected.user?.avatar || `https://ui-avatars.com/api/?name=${selected.user?.name}`} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold">{selected.user?.name}</p>
                  <p className="text-sm text-gray-500">{selected.user?.email}</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-3">
                {selected.verificationType === "PERSONAL" ? (
                  <>
                    <InfoItem label="Họ tên" value={selected.fullName} />
                    <InfoItem label="Số CCCD" value={selected.cccdNumber} />
                  </>
                ) : (
                  <>
                    <InfoItem label="Tên công ty" value={selected.companyName} />
                    <InfoItem label="Mã số thuế" value={selected.taxCode} />
                    <InfoItem label="Người đại diện" value={selected.legalRepresentative} />
                    <InfoItem label="CCCD đại diện" value={selected.representativeCCCD} />
                  </>
                )}
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-3">
                {selected.cccdFrontImage && <ImgPreview label="Mặt trước CCCD" url={selected.cccdFrontImage} />}
                {selected.cccdBackImage && <ImgPreview label="Mặt sau CCCD" url={selected.cccdBackImage} />}
                {selected.selfieImage && <ImgPreview label="Selfie" url={selected.selfieImage} />}
                {selected.businessLicense && <ImgPreview label="Giấy phép KD" url={selected.businessLicense} />}
              </div>

              {selected.status === "PENDING" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Ghi chú (tuỳ chọn)</label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={2}
                      placeholder="Lý do từ chối hoặc ghi chú..."
                      className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selected.id, "APPROVED")}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                    >
                      <CheckCircle size={18} /> Duyệt
                    </button>
                    <button
                      onClick={() => handleAction(selected.id, "REJECTED")}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition disabled:opacity-50"
                    >
                      <XCircle size={18} /> Từ chối
                    </button>
                  </div>
                </>
              )}
              {selected.status !== "PENDING" && (
                <div className={`p-3 rounded-xl text-sm font-medium ${statusColors[selected.status]}`}>
                  Trạng thái: <strong>{selected.status}</strong>
                  {selected.reviewNote && <p className="mt-1 text-xs opacity-80">{selected.reviewNote}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function ImgPreview({ label, url }) {
  // Nếu backend chỉ lưu path, tự nối với Supabase Storage public URL
  const getFullUrl = (fileUrl) => {
    if (!fileUrl) return "";

    // Nếu đã là full URL thì dùng luôn
    if (fileUrl.startsWith("http")) return fileUrl;

    // Nếu chỉ là path trong bucket
    return `https://sqfjvxoplhobezzyayub.supabase.co/storage/v1/object/public/host-verifications/${fileUrl}`;
  };

  const imageUrl = getFullUrl(url);

  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
        {label}
      </p>

      <a href={imageUrl} target="_blank" rel="noreferrer">
        <img
          src={imageUrl}
          alt={label}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=Image+Not+Found";
          }}
          className="w-full h-28 object-cover rounded-xl border hover:opacity-90 transition"
        />
      </a>
    </div>
  );
}
