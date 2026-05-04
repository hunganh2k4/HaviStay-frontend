import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import PropertyDetailPage from "./properties/DetailPropertiesPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import BecomeHostPage from "./auth/BecomeHostPage";
import ManagePropertiesPage from "./properties/ManagePropertiesPage";
import CreatePropertyPage from "./properties/CreatePropertyPage";
import EditPropertyPage from "./properties/EditPropertyPage";
import ManageRoomsPage from "./properties/ManageRoomsPage";
import AdminDashboard from "./admin/AdminDashboard";
import PaymentResultPage from "./payments/PaymentResultPage";
import MyTripsPage from "./trips/MyTripsPage";
import WishlistPage from "./wishlist/WishlistPage";
import ChatPage from "./chat/ChatPage";
import PropertiesByLocationPage from "./properties/PropertiesByLocationPage";
import EarningsPage from "./properties/EarningsPage";
import ChatFloatingButton from "./components/ChatFloatingButton";
import { useEffect } from "react";

import { startIdleLogout } from "./utils/idleLogout";
import { handleUnauthorized } from "./utils/api";

function App() {
  console.log(process.env.NODE_ENV);
  console.log(process.env.REACT_APP_BACKEND_APP_API_URL);

  useEffect(() => {
    const stopIdleLogout = startIdleLogout(async () => {
      handleUnauthorized();

      localStorage.removeItem("user");

      // Chỉ logout nếu chưa ở login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    });

    // Cleanup khi unmount
    return () => {
      stopIdleLogout();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <ChatFloatingButton />
        <Routes>
          {/* Định nghĩa đường dẫn mặc định là trang Home */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/become-a-host" element={<BecomeHostPage />} />
          
          <Route path="/host/properties" element={<ManagePropertiesPage />} />
          <Route path="/host/properties/create" element={<CreatePropertyPage />} />
          <Route path="/host/properties/:id/edit" element={<EditPropertyPage />} />
          <Route path="/host/properties/:id/rooms" element={<ManageRoomsPage />} />
          <Route path="/host/earnings" element={<EarningsPage />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/messages" element={<ChatPage />} />
          <Route path="/search" element={<PropertiesByLocationPage />} />
          <Route path="/search/:location" element={<PropertiesByLocationPage />} />

          {/* Bạn có thể thêm các route khác ở đây sau này */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;