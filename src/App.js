import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./home/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Định nghĩa đường dẫn mặc định là trang Home */}
        <Route path="/" element={<HomePage />} />

        {/* Bạn có thể thêm các route khác ở đây sau này */}
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;