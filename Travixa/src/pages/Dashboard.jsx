
import "../styles/Dashboard.css";
import DashboardNavbar from "../components/DashboardNavbar";
import PlannerForm from "../components/PlannerForm";

function Dashboard() {
  return (
    <>
      <DashboardNavbar />

      <div className="dashboard-container">
        <PlannerForm />
      </div>
    </>
  );
}

export default Dashboard;