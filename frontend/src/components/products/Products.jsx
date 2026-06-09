import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { productsApi } from "../../services/api";

export default function Products() {
  const { data: products, loading, error, refetch } = useApi(productsApi.getAll);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", sku: "", price: "", quantity: "" });

  const resetForm = () => {
    setFormData({ name: "", sku: "", price: "", quantity: "" });
    setEditProduct(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
      };
      if (editProduct) {
        await productsApi.update(editProduct.id, { name: payload.name, price: payload.price, quantity: payload.quantity });
      } else {
        await productsApi.create(payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productsApi.delete(id);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>Name <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></label>
              <label>SKU <input required value={formData.sku} disabled={!!editProduct} onChange={e => setFormData({...formData, sku: e.target.value})} /></label>
              <label>Price <input required type="number" step="0.01" min="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></label>
              <label>Quantity <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></label>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProduct ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products?.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td><code>{p.sku}</code></td>
              <td>₹{p.price.toFixed(2)}</td>
              <td>
                <span className={`badge ${p.quantity <= 5 ? "badge-danger" : "badge-success"}`}>
                  {p.quantity}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
