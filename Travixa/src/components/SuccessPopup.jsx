import "../styles/SuccessPopup.css";

function SuccessPopup({ show, onClose }) {

  if (!show) return null;

  return (
    <div className="popup-overlay">

      <div className="popup-card">

        <div className="popup-icon">✅</div>

        <h2>Trip Generated Successfully!</h2>

        <p>Your itinerary is ready.</p>

        <button onClick={onClose}>
          OK
        </button>

      </div>

    </div>
  );
}

export default SuccessPopup;