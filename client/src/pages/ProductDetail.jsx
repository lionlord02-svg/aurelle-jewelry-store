import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../CartContext';
import { formatPrice } from '../components/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    api
      .getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container product-detail__loading">Loading…</div>;
  if (error || !product) {
    return (
      <div className="container product-detail__loading">
        <p>We couldn't find that piece.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="container product-detail">
      <div className="product-detail__image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-detail__info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-detail__price">{formatPrice(product.price, product.currency)}</p>
        <p className="product-detail__description">{product.description}</p>

        {outOfStock ? (
          <p className="product-detail__stock product-detail__stock--out">
            Currently sold out. Check back soon.
          </p>
        ) : (
          <>
            <p className="product-detail__stock">
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </p>
            <div className="product-detail__actions">
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>
                {added ? 'Added to cart ✓' : 'Add to cart'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
