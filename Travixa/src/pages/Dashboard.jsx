
import { useState } from "react";
import "../styles/Dashboard.css";

import DashboardNavbar from "../components/DashboardNavbar";
import HeroSection from "../components/HeroSection";
import PlannerForm from "../components/PlannerForm";
import MapCard from "../components/MapCard";

import DestinationCard from "../components/DestinationCard";


import AISuggestions from "../components/AISuggestions";
import AITripResult from "../components/AITripResult";
import Footer from "../components/Footer";
import SuccessPopup from "../components/SuccessPopup";

function Dashboard({ theme, toggleTheme }) {

  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleGenerateTrip = (trip) => {

    setLoading(true);

    setTimeout(() => {

      setGeneratedTrip(trip);

      setLoading(false);

    }, 3000);

  };

  return (

    <div className={`dashboard ${theme}`}>

      <DashboardNavbar
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="dashboard-container">

        <HeroSection />

        {/* Top Section */}

        <div className="top-section">

         <PlannerForm
  setGeneratedTrip={(trip) => {
    setGeneratedTrip(trip);
    setShowPopup(true);
  }}
/> 

          <MapCard />

        </div>

        {/* Loading / Empty State / AI Result */}

        {loading ? (

          <div className="loading-card">

            <h2>✨ Generating your AI itinerary...</h2>

            <p>⏳ Thinking...</p>

            <p>📍 Analyzing destination...</p>

            <p>🗺 Finding attractions...</p>

            <p>✈ Planning your trip...</p>

          </div>

        ) : generatedTrip ? (

          <AITripResult trip={generatedTrip} />

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              🤖
            </div>

            <h2>Your AI Travel Plan will appear here</h2>

            <p>
              Fill out the planner form and click
              <br />
              <strong>✨ Generate AI Trip</strong>
              <br />
              to create your personalized itinerary.
            </p>

            <span>
              🌍 Ready to explore the world?
            </span>

          </div>

        )}

        {/* Dashboard Cards */}

        <div className="dashboard-grid">

          

          <DestinationCard />

          


          <AISuggestions />

        </div>

      </div>
<SuccessPopup
  show={showPopup}
  onClose={() => setShowPopup(false)}
/>
      <Footer />

    </div>

  );
}

export default Dashboard;