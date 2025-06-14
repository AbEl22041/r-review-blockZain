import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import QRScannerPage from "./components/QRScannerPage";
import RestaurantQRCodePage from "./components/RestaurantQRCodePage";
import RestaurantPage from "./components/RestaurantPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/scan" element={<QRScannerPage />} />
        <Route path="/restaurant-qr" element={<RestaurantQRCodePage />} />
        <Route path="/restaurant/:restaurant_id" element={<RestaurantPage />} />

      </Routes>
    </Router>
  );
}

export default App;
