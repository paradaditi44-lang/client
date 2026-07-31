import React, { useState, useEffect, useMemo } from "react";
import "../styles/PackingChecklist.css";

const CATEGORIES = [
  { id: "clothing", title: "Clothing", icon: "👕", badgeClass: "badge-blue" },
  { id: "documents", title: "Documents", icon: "📄", badgeClass: "badge-orange" },
  { id: "electronics", title: "Electronics", icon: "🔌", badgeClass: "badge-teal" },
  { id: "health", title: "Health & Personal Care", icon: "💊", badgeClass: "badge-red" },
  { id: "weather", title: "Weather Essentials", icon: "🌦", badgeClass: "badge-cyan" },
];

function generateChecklistItems(destination, travelStyle, duration) {
  const destLower = (destination || "").toLowerCase();
  const styleLower = (travelStyle || "").toLowerCase();
  const days = Number(duration) || 3;

  const clothing = [
    "Comfortable walking shoes & sneakers",
    "Weather-appropriate outfits (T-shirts, trousers)",
    "Light jacket or cardigan",
    "Underwear & socks (extra pairs)",
    "Sleepwear & lounge clothes",
  ];

  const documents = [
    "Government ID / Passport & visa copies",
    "Flight tickets & hotel booking confirmations",
    "Travel insurance & emergency contacts",
    "Credit/Debit cards & local cash",
    "Driver's license or international permit",
  ];

  const electronics = [
    "Smartphone & high-speed charger",
    "Universal power adapter",
    "Power bank (10,000mAh+)",
    "Headphones or earbuds",
    "Camera & memory cards",
  ];

  const health = [
    "First aid kit & band-aids",
    "Prescription medicines & vitamins",
    "Hand sanitizer & wet wipes",
    "Sunscreen SPF 50+ & lip balm",
    "Pain relievers & motion sickness tablets",
  ];

  const weather = [
    "Compact windproof travel umbrella",
    "Reusable insulated water bottle",
    "Sunglasses with UV protection",
    "Lightweight daypack / travel bag",
  ];

  // Dynamic additions based on destination & rules
  if (
    styleLower.includes("beach") ||
    destLower.includes("goa") ||
    destLower.includes("bali") ||
    destLower.includes("thailand") ||
    destLower.includes("maldives") ||
    destLower.includes("dubai") ||
    destLower.includes("miami")
  ) {
    clothing.push("Swimwear & cover-ups", "Flip flops & sandals");
    weather.push("Beach towel & UV rashguard", "Waterproof phone pouch");
    health.push("Aloe vera gel & insect repellent");
  } else if (
    styleLower.includes("mountain") ||
    styleLower.includes("winter") ||
    destLower.includes("seoul") ||
    destLower.includes("tokyo") ||
    destLower.includes("paris") ||
    destLower.includes("london") ||
    destLower.includes("manali") ||
    destLower.includes("shimla") ||
    destLower.includes("snow") ||
    destLower.includes("europe")
  ) {
    clothing.push("Heavy winter jacket & thermals", "Woollen socks & gloves", "Hiking / insulated shoes");
    weather.push("Scarf & warm beanie");
    health.push("Heavy moisturizer & lip butter");
  }

  if (styleLower.includes("adventure") || styleLower.includes("trek") || styleLower.includes("nature")) {
    clothing.push("Sports shoes & durable pants");
    electronics.push("Torch / headlamp & extra batteries");
    weather.push("Multi-tool & carabiner");
  }

  if (styleLower.includes("business") || styleLower.includes("work")) {
    electronics.push("Laptop & laptop charger");
    clothing.push("Formal clothes & blazer");
    documents.push("Business cards & work documents");
  }

  if (destLower.includes("rain") || destLower.includes("monsoon") || styleLower.includes("rain")) {
    weather.push("Raincoat & poncho", "Waterproof bag cover");
  }

  if (days > 5) {
    clothing.push("Travel laundry detergent sheets");
  }

  const result = [];
  const addCategoryItems = (catId, list) => {
    list.forEach((label, idx) => {
      result.push({
        id: `${catId}-${idx}-${label.slice(0, 10).replace(/\s+/g, "")}`,
        label,
        category: catId,
        checked: false,
      });
    });
  };

  addCategoryItems("clothing", clothing);
  addCategoryItems("documents", documents);
  addCategoryItems("electronics", electronics);
  addCategoryItems("health", health);
  addCategoryItems("weather", weather);

  return result;
}

function PackingChecklist({ destination = "", travelStyle = "", duration = 3 }) {
  // Store checklist items in React state: Array of { id, label, category, checked }
  const [items, setItems] = useState(() =>
    generateChecklistItems(destination, travelStyle, duration)
  );

  // Re-generate checklist items when trip props change
  useEffect(() => {
    setItems(generateChecklistItems(destination, travelStyle, duration));
  }, [destination, travelStyle, duration]);

  // Toggle checked state for an item
  const toggleItem = (itemId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Reset checklist: uncheck all items
  const resetAll = () => {
    setItems((prevItems) =>
      prevItems.map((item) => ({ ...item, checked: false }))
    );
  };

  // Compute total and checked counts for progress bar
  const totalItemsCount = items.length;
  const checkedCount = items.filter((item) => item.checked).length;
  const progressPercent = totalItemsCount
    ? Math.round((checkedCount / totalItemsCount) * 100)
    : 0;

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((cat) => {
      map[cat.id] = items.filter((item) => item.category === cat.id);
    });
    return map;
  }, [items]);

  return (
    <section className="packing-checklist-section">
      {/* Header Banner */}
      <div className="checklist-header">
        <div>
          <span className="checklist-badge">✨ AI SMART PACKING</span>
          <h2>🧳 AI Packing Checklist</h2>
          <p>Everything you should pack for your journey.</p>
        </div>

        <button className="btn-reset-checklist" onClick={resetAll} title="Reset all checked items">
          🔄 Reset Checklist
        </button>
      </div>

      {/* Progress Bar Display */}
      <div className="packing-progress-card">
        <div className="progress-text-row">
          <span>
            <strong>{checkedCount}</strong> / <strong>{totalItemsCount}</strong> Packed ({progressPercent}%)
          </span>
          <span className="progress-status-badge">
            {progressPercent === 100 ? "🎉 Fully Packed!" : `${progressPercent}% Ready`}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="checklist-categories-grid">
        {CATEGORIES.map((category) => {
          const categoryItems = itemsByCategory[category.id] || [];

          return (
            <div key={category.id} className="category-checklist-card">
              {/* Category Title Header */}
              <div className={`category-card-header ${category.badgeClass}`}>
                <span className="category-icon">{category.icon}</span>
                <h3>{category.title}</h3>
                <span className="category-count">{categoryItems.length} items</span>
              </div>

              {/* Items List */}
              <div className="category-items-list">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item-row ${item.checked ? "checked" : ""}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="custom-checkbox-box">
                      {item.checked ? "✓" : ""}
                    </div>
                    <span className="item-label-text">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PackingChecklist;
