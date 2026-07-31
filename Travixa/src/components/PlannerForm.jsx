import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/PlannerForm.css";

function PlannerForm({ setGeneratedTrip, onDestinationChange }) {
  const navigate = useNavigate();

  const [trip, setTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2,
    budget: "",
    travelStyle: "",
    interests: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const interestsList = [
    "Nature",
    "Food",
    "Shopping",
    "Culture",
    "Photography",
  ];

  const handleInput = (e) => {
    const { name, value } = e.target;
    const updatedTrip = {
      ...trip,
      [name]: value,
    };
    setTrip(updatedTrip);

    if (name === "destination" && onDestinationChange) {
      onDestinationChange(value);
    }
  };

  const handleInterest = (interest) => {
    if (trip.interests.includes(interest)) {
      setTrip({
        ...trip,
        interests: trip.interests.filter((item) => item !== interest),
      });
    } else {
      setTrip({
        ...trip,
        interests: [...trip.interests, interest],
      });
    }
  };

  const generateTrip = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    setError("");

    const token =
      localStorage.getItem("travexaToken") || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !trip.destination ||
      !trip.startDate ||
      !trip.endDate ||
      !trip.budget ||
      !trip.travelStyle
    ) {
      setError("Please fill in all required fields to generate your itinerary.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        destination: trip.destination.trim(),
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: Number(trip.budget) || 0,
        numberOfTravelers: Number(trip.travelers) || 1,
        preferences: {
          travelStyle: trip.travelStyle,
          interests: trip.interests,
        },
      };

      const res = await API.post("/trips", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.trip) {
        const createdTrip = res.data.trip;
        localStorage.setItem("travexaTrip", JSON.stringify(createdTrip));
        if (setGeneratedTrip) {
          setGeneratedTrip(createdTrip);
        }
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("travexaToken");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const data = err.response.data;
        if (data.message) {
          setError(data.message);
        } else if (data.errors && Array.isArray(data.errors)) {
          const errorMsgs = data.errors.map((e) => e.msg || e.message).join(", ");
          setError(errorMsgs || "Validation error");
        } else {
          setError("Failed to generate trip. Server error.");
        }
      } else {
        setError("Server error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-card-glass">
      <div className="planner-card-header">
        <span className="planner-badge">✨ STEP 1 OF 2</span>
        <h2>Plan Your Trip Details</h2>
        <p className="planner-subtext">Fill in your travel preferences below.</p>
      </div>

      {error && (
        <div className="planner-error-alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={generateTrip} className="planner-form-grid">
        {/* Destination */}
        <div className="form-group full-width">
          <label htmlFor="destination">📍 DESTINATION</label>
          <div className="input-group">
            <span className="input-icon">📍</span>
            <input
              id="destination"
              type="text"
              name="destination"
              placeholder="e.g. Paris, Tokyo, Mumbai, London"
              value={trip.destination}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="form-group">
          <label htmlFor="startDate">📅 START DATE</label>
          <div className="input-group">
            <span className="input-icon">📅</span>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={trip.startDate}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* End Date */}
        <div className="form-group">
          <label htmlFor="endDate">📅 END DATE</label>
          <div className="input-group">
            <span className="input-icon">📅</span>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={trip.endDate}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Travelers */}
        <div className="form-group">
          <label htmlFor="travelers">👥 TRAVELERS</label>
          <div className="input-group">
            <span className="input-icon">👥</span>
            <input
              id="travelers"
              type="number"
              name="travelers"
              min="1"
              max="20"
              placeholder="2"
              value={trip.travelers}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Budget */}
        <div className="form-group">
          <label htmlFor="budget">💰 BUDGET (₹)</label>
          <div className="input-group">
            <span className="input-icon">💰</span>
            <input
              id="budget"
              type="number"
              name="budget"
              placeholder="e.g. 50000"
              value={trip.budget}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Travel Style */}
        <div className="form-group full-width">
          <label htmlFor="travelStyle">🎒 TRAVEL STYLE</label>
          <div className="input-group">
            <span className="input-icon">🎒</span>
            <select
              id="travelStyle"
              name="travelStyle"
              value={trip.travelStyle}
              onChange={handleInput}
            >
              <option value="">Select your travel style</option>
              <option value="Adventure">🏔️ Adventure & Outdoors</option>
              <option value="Luxury">👑 Luxury & Comfort</option>
              <option value="Family">👨‍👩‍👧‍👦 Family Friendly</option>
              <option value="Solo">🎒 Solo Traveler</option>
              <option value="Relax">🌅 Relax & Unwind</option>
            </select>
          </div>
        </div>

        {/* Interests Badges */}
        <div className="form-group full-width">
          <label>❤️ INTERESTS & PREFERENCES</label>
          <div className="interest-badges-grid">
            {interestsList.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  trip.interests.includes(item)
                    ? "interest-badge active"
                    : "interest-badge"
                }
                onClick={() => handleInterest(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-group full-width">
          <button
            type="submit"
            className="btn-generate-gradient"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-state">
                <span className="spinner-dot"></span> Generating AI Itinerary...
              </span>
            ) : (
              "✨ Generate AI Trip"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlannerForm;