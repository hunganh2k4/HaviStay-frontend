import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export default function ChatFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("user");

  // Don't show on chat page or if not logged in
  if (location.pathname === "/messages" || !user) return null;

  return (
    <button
      onClick={() => navigate("/messages")}
      className="fixed bottom-8 right-8 w-16 h-16 bg-rose-500 text-white rounded-full shadow-2xl shadow-rose-200 flex items-center justify-center hover:bg-rose-600 transition-all hover:scale-110 active:scale-95 z-[9999] group"
    >
      <div className="relative">
        <MessageSquare size={28} />
        {/* Badge - could be dynamic later */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
          !
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        Chat với chúng tôi
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </div>
    </button>
  );
}
