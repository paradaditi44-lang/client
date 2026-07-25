import { useState } from "react";
import "../styles/PlannerForm.css";

function PlannerForm({ setGeneratedTrip }) {
  const [trip, setTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2,
    budget: "",
    travelStyle: "",
    interests: [],
  });

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

  
const generateTrip = () => {
  if (
    !trip.destination ||
    !trip.startDate ||
    !trip.endDate ||
    !trip.budget ||
    !trip.travelStyle
  ) {
    alert("Please fill all the required fields.");
    return;
  }
  setGeneratedTrip(trip);
};


  return (
    <div className="planner-card">

      <h2>✨ AI Trip Planner</h2>

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
      >
        ✨ Generate AI Trip
      </button>

    </div>
  );
}

export default PlannerForm;