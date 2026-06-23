import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { api } from '../api';
import { formatPrice } from '../components/ProductCard';
import './Cart.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    try {
      const { url } = await api.createCheckoutSession(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container cart cart--empty">
        <p className="eyebrow">Your cart</p>
        <h1>It's empty in here.</h1>
        <p>Browse the collection and find something worth keeping.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart">
      <p className="eyebrow">Your cart</p>
      <h1>Cart</h1>

      <div className="cart__layout">
        <ul className="cart__list">
          {items.map((item) => (
            <li key={item.productId} className="cart__item">
              <img src={item.image} alt={item.name} />
              <div className="cart__item-info">
                <h3>{item.name}</h3>
                <p className="cart__item-price">{formatPrice(item.price)}</p>
                <div className="cart__item-controls">
                  <div className="qty-stepper qty-stepper--sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart__remove"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="cart__item-total">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="cart__summary">
          <h2>Order summary</h2>
          <div className="cart__summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="cart__summary-note">Shipping and taxes calculated at checkout.</p>
          {error && <p className="cart__error">{error}</p>}
          <button
            type="button"
            className="btn btn-primary cart__checkout-btn"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Redirecting…' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
