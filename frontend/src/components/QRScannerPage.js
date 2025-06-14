import React from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";

export default function QRScannerPage() {
  const navigate = useNavigate();

  const handleResult = (result) => {
    if (result?.text) {
      const scannedValue = result.text;
      console.log("✅ Scanned QR code value:", scannedValue);

      // Expecting: http://localhost:3000/restaurant/5 or similar
      const match = scannedValue.match(/\/restaurant\/(\d+)/);
      const restaurantId = match?.[1];

      if (restaurantId) {
        navigate(`/restaurant/${restaurantId}`);
      } else {
        alert("⚠️ Invalid QR code format. Please scan a valid restaurant QR.");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Restaurant QR Code</h2>
      <p>This will redirect you to the restaurant review page.</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <QrReader
          onResult={(result, error) => {
            if (result) handleResult(result);
          }}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
