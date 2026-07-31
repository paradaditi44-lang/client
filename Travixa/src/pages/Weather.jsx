import React from 'react';
import WeatherCard from '../components/WeatherCard';
import '../styles/Weather.css';

const Weather = () => {
  return (
    <div className="travexa-weather-page">
      {/* Dynamic Animated Sky Background */}
      <div className="twp-background">
        {/* Soft Floating Glassmorphism Orbs */}
        <div className="twp-orb twp-orb-1"></div>
        <div className="twp-orb twp-orb-2"></div>
        <div className="twp-orb twp-orb-3"></div>
        <div className="twp-orb twp-orb-4"></div>

        {/* Moving Clouds Layer */}
        <div className="twp-cloud-layer">
          <div className="twp-cloud twp-cloud-1"></div>
          <div className="twp-cloud twp-cloud-2"></div>
          <div className="twp-cloud twp-cloud-3"></div>
          <div className="twp-cloud twp-cloud-4"></div>
        </div>

        {/* Horizon Wave Silhouette */}
        <div className="twp-horizon-silhouette">
          <svg
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="twp-wave-svg"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(15, 23, 42, 0.45)"
              d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
            <path
              fill="rgba(15, 23, 42, 0.75)"
              d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,224C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Floating Centered Weather Card Container */}
      <main className="twp-content-container">
        <div className="twp-card-wrapper">
          <WeatherCard />
        </div>
      </main>
    </div>
  );
};

export default Weather;