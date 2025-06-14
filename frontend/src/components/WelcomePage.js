import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/restaurants/")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error("Failed to fetch restaurants:", err));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🍽️ Welcome to R-Review</h1>
      <p style={styles.subheader}>Discover, rate, and improve local restaurants.</p>

      <div style={styles.restaurantGrid}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} style={styles.card}>
            <h2 style={styles.name}>{restaurant.name}</h2>
            <p style={styles.city}>📍 {restaurant.city}</p>
            <p style={styles.rating}>⭐ Average Rating: {restaurant.average_rating || "N/A"}</p>
            <div style={styles.actions}>
              <button
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                style={styles.reviewButton}
              >
                Rate This Restaurant
              </button>
              <a
                href={`http://localhost:8000/api/restaurant/${restaurant.id}/qr/`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.qrLink}
              >
                View QR Code
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "40px",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  header: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  subheader: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "30px",
  },
  restaurantGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    width: "300px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  name: {
    fontSize: "24px",
    marginBottom: "5px",
  },
  city: {
    fontSize: "16px",
    color: "#555",
  },
  rating: {
    fontSize: "16px",
    marginTop: "10px",
    color: "#222",
  },
  actions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewButton: {
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  qrLink: {
    fontSize: "13px",
    color: "#007bff",
    textDecoration: "none",
  },
};
