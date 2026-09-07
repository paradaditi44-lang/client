import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JourneyTransition from "./JourneyTransition";
import "../styles/SuccessPopup.css";

function SuccessPopup({ show, onClose }) {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!show) return null;

  // Retrieve existing saved trip data from localStorage
  const getSavedTrip = () => {
    try {
      const saved = localStorage.getItem("travexaTrip");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse travexaTrip:", e);
    }
    return null;
  };

  const tripData = getSavedTrip();
  const origin = tripData?.origin || tripData?.preferences?.origin || "Current Location";
  const destination = tripData?.destination || "Destination";
  const transport = tripData?.preferences?.transport || tripData?.transport || "Driving";

  const handleViewTrip = () => {
    setIsTransitioning(true);
  };

  const handleAnimationEnd = () => {
    setIsTransitioning(false);
    if (onClose) onClose();
    navigate("/trip-details");
  };

  return (
    <>
      {isTransitioning ? (
        <JourneyTransition
          origin={origin}
          destination={destination}
          transport={transport}
          onComplete={handleAnimationEnd}
        />
      ) : (
        <div className="popup-overlay">
          <div className="popup-card">
            <div className="popup-icon">✅</div>
            <h2>Trip Generated Successfully!</h2>
            <p>Your itinerary is ready.</p>
            <button onClick={handleViewTrip}>
              View My Trip
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SuccessPopup;