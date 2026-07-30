import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/PlannerForm.css";

function PlannerForm({ setGeneratedTrip }) {
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
    setTrip({
      ...trip,
      [e.target.name]: e.target.value,
    });
  };

  const handleInterest = (interest) => {
    if (trip.interests.includes(interest)) {
      setTrip({
        ...trip,
        interests: trip.interests.filter(
          (item) => item !== interest
        ),
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

    const token = localStorage.getItem("travexaToken");
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
      setError("Please fill all the required fields.");
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
    <div className="planner-card">

      <h2>✨ AI Trip Planner</h2>

      {error && (
        <div
          className="planner-error"
          style={{
            padding: "10px 14px",
            marginBottom: "14px",
            borderRadius: "8px",
            background: "#fff1f2",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <label>📍 Destination</label>
      <input
        type="text"
        name="destination"
        placeholder="Enter city or country"
        value={trip.destination}
        onChange={handleInput}
      />

      <label>📅 Start Date</label>
      <input
        type="date"
        name="startDate"
        value={trip.startDate}
        onChange={handleInput}
      />

      <label>📅 End Date</label>
      <input
        type="date"
        name="endDate"
        value={trip.endDate}
        onChange={handleInput}
      />

      <label>👥 Travelers</label>
      <input
        type="number"
        name="travelers"
        min="1"
        value={trip.travelers}
        onChange={handleInput}
      />

      <label>💰 Budget</label>
      <input
        type="number"
        name="budget"
        placeholder="₹50,000"
        value={trip.budget}
        onChange={handleInput}
      />

      <label>✈ Travel Style</label>
      <select
        name="travelStyle"
        value={trip.travelStyle}
        onChange={handleInput}
      >
        <option value="">Select</option>
        <option value="Adventure">Adventure</option>
        <option value="Luxury">Luxury</option>
        <option value="Family">Family</option>
        <option value="Solo">Solo</option>
        <option value="Relax">Relax</option>
      </select>

      <label>❤️ Interests</label>

      <div className="interest-grid">
        {interestsList.map((item) => (
          <button
            key={item}
            type="button"
            className={
              trip.interests.includes(item)
                ? "interest active"
                : "interest"
            }
            onClick={() => handleInterest(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <button
        className="generate-btn"
        onClick={generateTrip}
        disabled={loading}
      >
        {loading ? "✨ Generating..." : "✨ Generate AI Trip"}
      </button>

    </div>
  );
}

export default PlannerForm;