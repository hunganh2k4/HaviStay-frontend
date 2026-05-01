import React from "react";
import "../index.css";
import { Heart, ChevronRight } from "lucide-react";
import Header from "../components/Header";

/* =========================
   DATA
========================= */
const staysHanoi = [
  {
    title: "Nhà phố tại Quận Hoàn Kiếm",
    price: "₫3.060.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Nơi ở tại Quận Tây Hồ",
    price: "₫1.039.765 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Phòng tại Quận Hoàn Kiếm",
    price: "₫716.283 cho 2 đêm · ★ 4.8",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Căn hộ tại Ba Đình",
    price: "₫1.250.000 cho 2 đêm · ★ 4.9",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    badge: "Chủ nhà siêu cấp",
  },
  {
    title: "Nhà tại Tây Hồ",
    price: "₫1.850.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Studio tại Long Biên",
    price: "₫980.000 cho 2 đêm · ★ 4.7",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    badge: "Được khách yêu thích",
  },
  {
    title: "Penthouse tại Cầu Giấy",
    price: "₫2.800.000 cho 2 đêm · ★ 5.0",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    badge: "Chủ nhà siêu cấp",
  },
];

const staysSeoul = [
  ...staysHanoi.map((item, index) => ({
    ...item,
    title: `Chỗ ở Seoul ${index + 1}`,
  })),
];


/* =========================
   SECTION - 7 ITEMS NGANG
========================= */
const Section = ({ title, items }) => (
  <section className="px-6 md:px-12 py-6">
    {/* Header */}
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-xl md:text-2xl font-bold whitespace-nowrap">
        {title}
      </h2>

      <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
        <ChevronRight size={20} />
      </button>
    </div>

    {/* 7 item cùng 1 hàng */}
    <div className="grid grid-cols-7 gap-4">
      {items.slice(0, 7).map((item, index) => (
        <div key={index} className="w-full min-w-0">
          <div className="cursor-pointer group">
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />

              <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-[10px] font-bold shadow">
                {item.badge}
              </span>

              <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition">
                <Heart size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="mt-2">
              <h3 className="font-semibold text-xs line-clamp-2">
                {item.title}
              </h3>

              <p className="text-gray-500 text-[11px] line-clamp-2">
                {item.price}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* =========================
   MAIN APP
========================= */
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased">
      <Header />

      {/* BODY */}
      <Section
        title="Nơi lưu trú được ưa chuộng tại Hà Nội"
        items={staysHanoi}
      />

      <Section
        title="Chỗ ở được yêu thích tại Seoul"
        items={staysSeoul}
      />
    </div>
  );
}
