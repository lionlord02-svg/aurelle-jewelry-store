import { Link } from 'react-router-dom';
import './ProductCard.css';

export function formatPrice(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__frame">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-card__bracket product-card__bracket--tl" aria-hidden="true" />
        <span className="product-card__bracket product-card__bracket--tr" aria-hidden="true" />
        <span className="product-card__bracket product-card__bracket--bl" aria-hidden="true" />
        <span className="product-card__bracket product-card__bracket--br" aria-hidden="true" />
        {outOfStock && <span className="product-card__sold-out">Sold Out</span>}
      </div>
      <div className="product-card__info">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <span className="product-card__price">{formatPrice(product.price, product.currency)}</span>
      </div>
    </Link>
  );
}
