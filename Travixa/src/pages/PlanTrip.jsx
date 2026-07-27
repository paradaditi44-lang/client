import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleGenerate = (e) => {
    e.preventDefault();

    if (
      !trip.destination ||
      !trip.travelDate ||
      !trip.budget ||
      !trip.travelStyle
    ) {
      alert("Please complete all trip details.");
      return;
    }

    // Save trip details
    localStorage.setItem("travexaTrip", JSON.stringify(trip));

    // Go to result page
    navigate("/trip-result");
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
            >
              ✨ Generate My Trip →
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default PlanTrip;