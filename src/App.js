import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";
import PropertyDetailPage from "./properties/DetailPropertiesPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import BecomeHostPage from "./auth/BecomeHostPage";
import ManagePropertiesPage from "./properties/ManagePropertiesPage";
import CreatePropertyPage from "./properties/CreatePropertyPage";

function App() {
  console.log(process.env.NODE_ENV);
  console.log(process.env.REACT_APP_BACKEND_APP_API_URL);
  return (
    <Router>
      <Routes>
        {/* Định nghĩa đường dẫn mặc định là trang Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/become-a-host" element={<BecomeHostPage />} />
        <Route path="/host/properties" element={<ManagePropertiesPage />} />
        <Route path="/host/properties/create" element={<CreatePropertyPage />} />

        {/* Bạn có thể thêm các route khác ở đây sau này */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;