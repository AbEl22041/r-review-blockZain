import React from "react";

export default function RestaurantQRCodePage() {
  const qrData = {
    name: "Gourmet Grill",
    city: "Addis Ababa",
    id: 1,
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:3000/restaurant/1"
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📱 Scan to Review</h2>
      <div style={styles.qrCard}>
        <p><strong>Restaurant:</strong> {qrData.name}</p>
        <p><strong>City:</strong> {qrData.city}</p>
        <p><strong>ID:</strong> {qrData.id}</p>
        <img src={qrData.qr_url} alt="QR Code" style={styles.qrImage} />
        <p style={styles.note}>Point your camera or QR scanner to open the review page.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
  },
  qrCard: {
    maxWidth: 400,
    margin: "auto",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  qrImage: {
    margin: "20px auto",
    display: "block",
  },
  note: {
    color: "#555",
    fontSize: 14,
  }
};
