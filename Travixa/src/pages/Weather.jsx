import React from "react";
import WeatherCard from "../components/WeatherCard";
import Footer from "../components/Footer";
import "../styles/Weather.css";

const Weather = () => {
  return (
    <div className="weather-page-root">
      <main className="weather-page-wrapper">
        {/* Compact Hero Header */}
        <section className="weather-hero-compact">
          <span className="hero-badge">🌤️ TRAVEL WEATHER</span>
          <h1>Weather Forecast 🌤</h1>
          <p>Check the latest weather before your trip.</p>
        </section>

        {/* Centered Weather Card Container */}
        <div className="weather-card-container">
          <WeatherCard />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Weather;