import { useEffect, useState } from 'react';
import { api } from '../../api';
import { formatPrice } from '../../components/ProductCard';
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-orders">
      <p className="eyebrow">Manage</p>
      <h1>Orders</h1>

      {error && <p className="admin-orders__error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <p className="admin-orders__empty">No orders yet.</p>
      ) : (
        <table className="admin-orders__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="admin-orders__id">{o.id}</td>
                <td>
                  {o.items.map((i) => (
                    <div key={i.productId}>
                      {i.name} × {i.quantity}
                    </div>
                  ))}
                </td>
                <td>{formatPrice(o.total)}</td>
                <td>
                  <span className={`admin-orders__status admin-orders__status--${o.status}`}>
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
