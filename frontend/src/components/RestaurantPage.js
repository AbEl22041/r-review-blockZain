import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReviewRecorder from "./ReviewRecorder";

export default function RestaurantPage() {
  const { restaurant_id } = useParams(); // get restaurant id from URL params
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRestaurantData() {
      try {
        setLoading(true);
        setError(null);
  
        // Fetch restaurant details
        const resDetails = await fetch(`http://localhost:8000/api/restaurant/${restaurant_id}/`);
        if (!resDetails.ok) throw new Error("Failed to fetch restaurant details");
        const restaurantData = await resDetails.json();
  
        // Fetch restaurant reviews
        const resReviews = await fetch(`http://localhost:8000/api/restaurant/${restaurant_id}/reviews/`);
        if (!resReviews.ok) throw new Error("Failed to fetch reviews");
        const reviewsData = await resReviews.json();
  
        setRestaurant(restaurantData);
        setReviews(reviewsData.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  
    fetchRestaurantData();
  }, [restaurant_id]);
  

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>Error: {error}</p>;
  if (!restaurant) return <p style={{ textAlign: "center" }}>Restaurant not found</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍽️ {restaurant.name}</h1>
      <p style={styles.subheading}>📍 City: {restaurant.city}</p>
      <h2 style={styles.rating}>⭐ Average Rating: {restaurant.average_rating || "N/A"}</h2>

      <div style={styles.reviewSection}>
        <h3 style={styles.sectionTitle}>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to leave a review!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} style={styles.card}>
              <p><strong>Sentiment:</strong> {review.sentiment}</p>
              <p><strong>Rating:</strong> {review.rating} ⭐</p>
              <p><strong>Suggestion:</strong> {review.suggestion}</p>
              <p><em>{review.text}</em></p>
            </div>
          ))
        )}
      </div>

      <div style={styles.recorderSection}>
        <h3 style={styles.sectionTitle}>🎤 Leave Your Review</h3>
        <ReviewRecorder restaurantId={restaurant_id} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: "auto",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    marginBottom: 10,
  },
  subheading: {
    textAlign: "center",
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
  },
  rating: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 30,
  },
  reviewSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  recorderSection: {
    marginTop: 40,
  },
};
