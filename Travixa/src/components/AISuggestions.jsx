import "../styles/AISuggestions.css";

const suggestions = [
  {
    id: 1,
    icon: "🌤️",
    title: "Check Weather",
    description:
      "Always check the weather forecast before travelling to pack suitable clothes.",
  },
  {
    id: 2,
    icon: "🎒",
    title: "Pack Smart",
    description:
      "Carry only essential items and keep your important documents in one place.",
  },
  {
    id: 3,
    icon: "💰",
    title: "Budget Tip",
    description:
      "Book hotels and flights early to get the best deals and save money.",
  },
  {
    id: 4,
    icon: "📍",
    title: "Explore Nearby",
    description:
      "Visit local attractions, restaurants, and hidden gems near your destination.",
  },
];

function AISuggestions() {
  return (
    <div className="ai-section">
      <h2>🤖 AI Travel Suggestions</h2>

      <div className="ai-grid">
        {suggestions.map((item) => (
          <div className="ai-card" key={item.id}>
            <div className="ai-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AISuggestions;