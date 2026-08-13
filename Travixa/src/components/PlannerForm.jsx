import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { calculateItineraryDistance } from "../services/geocoding";
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
    transport: "Driving",
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

    const calcDays = () => {
      if (trip.startDate && trip.endDate) {
        const [sYear, sMonth, sDay] = String(trip.startDate).split('-').map(Number);
        const [eYear, eMonth, eDay] = String(trip.endDate).split('-').map(Number);
        if (sYear && sMonth && sDay && eYear && eMonth && eDay) {
          const startUtc = Date.UTC(sYear, sMonth - 1, sDay);
          const endUtc = Date.UTC(eYear, eMonth - 1, eDay);
          const diffMs = endUtc - startUtc;
          return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        }
      }
      return 1;
    };
    const totalDays = calcDays();

    let totalDistanceKm = null;
    try {
      let userCoords = null;
      if ("geolocation" in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (pos?.coords) {
                userCoords = [pos.coords.latitude, pos.coords.longitude];
              }
              resolve();
            },
            () => resolve(),
            { timeout: 3000 }
          );
        });
      }
      totalDistanceKm = await calculateItineraryDistance({
        originCoords: userCoords,
        destination: trip.destination.trim(),
      });
    } catch (e) {
      // Ignore distance calc errors
    }

    const payload = {
      destination: trip.destination.trim(),
      startDate: trip.startDate,
      endDate: trip.endDate,
      days: totalDays,
      budget: Number(trip.budget) || 0,
      numberOfTravelers: Number(trip.travelers) || 1,
      totalDistanceKm: totalDistanceKm,
      preferences: {
        travelStyle: trip.travelStyle,
        transport: trip.transport || "Driving",
        interests: trip.interests,
      },
    };

    const token =
      localStorage.getItem("travexaToken") || localStorage.getItem("token");

    if (!token) {
      // Guest mode: Save local trip and display success popup
      const localTrip = {
        id: `trip-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("travexaTrip", JSON.stringify(localTrip));
      if (setGeneratedTrip) {
        setGeneratedTrip(localTrip);
      }
      setLoading(false);
      return;
    }

    try {
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
      // Fallback local save if server responds with error
      const localTrip = {
        id: `trip-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("travexaTrip", JSON.stringify(localTrip));
      if (setGeneratedTrip) {
        setGeneratedTrip(localTrip);
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

        {/* Travel Style / Traveler Type */}
        <div className="form-group">
          <label htmlFor="travelStyle">🎒 TRAVELER CATEGORY</label>
          <div className="input-group">
            <span className="input-icon">🎒</span>
            <select
              id="travelStyle"
              name="travelStyle"
              value={trip.travelStyle}
              onChange={handleInput}
            >
              <option value="">Select category</option>
              <option value="Family">👨‍👩‍👧‍👦 Family Friendly</option>
              <option value="Solo">🎒 Solo Traveler</option>
              <option value="Luxury">👑 Luxury & Comfort</option>
              <option value="Adventure">🏔️ Adventure & Outdoors</option>
              <option value="Relax">🌅 Relax & Unwind</option>
            </select>
          </div>
        </div>

        {/* Mode of Transport */}
        <div className="form-group">
          <label htmlFor="transport">🚗 MODE OF TRANSPORT</label>
          <div className="input-group">
            <span className="input-icon">🚗</span>
            <select
              id="transport"
              name="transport"
              value={trip.transport}
              onChange={handleInput}
            >
              <option value="Driving">🚗 Driving</option>
              <option value="Walking">🚶 Walking</option>
              <option value="Ride/Bike">🏍️ Ride / Bike</option>
              <option value="Flight">✈️ Flight</option>
              <option value="Train">🚆 Train</option>
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