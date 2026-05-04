import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import API_URL from "../config/config";
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Moon,
  Star,
  BarChart2,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Layers,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChartSimple({ data, title, subTitle }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.revenue), 1000);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
          <BarChart2 size={18} className="text-rose-500" />
        </div>
        <div>
          <h2 className="font-bold text-base">{title}</h2>
          <p className="text-xs text-gray-400">{subTitle}</p>
        </div>
      </div>

      <div className="flex items-end gap-2 h-56 w-full pt-10">
        {data.map((d, i) => {
          const heightPct = (d.revenue / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
              {/* Value Label */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <span className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                   ₫{Number(d.revenue).toLocaleString()}
                </span>
              </div>
              
              {/* The Bar */}
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                  d.revenue > 0 ? "bg-rose-400 group-hover:bg-rose-500" : "bg-gray-50"
                }`}
                style={{ height: `${Math.max(heightPct, d.revenue > 0 ? 2 : 1)}%` }}
              >
                {/* Floating Price tag on top of bar if visible enough */}
                {d.revenue > 0 && heightPct > 15 && (
                  <div className="text-[8px] text-white font-bold text-center mt-1 truncate px-1">
                    {Math.round(d.revenue / 1000)}k
                  </div>
                )}
              </div>
              
              <span className="text-[9px] font-bold text-gray-400 text-center truncate w-full leading-tight uppercase tracking-tighter">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("month"); // month, week, day

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    const { role } = JSON.parse(user);
    if (role !== "HOST" && role !== "ADMIN") {
      navigate("/");
      return;
    }

    const fetchEarnings = async () => {
      try {
        const res = await fetch(`${API_URL}/bookings/host/earnings`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, [navigate]);

  const getViewData = () => {
    if (!data) return [];
    if (view === "month") return data.monthlyRevenue || [];
    if (view === "week") return data.weeklyRevenue || [];
    if (view === "day") return data.dayOfWeekRevenue || [];
    return [];
  };

  const getViewTitle = () => {
    if (view === "month") return "Doanh thu theo tháng";
    if (view === "week") return "Doanh thu theo tuần";
    if (view === "day") return "Doanh thu theo thứ trong tuần";
    return "";
  };

  const getViewSubTitle = () => {
    if (view === "month") return "12 tháng gần nhất";
    if (view === "week") return "12 tuần gần nhất";
    if (view === "day") return "Tổng hợp theo các ngày trong tuần";
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased pb-20">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back + Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/host/properties")}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Thống kê thu nhập</h1>
              <p className="text-sm text-gray-500 mt-0.5">Phân tích hiệu suất tài chính</p>
            </div>
          </div>
          
          {/* View Switcher */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {[
              { id: "day", label: "Thứ", icon: Layers },
              { id: "week", label: "Tuần", icon: Calendar },
              { id: "month", label: "Tháng", icon: BarChart2 },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setView(btn.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  view === btn.id
                    ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <btn.icon size={14} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm mt-4 font-medium">Đang phân tích dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={DollarSign}
                label="Tổng doanh thu"
                value={`₫${(data.totalRevenue || 0).toLocaleString()}`}
                sub="Doanh thu ròng"
                color="bg-rose-500"
              />
              <StatCard
                icon={CalendarCheck}
                label="Tổng đặt phòng"
                value={data.totalBookings || 0}
                sub="Đã hoàn thành"
                color="bg-violet-500"
              />
              <StatCard
                icon={Moon}
                label="Tổng đêm lưu trú"
                value={data.totalNights || 0}
                sub="Đêm nghỉ"
                color="bg-amber-500"
              />
              <StatCard
                icon={TrendingUp}
                label="TB / booking"
                value={`₫${(data.avgRevenuePerBooking || 0).toLocaleString()}`}
                sub={data.bestMonth ? `Đỉnh điểm: ${data.bestMonth.label}` : "N/A"}
                color="bg-emerald-500"
              />
            </div>

            {/* Dynamic Chart */}
            <BarChartSimple 
              data={getViewData()} 
              title={getViewTitle()} 
              subTitle={getViewSubTitle()} 
            />

            {/* Per-property breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Star size={18} className="text-violet-500" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Xếp hạng chỗ nghỉ</h2>
                  <p className="text-xs text-gray-400">Hiệu suất theo từng bất động sản</p>
                </div>
              </div>

              {data.byProperty?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">Chưa có giao dịch phát sinh</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.byProperty.map((p, i) => {
                    const pct =
                      data.totalRevenue > 0
                        ? Math.round((p.revenue / data.totalRevenue) * 100)
                        : 0;
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/properties/${p.id}`)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition group"
                      >
                        <span className="text-sm font-black text-gray-200 w-6 shrink-0 italic">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="relative">
                          <img
                            src={p.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border-2 border-white shadow-sm"
                          />
                          {i === 0 && (
                            <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                              <Star size={10} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate group-hover:text-rose-500 transition">{p.title}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-rose-400 to-rose-300 h-1.5 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-rose-500 shrink-0">{pct}%</span>
                          </div>
                          <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-tight">
                            {p.bookings} lượt · {p.nights} đêm lưu trú
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-sm text-gray-900">₫{p.revenue.toLocaleString()}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 shrink-0 transition translate-x-0 group-hover:translate-x-1" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
