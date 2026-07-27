import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const isLoggedIn = () => {
    return localStorage.getItem("travexaLoggedIn") === "true";
  };

  const handlePlanTrip = () => {
    if (isLoggedIn()) {
      navigate("/plan-trip");
    } else {
      navigate("/register");
    }
  };

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}
      <section className="home-hero">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">
            ✨ AI-Powered Travel Planning
          </div>

          <h1>
            Your Journey.
            <br />
            <span>Our Intelligence.</span>
          </h1>

          <p>
            Discover beautiful destinations, create personalised
            itineraries, find hotels, check weather and explore places —
            all in one smart travel companion.
          </p>

          <div className="hero-actions">

            {/* Start Exploring */}
            <button
              className="hero-primary"
              onClick={() => navigate("/register")}
            >
              Start Exploring
              <span>→</span>
            </button>

            {/* Plan Trip */}
            <button
              className="hero-secondary"
              onClick={handlePlanTrip}
            >
              Plan a Trip
            </button>

          </div>

          {/* HERO STATS */}
          <div className="hero-stats">

            <div className="hero-stat">
              <strong>AI</strong>
              <span>Smart Planning</span>
            </div>

            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Travel Assistant</span>
            </div>

            <div className="hero-stat">
              <strong>∞</strong>
              <span>Places to Explore</span>
            </div>

          </div>

        </div>

        <div className="scroll-indicator">
          <span>Explore Travexa</span>
          <div>↓</div>
        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="home-features">

        <div className="section-title">

          <span>WHY TRAVEXA?</span>

          <h2>
            Travel planning,
            <br />
            <em>made intelligent.</em>
          </h2>

          <p>
            Everything you need to turn your travel idea into
            a beautiful journey.
          </p>

        </div>


        <div className="feature-grid">

          {/* AI PLANNER */}
          <div className="feature-card feature-large">

            <div className="feature-number">01</div>

            <div className="feature-icon">
              🤖
            </div>

            <h3>AI Trip Planner</h3>

            <p>
              Tell Travexa where you want to go, your budget,
              dates and interests. Get a personalised travel
              plan in seconds.
            </p>

            <button onClick={handlePlanTrip}>
              Try it →
            </button>

          </div>


          {/* HOTELS */}
          <div className="feature-card">

            <div className="feature-number">02</div>

            <div className="feature-icon">
              🏨
            </div>

            <h3>Smart Hotels</h3>

            <p>
              Explore hotel options that fit your destination
              and travel preferences.
            </p>

          </div>


          {/* WEATHER */}
          <div className="feature-card">

            <div className="feature-number">03</div>

            <div className="feature-icon">
              🌤️
            </div>

            <h3>Weather Updates</h3>

            <p>
              Check weather conditions before and during
              your journey.
            </p>

          </div>


          {/* MAPS */}
          <div className="feature-card">

            <div className="feature-number">04</div>

            <div className="feature-icon">
              🗺️
            </div>

            <h3>Explore Maps</h3>

            <p>
              Discover destinations, attractions and places
              around your trip.
            </p>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="home-cta">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <span>YOUR NEXT ADVENTURE AWAITS</span>

          <h2>
            Don't just travel.
            <br />
            <strong>Travel smarter.</strong>
          </h2>

          <p>
            Let Travexa help you plan your next unforgettable journey.
          </p>

          <button onClick={handlePlanTrip}>
            Create My Trip →
          </button>

        </div>

      </section>

    </main>
  );
}

export default Home;