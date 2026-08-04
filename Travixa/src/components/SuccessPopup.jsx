import { useNavigate } from "react-router-dom";
import "../styles/SuccessPopup.css";

function SuccessPopup({ show, onClose }) {
  const navigate = useNavigate();

  if (!show) return null;

  const handleViewTrip = () => {
    if (onClose) onClose();
    navigate("/trip-details");
  };

  return (
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
  );
}

export default SuccessPopup;