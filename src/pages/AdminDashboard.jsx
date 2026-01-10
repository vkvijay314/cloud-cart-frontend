import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/analytics/dashboard");
      setStats(res.data.stats);
    };
    fetchStats();
  }, []);

  if (!stats) return <h3>Loading dashboard...</h3>;

  return (
    <div style={styles.container}>
      <h2>Admin Dashboard</h2>

      <div style={styles.grid}>
        <Card title="Users" value={stats.users} />
        <Card title="Products" value={stats.products} />
        <Card title="Orders" value={stats.orders} />
        <Card title="Revenue" value={`₹ ${stats.revenue}`} />
        <Card title="Total Expense" value={`₹ ${stats.totalExpenseAmount}`} />
      </div>
    </div>
  );
}

const Card = ({ title, value }) => (
  <div style={styles.card}>
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

const styles = {
  container: {
    maxWidth: "900px",
    margin: "30px auto"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
  }
};

export default AdminDashboard;
