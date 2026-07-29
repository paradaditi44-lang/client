import "../../styles/CategoryFilter.css";

const categories = [
  { icon: "📸", name: "Attractions" },
  { icon: "🍽", name: "Restaurants" },
  { icon: "☕", name: "Cafes" },
  { icon: "🏨", name: "Hotels" },
  { icon: "🛍", name: "Shopping" },
  { icon: "🌳", name: "Parks" },
  { icon: "⛽", name: "Petrol" },
  { icon: "🏥", name: "Hospitals" },
  { icon: "🏧", name: "ATM" },
  { icon: "🚉", name: "Railway" },
];

function CategoryFilter() {
  return (
    <div className="category-section">

      <h2>Explore Categories</h2>

      <div className="category-grid">

        {categories.map((item) => (
          <button
            key={item.name}
            className="category-card"
          >
            <span className="category-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </button>
        ))}

      </div>

    </div>
  );
}

export default CategoryFilter;