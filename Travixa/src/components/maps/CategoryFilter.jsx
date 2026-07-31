import "../../styles/CategoryFilter.css";

function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <div className="category-section">
      <h2>Explore Categories</h2>

      <div className="category-grid">
        {categories.map((category) => {
          const isActive = category.id === selectedCategory?.id;

          return (
            <button
              key={category.id}
              type="button"
              className={`category-card ${isActive ? "active" : ""}`}
              style={isActive ? { "--cat-color": category.color } : undefined}
              onClick={() => onSelect(category)}
            >
              <span className="category-icon">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;