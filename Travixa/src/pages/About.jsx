import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/About.css";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page-root">
      <main className="about-page-wrapper">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-badge">🌍 ABOUT TRAVEXA</div>

          <h1>
            Travel planning,
            <br />
            <span>reimagined.</span>
          </h1>

          <p>
            Travexa is a smart travel platform designed to make discovering and
            planning your next journey easier, faster, and more personalized.
          </p>
        </section>

        {/* Mission */}
        <section className="about-mission">
          <div className="mission-label">OUR MISSION</div>

          <h2>
            We believe planning a trip
            <br />
            should be part of the adventure.
          </h2>

          <p>
            Instead of jumping between different websites and apps, Travexa
            brings important travel tools together in one simple experience.
          </p>
        </section>
{/* Statistics */}

<section className="about-stats">

  <div className="stat-card">
    <div className="stat-icon">🌍</div>
    <h3>190+</h3>
    <p>Countries Supported</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon">🏨</div>
    <h3>Hotels</h3>
    <p>Worldwide Search</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon">☁️</div>
    <h3>Live</h3>
    <p>Weather Updates</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon">🗺️</div>
    <h3>Maps</h3>
    <p>Explore Places</p>
  </div>

</section>
        {/* Features */}
        <section className="about-features">
          <div className="about-card">
            <div className="about-card-icon">🤖</div>
            <h3>Smarter Planning</h3>
            <p>
              Use intelligent travel planning to create journeys based on your
              destination, preferences, and interests.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🗺️</div>
            <h3>Everything Together</h3>
            <p>
              Explore maps, weather, hotels, and travel information from one
              convenient platform.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">✨</div>
            <h3>Personalized Experience</h3>
            <p>
              Travexa is designed around your travel style, interests, and the
              kind of experience you want.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section">
          <div className="mission-label">HOW TRAVEXA WORKS</div>

          <h2>From idea to itinerary.</h2>

          <div className="steps">
            <div className="step">
              <span className="step-num">01</span>
              <div>
                <h3>Tell us your idea</h3>
                <p>
                  Choose where you want to go and tell us what kind of
                  experience you want.
                </p>
              </div>
            </div>

            <div className="step">
              <span className="step-num">02</span>
              <div>
                <h3>Explore your options</h3>
                <p>
                  Check hotels, weather, maps, and other useful travel
                  information.
                </p>
              </div>
            </div>

            <div className="step">
              <span className="step-num">03</span>
              <div>
                <h3>Start your journey</h3>
                <p>
                  Get your travel plan ready and enjoy your adventure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div>
            <span className="cta-badge">READY TO EXPLORE?</span>
            <h2>
              Your next adventure
              <br />
              starts here.
            </h2>
          </div>

          <button onClick={() => navigate("/plan-trip")}>
            Plan My Trip →
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;