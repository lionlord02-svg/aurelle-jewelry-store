import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import ProductGrid from '../components/ProductGrid';
import './Shop.css';

const LABELS = {
  jewelry: 'Jewelry',
  watches: 'Watches',
  bags: 'Bags',
  wallets: 'Wallets',
};

export default function Shop() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('default');

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="container shop">
      <div className="shop__header">
        <div>
          <p className="eyebrow">Collection</p>
          <h1>{LABELS[category] || category}</h1>
        </div>
        <label className="shop__sort">
          <span className="visually-hidden">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="shop__loading">Loading…</p>
      ) : (
        <ProductGrid products={sorted} />
      )}
    </div>
  );
}
