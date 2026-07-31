import { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/Dashboard.css";


import HeroSection from "../components/HeroSection";
import PlannerForm from "../components/PlannerForm";
import MapCard from "../components/MapCard";

import DestinationCard from "../components/DestinationCard";
import AISuggestions from "../components/AISuggestions";
import AITripResult from "../components/AITripResult";
import Footer from "../components/Footer";
import SuccessPopup from "../components/SuccessPopup";

function PlanTrip({ theme, toggleTheme }) {
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripError, setTripError] = useState("");

  const fetchTrips = async () => {
    try {
      setLoadingTrips(true);
      setTripError("");
      const token =
        localStorage.getItem("travexaToken") || localStorage.getItem("token");
      const response = await API.get("/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrips(response.data?.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTripError(error.response?.data?.message || "Failed to fetch trips");
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleGenerateTrip = (trip) => {
    setLoading(true);

    setTimeout(() => {
      setGeneratedTrip(trip);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className={`dashboard ${theme || "light"}`}>
      
      <div className="dashboard-container">
        <HeroSection />

        {/* Top Section */}
        <div className="top-section">
          <PlannerForm
            setGeneratedTrip={(trip) => {
              setGeneratedTrip(trip);
              setShowPopup(true);
            }}
          />
          <MapCard />
        </div>

        {/* Loading / Empty State / AI Result */}
        {loading ? (
          <div className="loading-card">
            <h2>✨ Generating your AI itinerary...</h2>
            <p>⏳ Thinking...</p>
            <p>📍 Analyzing destination...</p>
            <p>🗺 Finding attractions...</p>
            <p>✈ Planning your trip...</p>
          </div>
        ) : generatedTrip ? (
          <AITripResult trip={generatedTrip} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h2>Your AI Travel Plan will appear here</h2>
            <p>
              Fill out the planner form and click
              <br />
              <strong>✨ Generate AI Trip</strong>
              <br />
              to create your personalized itinerary.
            </p>
            <span>🌍 Ready to explore the world?</span>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          <DestinationCard />
          <AISuggestions />
        </div>
      </div>

      <SuccessPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
      />
      <Footer />
    </div>
  );
}

export default PlanTrip;