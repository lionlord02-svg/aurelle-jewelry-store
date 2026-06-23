import { useEffect, useState } from 'react';
import { api } from '../../api';
import { formatPrice } from '../../components/ProductCard';
import './AdminProducts.css';

const CATEGORIES = ['jewelry', 'watches', 'bags', 'wallets'];

const BLANK_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'jewelry',
  image: '',
  stock: '',
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    setLoading(true);
    api
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function startCreate() {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function startEdit(product) {
    setForm({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setEditingId(product.id);
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }
    const stockNum = parseInt(form.stock, 10);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(priceNum * 100), // dollars -> cents
      category: form.category,
      image: form.image.trim(),
      stock: isNaN(stockNum) ? 0 : stockNum,
      featured: form.featured,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <div>
          <p className="eyebrow">Manage</p>
          <h1>Products</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          + Add product
        </button>
      </div>

      {error && !showForm && <p className="admin-products__error">{error}</p>}

      {showForm && (
        <div className="admin-products__form-overlay" onClick={() => setShowForm(false)}>
          <form
            className="admin-products__form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <h2>{editingId ? 'Edit product' : 'New product'}</h2>

            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>

            <label>
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>

            <div className="admin-products__form-row">
              <label>
                Price (USD)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="49.00"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </label>
            </div>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Image URL
              <input
                placeholder="https://..."
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </label>
            <p className="admin-products__form-hint">
              Paste a link to an image hosted elsewhere. (Direct photo upload can be added later if you need it.)
            </p>

            <label className="admin-products__checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Feature on home page
            </label>

            {error && <p className="admin-products__error">{error}</p>}

            <div className="admin-products__form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <p className="admin-products__empty">No products yet. Add your first one above.</p>
      ) : (
        <table className="admin-products__table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.image} alt={p.name} className="admin-products__thumb" />
                </td>
                <td>{p.name}</td>
                <td className="admin-products__category">{p.category}</td>
                <td>{formatPrice(p.price, p.currency)}</td>
                <td className={p.stock === 0 ? 'admin-products__stock-zero' : ''}>{p.stock}</td>
                <td>{p.featured ? '★' : ''}</td>
                <td className="admin-products__row-actions">
                  <button type="button" className="btn-ghost" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost admin-products__delete"
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
