import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { ordersApi, customersApi, productsApi } from "../../services/api";

export default function Orders() {
  const { data: orders, loading, error, refetch } = useApi(ordersApi.getAll);
  const { data: customers } = useApi(customersApi.getAll);
  const { data: products } = useApi(productsApi.getAll);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const resetForm = () => {
    setCustomerId("");
    setItems([{ product_id: "", quantity: 1 }]);
    setShowForm(false);
    setFormError("");
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await ordersApi.create({
        customer_id: parseInt(customerId),
        items: items.map(it => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) }))
      });
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await ordersApi.delete(id);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Order</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal-wide">
            <h2>Create Order</h2>
            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Customer
                <select required value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">-- Select Customer --</option>
                  {customers?.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </label>

              <h3>Order Items</h3>
              {items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <select required value={item.product_id} onChange={e => updateItem(i, "product_id", e.target.value)}>
                    <option value="">-- Select Product --</option>
                    {products?.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity}) — ₹{p.price}</option>)}
                  </select>
                  <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} placeholder="Qty" />
                  {items.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {orders?.map(o => (
            <React.Fragment key={o.id}>
              <tr>
                <td>#{o.id}</td>
                <td>{customers?.find(c => c.id === o.customer_id)?.full_name || `Customer #${o.customer_id}`}</td>
                <td>₹{o.total_amount.toFixed(2)}</td>
                <td><span className="badge badge-success">{o.status}</span></td>
                <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>Details</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleCancel(o.id)}>Cancel</button>
                </td>
              </tr>
              {expandedOrder === o.id && (
                <tr>
                  <td colSpan={6} className="order-details">
                    <strong>Items:</strong>
                    <ul>
                      {o.items.map(item => (
                        <li key={item.id}>
                          {products?.find(p => p.id === item.product_id)?.name || `Product #${item.product_id}`} — Qty: {item.quantity} × ₹{item.unit_price} = ₹{(item.quantity * item.unit_price).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
