import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, CalendarCheck, DollarSign,
  Bell, Search, Menu, X, TrendingUp, Star, Settings,
  UserCheck, HomeIcon,
} from "lucide-react";
import VerifyHostsPage from "./VerifyHostsPage";
import VerifyPropertiesPage from "./VerifyPropertiesPage";
import { apiCall } from "../utils/api";

// ─── Dashboard Overview ───────────────────────────────────────────────────────
function DashboardOverview({ stats }) {
  const cards = [
    { title: "Tổng Users", value: stats?.totalUsers ?? "—", icon: <Users className="w-5 h-5" />, change: "" },
    { title: "Properties", value: stats?.totalProperties ?? "—", icon: <Building2 className="w-5 h-5" />, change: "" },
    { title: "Bookings", value: stats?.totalBookings ?? "—", icon: <CalendarCheck className="w-5 h-5" />, change: "" },
    { title: "Revenue", value: stats ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—", icon: <DollarSign className="w-5 h-5" />, change: "" },
  ];

  const recentBookings = [
    { guest: "Hung Anh", property: "Luxury Villa Nha Trang", date: "May 3, 2026", amount: "$320", status: "Confirmed" },
    { guest: "Minh Quan", property: "Beach House Da Nang", date: "May 2, 2026", amount: "$280", status: "Pending" },
    { guest: "Ngoc Mai", property: "Saigon City Loft", date: "May 2, 2026", amount: "$190", status: "Completed" },
  ];

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's your platform summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
              <div className="bg-slate-100 p-3 rounded-xl">{stat.icon}</div>
              {stat.change && <span className="text-green-500 font-semibold text-xs">{stat.change}</span>}
            </div>
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold">Revenue Analytics</h3>
            <TrendingUp className="text-green-500 w-5 h-5" />
          </div>
          <div className="h-56 flex items-center justify-center bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl">
            <p className="text-gray-400 text-sm">Chart Integration (Recharts / Chart.js)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition text-sm">Add New Property</button>
            <button className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition text-sm">Manage Users</button>
            <button className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition text-sm">View Reports</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Recent Bookings</h3>
          <button className="text-slate-900 font-semibold text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Guest</th><th className="pb-3">Property</th>
                <th className="pb-3">Date</th><th className="pb-3">Amount</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b, i) => (
                <tr key={i} className="border-b last:border-none hover:bg-gray-50">
                  <td className="py-4 font-medium">{b.guest}</td>
                  <td>{b.property}</td><td>{b.date}</td><td>{b.amount}</td>
                  <td><span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [pendingCounts, setPendingCounts] = useState({ pendingHosts: 0, pendingProperties: 0 });
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPendingCounts();
    fetchStats();
  }, []);

  const fetchPendingCounts = async () => {
    try {
      const res = await apiCall("/admin/pending-counts");
      const data = await res.json();
      setPendingCounts(data);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await apiCall("/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  const menuItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "verify-hosts", icon: <UserCheck size={20} />, label: "Verify Host", badge: pendingCounts.pendingHosts },
    { id: "verify-properties", icon: <HomeIcon size={20} />, label: "Verify Property", badge: pendingCounts.pendingProperties },
    { id: "users", icon: <Users size={20} />, label: "Users" },
    { id: "bookings", icon: <CalendarCheck size={20} />, label: "Bookings" },
    { id: "revenue", icon: <DollarSign size={20} />, label: "Revenue" },
    { id: "reviews", icon: <Star size={20} />, label: "Reviews" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  const totalPending = pendingCounts.pendingHosts + pendingCounts.pendingProperties;

  const renderPage = () => {
    if (activePage === "verify-hosts") return <VerifyHostsPage />;
    if (activePage === "verify-properties") return <VerifyPropertiesPage />;
    return <DashboardOverview stats={stats} />;
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {sidebarOpen && <h1 className="font-bold text-xl tracking-wide">HaviStay</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-left ${
                activePage === item.id ? "bg-white text-slate-900 shadow-md" : "hover:bg-slate-700 text-white"
              }`}
            >
              <div className="relative flex-shrink-0">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 w-full max-w-md">
            <Search className="text-gray-500 w-4 h-4" />
            <input type="text" placeholder="Search users, bookings..." className="bg-transparent outline-none ml-2 w-full text-sm" />
          </div>

          <div className="flex items-center gap-5 ml-4">
            <button className="relative" onClick={() => setActivePage("verify-hosts")}>
              <Bell className="w-5 h-5 text-gray-700" />
              {totalPending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalPending > 99 ? "99+" : totalPending}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "Admin"}`}
                alt="Admin"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <p className="font-semibold text-sm">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {renderPage()}
      </main>
    </div>
  );
}