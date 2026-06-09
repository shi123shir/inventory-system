import React from "react";
import { useApi } from "../../hooks/useApi";
import { dashboardApi } from "../../services/api";

export default function Dashboard() {
  const { data, loading, error } = useApi(dashboardApi.getSummary);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatCard label="Total Products" value={data?.total_products} color="#4f46e5" />
        <StatCard label="Total Customers" value={data?.total_customers} color="#0891b2" />
        <StatCard label="Total Orders" value={data?.total_orders} color="#059669" />
        <StatCard label="Low Stock Items" value={data?.low_stock_products?.length} color="#dc2626" />
      </div>

      {data?.low_stock_products?.length > 0 && (
        <div className="low-stock-alert">
          <h2>⚠️ Low Stock Products</h2>
          <table>
            <thead>
              <tr><th>Product</th><th>Quantity Left</th></tr>
            </thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ color: "#dc2626", fontWeight: "bold" }}>{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-value" style={{ color }}>{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
