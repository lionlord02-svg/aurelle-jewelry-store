import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>Nothing here yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
