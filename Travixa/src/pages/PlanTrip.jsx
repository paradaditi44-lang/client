import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/PlanTrip.css";

function PlanTrip() {
  const navigate = useNavigate();

  const [trip, setTrip] = useState({
    destination: "",
    travelDate: "",
    days: 5,
    travellers: 2,
    budget: "",
    travelStyle: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("travexaToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const budgets = [
    {
      id: "budget",
      icon: "💵",
      title: "Budget",
      text: "Save & explore",
    },
    {
      id: "moderate",
      icon: "💳",
      title: "Moderate",
      text: "Balanced comfort",
    },
    {
      id: "luxury",
      icon: "💎",
      title: "Luxury",
      text: "Premium experience",
    },
  ];

  const travelStyles = [
    { id: "adventure", icon: "🏔️", title: "Adventure" },
    { id: "relaxation", icon: "🏖️", title: "Relaxation" },
    { id: "culture", icon: "🏛️", title: "Culture" },
    { id: "food", icon: "🍴", title: "Food" },
    { id: "nature", icon: "🌿", title: "Nature" },
    { id: "shopping", icon: "🛍️", title: "Shopping" },
  ];

  const handleChange = (e) => {
    setTrip({
      ...trip,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const token = localStorage.getItem("travexaToken");
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !trip.destination ||
      !trip.travelDate ||
      !trip.budget ||
      !trip.travelStyle
    ) {
      setError("Please complete all trip details.");
      return;
    }

    // Calculate endDate based on travelDate (startDate) and days count
    const startDateStr = trip.travelDate;
    const daysNum = Number(trip.days) || 1;
    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + daysNum - 1);
    const endDateStr = endDateObj.toISOString().split("T")[0];

    // Determine numeric budget if possible
    let numericBudget;
    if (!isNaN(parseFloat(trip.budget))) {
      numericBudget = parseFloat(trip.budget);
    } else if (trip.budget === "budget") {
      numericBudget = 15000;
    } else if (trip.budget === "moderate") {
      numericBudget = 40000;
    } else if (trip.budget === "luxury") {
      numericBudget = 100000;
    }

    const payload = {
      destination: trip.destination.trim(),
      startDate: startDateStr,
      endDate: endDateStr,
      numberOfTravelers: Number(trip.travellers) || 1,
      preferences: {
        travelStyle: trip.travelStyle,
        budgetCategory: trip.budget,
      },
    };

    if (numericBudget !== undefined) {
      payload.budget = numericBudget;
    }

    setLoading(true);

    try {
      const response = await API.post("/trips", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.trip) {
        const createdTrip = response.data.trip;
        localStorage.setItem("travexaTrip", JSON.stringify(createdTrip));
        navigate("/trip-result", { state: { trip: createdTrip } });
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
          setError("Failed to create trip. Server error.");
        }
      } else {
        setError("Server error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plan-trip-page">

      {/* HERO */}

      <section className="trip-hero">

        <div className="hero-content">

          <span className="hero-badge">
            ✨ AI POWERED TRAVEL PLANNER
          </span>

          <h1>
            Plan Your Next
            <span> Adventure</span>
          </h1>

          <p>
            Tell Travexa what kind of journey you want,
            and we'll create a personalised travel experience
            just for you.
          </p>

        </div>

        <div className="hero-decoration">
          ✈️
        </div>

      </section>


      {/* FORM */}

      <main className="trip-planner">

        {error && (
          <div
            className="register-error"
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              borderRadius: "12px",
              background: "#fff1f2",
              color: "#dc2626",
              border: "1px solid #fecdd3",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>

          {/* DESTINATION */}

          <div className="planner-section">

            <div className="section-heading">

              <div className="section-icon">
                📍
              </div>

              <div>
                <span>STEP 01</span>
                <h2>Where are you going?</h2>
              </div>

            </div>

            <div className="destination-input">

              <span>🔎</span>

              <input
                type="text"
                name="destination"
                placeholder="Enter a city or country..."
                value={trip.destination}
                onChange={handleChange}
              />

              <span>📌</span>

            </div>

          </div>


          {/* DETAILS */}

          <div className="planner-section">

            <div className="section-heading">

              <div className="section-icon">
                🧳
              </div>

              <div>
                <span>STEP 02</span>
                <h2>Trip details</h2>
              </div>

            </div>

            <div className="details-grid">

              <div className="detail-card">

                <label>📅 Travel Date</label>

                <input
                  type="date"
                  name="travelDate"
                  value={trip.travelDate}
                  onChange={handleChange}
                />

              </div>


              <div className="detail-card">

                <label>🗓️ Number of Days</label>

                <div className="number-control">

                  <button
                    type="button"
                    onClick={() =>
                      setTrip({
                        ...trip,
                        days: Math.max(1, trip.days - 1),
                      })
                    }
                  >
                    −
                  </button>

                  <strong>{trip.days}</strong>

                  <span>days</span>

                  <button
                    type="button"
                    onClick={() =>
                      setTrip({
                        ...trip,
                        days: trip.days + 1,
                      })
                    }
                  >
                    +
                  </button>

                </div>

              </div>


              <div className="detail-card">

                <label>👥 Travellers</label>

                <div className="number-control">

                  <button
                    type="button"
                    onClick={() =>
                      setTrip({
                        ...trip,
                        travellers: Math.max(
                          1,
                          trip.travellers - 1
                        ),
                      })
                    }
                  >
                    −
                  </button>

                  <strong>{trip.travellers}</strong>

                  <span>people</span>

                  <button
                    type="button"
                    onClick={() =>
                      setTrip({
                        ...trip,
                        travellers: trip.travellers + 1,
                      })
                    }
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

          </div>


          {/* BUDGET */}

          <div className="planner-section">

            <div className="section-heading">

              <div className="section-icon">
                💰
              </div>

              <div>
                <span>STEP 03</span>
                <h2>What's your budget?</h2>
              </div>

            </div>

            <div className="choice-grid">

              {budgets.map((item) => (

                <div
                  key={item.id}
                  className={`choice-card ${
                    trip.budget === item.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setTrip({
                      ...trip,
                      budget: item.id,
                    })
                  }
                >

                  <div className="choice-icon">
                    {item.icon}
                  </div>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>

                  <div className="radio-circle">
                    {trip.budget === item.id && "✓"}
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* TRAVEL STYLE */}

          <div className="planner-section">

            <div className="section-heading">

              <div className="section-icon">
                🎒
              </div>

              <div>
                <span>STEP 04</span>
                <h2>What's your travel style?</h2>
              </div>

            </div>

            <div className="style-grid">

              {travelStyles.map((style) => (

                <div
                  key={style.id}
                  className={`style-card ${
                    trip.travelStyle === style.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setTrip({
                      ...trip,
                      travelStyle: style.id,
                    })
                  }
                >

                  <span className="style-icon">
                    {style.icon}
                  </span>

                  <span>{style.title}</span>

                  {trip.travelStyle === style.id && (
                    <span className="selected-check">
                      ✓
                    </span>
                  )}

                </div>

              ))}

            </div>

          </div>


          {/* GENERATE BUTTON */}

          <div className="generate-area">

            <div>
              <strong>
                Ready for your adventure?
              </strong>

              <p>
                Travexa will create your personalised itinerary.
              </p>
            </div>

            <button
              type="submit"
              className="generate-trip-btn"
              disabled={loading}
            >
              {loading ? "✨ Generating Trip..." : "✨ Generate My Trip →"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default PlanTrip;