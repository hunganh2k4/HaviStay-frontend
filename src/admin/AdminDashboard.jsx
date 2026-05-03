import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  DollarSign,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  ShieldCheck,
  Star,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    {
      title: "Total Users",
      value: "24,891",
      change: "+12.5%",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Properties",
      value: "1,284",
      change: "+8.2%",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      title: "Bookings",
      value: "8,492",
      change: "+18.1%",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      title: "Revenue",
      value: "$184,200",
      change: "+21.4%",
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  const recentBookings = [
    {
      guest: "Hung Anh",
      property: "Luxury Villa Nha Trang",
      date: "May 3, 2026",
      amount: "$320",
      status: "Confirmed",
    },
    {
      guest: "Minh Quan",
      property: "Beach House Da Nang",
      date: "May 2, 2026",
      amount: "$280",
      status: "Pending",
    },
    {
      guest: "Ngoc Mai",
      property: "Saigon City Loft",
      date: "May 2, 2026",
      amount: "$190",
      status: "Completed",
    },
  ];

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <Users size={20} />, label: "Users" },
    { icon: <Building2 size={20} />, label: "Properties" },
    { icon: <CalendarCheck size={20} />, label: "Bookings" },
    { icon: <DollarSign size={20} />, label: "Revenue" },
    { icon: <ShieldCheck size={20} />, label: "Security" },
    { icon: <Star size={20} />, label: "Reviews" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1
            className={`font-bold text-xl ${
              !sidebarOpen && "hidden"
            } tracking-wide`}
          >
            HaviStay
          </h1>

          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-3 space-y-2">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                item.active
                  ? "bg-white text-slate-900 shadow-md"
                  : "hover:bg-slate-700"
              }`}
            >
              {item.icon}
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 w-full">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 w-full max-w-md">
            <Search className="text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, bookings..."
              className="bg-transparent outline-none ml-2 w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-5 ml-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100"
                alt="Admin"
                className="w-10 h-10 rounded-full"
              />

              <div className="hidden md:block">
                <p className="font-semibold text-sm">Hung Anh</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 w-full">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back! Here’s your platform summary.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="bg-slate-100 p-3 rounded-xl">
                    {stat.icon}
                  </div>

                  <span className="text-green-500 font-semibold text-xs">
                    {stat.change}
                  </span>
                </div>

                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts + Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Revenue */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">Revenue Analytics</h3>
                <TrendingUp className="text-green-500 w-5 h-5" />
              </div>

              <div className="h-56 flex items-center justify-center bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl">
                <p className="text-gray-400 text-sm">
                  Chart Integration (Recharts / Chart.js)
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition text-sm">
                  Add New Property
                </button>

                <button className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition text-sm">
                  Manage Users
                </button>

                <button className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition text-sm">
                  View Reports
                </button>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Recent Bookings</h3>

              <button className="text-slate-900 font-semibold text-sm">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Guest</th>
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="py-4 font-medium">{booking.guest}</td>
                      <td>{booking.property}</td>
                      <td>{booking.date}</td>
                      <td>{booking.amount}</td>
                      <td>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}