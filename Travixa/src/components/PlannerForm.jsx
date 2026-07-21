import "../styles/PlannerForm.css";

function PlannerForm() {
  return (
    <div className="planner-card">
      <h2>✨ AI Trip Planner</h2>

      <label>📍 Destination</label>
      <input type="text" placeholder="Search destination..." />

      <label>📅 Start Date</label>
      <input type="date" />

      <label>📅 End Date</label>
      <input type="date" />

      <label>👥 Travelers</label>
      <input type="number" defaultValue="2" />

      <label>💰 Budget</label>
      <input type="text" placeholder="₹50,000" />

      <button>✨ Generate AI Trip</button>
    </div>
  );
}

export default PlannerForm;