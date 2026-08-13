import React, { useMemo } from "react";
import "../styles/SmartBudgetOptimizer.css";

// Dynamic allocation percentages based on travel style
const ALLOCATION_RULES = {
  luxury: { accommodation: 45, food: 20, transport: 10, activities: 20, shopping: 5 },
  adventure: { accommodation: 25, food: 15, transport: 20, activities: 30, shopping: 10 },
  family: { accommodation: 40, food: 25, transport: 15, activities: 15, shopping: 5 },
  solo: { accommodation: 30, food: 20, transport: 20, activities: 20, shopping: 10 },
  relax: { accommodation: 40, food: 20, transport: 10, activities: 15, shopping: 15 },
  default: { accommodation: 35, food: 25, transport: 15, activities: 15, shopping: 10 },
};

function calculateDuration(startDate, endDate, fallbackDays) {
  if (startDate && endDate) {
    const [sYear, sMonth, sDay] = String(startDate).split('-').map(Number);
    const [eYear, eMonth, eDay] = String(endDate).split('-').map(Number);
    if (sYear && sMonth && sDay && eYear && eMonth && eDay) {
      const startUtc = Date.UTC(sYear, sMonth - 1, sDay);
      const endUtc = Date.UTC(eYear, eMonth - 1, eDay);
      const diffMs = endUtc - startUtc;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays + 1);
    }
  }
  return Number(fallbackDays) || 1;
}

function getBudgetHealth(dailyBudget) {
  if (dailyBudget >= 6000) {
    return {
      status: "Excellent Budget",
      badgeClass: "health-excellent",
      icon: "🟢",
      description: "Generous budget! You can enjoy premium stays, fine dining, and top attractions effortlessly.",
      savingsPercent: 8,
    };
  } else if (dailyBudget >= 3500) {
    return {
      status: "Moderate Budget",
      badgeClass: "health-moderate",
      icon: "🟡",
      description: "Balanced budget! Good balance of comfort, dining, and activities with smart choices.",
      savingsPercent: 12,
    };
  } else {
    return {
      status: "Tight Budget",
      badgeClass: "health-tight",
      icon: "🔴",
      description: "Budget conscious! Prioritize key experiences, use local transport, and look for value stays.",
      savingsPercent: 15,
    };
  }
}

function generateRecommendations(dest, style, budget, healthStatus) {
  const destination = dest || "your destination";
  const styleText = style || "General";
  const emergencyFund = Math.round(budget * 0.1);

  return [
    {
      icon: "🏨",
      title: "Smart Accommodation Choice",
      text: `In ${destination}, booking boutique hotels or apartments 10 minutes outside core tourist hubs can save up to 20% on nightly rates.`,
    },
    {
      icon: "🚌",
      title: "Local Transit & City Passes",
      text: `Opt for public transit day passes in ${destination} rather than taxis for cost-effective city travel.`,
    },
    {
      icon: "🎟️",
      title: `${styleText} Attraction Reservations`,
      text: `Reserve attraction passes and tour tickets online in advance to unlock early bird rates and skip waiting lines.`,
    },
    {
      icon: "🛡️",
      title: "Emergency Contingency Buffer",
      text: `Reserve a 10% emergency buffer (₹${emergencyFund.toLocaleString()}) for unforeseen local transport or incidental expenses.`,
    },
    {
      icon: "🍽️",
      title: "Authentic Local Dining",
      text: `Explore highly-rated local eateries and neighborhood food markets in ${destination} for authentic meals at a fraction of hotel dining costs.`,
    },
  ];
}

