import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { customersApi } from "../../services/api";

export default function Customers() {
  const { data: customers, loading, error, refetch } = useApi(customersApi.getAll);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "" });

  const resetForm = () => {
    setFormData({ full_name: "", email: "", phone: "" });
    setShowForm(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await customersApi.create(formData);
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customersApi.delete(id);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading customers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Customer</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Customer</h2>
            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>Full Name <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></label>
              <label>Email <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></label>
              <label>Phone <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></label>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {customers?.map(c => (
            <tr key={c.id}>
              <td>{c.full_name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
