import { useState, useEffect } from "react";
import API from "../services/api";
import PlannerForm from "../components/PlannerForm";
import MapCard from "../components/MapCard";
import DestinationCard from "../components/DestinationCard";
import AISuggestions from "../components/AISuggestions";
import AITripResult from "../components/AITripResult";
import Footer from "../components/Footer";
import SuccessPopup from "../components/SuccessPopup";
import "../styles/PlanTrip.css";

function PlanTrip() {
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [destinationPreview, setDestinationPreview] = useState("");

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripError, setTripError] = useState("");

  const fetchTrips = async () => {
    try {
      setLoadingTrips(true);
      setTripError("");
      const token =
        localStorage.getItem("travexaToken") || localStorage.getItem("token");
      if (!token) {
        setLoadingTrips(false);
        return;
      }
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

  return (
    <main className="plan-trip-root">
      {/* Background Animated Gradient Orbs */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="plan-trip-wrapper">
        {/* Page Heading Banner */}
        <header className="plan-trip-hero">
          <span className="hero-eyebrow">✨ AI TRAVEL PLANNER</span>
          <h1>Craft Your Next Unforgettable Journey</h1>
          <p>
            Tell Travexa AI where you want to go, your dates, and budget. Our intelligent engine will curate a custom day-by-day travel plan just for you.
          </p>
        </header>

        {/* Two-Column Responsive Workspace */}
        <div className="planner-workspace-grid">
          {/* Left Column: Form */}
          <div className="planner-left-panel">
            <PlannerForm
              onDestinationChange={(dest) => setDestinationPreview(dest)}
              setGeneratedTrip={(trip) => {
                setGeneratedTrip(trip);
                setShowPopup(true);
              }}
            />
          </div>

          {/* Right Column: Live Map Preview */}
          <div className="planner-right-panel">
            <MapCard destination={destinationPreview} />
          </div>
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
          <div className="empty-state-glass">
            <div className="empty-icon-glow">🤖</div>
            <h2>Your AI Travel Itinerary Will Appear Here</h2>
            <p>
              Fill out the trip details above and click
              <br />
              <strong style={{ color: "#38bdf8" }}>✨ Generate AI Trip</strong>
              <br />
              to create your complete travel plan.
            </p>
            <span className="empty-badge">🌍 Ready to explore the world?</span>
          </div>
        )}

        {/* Popular Destinations & AI Suggestions Grid */}
        <div className="dashboard-grid">
          <DestinationCard />
          <AISuggestions />
        </div>
      </div>

      <SuccessPopup show={showPopup} onClose={() => setShowPopup(false)} />
      <Footer />
    </main>
  );
}

export default PlanTrip;