function SmartBudgetOptimizer({ trip: propTrip }) {
  const trip = useMemo(() => {
    if (propTrip) return propTrip;
    try {
      const saved = localStorage.getItem("travexaTrip");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [propTrip]);

  if (!trip) {
    return null;
  }

  const totalBudget = Number(trip.budget) || 0;
  const travelers = Number(trip.numberOfTravelers || trip.travelers) || 1;
  const duration = calculateDuration(trip.startDate, trip.endDate, trip.days);
  const dailyBudget = duration > 0 ? Math.round(totalBudget / (duration * travelers)) : totalBudget;
  const travelStyle = trip.preferences?.travelStyle || trip.travelStyle || "General";
  const destination = trip.destination || "Destination";

  const styleKey = (travelStyle || "").toLowerCase();
  let matchedRule = ALLOCATION_RULES.default;

  if (styleKey.includes("luxur")) matchedRule = ALLOCATION_RULES.luxury;
  else if (styleKey.includes("adventur")) matchedRule = ALLOCATION_RULES.adventure;
  else if (styleKey.includes("famil")) matchedRule = ALLOCATION_RULES.family;
  else if (styleKey.includes("solo")) matchedRule = ALLOCATION_RULES.solo;
  else if (styleKey.includes("relax")) matchedRule = ALLOCATION_RULES.relax;

  const allocations = [
    { key: "accommodation", label: "Accommodation", icon: "🏨", pct: matchedRule.accommodation, color: "gradient-blue" },
    { key: "food", label: "Food & Dining", icon: "🍛", pct: matchedRule.food, color: "gradient-orange" },
    { key: "transport", label: "Transport", icon: "🚕", pct: matchedRule.transport, color: "gradient-teal" },
    { key: "activities", label: "Activities", icon: "🎟", pct: matchedRule.activities, color: "gradient-purple" },
    { key: "shopping", label: "Shopping", icon: "🛍", pct: matchedRule.shopping, color: "gradient-pink" },
  ];

  const health = getBudgetHealth(dailyBudget);
  const potentialSavingsAmount = Math.round((totalBudget * health.savingsPercent) / 100);
  const recommendations = generateRecommendations(destination, travelStyle, totalBudget, health.status);

  return (
    <section className="smart-budget-section" id="smart-budget-optimizer">
      {/* Header Banner */}
      <div className="budget-section-header">
        <span className="budget-eyebrow">💡 AI FINANCIAL ENGINE</span>
        <h2 className="budget-title">📊 Smart Budget Optimizer</h2>
        <p className="budget-subtitle">
          Intelligent budget breakdown, category allocations, and AI recommendations tailored for your {duration}-day trip to {destination}.
        </p>
      </div>

      {/* Top Summary Header Grid */}
      <div className="budget-summary-grid">
        <div className="budget-stat-card">
          <span className="stat-icon">💰</span>
          <div>
            <span className="stat-label">Total Budget</span>
            <strong className="stat-value">₹{totalBudget.toLocaleString()}</strong>
          </div>
        </div>

        <div className="budget-stat-card">
          <span className="stat-icon">🗓️</span>
          <div>
            <span className="stat-label">Trip Duration</span>
            <strong className="stat-value">{duration} Days</strong>
          </div>
        </div>

        <div className="budget-stat-card">
          <span className="stat-icon">🎒</span>
          <div>
            <span className="stat-label">Travel Style</span>
            <strong className="stat-value text-capitalize">{travelStyle}</strong>
          </div>
        </div>

        <div className="budget-stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <span className="stat-label">Travelers</span>
            <strong className="stat-value">{travelers} {travelers === 1 ? "Person" : "People"}</strong>
          </div>
        </div>

        <div className="budget-stat-card highlight-card">
          <span className="stat-icon">💵</span>
          <div>
            <span className="stat-label">Est. Daily / Person</span>
            <strong className="stat-value text-blue">₹{dailyBudget.toLocaleString()} / day</strong>
          </div>
        </div>
      </div>

      {/* Budget Health Indicator Banner */}
      <div className={`budget-health-card ${health.badgeClass}`}>
        <div className="health-header-row">
          <span className="health-icon">{health.icon}</span>
          <div className="health-title-wrap">
            <span className="health-eyebrow">BUDGET HEALTH INDICATOR</span>
            <h3 className="health-status-text">{health.status}</h3>
          </div>
        </div>
        <p className="health-description">{health.description}</p>
      </div>

      {/* Allocation Cards Grid */}
      <div className="allocation-section">
        <h3 className="section-subheading">🎯 Category Budget Breakdown</h3>
        <div className="allocation-cards-grid">
          {allocations.map((item) => {
            const amount = Math.round((totalBudget * item.pct) / 100);
            return (
              <div key={item.key} className="allocation-card">
                <div className="allocation-card-header">
                  <span className="cat-icon">{item.icon}</span>
                  <div className="cat-meta">
                    <span className="cat-name">{item.label}</span>
                    <strong className="cat-amount">₹{amount.toLocaleString()}</strong>
                  </div>
                  <span className="cat-pct-badge">{item.pct}%</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Potential Savings Highlight Card */}
      <div className="savings-highlight-card">
        <div className="savings-content">
          <div className="savings-icon-wrap">⚡</div>
          <div>
            <span className="savings-eyebrow">POTENTIAL OPTIMIZED SAVINGS</span>
            <h3 className="savings-amount">
              Save up to ₹{potentialSavingsAmount.toLocaleString()}{" "}
              <span className="savings-pct">({health.savingsPercent}% of total budget)</span>
            </h3>
            <p className="savings-subtext">
              By following Travexa AI's smart recommendations below, you can optimize costs without sacrificing comfort.
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="ai-recs-section">
        <h3 className="section-subheading">✨ AI Smart Financial Recommendations</h3>
        <div className="recs-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="rec-card">
              <span className="rec-icon">{rec.icon}</span>
              <div>
                <h4 className="rec-title">{rec.title}</h4>
                <p className="rec-text">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SmartBudgetOptimizer;
