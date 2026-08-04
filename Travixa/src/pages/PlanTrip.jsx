import { useState, useEffect } from "react";
import API from "../services/api";
import PlannerForm from "../components/PlannerForm";
import MapCard from "../components/MapCard";
import DestinationCard from "../components/DestinationCard";
import AISuggestions from "../components/AISuggestions";
import Footer from "../components/Footer";
import SuccessPopup from "../components/SuccessPopup";
import "../styles/PlanTrip.css";

function PlanTrip() {
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
              setGeneratedTrip={() => {
                setShowPopup(true);
              }}
            />
          </div>

          {/* Right Column: Live Map Preview */}
          <div className="planner-right-panel">
            <MapCard destination={destinationPreview} />
          </div>
        </div>

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