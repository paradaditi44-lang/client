import React, { useEffect } from "react";
import "../styles/JourneyTransition.css";

const TRANSPORT_ICONS = {
  Driving: "🚗",
  Walking: "🚶",
  Train: "🚆",
  Flight: "✈️",
};

function JourneyTransition({ origin, destination, transport, onComplete }) {
  const startName = origin && String(origin).trim() ? String(origin).trim() : "Current Location";
  const endName = destination && String(destination).trim() ? String(destination).trim() : "Destination";
  const vehicleIcon = TRANSPORT_ICONS[transport] || "🚗";
  const isFlight = transport === "Flight";

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const duration = mediaQuery.matches ? 400 : 2500;

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="journey-transition-overlay" role="dialog" aria-label="Journey Transition">
      <div className="journey-transition-card">
        {/* Travexa AI Header Badge */}
        <div className="journey-badge-pill">
          <span className="badge-sparkle">✨</span> TRAVEXA JOURNEY ENGINE
        </div>

        {/* Travel Path Visualization */}
        <div className={`journey-path-container ${isFlight ? "is-flight-mode" : ""}`}>
          {/* Origin Node */}
          <div className="journey-node origin-node">
            <div className="node-dot start-dot">
              <span className="dot-ping"></span>
            </div>
            <div className="node-label-group">
              <span className="node-caption">STARTING FROM</span>
              <strong className="node-title">{startName}</strong>
            </div>
          </div>

          {/* Track Line & Vehicle Animation */}
          <div className="journey-track">
            <div className="track-line">
              <div className="track-line-progress"></div>
            </div>

            {/* Vehicle Icon */}
            <div className={`vehicle-wrapper ${isFlight ? "flight-arc" : "linear-travel"}`}>
              <span className="vehicle-emoji" aria-hidden="true">
                {vehicleIcon}
              </span>
              <span className="vehicle-trail"></span>
            </div>
          </div>

          {/* Destination Node */}
          <div className="journey-node destination-node">
            <div className="node-dot end-dot">
              <span className="dot-ping end-ping"></span>
            </div>
            <div className="node-label-group">
              <span className="node-caption">DESTINATION</span>
              <strong className="node-title">{endName}</strong>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="journey-status-bar">
          <div className="status-spinner-dot"></div>
          <span className="status-message-text">
            Your journey begins...
          </span>
        </div>
      </div>
    </div>
  );
}

export default JourneyTransition;
