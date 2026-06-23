import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../CartContext';
import { formatPrice } from '../components/ProductCard';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    // Give the webhook a moment to mark the order paid, then fetch it.
    // We poll briefly since webhook delivery can lag slightly behind redirect.
    let attempts = 0;
    const poll = () => {
      api
        .getOrder(orderId)
        .then((data) => {
          setOrder(data);
          if (data.status === 'pending' && attempts < 5) {
            attempts += 1;
            setTimeout(poll, 1500);
          } else {
            setLoading(false);
            clearCart();
          }
        })
        .catch(() => setLoading(false));
    };
    poll();
  }, [orderId, clearCart]);

  if (!orderId) {
    return (
      <div className="container confirmation confirmation--center">
        <p>No order to show.</p>
        <Link to="/" className="btn btn-secondary">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container confirmation">
      <div className="confirmation__check" aria-hidden="true">
        <svg viewBox="0 0 60 60" width="56" height="56">
          <circle cx="30" cy="30" r="28" fill="none" stroke="var(--brass)" strokeWidth="1.5" />
          <path d="M18 31l8 8 16-18" fill="none" stroke="var(--brass)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="eyebrow">Order confirmed</p>
      <h1>Thank you.</h1>
      <p className="confirmation__sub">
        Order <strong>{orderId}</strong>{' '}
        {loading
          ? 'is being confirmed…'
          : order?.status === 'paid'
          ? 'has been received and is on its way to preparation.'
          : 'is being processed — you\u2019ll get a confirmation shortly.'}
      </p>

      {order && (
        <div className="confirmation__summary">
          {order.items.map((item) => (
            <div key={item.productId} className="confirmation__row">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="confirmation__row confirmation__row--total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <Link to="/" className="btn btn-primary">Continue shopping</Link>
    </div>
  );
}
