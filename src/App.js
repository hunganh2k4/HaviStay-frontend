import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import PropertyDetailPage from "./properties/DetailPropertiesPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

function App() {
  console.log(process.env.NODE_ENV);
  return (
    <Router>
      <Routes>
        {/* Định nghĩa đường dẫn mặc định là trang Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Bạn có thể thêm các route khác ở đây sau này */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;