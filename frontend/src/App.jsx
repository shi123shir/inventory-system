import React, { useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Products from "./components/products/Products";
import Customers from "./components/customers/Customers";
import Orders from "./components/orders/Orders";
import "./App.css";

const PAGES = {
  dashboard: { label: "📊 Dashboard", component: Dashboard },
  products: { label: "📦 Products", component: Products },
  customers: { label: "👥 Customers", component: Customers },
  orders: { label: "🛒 Orders", component: Orders },
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const ActiveComponent = PAGES[activePage].component;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>InvenTrack</h2>
          <span>Inventory System</span>
        </div>
        <nav>
          {Object.entries(PAGES).map(([key, { label }]) => (
            <button
              key={key}
              className={`nav-item ${activePage === key ? "active" : ""}`}
              onClick={() => setActivePage(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  );
}
